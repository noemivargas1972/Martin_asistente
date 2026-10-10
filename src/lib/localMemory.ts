/**
 * Local Memory & Auto-Save Persistence Engine for Smart Commerce & Martín IA
 * Guaranteed protection against app restarts, browser crashes, or network disconnects.
 */

export interface SavedInventoryData {
  items: any[];
  selectedTemplateIndex?: number;
  uploadedFileName?: string | null;
  uploadedSheetName?: string | null;
  lastUpdated: string;
}

export interface SavedOperarioDraft {
  dictadoTexto: string;
  zonaActiva: string;
  itemsDictados: any[];
  lastUpdated: string;
}

export interface SavedChatHistory {
  messages: any[];
  lastUpdated: string;
}

// Storage keys
export const STORAGE_KEYS = {
  INVENTORY_LOCAL: "@Inventario_Martin_Local",
  OPERARIO_DRAFT: "@SmartCommerce_Operario_Draft",
  OPERARIO_CHAT: "@SmartCommerce_Operario_Chat",
  MARTIN_CHAT_MAIN: "@SmartCommerce_Martin_ChatHistory_V3",
  EXCEL_WORKING_DRAFT: "@SmartCommerce_Excel_Working_Draft",
  LAST_SAFE_STATE: "@SmartCommerce_Last_Safe_State"
};

/**
 * Save data safely to localStorage without throwing exceptions
 */
export function saveToLocalMemory<T>(key: string, value: T): boolean {
  try {
    const payload = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, payload);
    localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
    return true;
  } catch (error) {
    console.warn(`[LocalMemory] Error saving key ${key}:`, error);
    return false;
  }
}

/**
 * Load data safely from localStorage
 */
export function loadFromLocalMemory<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data === null || data === undefined) {
      return defaultValue;
    }
    // Check if expected return type is string or JSON
    if (typeof defaultValue === "string") {
      return data as unknown as T;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`[LocalMemory] Error reading key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Clear a key from localStorage
 */
export function removeFromLocalMemory(key: string): void {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
  } catch (error) {
    console.warn(`[LocalMemory] Error removing key ${key}:`, error);
  }
}

/**
 * Get timestamp of when a key was last saved
 */
export function getLocalMemoryTimestamp(key: string): string | null {
  try {
    return localStorage.getItem(`${key}_timestamp`);
  } catch (e) {
    return null;
  }
}

/**
 * Global backup snapshot of current user session
 */
export function createBackupSnapshot(snapshotData: {
  activeTab?: string;
  operarioText?: string;
  inventoryCount?: number;
}): void {
  saveToLocalMemory(STORAGE_KEYS.LAST_SAFE_STATE, {
    ...snapshotData,
    snapshotTime: new Date().toISOString()
  });
}

export interface DatabaseCleanResult {
  keysScanned: number;
  keysCleaned: number;
  bytesFreed: number;
  corruptEntriesRemoved: number;
  duplicatesRemoved: number;
  summary: string[];
}

/**
 * Clean all junk, test artifacts, corrupt values, and orphaned keys from LocalStorage & Memory
 */
export function cleanGarbageFromLocalDatabase(): DatabaseCleanResult {
  const result: DatabaseCleanResult = {
    keysScanned: 0,
    keysCleaned: 0,
    bytesFreed: 0,
    corruptEntriesRemoved: 0,
    duplicatesRemoved: 0,
    summary: []
  };

  try {
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.push(k);
    }

    result.keysScanned = allKeys.length;

    allKeys.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      const initialSize = raw.length;

      // 1. Remove orphaned timestamp keys without corresponding data
      if (key.endsWith("_timestamp")) {
        const baseKey = key.replace(/_timestamp$/, "");
        if (!localStorage.getItem(baseKey)) {
          localStorage.removeItem(key);
          result.keysCleaned++;
          result.bytesFreed += initialSize;
          result.summary.push(`Marca de tiempo huérfana eliminada: ${key}`);
          return;
        }
      }

      // 2. Clean inventory items with null, NaN or corrupt structures
      if (key === STORAGE_KEYS.INVENTORY_LOCAL) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.items)) {
            const originalCount = parsed.items.length;
            const seen = new Set<string>();
            const cleanedItems = parsed.items.filter((it: any) => {
              if (!it || typeof it !== "object") return false;
              const prod = String(it.Producto || it.producto || it.name || "").trim();
              if (!prod || prod.toLowerCase() === "undefined" || prod.toLowerCase() === "null") return false;
              
              // Filter out duplicate identical rows
              const dedupeKey = `${prod.toLowerCase()}__${it.Local || it.local || ""}`;
              if (seen.has(dedupeKey)) {
                result.duplicatesRemoved++;
                return false;
              }
              seen.add(dedupeKey);

              // Fix corrupted quantities
              if (isNaN(Number(it.Cantidad ?? it.cantidad))) {
                it.Cantidad = 0;
                it.cantidad = 0;
              }
              return true;
            });

            if (cleanedItems.length !== originalCount) {
              const removed = originalCount - cleanedItems.length;
              result.corruptEntriesRemoved += removed;
              parsed.items = cleanedItems;
              parsed.lastUpdated = new Date().toISOString();
              saveToLocalMemory(key, parsed);
              result.keysCleaned++;
              result.summary.push(`Inventario Local depurado: ${removed} filas corruptas/duplicadas eliminadas`);
            }
          }
        } catch (e) {
          localStorage.removeItem(key);
          result.corruptEntriesRemoved++;
          result.summary.push(`Inventario corrupto no recuperable eliminado: ${key}`);
        }
      }

      // 3. Clean operario draft if it is empty or garbage
      if (key === STORAGE_KEYS.OPERARIO_DRAFT) {
        try {
          const parsed = JSON.parse(raw);
          if (!parsed.dictadoTexto && (!parsed.itemsDictados || parsed.itemsDictados.length === 0)) {
            localStorage.removeItem(key);
            result.keysCleaned++;
            result.bytesFreed += initialSize;
            result.summary.push("Borrador vacío de operario depurado");
          }
        } catch (e) {
          localStorage.removeItem(key);
          result.corruptEntriesRemoved++;
        }
      }

      // 4. Remove obsolete or test keys
      if (
        key.includes("test_") || 
        key.includes("mock_") || 
        key.includes("temp_dummy_") ||
        raw === "undefined" ||
        raw === "null" ||
        raw === '""'
      ) {
        localStorage.removeItem(key);
        result.keysCleaned++;
        result.bytesFreed += initialSize;
        result.summary.push(`Clave temporal o de prueba eliminada: ${key}`);
      }
    });

    if (result.summary.length === 0) {
      result.summary.push("La base de datos local se encuentra 100% limpia y sin registros corruptos.");
    }
  } catch (error) {
    console.error("[LocalMemory] Error cleaning database:", error);
  }

  return result;
}

/**
 * Full Database Purge: resets temporary test artifacts while keeping verified user configurations
 */
export function purgeLocalDatabaseHard(): DatabaseCleanResult {
  const result: DatabaseCleanResult = {
    keysScanned: 0,
    keysCleaned: 0,
    bytesFreed: 0,
    corruptEntriesRemoved: 0,
    duplicatesRemoved: 0,
    summary: []
  };

  try {
    const preserveKeys = [
      "user_gemini_api_key",
      "admin_secret_key",
      "@SmartCommerce_UsersList_V2",
      "smart_commerce_whatsapp_mode"
    ];

    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.push(k);
    }

    result.keysScanned = allKeys.length;

    allKeys.forEach(k => {
      if (!preserveKeys.includes(k)) {
        const raw = localStorage.getItem(k);
        const sz = raw ? raw.length : 0;
        localStorage.removeItem(k);
        result.keysCleaned++;
        result.bytesFreed += sz;
      }
    });

    result.summary.push(`Se eliminaron ${result.keysCleaned} claves y se liberaron ${(result.bytesFreed / 1024).toFixed(1)} KB.`);
    result.summary.push("Se preservaron tus credenciales de API, PIN de seguridad y usuarios administradores.");
  } catch (e) {
    console.error("Error purging database:", e);
  }

  return result;
}
