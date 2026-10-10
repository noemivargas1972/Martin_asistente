import * as XLSX from "xlsx";

export interface CleanExcelRow {
  id: number;
  codigo: string;
  producto: string;
  unidad: string;
  cantidadEsperada?: number;
  cantidadContada: number | null;
  estado: "pendiente" | "completado" | "desviado";
  precioUnitario?: number;
  costoUnitario?: number;
  notas?: string;
  excelRowIndex?: number;
  excelQtyColIndex?: number;
}

export interface ExcelParseResult {
  success: boolean;
  fileName: string;
  sheetName: string;
  totalRows: number;
  items: CleanExcelRow[];
  workbook: XLSX.WorkBook | null;
  error?: string;
  detectedColumns: {
    productCol: number;
    codeCol: number;
    qtyCol: number;
    priceCol: number;
  };
}

/**
 * Intelligent Excel / CSV Parser designed for Smart Commerce.
 * Auto-detects columns, sanitizes numbers, cleans up special characters,
 * and preserves raw cell locations for round-trip Excel export.
 */
export function parseExcelFile(
  binaryData: string | ArrayBuffer,
  fileName: string
): ExcelParseResult {
  try {
    const wb = XLSX.read(binaryData, {
      type: typeof binaryData === "string" ? "binary" : "array",
      cellStyles: true,
      cellFormula: true,
      cellDates: true,
      cellNF: true
    });

    const sheetName = wb.SheetNames[0] || "Hoja1";
    const ws = wb.Sheets[sheetName];
    if (!ws) {
      return {
        success: false,
        fileName,
        sheetName,
        totalRows: 0,
        items: [],
        workbook: wb,
        error: "La hoja de cálculo está vacía o dañada.",
        detectedColumns: { productCol: 0, codeCol: -1, qtyCol: 1, priceCol: -1 }
      };
    }

    // Convert sheet to array of rows (header: 1 returns raw array of arrays)
    const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" });
    if (!rawRows || rawRows.length === 0) {
      return {
        success: false,
        fileName,
        sheetName,
        totalRows: 0,
        items: [],
        workbook: wb,
        error: "No se encontraron filas con datos en el archivo Excel.",
        detectedColumns: { productCol: 0, codeCol: -1, qtyCol: 1, priceCol: -1 }
      };
    }

    // Column detection logic
    let headerRowIndex = 0;
    let productCol = -1;
    let codeCol = -1;
    let qtyCol = -1;
    let priceCol = -1;

    // Scan first 10 rows to identify header row
    for (let r = 0; r < Math.min(10, rawRows.length); r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;

      row.forEach((cellVal, c) => {
        const str = String(cellVal || "").toLowerCase().trim();
        if (!str) return;

        if (productCol === -1 && (
          str.includes("product") || str.includes("descrip") || str.includes("articul") ||
          str.includes("nombre") || str.includes("detalle") || str.includes("item")
        )) {
          productCol = c;
          headerRowIndex = r;
        }

        if (codeCol === -1 && (
          str.includes("cod") || str.includes("sku") || str.includes("id") || str.includes("clave")
        )) {
          codeCol = c;
        }

        if (qtyCol === -1 && (
          str.includes("cant") || str.includes("stock") || str.includes("unid") ||
          str.includes("esperad") || str.includes("existenci") || str.includes("saldo")
        )) {
          qtyCol = c;
        }

        if (priceCol === -1 && (
          str.includes("preci") || str.includes("cost") || str.includes("monto") || str.includes("valor")
        )) {
          priceCol = c;
        }
      });

      if (productCol !== -1) break; // Found header row
    }

    // Fallbacks if auto-detection didn't match exact headers
    if (productCol === -1) productCol = 0;
    if (qtyCol === -1) qtyCol = productCol === 0 ? 1 : 0;

    const startRow = productCol !== -1 && headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
    const items: CleanExcelRow[] = [];

    for (let i = startRow; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const rawProduct = String(row[productCol] !== undefined ? row[productCol] : "").trim();
      if (!rawProduct || rawProduct.length < 2) continue; // Skip empty/too short lines

      // Clean Code
      const rawCode = codeCol !== -1 && row[codeCol] ? String(row[codeCol]).trim() : `ART-${100 + items.length + 1}`;

      // Clean Quantity
      let expQty: number | undefined = undefined;
      const rawQtyVal = qtyCol !== -1 ? row[qtyCol] : undefined;
      if (rawQtyVal !== undefined && rawQtyVal !== "" && !isNaN(Number(rawQtyVal))) {
        expQty = Math.abs(Number(rawQtyVal));
      }

      // Clean Price
      let priceVal: number | undefined = undefined;
      const rawPriceVal = priceCol !== -1 ? row[priceCol] : undefined;
      if (rawPriceVal !== undefined && rawPriceVal !== "" && !isNaN(Number(rawPriceVal))) {
        priceVal = Number(rawPriceVal);
      }

      items.push({
        id: items.length + 1,
        codigo: rawCode,
        producto: rawProduct,
        unidad: "unidades",
        cantidadEsperada: expQty,
        cantidadContada: null,
        estado: "pendiente",
        precioUnitario: priceVal,
        excelRowIndex: i,
        excelQtyColIndex: qtyCol
      });
    }

    return {
      success: items.length > 0,
      fileName,
      sheetName,
      totalRows: items.length,
      items,
      workbook: wb,
      detectedColumns: { productCol, codeCol, qtyCol, priceCol },
      error: items.length === 0 ? "No se detectaron productos válidos en el archivo Excel." : undefined
    };

  } catch (err: any) {
    console.error("[ExcelProcessor] Error parsing file:", err);
    return {
      success: false,
      fileName,
      sheetName: "Error",
      totalRows: 0,
      items: [],
      workbook: null,
      error: `Error al procesar el archivo Excel: ${err?.message || "Formato no compatible"}`,
      detectedColumns: { productCol: 0, codeCol: -1, qtyCol: 1, priceCol: -1 }
    };
  }
}

/**
 * Export current inventory items back to Excel preserving formatting
 */
export function exportToExcel(
  items: CleanExcelRow[],
  fileName: string = "Inventario_SmartCommerce_Marti.xlsx",
  existingWorkbook?: XLSX.WorkBook | null
): void {
  try {
    let wb = existingWorkbook;

    if (!wb) {
      wb = XLSX.utils.book_new();
      const exportData = items.map((item) => ({
        "Código": item.codigo,
        "Producto": item.producto,
        "Unidad": item.unidad,
        "Cantidad Esperada": item.cantidadEsperada ?? "-",
        "Cantidad Contada (Físico)": item.cantidadContada ?? 0,
        "Diferencia": item.cantidadEsperada !== undefined && item.cantidadContada !== null
          ? item.cantidadContada - item.cantidadEsperada
          : "-",
        "Estado": item.estado.toUpperCase(),
        "Notas": item.notas || ""
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [
        { wch: 15 },
        { wch: 40 },
        { wch: 12 },
        { wch: 18 },
        { wch: 22 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Inventario Consolidado");
    } else {
      // Update original workbook in-place
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      items.forEach((item) => {
        if (item.excelRowIndex !== undefined && item.excelQtyColIndex !== undefined) {
          const cellRef = XLSX.utils.encode_cell({ r: item.excelRowIndex, c: item.excelQtyColIndex });
          if (item.cantidadContada !== null) {
            ws[cellRef] = { t: "n", v: item.cantidadContada };
          }
        }
      });
    }

    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error("[ExcelProcessor] Error exporting excel:", err);
  }
}
