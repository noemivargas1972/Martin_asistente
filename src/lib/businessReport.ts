import { useState, useEffect } from "react";

export interface DictatedProduct {
  id: string;
  brand: string;
  product: string;
  quantity: string;
  observations?: string;
  updatedAt: string;
}

export interface BusinessReportData {
  lastUpdated: string;
  sessionKey: string; // Unique timestamp to force fresh state/downloads
  title: string;
  products: DictatedProduct[];
  csvContent: string;
  totalItemsCount: number;
}

const STORAGE_KEY = "smart_commerce_business_report_data";
const EVENT_NAME = "smart_commerce_business_report_updated";

// Helper to extract clean products from table markdown or raw dictation text
export function parseDictatedProductsFromText(text: string): DictatedProduct[] {
  if (!text || typeof text !== "string") return [];

  const products: DictatedProduct[] = [];
  const lines = text.split("\n");

  // 1. Try parsing Markdown table lines first (| Marca | Producto | Cantidad | ...)
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      const cells = trimmed
        .split("|")
        .map(c => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      // Skip header or separator rows
      if (cells.length >= 3 && !cells.every(c => /^:?-+:?$/.test(c))) {
        const firstCellLower = cells[0].toLowerCase();
        if (firstCellLower.includes("marca") || firstCellLower.includes("puesto") || firstCellLower.includes("sucursal")) {
          continue; // Skip table header
        }

        const brand = cells[0] || "General";
        const product = cells[1] || "Artículo";
        const quantity = cells[2] || "1";
        const observations = cells[3] || "Conteo registrado";

        products.push({
          id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          brand,
          product,
          quantity,
          observations,
          updatedAt: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
        });
      }
    }
  }

  // 2. Fallback: Parse raw dictation lines or comma-separated chunks if no table found
  if (products.length === 0) {
    const rawChunks = text
      .split(/[,;\n\r•]+/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const raw of rawChunks) {
      if (!raw || raw.length < 2) continue;
      const lowerRaw = raw.toLowerCase();
      if (
        lowerRaw.startsWith("hola") ||
        lowerRaw.startsWith("bueno") ||
        lowerRaw.includes("quiero generar") ||
        lowerRaw.includes("te quiero dictar") ||
        lowerRaw.includes("excel") ||
        lowerRaw.includes("planilla")
      ) {
        continue;
      }

      let quantity = "1";
      let cleanProd = raw;

      // Extract trailing or leading numbers (e.g., "15 Coca Cola" or "Coca Cola 15 u")
      const leadingMatch = raw.match(/^(\d+)\s+(.+)/);
      const trailingMatch = raw.match(/(.+?)\s+(\d+)\s*(u|unidades|packs|cajas)?$/i);

      if (leadingMatch) {
        quantity = leadingMatch[1];
        cleanProd = leadingMatch[2];
      } else if (trailingMatch) {
        cleanProd = trailingMatch[1];
        quantity = trailingMatch[2];
      }

      const formattedProd = cleanProd.charAt(0).toUpperCase() + cleanProd.slice(1);
      
      // Basic brand guessing
      let brand = "General";
      const lowerP = formattedProd.toLowerCase();
      if (lowerP.includes("coca") || lowerP.includes("pepsi") || lowerP.includes("fanta") || lowerP.includes("sprite") || lowerP.includes("manaos") || lowerP.includes("gaseosa")) {
        brand = "Gaseosas & Bebidas";
      } else if (lowerP.includes("agua") || lowerP.includes("levite") || lowerP.includes("villavicencio") || lowerP.includes("ser")) {
        brand = "Aguas & Saborizadas";
      } else if (lowerP.includes("yerba") || lowerP.includes("playadito") || lowerP.includes("taragui") || lowerP.includes("rosamonte")) {
        brand = "Yerba Mate & Infusiones";
      } else if (lowerP.includes("cerveza") || lowerP.includes("heineken") || lowerP.includes("quilmes") || lowerP.includes("brahma") || lowerP.includes("stella")) {
        brand = "Cervezas";
      } else if (lowerP.includes("galletita") || lowerP.includes("pepitos") || lowerP.includes("chocolate") || lowerP.includes("cofler") || lowerP.includes("alfajor") || lowerP.includes("turron")) {
        brand = "Golosinas & Galletitas";
      } else if (lowerP.includes("detergente") || lowerP.includes("ala") || lowerP.includes("lavandina") || lowerP.includes("limpieza")) {
        brand = "Limpieza";
      } else if (lowerP.includes("leche") || lowerP.includes("queso") || lowerP.includes("manteca") || lowerP.includes("serenisima")) {
        brand = "Lácteos";
      }

      products.push({
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        brand,
        product: formattedProd,
        quantity,
        observations: "Dictado por voz",
        updatedAt: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      });
    }
  }

  return products;
}

// Compile products array into CSV format ready for Excel with UTF-8 BOM
export function compileProductsToCsv(products: DictatedProduct[], title: string = "Control_Productos_Dictados"): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR");
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  let csv = `Smart Commerce - ${title}\n`;
  csv += `Fecha de Generacion,${dateStr} ${timeStr}\n`;
  csv += `Total de Articulos,${products.length}\n\n`;
  csv += `Marca,Producto,Cantidad,Observaciones,Hora_Registro\n`;

  if (products.length === 0) {
    csv += `"Sin datos","No se registraron productos en esta sesion","0","N/A","${timeStr}"\n`;
  } else {
    for (const p of products) {
      const cleanBrand = (p.brand || "General").replace(/"/g, '""');
      const cleanProd = (p.product || "Producto").replace(/"/g, '""');
      const cleanQty = (p.quantity || "1").replace(/"/g, '""');
      const cleanObs = (p.observations || "Registrado").replace(/"/g, '""');
      const cleanTime = (p.updatedAt || timeStr).replace(/"/g, '""');

      csv += `"${cleanBrand}","${cleanProd}","${cleanQty}","${cleanObs}","${cleanTime}"\n`;
    }
  }

  return csv;
}

// Default initial state
const defaultReportData: BusinessReportData = {
  lastUpdated: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  sessionKey: String(Date.now()),
  title: "Control de Productos Dictados por Voz",
  products: [
    {
      id: "init-1",
      brand: "Gaseosas & Bebidas",
      product: "Coca-Cola 1.5L",
      quantity: "15 u",
      observations: "Dictado por voz",
      updatedAt: "19:30"
    },
    {
      id: "init-2",
      brand: "Aguas & Saborizadas",
      product: "Agua Villavicencio 1.5L",
      quantity: "10 u",
      observations: "Dictado por voz",
      updatedAt: "19:30"
    }
  ],
  csvContent: "",
  totalItemsCount: 2
};
defaultReportData.csvContent = compileProductsToCsv(defaultReportData.products, defaultReportData.title);

// Get current report data from localStorage or default
export function getBusinessReportData(): BusinessReportData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.products)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not parse saved businessReportData:", e);
  }
  return defaultReportData;
}

// Update reactive businessReportData state, persist, and notify subscribers
export function updateBusinessReportData(
  input: DictatedProduct[] | string,
  customTitle: string = "Control de Productos Dictados"
): BusinessReportData {
  let products: DictatedProduct[] = [];

  if (typeof input === "string") {
    products = parseDictatedProductsFromText(input);
  } else if (Array.isArray(input)) {
    products = input;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR");
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const uniqueSessionKey = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}_${now.getTime()}`;

  const compiledCsv = compileProductsToCsv(products, customTitle);

  const newReportState: BusinessReportData = {
    lastUpdated: `${dateStr} ${timeStr}`,
    sessionKey: uniqueSessionKey,
    title: customTitle,
    products,
    csvContent: compiledCsv,
    totalItemsCount: products.length
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReportState));
  } catch (e) {
    console.error("Error saving businessReportData to localStorage:", e);
  }

  // Dispatch custom event to force reactive update in all active components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newReportState }));
  }

  return newReportState;
}

// Triggers instant browser download of CSV file with unique timestamped filename
export function downloadBusinessReportCsv(
  data?: BusinessReportData,
  customFilename?: string
): void {
  const report = data || getBusinessReportData();
  const csvContent = report.csvContent || compileProductsToCsv(report.products, report.title);

  // UTF-8 BOM prefix (\ufeff) ensures Excel opens special characters (accents, ñ) perfectly
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}${String(now.getSeconds()).padStart(2,"0")}`;
  
  const filename = customFilename || `Planilla_Productos_Dictados_${timestamp}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// React Hook for subscription to reactive businessReportData changes
export function useBusinessReportData(): [BusinessReportData, (input: DictatedProduct[] | string, title?: string) => void] {
  const [reportData, setReportData] = useState<BusinessReportData>(getBusinessReportData);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<BusinessReportData>;
      if (customEvt.detail) {
        setReportData(customEvt.detail);
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  const update = (input: DictatedProduct[] | string, title?: string) => {
    const newState = updateBusinessReportData(input, title);
    setReportData(newState);
  };

  return [reportData, update];
}
