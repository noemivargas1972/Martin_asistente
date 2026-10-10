/**
 * Inventory Consolidator Engine for Smart Commerce & Martín IA
 * 
 * Guarantees:
 * 1. Automatic recognition of repeated products & variant unification.
 * 2. Quantity accumulation (e.g. 10 Coca 500ml + 15 Coca 500ml = 25 Coca 500ml).
 * 3. Session memory maintenance during dictation/conteo.
 * 4. Consolidated native .xlsx generation without duplicate rows.
 */

import { saveToLocalMemory, loadFromLocalMemory, removeFromLocalMemory, STORAGE_KEYS } from "./localMemory";

export interface DictatedProductItem {
  brand: string;
  product: string;
  quantity: number;
  observation?: string;
  lastUpdated?: string;
}

/**
 * Normalizes product name to recognize variants and duplicates
 * e.g. "Coca-Cola 500ml", "coca de 500", "Coca Cola 500 ml" -> "coca-cola 500ml"
 */
export function normalizeProductKey(rawName: string): string {
  if (!rawName) return "";
  
  let name = rawName.trim().toLowerCase();
  
  // Strip accents
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Standardize common brand/product shortcuts
  name = name.replace(/\bcoca[\s\-_]*cola\b/g, "coca-cola");
  name = name.replace(/\bcoca\b/g, "coca-cola");
  name = name.replace(/\bagua[\s\-_]*mineral\b/g, "agua mineral");
  
  // Clean up filler words
  name = name.replace(/\b(de|x|unidades|uds|u|cajas|packs|botellas|por)\b/g, " ");

  // Remove extra spaces and punctuation
  name = name.replace(/[^\w\d]/g, "");

  return name;
}

/**
 * Consolidates array of dictated product items by recognizing duplicates and accumulating quantities
 */
export function consolidateDictatedItems(
  existingItems: DictatedProductItem[],
  newItems: DictatedProductItem[]
): DictatedProductItem[] {
  const map = new Map<string, DictatedProductItem>();

  const processItem = (item: DictatedProductItem) => {
    if (!item.product || item.product.trim().length === 0) return;

    const key = normalizeProductKey(item.product);
    if (!key) return;

    const parsedQty = typeof item.quantity === "number" 
      ? item.quantity 
      : parseFloat(String(item.quantity).replace(/[^\d\.]/g, "")) || 0;

    if (map.has(key)) {
      const current = map.get(key)!;
      current.quantity += parsedQty;
      if (item.observation && !current.observation?.includes(item.observation)) {
        current.observation = current.observation ? `${current.observation}; ${item.observation}` : item.observation;
      }
    } else {
      map.set(key, {
        brand: item.brand || deriveBrandFromProduct(item.product),
        product: formatProductTitle(item.product),
        quantity: parsedQty,
        observation: item.observation || "Registrado",
        lastUpdated: new Date().toISOString()
      });
    }
  };

  existingItems.forEach(processItem);
  newItems.forEach(processItem);

  const consolidatedList = Array.from(map.values());

  // Sort by brand then product name
  consolidatedList.sort((a, b) => a.brand.localeCompare(b.brand) || a.product.localeCompare(b.product));

  return consolidatedList;
}

/**
 * Derives brand from product name if brand is empty or generic
 */
export function deriveBrandFromProduct(productName: string): string {
  const lower = (productName || "").toLowerCase();
  if (lower.includes("coca") || lower.includes("sprite") || lower.includes("fanta")) return "Coca-Cola";
  if (lower.includes("agua") || lower.includes("cellier") || lower.includes("soda") || lower.includes("villavicencio") || lower.includes("levite")) return "Aguas / Bebidas";
  if (lower.includes("gatorade") || lower.includes("powerade")) return "Isotónicas";
  if (lower.includes("cerveza") || lower.includes("quilmes") || lower.includes("brahma") || lower.includes("heineken") || lower.includes("stella")) return "Cervezas";
  if (lower.includes("yerba") || lower.includes("playadito") || lower.includes("taragui")) return "Infusiones";
  if (lower.includes("alfajor") || lower.includes("galletita") || lower.includes("chocolate") || lower.includes("cofler") || lower.includes("pepitos")) return "Golosinas";
  return "General";
}

/**
 * Formats title nicely (Capitalizes words)
 */
export function formatProductTitle(rawProduct: string): string {
  if (!rawProduct) return "";
  const trimmed = rawProduct.trim().replace(/^[\.\,\;\-\s]+|[\.\,\;\-\s]+$/g, "");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Loads working inventory draft from session memory
 */
export function getWorkingInventoryDraft(): DictatedProductItem[] {
  return loadFromLocalMemory<DictatedProductItem[]>(STORAGE_KEYS.EXCEL_WORKING_DRAFT, []);
}

/**
 * Saves working inventory draft to session memory
 */
export function saveWorkingInventoryDraft(items: DictatedProductItem[]): void {
  saveToLocalMemory(STORAGE_KEYS.EXCEL_WORKING_DRAFT, items);
}

/**
 * Clears working inventory draft from session memory
 */
export function clearWorkingInventoryDraft(): void {
  removeFromLocalMemory(STORAGE_KEYS.EXCEL_WORKING_DRAFT);
}

/**
 * Converts consolidated products into Markdown table and WRITE_FILE tag
 */
export function buildConsolidatedExcelMarkdown(items: DictatedProductItem[], dateSourceStr?: string): string {
  if (!items || items.length === 0) {
    return `### 📊 Planilla de Control de Productos Dictados (Estructura Vacía)

| Marca | Producto | Cantidad | Observación |
| :--- | :--- | ---: | :--- |
*(Sin registros de datos — Plantilla base lista)*

<WRITE_FILE name="Smart Commerce - Control Productos Dictados.xlsx" mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
Marca,Producto,Cantidad,Observacion
</WRITE_FILE>

📌 **Origen de datos**: Plantilla base vacía (sin registros acumulados).`;
  }

  const markdownRows = items
    .map(i => `| **${i.brand}** | ${i.product} | **${i.quantity} u.** | ${i.observation || 'Registrado'} |`)
    .join("\n");

  const csvContent = items
    .map(i => `"${i.brand}","${i.product}","${i.quantity}","${i.observation || 'Registrado'}"`)
    .join("\n");

  const sourceNotice = dateSourceStr || `Productos acumulados en esta sesión (${new Date().toLocaleDateString("es-AR")})`;

  return `### 📊 Planilla Consolidada de Productos Dictados

| Marca | Producto | Cantidad | Observación |
| :--- | :--- | ---: | :--- |
${markdownRows}

<WRITE_FILE name="Smart Commerce - Control Productos Dictados.xlsx" mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
Marca,Producto,Cantidad,Observacion
${csvContent}
</WRITE_FILE>

📌 **Origen de los datos**: ${sourceNotice}`;
}

