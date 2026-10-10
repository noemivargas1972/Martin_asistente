import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight, 
  Activity, 
  FileSpreadsheet, 
  Layers, 
  Bot, 
  Send, 
  Sparkles, 
  Plus, 
  ChevronRight,
  RefreshCw,
  Clock,
  Briefcase,
  Truck,
  Camera,
  MapPin,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  ListChecks,
  Sun,
  Thermometer,
  Lock,
  Unlock,
  CloudSun,
  Mic,
  Volume2,
  Smartphone,
  Trash2,
  Download,
  Upload,
  Bell
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

import { UserRole } from "../types";
import * as XLSX from "xlsx";
import MartinStockRedistributionAgent from "./MartinStockRedistributionAgent";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: UserRole;
  userDisplayName?: string;
}


// FORMAT UTIL
const formatARS = (val: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(val);
};

export default function DashboardTabs({ activeTab, setActiveTab, userRole = "owner", userDisplayName = "Noemí Carvallo" }: DashboardTabsProps) {
  // Global Local State for Simulation (making all fields interactive and testable!)
  const [salesData, setSalesData] = useState([
    { fecha: "2026-06-24", ventas: 1150000, costo: 862500, ganancia: 287500, transacciones: 264 },
    { fecha: "2026-06-25", ventas: 1210000, costo: 907500, ganancia: 302500, transacciones: 278 },
    { fecha: "2026-06-26", ventas: 1340000, costo: 1005000, ganancia: 335000, transacciones: 301 },
    { fecha: "2026-06-27", ventas: 1450000, costo: 1087500, ganancia: 362500, transacciones: 312 },
    { fecha: "2026-06-28", ventas: 1250000, costo: 937500, ganancia: 312500, transacciones: 287 },
    { fecha: "2026-06-29", ventas: 1180000, costo: 885000, ganancia: 295000, transacciones: 256 },
    { fecha: "2026-06-30", ventas: 1250000, costo: 937500, ganancia: 312500, transacciones: 287 },
  ]);

  const [stockData, setStockData] = useState<any[]>([]);

  const [invoicesData, setInvoicesData] = useState<any[]>([]);

  const [categoriesProfitability, setCategoriesProfitability] = useState([
    { categoria: "Golosinas", ventasTotales: 2750300, costoTotal: 1925210, margenPromedio: 0.30, rendimiento: "Alto" },
    { categoria: "Bebidas", ventasTotales: 3320000, costoTotal: 2490000, margenPromedio: 0.25, rendimiento: "Medio" },
    { categoria: "Almacen", ventasTotales: 2250200, costoTotal: 1800160, margenPromedio: 0.20, rendimiento: "Medio" },
    { categoria: "Limpieza", ventasTotales: 1238500, costoTotal: 866950, margenPromedio: 0.30, rendimiento: "Alto" },
    { categoria: "Lacteos", ventasTotales: 1750400, costoTotal: 1400320, margenPromedio: 0.20, rendimiento: "Medio" },
    { categoria: "Otros", ventasTotales: 550100, costoTotal: 412575, margenPromedio: 0.25, rendimiento: "Bajo" },
  ]);

  const [storesClosure, setStoresClosure] = useState([
    { id: 1, label: "Local 1 - Centro", baseEf: 380000, baseDig: 450000, total: 830000, arqueoStatus: "Cuadrado" },
    { id: 2, label: "Local 2 - Palermo", baseEf: 420000, baseDig: 730000, total: 1150000, arqueoStatus: "Cuadrado" },
    { id: 3, label: "Local 3 - Belgrano", baseEf: 350000, baseDig: 600000, total: 950000, arqueoStatus: "Cuadrado" },
    { id: 4, label: "Local 4 - Almagro", baseEf: 310000, baseDig: 410000, total: 720000, arqueoStatus: "Discrepancia -$3500" },
    { id: 5, label: "Local 5 - Flores", baseEf: 450000, baseDig: 440000, total: 890000, arqueoStatus: "Cuadrado" },
    { id: 6, label: "Local 6 - Caballito", baseEf: 390000, baseDig: 520000, total: 910000, arqueoStatus: "Cuadrado" },
    { id: 7, label: "Local 7 - Recoleta", baseEf: 410000, baseDig: 870000, total: 1280000, arqueoStatus: "Cuadrado" },
    { id: 8, label: "Local 8 - Devoto", baseEf: 290000, baseDig: 390000, total: 680000, arqueoStatus: "Cuadrado" },
    { id: 9, label: "Local 9 - San Telmo", baseEf: 340000, baseDig: 410000, total: 750000, arqueoStatus: "Cuadrado" },
    { id: 10, label: "Local 10 - Nuñez", baseEf: 360000, baseDig: 660000, total: 1020000, arqueoStatus: "Cuadrado" },
  ]);

  // Form states for simulations
  const [newSaleVal, setNewSaleVal] = useState("");
  const [newSaleCost, setNewSaleCost] = useState("");
  const [newStockProd, setNewStockProd] = useState("");
  const [newStockQty, setNewStockQty] = useState("");
  const [newInvoiceProv, setNewInvoiceProv] = useState("");
  const [newInvoiceMonto, setNewInvoiceMonto] = useState("");

  // NUEVOS ESTADOS DE AUDITORÍA Y ESCÁNER CON VOZ
  const [stockSubTab, setStockSubTab] = useState<"lista" | "auditoria">("lista");
  const [auditSession, setAuditSession] = useState<{
    id: string;
    producto: string;
    codigoBarras: string;
    cantidadOriginal: number;
    cantidadAuditada: number;
    diferencia: number;
    timestamp: string;
  }[]>([]);
  const [auditQty, setAuditQty] = useState<number>(1);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [auditMode, setAuditMode] = useState<"reemplazar" | "sumar">("reemplazar");
  const [lastScannedItem, setLastScannedItem] = useState<{
    producto: string;
    cantidad: number;
    codigo: string;
    isSuccess: boolean;
    msg: string;
  } | null>(null);

  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("Inactivo");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [auditToast, setAuditToast] = useState<string | null>(null);

  // NUEVOS ESTADOS DE AUDITORÍA CON PLANTILLA EXCEL Y FOTO CON IA
  const [templateFile, setTemplateFile] = useState<{
    name: string;
    headers: string[];
    rows: any[];
    originalOrder: any[];
  } | null>(null);
  const [excelAuditMode, setExcelAuditMode] = useState<boolean>(false);
  const [photoForAI, setPhotoForAI] = useState<string | null>(null);
  const [aiDictation, setAiDictation] = useState<string>("");
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [excelSearchQuery, setExcelSearchQuery] = useState<string>("");

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // EFECTOS DE AUDIO SINTETIZADOS NATIVAMENTE
  const playScanSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // Nota Do (C6)
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.log("Audio feedback error:", e);
    }
  };

  const playSuccessBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1318.51, audioCtx.currentTime); // Nota Mi (E6)
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log("Audio feedback error:", e);
    }
  };

  // MAPA DE PALABRAS A NÚMEROS EN ESPAÑOL
  const spanishNumberWords: { [key: string]: number } = {
    "cero": 0, "un": 1, "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, 
    "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
    "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15,
    "dieciséis": 16, "diecisiete": 17, "dieciocho": 18, "diecinueve": 19, "veinte": 20,
    "treinta": 30, "cuarenta": 40, "cincuenta": 50, "sesenta": 60, "setenta": 70, "ochenta": 80, "noventa": 90, "cien": 100
  };

  // --- NUEVAS FUNCIONES PARA CONTROL POR EXCEL Y DICTADO DE FOTOS CON IA ---

  // Cargar plantilla Excel para Auditoría en Tiempo Real
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw rows as an array of objects
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];
        
        if (rawJson.length === 0) {
          setAuditToast("⚠️ El archivo Excel está vacío.");
          return;
        }

        // Detect or normalize column names
        const headers = Object.keys(rawJson[0]);
        
        // Map and normalize rows
        const normalizedRows = rawJson.map((row, idx) => {
          const productoCol = Object.keys(row).find(k => 
            /producto|art[íi]culo|nombre|item|descripci[oó]n/i.test(k)
          ) || headers[0];
          
          const codigoCol = Object.keys(row).find(k => 
            /c[oó]digo|barras|ean|barcode|cod/i.test(k)
          ) || headers[1];

          const stockCol = Object.keys(row).find(k => 
            /stock|cantidad|teorico|te[oó]rico|actual/i.test(k)
          );

          const conteoCol = Object.keys(row).find(k => 
            /conteo|f[ií]sico|real|auditado|fisico/i.test(k)
          );

          const productoVal = row[productoCol] || `Producto ${idx + 1}`;
          const codigoVal = String(row[codigoCol] || "").trim();
          const stockVal = stockCol ? parseInt(row[stockCol]) || 0 : 0;
          const conteoVal = conteoCol && row[conteoCol] !== "" ? parseInt(row[conteoCol]) : null;

          return {
            originalRow: { ...row },
            producto: productoVal,
            codigoBarras: codigoVal,
            stockTeorico: stockVal,
            cantidadAuditada: conteoVal,
            originalKeyProducto: productoCol,
            originalKeyCodigo: codigoCol,
            originalKeyStock: stockCol || "Stock Original",
            originalKeyConteo: conteoCol || "Conteo Físico",
            originalIndex: idx
          };
        });

        const hasConteoHeader = headers.some(h => /conteo|f[ií]sico|real|auditado/i.test(h));
        const finalHeaders = hasConteoHeader ? headers : [...headers, "Conteo Físico"];

        setTemplateFile({
          name: file.name,
          headers: finalHeaders,
          rows: normalizedRows,
          originalOrder: rawJson
        });
        setExcelAuditMode(true);
        setAuditToast(`✅ Plantilla Excel cargada: ${file.name}. Se detectaron ${normalizedRows.length} productos.`);
        playSuccessBeep();
      } catch (err: any) {
        console.error("Error parsing Excel:", err);
        setAuditToast("❌ Error al leer el archivo Excel. Asegurate de que sea un formato válido (.xlsx, .xls o .csv).");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Exportar Excel de auditoría completado en el EXACTO orden original
  const exportExcelAudit = () => {
    if (!templateFile) return;

    try {
      const updatedJson = templateFile.rows.map((row) => {
        const orig = { ...row.originalRow };
        const conteoColName = row.originalKeyConteo;
        orig[conteoColName] = row.cantidadAuditada !== null ? row.cantidadAuditada : "";
        return orig;
      });

      const worksheet = XLSX.utils.json_to_sheet(updatedJson);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoría de Stock");

      const fileName = `CONTEO_COMPLETADO_${templateFile.name}`;
      XLSX.writeFile(workbook, fileName);
      setAuditToast(`💾 Conteo exportado exitosamente en el orden original!`);
      playSuccessBeep();
    } catch (err) {
      console.error("Error exporting Excel:", err);
      setAuditToast("❌ Hubo un error al exportar el archivo Excel.");
    }
  };

  // Cargar imagen de producto desde celular/notebook
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setPhotoForAI(base64);
      setAiError(null);
    };
    reader.readAsDataURL(file);
  };

  // Enviar foto y dictado de Noemí a Martín IA para auditoría inteligente
  const processPhotoWithAI = async () => {
    if (!photoForAI) {
      setAiError("Por favor, cargá o sacá una foto primero.");
      return;
    }

    setAiAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch("/api/audit/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photoForAI,
          dictation: aiDictation
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al analizar la foto.");
      }

      const data = await response.json();
      const detectedProducts = data.products || [];

      if (detectedProducts.length === 0) {
        setAiError("No se pudieron detectar productos en la imagen. Por favor, reintentá con una mejor toma.");
        setAiAnalyzing(false);
        return;
      }

      // Procesar cada producto detectado por la IA
      detectedProducts.forEach((prod: any) => {
        // Si no se lee código de barras, generamos un identificador único local
        const barcode = prod.codigoBarras || `999${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        
        // Registrar en stockData (Base de Datos) si no existe
        const existingInDb = stockData.find(item => item.codigoBarras === barcode || item.producto.toLowerCase() === prod.nombreProducto.toLowerCase());
        
        if (!existingInDb) {
          const newDbItem = {
            producto: prod.nombreProducto,
            categoria: prod.categoria || "Otros",
            stockActual: 0,
            stockMinimo: 20,
            proveedor: "Proveedor Detectado IA",
            estado: "Stock Bajo",
            precioCosto: prod.precioCosto || 500,
            precioVenta: (prod.precioCosto || 500) * 1.5,
            codigoBarras: barcode
          };
          
          setStockData(prev => [...prev, newDbItem]);
        }

        // Ejecutar escaneo con cantidad detectada
        setAuditQty(prod.cantidad || 1);
        setAuditMode("reemplazar"); // fijar valor detectado
        triggerBarcodeScan(barcode);
      });

      setAuditToast(`✨ Martín IA procesó la foto y registró ${detectedProducts.length} producto(s) exitosamente.`);
      setPhotoForAI(null);
      setAiDictation("");
      playSuccessBeep();
    } catch (err: any) {
      console.error("AI photo analysis error:", err);
      setAiError(err.message || "Error al procesar la foto con Martín IA.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  // PROCESAR ESCANEO DE CÓDIGO DE BARRAS (MODO LIBRE O MODO PLANTILLA)
  const triggerBarcodeScan = (barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;

    // Actualizar dinámicamente el stock local en tiempo real
    setStockData(prev => prev.map(item => {
      if (item.codigoBarras === cleanBarcode) {
        const newQty = auditMode === "sumar" ? item.stockActual + auditQty : auditQty;
        return {
          ...item,
          stockActual: newQty,
          estado: newQty >= item.stockMinimo ? "Stock OK" : "Stock Bajo"
        };
      }
      return item;
    }));

    if (excelAuditMode && templateFile) {
      const updatedRows = [...templateFile.rows];
      const matchIdx = updatedRows.findIndex(row => row.codigoBarras === cleanBarcode);
      
      if (matchIdx > -1) {
        playScanSound();
        const row = updatedRows[matchIdx];
        const newQty = auditMode === "sumar" 
          ? (row.cantidadAuditada || 0) + auditQty
          : auditQty;

        updatedRows[matchIdx] = {
          ...row,
          cantidadAuditada: newQty,
          diferencia: newQty - row.stockTeorico
        };

        setTemplateFile({
          ...templateFile,
          rows: updatedRows
        });

        setLastScannedItem({
          producto: row.producto,
          cantidad: auditQty,
          codigo: cleanBarcode,
          isSuccess: true,
          msg: `[Excel] ¡Escaneado con éxito! ${row.producto} (${auditQty} u.)`
        });

        // Sincronizar con auditSession
        const timestamp = new Date().toLocaleTimeString();
        setAuditSession(prev => {
          const existingIdx = prev.findIndex(item => item.codigoBarras === cleanBarcode);
          if (existingIdx > -1) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              cantidadAuditada: newQty,
              diferencia: newQty - row.stockTeorico,
              timestamp
            };
            return updated;
          } else {
            return [...prev, {
              id: Math.random().toString(36).substring(2, 11),
              producto: row.producto,
              codigoBarras: cleanBarcode,
              cantidadOriginal: row.stockTeorico,
              cantidadAuditada: newQty,
              diferencia: newQty - row.stockTeorico,
              timestamp
            }];
          }
        });

        setScannedBarcode("");

        // Highlight animado
        setTimeout(() => {
          const rowElement = document.getElementById(`excel-row-${matchIdx}`);
          if (rowElement) {
            rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
            rowElement.classList.add("bg-indigo-50");
            setTimeout(() => {
              rowElement.classList.remove("bg-indigo-50");
            }, 2500);
          }
        }, 100);

      } else {
        // Buscar en base general de stock
        const prod = stockData.find(item => item.codigoBarras === cleanBarcode);
        if (prod) {
          playScanSound();
          const timestamp = new Date().toLocaleTimeString();
          const newRow = {
            originalRow: { 
              "Producto": prod.producto, 
              "Código de Barras": cleanBarcode, 
              "Stock Original": prod.stockActual,
              "Conteo Físico": auditQty 
            },
            producto: prod.producto,
            codigoBarras: cleanBarcode,
            stockTeorico: prod.stockActual,
            cantidadAuditada: auditQty,
            originalKeyProducto: "Producto",
            originalKeyCodigo: "Código de Barras",
            originalKeyStock: "Stock Original",
            originalKeyConteo: "Conteo Físico",
            originalIndex: updatedRows.length
          };
          
          setTemplateFile({
            ...templateFile,
            rows: [...updatedRows, newRow]
          });

          setLastScannedItem({
            producto: prod.producto,
            fancy: false,
            cantidad: auditQty,
            codigo: cleanBarcode,
            isSuccess: true,
            msg: `¡Agregado nuevo a Excel! ${prod.producto} (${auditQty} u.)`
          } as any);

          setAuditSession(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 11),
              producto: prod.producto,
              codigoBarras: cleanBarcode,
              cantidadOriginal: prod.stockActual,
              cantidadAuditada: auditQty,
              diferencia: auditQty - prod.stockActual,
              timestamp
            }
          ]);
          setScannedBarcode("");
        } else {
          setLastScannedItem({
            producto: "Desconocido",
            cantidad: auditQty,
            codigo: cleanBarcode,
            isSuccess: false,
            msg: `Código ${cleanBarcode} desconocido.`
          });
        }
      }
    } else {
      // Modo auditoría libre original
      const prod = stockData.find(item => item.codigoBarras === cleanBarcode);

      if (prod) {
        playScanSound();
        const timestamp = new Date().toLocaleTimeString();
        
        setAuditSession(prev => {
          const existingIdx = prev.findIndex(item => item.codigoBarras === cleanBarcode);
          if (existingIdx > -1) {
            const updated = [...prev];
            const newQty = auditMode === "sumar" 
              ? updated[existingIdx].cantidadAuditada + auditQty
              : auditQty;
            
            updated[existingIdx] = {
              ...updated[existingIdx],
              cantidadAuditada: newQty,
              diferencia: newQty - prod.stockActual,
              timestamp
            };
            return updated;
          } else {
            return [...prev, {
              id: Math.random().toString(36).substring(2, 11),
              producto: prod.producto,
              codigoBarras: cleanBarcode,
              cantidadOriginal: prod.stockActual,
              cantidadAuditada: auditQty,
              diferencia: auditQty - prod.stockActual,
              timestamp
            }];
          }
        });

        setLastScannedItem({
          producto: prod.producto,
          cantidad: auditQty,
          codigo: cleanBarcode,
          isSuccess: true,
          msg: `¡Escaneado con éxito! ${prod.producto} (${auditQty} u.)`
        });

        setScannedBarcode("");
      } else {
        setLastScannedItem({
          producto: "Desconocido",
          cantidad: auditQty,
          codigo: cleanBarcode,
          isSuccess: false,
          msg: `El código ${cleanBarcode} no está registrado en este local.`
        });
      }
    }

    // Limpiar el aviso flotante después de 4 segundos
    setTimeout(() => {
      setLastScannedItem(null);
    }, 4000);
  };

  // CAPTURA POR VOZ (DICTADO DE CANTIDADES)
  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("No compatible con este navegador");
      setAuditToast("Tu navegador o dispositivo no soporta dictado por voz. Podés escribirlo manualmente.");
      setTimeout(() => setAuditToast(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-AR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceActive(true);
        setVoiceStatus("Escuchando... Decí un número (ej: 'ocho')");
      };

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript.toLowerCase().trim();
        setVoiceStatus(`Escuché: "${speechToText}"`);
        
        let parsedNum = parseInt(speechToText.replace(/[^0-9]/g, ""));
        
        if (isNaN(parsedNum)) {
          const words = speechToText.split(/\s+/);
          for (const w of words) {
            if (spanishNumberWords[w] !== undefined) {
              parsedNum = spanishNumberWords[w];
              break;
            }
          }
        }

        if (!isNaN(parsedNum) && parsedNum >= 0) {
          setAuditQty(parsedNum);
          setVoiceStatus(`Entendido: ${parsedNum}`);
          playSuccessBeep();
        } else {
          setVoiceStatus(`No reconocí un número en: "${speechToText}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        setVoiceStatus("Error de micrófono / reintentá");
        setVoiceActive(false);
      };

      recognition.onend = () => {
        setVoiceActive(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setVoiceStatus("Error al iniciar dictado");
      setVoiceActive(false);
    }
  };

  // CONTROLES DE LA CÁMARA WEB
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error", err);
      setCameraActive(false);
      setAuditToast("No se pudo acceder a la cámara. Usá el simulador rápido o cargá por código.");
      setTimeout(() => setAuditToast(null), 5000);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // OYENTE GLOBAL PARA PISTOLAS DE CÓDIGOS DE BARRAS (TECLADO RÁPIDO)
  React.useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT")) {
        if ((activeEl as HTMLInputElement).id !== "barcodeInputField") {
          return;
        }
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 120) {
        buffer = "";
      }
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length >= 8 && /^\d+$/.test(buffer)) {
          triggerBarcodeScan(buffer);
          buffer = "";
          e.preventDefault();
        }
      } else if (e.key >= "0" && e.key <= "9") {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [auditQty, auditMode, stockData]);

  // APLICAR AUDITORÍA AL INVENTARIO DE LA SUCURSAL
  const applyAuditToInventory = () => {
    if (auditSession.length === 0) return;
    
    setStockData(prev => {
      return prev.map(item => {
        const audited = auditSession.find(a => a.codigoBarras === item.codigoBarras);
        if (audited) {
          const newQty = audited.cantidadAuditada;
          return {
            ...item,
            stockActual: newQty,
            estado: newQty >= item.stockMinimo ? "Stock OK" : "Stock Bajo"
          };
        }
        return item;
      });
    });

    setAuditToast(`Auditoría de stock aplicada. Se actualizaron ${auditSession.length} productos.`);
    setAuditSession([]);
    setTimeout(() => setAuditToast(null), 5000);
  };

  // EXPORTAR A PLANILLA EXCEL / CSV
  const exportAuditToCSV = () => {
    if (auditSession.length === 0) return;

    const headers = ["Fecha/Hora", "Producto", "Codigo de Barras", "Stock Teorico (Original)", "Stock Fisico (Auditado)", "Diferencia (Mermas)", "Auditor"];
    const rows = auditSession.map(item => [
      item.timestamp,
      item.producto,
      item.codigoBarras,
      item.cantidadOriginal,
      item.cantidadAuditada,
      item.diferencia,
      userDisplayName
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Auditoria_Stock_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Planificación Logística y Red de Seguridad (Safety Net) States
  const [logisticsProducts, setLogisticsProducts] = useState([
    { id: 1, producto: "Sándwich Jamón y Queso", baseVenta: 40, safetyNet: 45, unidad: "u", costo: 450, venta: 900, elaboradoHoy: 45 },
    { id: 2, producto: "Sándwich de Pollo Teriyaki", baseVenta: 25, safetyNet: 28, unidad: "u", costo: 520, venta: 1100, elaboradoHoy: 28 },
    { id: 3, producto: "Sándwich de Bondiola Desmechada", baseVenta: 15, safetyNet: 17, unidad: "u", costo: 680, venta: 1400, elaboradoHoy: 17 },
    { id: 4, producto: "Ensalada César Premium", baseVenta: 20, safetyNet: 23, unidad: "u", costo: 400, venta: 850, elaboradoHoy: 23 },
    { id: 5, producto: "Yogur con Granola y Frutos Secos", baseVenta: 30, safetyNet: 34, unidad: "u", costo: 250, venta: 550, elaboradoHoy: 34 },
  ]);

  const [activeEvents, setActiveEvents] = useState([
    { id: 1, local: "Recoleta", tipo: "Marcha Masiva", impacto: "+400%", extraQty: 40, sándwichesTotal: 50, desc: "Manifestación masiva en Plaza Francia aumenta tránsito peatonal." },
    { id: 2, local: "Devoto", tipo: "Bloqueo / Corte de Calle", impacto: "-80%", extraQty: -8, sándwichesTotal: 2, desc: "Obras viales cortan el acceso de autos a la manzana principal." },
  ]);

  const [redistributionRescues, setRedistributionRescues] = useState([
    { id: 1, producto: "Sándwich Jamón y Queso", origen: "Devoto", destino: "Palermo", unidades: 15, diasVencimiento: 2, estado: "Pendiente", justificacion: "Devoto vendió solo el 15% de lo proyectado por corte de calle. Palermo tiene peligro inminente de quiebre de stock de elaborados." },
    { id: 2, producto: "Sándwich de Pollo Teriyaki", origen: "Almagro", destino: "Once", unidades: 10, diasVencimiento: 3, estado: "Pendiente", justificacion: "Baja tracción rotacional en Almagro. Once se encuentra sin stock disponible." },
  ]);

  // Form states for adding new events
  const [newEventLocal, setNewEventLocal] = useState("Recoleta");
  const [newEventTipo, setNewEventTipo] = useState("Marcha Masiva");
  const [newEventImpact, setNewEventImpact] = useState("+150%");
  const [newEventDesc, setNewEventDesc] = useState("");

  // Sub-Tab de Logística
  const [logisticsSubTab, setLogisticsSubTab] = useState<"radar" | "vencimientos" | "lotes">("radar");

  // RADAR DE EVENTOS CABA STATE
  const [radarEvents, setRadarEvents] = useState([
    { id: 1, nombre: "Marcha Masiva CGT (Congreso)", fecha: "Mañana (Hace 48h detectado)", localId: 1, localNombre: "Centro (Local 1)", tipo: "Marcha", impacto: "Positivo", factor: "+150%", sándwichesPeticion: 90, sándwichesBase: 40, desc: "Tránsito peatonal masivo frente al local por concentración en plaza.", rutaSugerida: "Evitar Av. Rivadavia. Redirigir camión por Av. Corrientes." },
    { id: 2, nombre: "Obras Subte Linea D (Plaza Italia)", fecha: "24hs de anticipación", localId: 7, localNombre: "Recoleta (Local 7)", tipo: "Bloqueo", impacto: "Negativo", factor: "-50%", sándwichesPeticion: 5, sándwichesBase: 10, desc: "Corte de calzada total reduce un 80% el flujo de clientes espontáneos.", rutaSugerida: "Evitar Av. Santa Fe. Redirigir camión por Av. del Libertador." },
    { id: 3, nombre: "Recital de Coldplay (Estadio River)", fecha: "En 48hs", localId: 10, localNombre: "Nuñez (Local 10)", tipo: "Recital", impacto: "Positivo", factor: "+300%", sándwichesPeticion: 120, sándwichesBase: 30, desc: "Público masivo saliendo del estadio buscará alimentos de paso.", rutaSugerida: "Evitar Av. del Libertador. Redirigir por Av. Cantilo." },
    { id: 4, nombre: "Corte Av. San Martín (Agronomía)", fecha: "En 12hs", localId: 8, localNombre: "Devoto (Local 8)", tipo: "Bloqueo", impacto: "Negativo", factor: "-70%", sándwichesPeticion: 3, sándwichesBase: 10, desc: "Corte por protesta de vecinos desvía el tránsito vehicular principal.", rutaSugerida: "Evitar Av. San Martín. Redirigir camión por Av. Nazca." }
  ]);
  const [selectedRadarEventId, setSelectedRadarEventId] = useState<number>(1);

  // CONTROL DE VENCIMIENTOS "CERO CUADERNOS" STATE
  const [shiftChecklist, setShiftChecklist] = useState([
    { id: 1, turno: "Mañana", producto: "Alfajores Havanna", min: 15, revisado: false, notas: "Toca reponer y verificar el frenteado (lo viejo adelante)." },
    { id: 2, turno: "Mañana", producto: "Gomitas Mogul", min: 10, revisado: true, notas: "Verificar stock y ordenar según fecha." },
    { id: 3, turno: "Noche", producto: "Cerveza Patagonia Lata", min: 15, revisado: false, notas: "Verificar frenteado de heladeras (viejo adelante, nuevo atrás)." },
    { id: 4, turno: "Noche", producto: "Chocolates Milka", min: 20, revisado: false, notas: "Inspeccionar las cajas exhibidoras de la caja principal." }
  ]);
  const [fifoConfirmed, setFifoConfirmed] = useState(false);
  const [expiringProductsAlerts, setExpiringProductsAlerts] = useState([
    { id: 1, producto: "Alfajores Terrabusi Chocolate", sucursalActual: "Local 8 - Devoto", sucursalVendedora: "Local 7 - Recoleta", cantExpiring: 350, diasVencer: 12, salesPerWeekActual: 20, salesPerWeekDestino: 180, estado: "Pendiente" },
    { id: 2, producto: "Cerveza Patagonia 26.9 IPA", sucursalActual: "Local 4 - Almagro", sucursalVendedora: "Local 2 - Palermo", cantExpiring: 120, diasVencer: 9, salesPerWeekActual: 10, salesPerWeekDestino: 95, estado: "Pendiente" }
  ]);
  const [newExpProduct, setNewExpProduct] = useState("Alfajores Suchard");
  const [newExpQty, setNewExpQty] = useState("150");
  const [newExpDays, setNewExpDays] = useState("10");
  const [newExpStore, setNewExpStore] = useState("Local 8 - Devoto");

  // CONTROL DE LOTES STATE
  const [activeBatches, setActiveBatches] = useState([
    { id: "LOT-2026-TERR-09", producto: "Alfajores Terrabusi Chocolate", totalInicial: 5000, vencimiento: "Noviembre 2026", unidadesRestantes: 2840, distribucion: [
      { local: "Recoleta (Local 7)", cant: 1200, inicial: 1500 },
      { local: "Palermo (Local 2)", cant: 940, inicial: 1500 },
      { local: "Devoto (Local 8)", cant: 700, inicial: 2000 }
    ], estado: "En Circulación" },
    { id: "LOT-2026-MILK-02", producto: "Chocolate Milka Oreo 100g", totalInicial: 3000, vencimiento: "Octubre 2026", unidadesRestantes: 1100, distribucion: [
      { local: "Belgrano (Local 3)", cant: 400, inicial: 1000 },
      { local: "Centro (Local 1)", cant: 200, inicial: 1000 },
      { local: "Nuñez (Local 10)", cant: 500, inicial: 1000 }
    ], estado: "En Circulación" }
  ]);
  
  const [purchaseBlockerActive, setPurchaseBlockerActive] = useState(true);
  const [invoicePhoto, setInvoicePhoto] = useState<string | null>(null);
  const [invoiceProduct, setInvoiceProduct] = useState("Alfajores Terrabusi Chocolate");
  const [invoiceQty, setInvoiceQty] = useState("5000");
  const [invoiceVencimiento, setInvoiceVencimiento] = useState("2026-11-20");
  const [scanLoading, setScanLoading] = useState(false);

  // PRE-SUMMER INFRASTRUCTURE AUDIT STATES
  const [sunMitigationRequested, setSunMitigationRequested] = useState(true); // Default to active audit requests since summer is approaching
  
  // Climate Predictive states
  const [currentTemp, setCurrentTemp] = useState(25.4);
  const [forecastTemp, setForecastTemp] = useState(27.8);
  const [escudoTermicoActive, setEscudoTermicoActive] = useState(true); // Default to true because temperature exceeds 26C or November is close
  const [climateAPIConnected, setClimateAPIConnected] = useState(true);

  // POS lockout states for employee POS/mobile system
  const [posLocked, setPosLocked] = useState(true); // Simulate a morning POS lock to make it immediately interactive
  const [posTaskImage, setPosTaskImage] = useState("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80");
  const [posTaskSubmitted, setPosTaskSubmitted] = useState(false);
  const [posSelectedTask, setPosSelectedTask] = useState("Mover exhibidor de chocolates fuera del rango de luz solar");

  // State to track sent warning intimations to managers (operational boycott tracking)
  const [intimacionesSent, setIntimacionesSent] = useState<Record<string, string>>({});

  const [infrastructureAudits, setInfrastructureAudits] = useState([
    {
      id: 1,
      local: "Local 1 - Centro",
      responsable: "Carlos Gómez (Supervisor Bebidas)",
      exposicionSol: "Baja (Vidriera protegida por marquesina)",
      solDirecto: false,
      ubicacionHeladeras: "Frente a pared este (sombra permanente)",
      flujoAire: "Direccionado hacia mostrador principal (Óptimo)",
      necesitaMejora: false,
      mejoraPropuesta: "Ninguna",
      fotosRecibidas: true,
      fotoSimulada: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80",
      ordenEmitida: "Reacomodar heladeras de bebidas a la sombra.",
      fechaOrden: "2026-07-16T12:00:00Z",
      plazoHoras: 24,
      ejecutado: true,
      verificadoWhatsApp: "Confirmado con foto en el grupo de WhatsApp. Verificación: OK.",
      categoriaAfectada: "Bebidas",
    },
    {
      id: 2,
      local: "Local 2 - Palermo",
      responsable: "Juan Pérez (Encargado Depósito)",
      exposicionSol: "Crítica (El sol de la tarde da directo a las estanterías de golosinas)",
      solDirecto: true,
      ubicacionHeladeras: "Frente a la vidriera oeste (vidrio transparente sin filtro)",
      flujoAire: "Desviado (no llega al sector crítico de chocolates)",
      necesitaMejora: true,
      mejoraPropuesta: "Instalar cortina blackout y túnel de sol urgente en vidriera oeste",
      fotosRecibidas: false,
      fotoSimulada: "",
      ordenEmitida: "Instalar cortina blackout temporal y trasladar chocolates a heladera trasera.",
      fechaOrden: "2026-07-16T09:00:00Z",
      plazoHoras: 24,
      ejecutado: false, // EXPOSED
      verificadoWhatsApp: "INCUMPLIDO. Transcurrieron más de 24 horas. Juan Pérez no envió foto ni respondió el pedido en el grupo de WhatsApp de Palermo.",
      categoriaAfectada: "Golosinas",
    },
    {
      id: 3,
      local: "Local 3 - Belgrano",
      responsable: "Estela Maris (Supervisor Golosinas)",
      exposicionSol: "Alta (Vidriera principal expuesta desde el mediodía)",
      solDirecto: true,
      ubicacionHeladeras: "Costado de la vidriera lateral (semi-expuesto)",
      flujoAire: "Hacia el sector de bombones directamente (Excelente)",
      necesitaMejora: true,
      mejoraPropuesta: "Instalar vinilo microperforado con protección UV",
      fotosRecibidas: true,
      fotoSimulada: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      ordenEmitida: "Instalar película UV y reubicar exhibidores de bombones.",
      fechaOrden: "2026-07-16T14:00:00Z",
      plazoHoras: 24,
      ejecutado: true,
      verificadoWhatsApp: "Confirmado en el grupo. Foto enviada del vinilo colocado en la vidriera de Belgrano.",
      categoriaAfectada: "Golosinas",
    },
    {
      id: 4,
      local: "Local 4 - Almagro",
      responsable: "Lucas Díaz (Supervisor Elaborados)",
      exposicionSol: "Crítica (El sol calienta el sector frontal donde se exhiben sándwiches y lácteos)",
      solDirecto: true,
      ubicacionHeladeras: "Frente al ventanal oeste sin protección de toldo",
      flujoAire: "Insuficiente (flujo bloqueado por estanterías altas de mercadería)",
      necesitaMejora: true,
      mejoraPropuesta: "Reparar toldo exterior plegable roto",
      fotosRecibidas: false,
      fotoSimulada: "",
      ordenEmitida: "Retirar alimentos sensibles de la vidriera y usar heladeras con cortina nocturna.",
      fechaOrden: "2026-07-16T10:30:00Z",
      plazoHoras: 24,
      ejecutado: false, // EXPOSED
      verificadoWhatsApp: "INCUMPLIDO. Excedido el plazo de 24hs. No hay confirmación del retiro de sándwiches del sol en el grupo 'Smart - Almagro'.",
      categoriaAfectada: "Elaborados",
    },
    {
      id: 5,
      local: "Local 5 - Flores",
      responsable: "Marta Ríos (Supervisor Bebidas)",
      exposicionSol: "Baja (Local dentro de galería, protegido)",
      solDirecto: false,
      ubicacionHeladeras: "Rincón interno de la galería (frescura natural)",
      flujoAire: "Excelente (flujo centralizado de aire acondicionado)",
      necesitaMejora: false,
      mejoraPropuesta: "Ninguna",
      fotosRecibidas: true,
      fotoSimulada: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80",
      ordenEmitida: "Control general de temperatura de heladeras.",
      fechaOrden: "2026-07-16T11:00:00Z",
      plazoHoras: 24,
      ejecutado: true,
      verificadoWhatsApp: "Confirmado. Fotos recibidas por chat mostrando heladeras en 4.2°C (OK).",
      categoriaAfectada: "Bebidas",
    }
  ]);

  const [selectedAuditId, setSelectedAuditId] = useState<number>(2);
  const [newOrderText, setNewOrderText] = useState("");
  const [newOrderLocalId, setNewOrderLocalId] = useState<string>("2");

  // AUDITORÍA DE MOVIMIENTOS STATE
  const [movementsData, setMovementsData] = useState([
    { id: 1, tipo: "Entrada de stock", producto: "Alfajores Terrabusi Chocolate", cantidad: 5000, local: "Depósito Central", responsable: "Marta (Depósito)", hora: "08:14:22", fecha: "2026-07-18" },
    { id: 2, tipo: "Traslado", producto: "Alfajores Terrabusi Chocolate", cantidad: 1200, local: "Recoleta (Local 7)", responsable: "Marta (Depósito)", hora: "09:30:15", fecha: "2026-07-18" },
    { id: 3, tipo: "Traslado", producto: "Alfajores Terrabusi Chocolate", cantidad: 940, local: "Palermo (Local 2)", responsable: "Marta (Depósito)", hora: "09:32:04", fecha: "2026-07-18" },
    { id: 4, tipo: "Merma", producto: "Chocolate Milka Oreo 100g", cantidad: 45, local: "Almagro (Local 4)", responsable: "Lucas Díaz (Almagro)", hora: "11:15:40", fecha: "2026-07-18" },
    { id: 5, tipo: "Entrada de stock", producto: "Cerveza Patagonia Lata", cantidad: 1500, local: "Depósito Central", responsable: "Leo (Encargado)", hora: "12:05:10", fecha: "2026-07-18" },
    { id: 6, tipo: "Traslado", producto: "Cerveza Patagonia Lata", cantidad: 400, local: "Belgrano (Local 3)", responsable: "Leo (Encargado)", hora: "12:45:00", fecha: "2026-07-18" },
    { id: 7, tipo: "Merma", producto: "Sándwich de Pollo Teriyaki", cantidad: 12, local: "Almagro (Local 4)", responsable: "Lucas Díaz (Almagro)", hora: "14:22:33", fecha: "2026-07-18" },
    { id: 8, tipo: "Entrada de stock", producto: "Chocolate Milka Oreo 100g", cantidad: 3000, local: "Depósito Central", responsable: "Marta (Depósito)", hora: "15:10:05", fecha: "2026-07-18" },
    { id: 9, tipo: "Traslado", producto: "Chocolate Milka Oreo 100g", cantidad: 500, local: "Nuñez (Local 10)", responsable: "Marta (Depósito)", hora: "15:55:12", fecha: "2026-07-18" },
    { id: 10, tipo: "Traslado", producto: "Chocolate Milka Oreo 100g", cantidad: 400, local: "Belgrano (Local 3)", responsable: "Marta (Depósito)", hora: "15:57:48", fecha: "2026-07-18" }
  ]);

  const [newMovTipo, setNewMovTipo] = useState("Entrada de stock");
  const [newMovProduct, setNewMovProduct] = useState("Alfajores Terrabusi Chocolate");
  const [newMovQty, setNewMovQty] = useState("500");
  const [newMovStore, setNewMovStore] = useState("Palermo (Local 2)");
  const [newMovResponsable, setNewMovResponsable] = useState("Leo (Encargado)");
  const [searchMovFilter, setSearchMovFilter] = useState("todos");

  // Supervisor Form states
  const [supLocalId, setSupLocalId] = useState("2");
  const [supSolExposicion, setSupSolExposicion] = useState("Crítica (Da directo por la tarde)");
  const [supNeedsMejora, setSupNeedsMejora] = useState("true");
  const [supMejoraPropuesta, setSupMejoraPropuesta] = useState("Instalar cortina blackout");
  const [supPhotoUrl, setSupPhotoUrl] = useState("https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80");
  const [supOrderExecuted, setSupOrderExecuted] = useState("false");

  // Specific hardware state overrides for editing
  const [editSolDirecto, setEditSolDirecto] = useState<boolean>(true);
  const [editUbicacionHeladeras, setEditUbicacionHeladeras] = useState<string>("Frente a la vidriera oeste");
  const [editFlujoAire, setEditFlujoAire] = useState<string>("Desviado de los chocolates");
  const [infraSimTab, setInfraSimTab] = useState<"supervisor" | "pos">("supervisor");

  // Quick prompt helper to send message directly to MartinChat!
  const askMartin = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("ask-martin", { detail: prompt }));
  };

  // Aggregated KPIs
  const totalBilling = salesData.reduce((sum, d) => sum + d.ventas, 0);
  const totalCosto = salesData.reduce((sum, d) => sum + d.costo, 0);
  const totalGanancia = salesData.reduce((sum, d) => sum + d.ganancia, 0);
  const totalTransacciones = salesData.reduce((sum, d) => sum + d.transacciones, 0);
  const avgMargin = totalBilling > 0 ? (totalGanancia / totalBilling) * 100 : 0;

  // Dynamic filtering of stock data based on active role/sector (Level 3 restriction)
  const filteredStockData = stockData.filter((item) => {
    if (userRole === "supervisor_golosinas") {
      return item.categoria.toLowerCase() === "golosinas";
    }
    if (userRole === "supervisor_bebidas") {
      return item.categoria.toLowerCase() === "bebidas";
    }
    if (userRole === "supervisor_elaborados") {
      return ["elaborados", "sándwiches", "almacen"].includes(item.categoria.toLowerCase());
    }
    return true; // Owner & Depot see all
  });

  const lowStockCount = filteredStockData.filter(i => i.stockActual <= i.stockMinimo).length;
  const pendingInvoicesAmount = invoicesData.filter(i => i.estado === "Pendiente").reduce((sum, d) => sum + d.monto, 0);

  // Dynamic filtering of expiring alerts based on supervisor sector role
  const filteredExpiringProductsAlerts = expiringProductsAlerts.filter((item) => {
    const prodLower = item.producto.toLowerCase();
    if (userRole === "supervisor_golosinas") {
      return prodLower.includes("alfajor") || prodLower.includes("chocolate") || prodLower.includes("goma");
    }
    if (userRole === "supervisor_bebidas") {
      return prodLower.includes("cerveza") || prodLower.includes("coca") || prodLower.includes("gaseosa");
    }
    if (userRole === "supervisor_elaborados") {
      return prodLower.includes("sándwich") || prodLower.includes("ensalada") || prodLower.includes("yogur");
    }
    return true; // Owner & Depot see all
  });

  // Check strict blocks for Level 2 Warehouse (deposito)
  const isBlockedForWarehouse = userRole === "deposito" && ["resumen", "ventas", "rentabilidad", "caja", "clientes"].includes(activeTab);

  if (isBlockedForWarehouse) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-8 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12" id="warehouse-block-panel">
        <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-full">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Acceso Bloqueado Estrictamente</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tu rol de <strong>Encargado de Depósito (Nivel 2)</strong> tiene bloqueo estricto configurado en este sector. No estás autorizado a ver las ventanas de recaudación de dinero, los márgenes de ganancia de la empresa, o realizar arqueos de caja.
        </p>
        <div className="p-4 bg-slate-50 rounded-xl text-left border border-slate-100">
          <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Consecuencias del Incumplimiento:</p>
          <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-1 mt-1.5 leading-relaxed">
            <li>La alteración de la conciliación de caja sin autorización genera discrepancias insalvables.</li>
            <li>La mezcla de presupuestos distorsiona el algoritmo de abastecimiento predictivo del sistema.</li>
            <li>Cualquier reajuste debe centralizarse a través del panel de administración del Propietario.</li>
          </ul>
        </div>
        <p className="text-[11px] text-slate-400">
          Para solicitar acceso o delegar un rol con mayores privilegios, comunicate con la propietaria general <strong>Noemí Carvallo</strong>.
        </p>
      </div>
    );
  }

  // ==========================================
  // DYNAMIC BOYCOTT AND OMISSION CALCULATIONS
  // ==========================================
  
  // 1. Unexecuted Pre-summer Solar Audits (Thermal Prevention Module omissions)
  const auditsOmitted = infrastructureAudits.filter(a => !a.ejecutado);
  
  // 2. Cash Discrepancies at Closure
  const closuresOmitted = storesClosure.filter(c => c.arqueoStatus !== "Cuadrado");
  
  // 3. Omitted Logistics Redistribution Rescues (Vencimientos Omissions)
  const rescuesOmitted = redistributionRescues.filter(r => r.estado === "Pendiente");
  
  // 4. Omitted Shift Checklists
  const checklistsOmitted = shiftChecklist.filter(c => !c.revisado);

  // Consolidated lists of omissions
  const totalOmissionsCount = auditsOmitted.length + closuresOmitted.length + rescuesOmitted.length + checklistsOmitted.length;

  // Let's create an organized list of branches with active omissions
  const branchesBase = [
    { id: 1, name: "Local 1 - Centro", manager: "Carlos Gómez (Supervisor Bebidas)" },
    { id: 2, name: "Local 2 - Palermo", manager: "Juan Pérez (Encargado Depósito)" },
    { id: 3, name: "Local 3 - Belgrano", manager: "Estela Maris (Supervisor Golosinas)" },
    { id: 4, name: "Local 4 - Almagro", manager: "Lucas Díaz (Supervisor Elaborados)" },
    { id: 5, name: "Local 5 - Flores", manager: "Marta Ríos (Supervisor Bebidas)" },
    { id: 6, name: "Local 6 - Caballito", manager: "Sofía Martínez (Encargada)" },
    { id: 7, name: "Local 7 - Recoleta", manager: "Bautista Russo (Supervisor)" },
    { id: 8, name: "Local 8 - Devoto", manager: "Néstor Kirchner (Encargado)" },
    { id: 9, name: "Local 9 - San Telmo", manager: "Mateo Silva (Supervisor)" },
    { id: 10, name: "Local 10 - Nuñez", manager: "Lucía Fernández (Encargada)" }
  ];

  const branchesWithOmissions = branchesBase.map(branch => {
    const branchAudits = auditsOmitted.filter(a => a.local.toLowerCase().includes(branch.name.split(" - ")[1].toLowerCase()));
    const branchClosures = closuresOmitted.filter(c => c.label.toLowerCase().includes(branch.name.split(" - ")[1].toLowerCase()));
    const branchRescues = rescuesOmitted.filter(r => r.origen.toLowerCase().includes(branch.name.split(" - ")[1].toLowerCase()));
    
    const branchChecklists = checklistsOmitted.filter(c => {
      if (branch.id === 1 && c.id === 1) return true;
      if (branch.id === 3 && c.id === 3) return true;
      if (branch.id === 2 && c.id === 4) return true;
      return false;
    });

    const activeOmissions = [
      ...branchAudits.map(a => ({ type: "Infraestructura (Térmica)", detail: `Omitió ejecutar la orden: "${a.ordenEmitida}"`, refId: a.id, category: "infraestructura" })),
      ...branchClosures.map(c => ({ type: "Arqueo de Caja", detail: `Presenta desvío financiero injustificado: "${c.arqueoStatus}"`, refId: c.id, category: "caja" })),
      ...branchRescues.map(r => ({ type: "Rescate Logístico FIFO", detail: `Omitió despachar rescate urgente de ${r.unidades}u de "${r.producto}" hacia ${r.destino}`, refId: r.id, category: "logistica" })),
      ...branchChecklists.map(c => ({ type: "Control FIFO de Turno", detail: `Omitió revisar planilla de vencimiento: "${c.producto}" (${c.turno})`, refId: c.id, category: "checklist" }))
    ];

    return {
      ...branch,
      activeOmissions,
      omissionCount: activeOmissions.length,
      intimado: intimacionesSent[branch.name] || null
    };
  }).filter(b => b.omissionCount > 0);

  const boycottingBranchesCount = branchesWithOmissions.length;

  // COLORS FOR CHARTS
  const COLORS = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#64748b"];

  return (
    <div className="space-y-6">
      
      {/* 1. TAB HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-950 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">ENTORNO SIMULADO DE PRUEBA</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-white tracking-tight mt-1 capitalize">
            Módulo de {activeTab.replace("_", " ")}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-normal max-w-xl">
            Desarrollador: Todos los datos son completamente dinámicos y editables. 
            Auditor: Podés testear cómo reacciona la inteligencia de Martín enviándole cualquier tabla a analizar con un solo click.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => askMartin(`Analizá el estado actual del módulo de ${activeTab} según los datos que tenemos registrados.`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Pedir análisis a Martín
          </button>
        </div>
      </div>

      {/* 2. TAB SECTIONS RENDERING */}
      
      {/* ==================== AGENTE COMANDOS & SOBRESTOCK ==================== */}
      {activeTab === "agente_remitos" && (
        <div className="space-y-6">
          <MartinStockRedistributionAgent
            onSendToMartinChat={(prompt) => askMartin(prompt)}
          />
        </div>
      )}

      {/* ==================== RESUMEN GENERAL ==================== */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          {/* SECTOR DE AUDITORÍA: ALERTAS ROJAS POR OMISIÓN Y BOICOT OPERATIVO */}
          {totalOmissionsCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-rose-100 bg-rose-50/50 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Auditoría Crítica: {totalOmissionsCount} Alertas Rojas por Omisión Detectadas
                    </h4>
                    <p className="text-[10px] text-rose-600 font-medium">Omisiones operativas, inacción climática y desvíos financieros por sucursal</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("alertas")}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  Ver Plan de Boicot Completo
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Red Audit Cards for quick overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-start gap-3.5">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Boicot Operativo</span>
                    <h3 className="text-xl font-bold font-mono text-slate-800">{boycottingBranchesCount} locales</h3>
                    <p className="text-[10px] text-slate-500 leading-snug">Sucursales con inacción o negligencia activa.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Omisión Térmica/Solar</span>
                    <h3 className="text-xl font-bold font-mono text-slate-800">{auditsOmitted.length} locales</h3>
                    <p className="text-[10px] text-slate-500 leading-snug">Órdenes estivales ignoradas por más de 24hs.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-start gap-3.5">
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-lg shrink-0">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Omisiones FIFO/Caja</span>
                    <h3 className="text-xl font-bold font-mono text-slate-800">{closuresOmitted.length + rescuesOmitted.length + checklistsOmitted.length} alertas</h3>
                    <p className="text-[10px] text-slate-500 leading-snug">Diferencias de arqueos y planillas ignoradas.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* KPI Mini-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Ventas Consolidadas</span>
                <p className="text-lg font-bold text-slate-800 font-mono mt-1">{formatARS(totalBilling)}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.4% vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Costo de Ventas</span>
                <p className="text-lg font-bold text-slate-800 font-mono mt-1">{formatARS(totalCosto)}</p>
                <span className="text-[10px] text-slate-400">Margen neto de ganancia: {avgMargin.toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Ganancia Bruta</span>
                <p className="text-lg font-bold text-emerald-600 font-mono mt-1">{formatARS(totalGanancia)}</p>
                <span className="text-[10px] text-slate-400">En caja hoy: {formatARS(totalGanancia * 0.95)}</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Transacciones Totales</span>
                <p className="text-lg font-bold text-slate-800 font-mono mt-1">{totalTransacciones}</p>
                <span className="text-[10px] text-slate-400">Ticket promedio: {formatARS(totalBilling / totalTransacciones)}</span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick interactive sandbox control */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Escenario de Simulación Financiera
              </h4>
              <p className="text-[11px] text-indigo-700 leading-relaxed max-w-xl">
                Podés ingresar valores de venta diarios para simular un repunte de fin de semana. Al actualizarse las métricas, Martín podrá realizar predicciones de flujo de caja y proyecciones presupuestarias óptimas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <input 
                type="number" 
                placeholder="Venta del día (Ej: 1500000)" 
                value={newSaleVal}
                onChange={(e) => setNewSaleVal(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono w-full sm:w-44 focus:outline-none focus:border-indigo-500"
              />
              <input 
                type="number" 
                placeholder="Costo (Ej: 1100000)" 
                value={newSaleCost}
                onChange={(e) => setNewSaleCost(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono w-full sm:w-36 focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={() => {
                  if (!newSaleVal || !newSaleCost) return;
                  const v = parseFloat(newSaleVal);
                  const c = parseFloat(newSaleCost);
                  const dateStr = new Date().toISOString().split("T")[0];
                  setSalesData([...salesData, { fecha: dateStr, ventas: v, costo: c, ganancia: v - c, transacciones: Math.floor(v / 4500) }]);
                  setNewSaleVal("");
                  setNewSaleCost("");
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap w-full sm:w-auto"
              >
                Simular Día
              </button>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Flujo de Caja Semanal (ARS)</h3>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">Sincronizado con Drive</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip formatter={(value) => formatARS(value as number)} labelStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="ventas" name="Ventas Totales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" />
                    <Area type="monotone" dataKey="ganancia" name="Margen Neto" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGanancias)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Cierre y Balance por Local (10 Locales)</h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">100% Cuadrado</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storesClosure}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={8} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip formatter={(value) => formatARS(value as number)} labelStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="baseEf" name="Efectivo" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="baseDig" name="Digital" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick actions for testing Martin */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Escenarios sugeridos para Martín:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div 
                onClick={() => askMartin("Analizá el rendimiento consolidado de los 10 locales de venta. ¿Cuál es el canal con mayor volumen y cómo afecta a la liquidez en caja?")}
                className="p-3 border border-slate-150 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-all space-y-1"
              >
                <div className="text-[10px] font-bold text-slate-400 font-mono">SCENARIO A</div>
                <h4 className="text-xs font-bold text-slate-700">Rendimiento Consolidado</h4>
                <p className="text-[10px] text-slate-500">Compara los locales de mayor volumen (Palermo, Recoleta) contra el resto.</p>
              </div>

              <div 
                onClick={() => askMartin("Martín, calculá el ticket de compra promedio del sistema. Sugerí estrategias comerciales para elevar un 15% las ventas cruzadas.")}
                className="p-3 border border-slate-150 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-all space-y-1"
              >
                <div className="text-[10px] font-bold text-slate-400 font-mono">SCENARIO B</div>
                <h4 className="text-xs font-bold text-slate-700">Ticket Promedio & Ventas</h4>
                <p className="text-[10px] text-slate-500">Evalúa la frecuencia de transacciones y propone combos promocionales.</p>
              </div>

              <div 
                onClick={() => askMartin("Detectás alguna discrepancia o anomalía de caja en los cierres diarios de las mini-empresas?")}
                className="p-3 border border-slate-150 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-all space-y-1"
              >
                <div className="text-[10px] font-bold text-slate-400 font-mono">SCENARIO C</div>
                <h4 className="text-xs font-bold text-slate-700">Anomalías & Caja</h4>
                <p className="text-[10px] text-slate-500">Audita la discrepancia del Local 4 (Almagro) e identifica fugas operativas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VENTAS ==================== */}
      {activeTab === "ventas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Venta Máxima Registrada</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">{formatARS(Math.max(...salesData.map(d => d.ventas)))}</p>
              </div>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-md font-mono">Max</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Venta Mínima Registrada</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">{formatARS(Math.min(...salesData.map(d => d.ventas)))}</p>
              </div>
              <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded-md font-mono">Min</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Promedio de Ventas Diarias</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">{formatARS(totalBilling / salesData.length)}</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-md font-mono">Prom</span>
            </div>
          </div>

          {/* Table representing daily sales file */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Historial del Archivo (ventas_diarias.csv)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Representación de la tabla leída de forma asíncrona desde Drive.</p>
              </div>
              <button 
                onClick={() => askMartin("Analizá el archivo de ventas_diarias.csv y decime qué tendencia ves en la facturación y si hay estacionalidad.")}
                className="px-3 py-1.5 border border-slate-200 hover:border-indigo-600 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1 cursor-pointer transition-all"
              >
                <Bot className="w-3 h-3 text-indigo-500" />
                Analizar Tabla
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Facturación Bruta (Ventas)</th>
                    <th className="p-4">Costo de Mercadería</th>
                    <th className="p-4">Margen de Ganancia Neto</th>
                    <th className="p-4">Tickets Emitidos</th>
                    <th className="p-4">Métricas Extra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {salesData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 text-slate-400">{d.fecha}</td>
                      <td className="p-4 font-bold text-slate-900">{formatARS(d.ventas)}</td>
                      <td className="p-4 text-rose-600">{formatARS(d.costo)}</td>
                      <td className="p-4 text-emerald-600 font-semibold">{formatARS(d.ganancia)}</td>
                      <td className="p-4">{d.transacciones}</td>
                      <td className="p-4 text-[10px] text-slate-400 font-sans">
                        Rentabilidad: {((d.ganancia/d.ventas)*100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== RENTABILIDAD ==================== */}
      {activeTab === "rentabilidad" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-1">
              <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Margen por Categoría</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoriesProfitability}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="ventasTotales"
                    >
                      {categoriesProfitability.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatARS(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                {categoriesProfitability.map((cat, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-slate-500 font-sans font-medium truncate">{cat.categoria} ({(cat.margenPromedio*100)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart Details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Costos vs Ventas (rentabilidad_categoria.csv)</h3>
                  <button 
                    onClick={() => askMartin("Hacé un desglose detallado de los márgenes por categoría basándote en rentabilidad_categoria.csv e indicame qué producto deberíamos priorizar y por qué.")}
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Pedir optimización de márgenes
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Comparativa visual del costo de producción/compra frente al precio final.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesProfitability} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `$${v/1000}k`} />
                    <YAxis dataKey="categoria" type="category" stroke="#94a3b8" fontSize={10} width={70} />
                    <Tooltip formatter={(value) => formatARS(value as number)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="ventasTotales" name="Ventas Totales" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="costoTotal" name="Costo Acumulado" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STOCK / INVENTARIO ==================== */}
      {activeTab === "stock" && (
        <div className="space-y-6">
          {auditToast && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl text-center shadow-lg"
            >
              {auditToast}
            </motion.div>
          )}

          {/* Selector de Vista: Planilla o Auditoría */}
          <div className="flex border-b border-slate-100 pb-px gap-6">
            <button 
              onClick={() => {
                setStockSubTab("lista");
                stopCamera();
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                stockSubTab === "lista" 
                  ? "text-indigo-600 font-extrabold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              📋 Planilla de Stock Actual
              {stockSubTab === "lista" && (
                <motion.div layoutId="stockActiveIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button 
              onClick={() => {
                setStockSubTab("auditoria");
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 ${
                stockSubTab === "auditoria" 
                  ? "text-indigo-600 font-extrabold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <ScanLine className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              🔍 Auditoría Urgente (Escáner y Voz)
              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Nuevo
              </span>
              {stockSubTab === "auditoria" && (
                <motion.div layoutId="stockActiveIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>

          {stockSubTab === "lista" ? (
            <>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">Alerta de Quiebre de Stock ({lowStockCount} productos críticos)</h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Martín detectó que la gaseosa <strong>Coca-Cola 1.5L</strong> y la <strong>Yerba Mate 1Kg</strong> se encuentran muy por debajo del Stock Mínimo establecido. Podés simular la reposición de stock cargando nuevas unidades a continuación.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Simulador de Reposición de Mercadería</h4>
                  <p className="text-[10px] text-slate-500">Aumentá las unidades de un producto para verificar la corrección del sistema.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <select 
                    value={newStockProd} 
                    onChange={(e) => setNewStockProd(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs w-full sm:w-44 focus:outline-none"
                    disabled={userRole === "deposito"}
                  >
                    <option value="">{userRole === "deposito" ? "Bloqueado para Depósito" : "Seleccionar Producto"}</option>
                    {filteredStockData.map((s, i) => (
                      <option key={i} value={s.producto}>{s.producto}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Unidades" 
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono w-full sm:w-20 focus:outline-none"
                    disabled={userRole === "deposito"}
                  />
                  <button 
                    disabled={userRole === "deposito"}
                    onClick={() => {
                      if (userRole === "deposito") return;
                      if (!newStockProd || !newStockQty) return;
                      const qty = parseInt(newStockQty);
                      setStockData(stockData.map(item => {
                        if (item.producto === newStockProd) {
                          const newActual = item.stockActual + qty;
                          return {
                            ...item,
                            stockActual: newActual,
                            estado: newActual >= item.stockMinimo ? "Stock OK" : "Stock Bajo"
                          };
                        }
                        return item;
                      }));
                      setNewStockProd("");
                      setNewStockQty("");
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      userRole === "deposito"
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    Ingresar Unidades
                  </button>
                  {userRole === "deposito" && (
                    <div className="text-[10px] text-red-500 font-semibold w-full mt-1">
                      ⚠️ Prohibido modificar stock de las sucursales directamente.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Estado de Alerta de Inventario (inventario_alerta.csv)</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Nivel crítico y reposición estimada.</p>
                  </div>
                  <button 
                    onClick={() => askMartin("Armá una lista de reorden de compras basándote en inventario_alerta.csv para los productos en Stock Bajo, calculando el costo total aproximado.")}
                    className="px-3 py-1.5 border border-slate-200 hover:border-amber-600 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Generar Orden de Compra
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-4">Producto</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Proveedor Oficial</th>
                        <th className="p-4 text-center">Stock Actual</th>
                        <th className="p-4 text-center">Stock Mínimo</th>
                        <th className="p-4">Estado Crítico</th>
                        <th className="p-4">Precio Costo</th>
                        <th className="p-4">Código de Barras</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700 font-sans">
                      {filteredStockData.map((d, i) => (
                        <tr key={i} className={`hover:bg-slate-50/50 ${d.estado === "Stock Bajo" ? "bg-rose-50/20" : ""}`}>
                          <td className="p-4 font-bold text-slate-800 font-mono">{d.producto}</td>
                          <td className="p-4">{d.categoria}</td>
                          <td className="p-4 text-slate-500 font-medium">{d.proveedor}</td>
                          <td className="p-4 text-center font-mono font-bold text-slate-800">{d.stockActual}</td>
                          <td className="p-4 text-center font-mono text-slate-400">{d.stockMinimo}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide font-mono ${
                              d.estado === "Stock Bajo" 
                                ? "bg-rose-100 text-rose-700" 
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {d.estado}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-500">{formatARS(d.precioCosto)}</td>
                          <td className="p-4 font-mono text-slate-400">{d.codigoBarras}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* NUEVO PANEL DE AUDITORÍA URGENCIAL DE STOCK */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* COLUMNA IZQUIERDA: CAPTURA & ESCÁNER */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* CARD 1: CONFIGURAR CANTIDAD (VOZ O TECLADO) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-indigo-500" />
                      1. Indicar Cantidad (Dictá o Escribí)
                    </h3>
                    <span className="text-[10px] text-slate-400">Paso previo al escaneo</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Cantidad a ingresar en auditoría:</label>
                    <div className="flex items-center gap-3 justify-center">
                      <button 
                        onClick={() => setAuditQty(Math.max(1, auditQty - 1))}
                        className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 text-sm active:scale-95 transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={auditQty}
                        onChange={(e) => setAuditQty(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 h-11 text-center font-mono text-xl font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button 
                        onClick={() => setAuditQty(auditQty + 1)}
                        className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 text-sm active:scale-95 transition-all cursor-pointer"
                      >
                        +
                      </button>

                      {/* BOTÓN DE DICTADO POR VOZ (PREMIUM INTUITIVE EXPERIENCE) */}
                      <button 
                        onClick={startVoiceCapture}
                        className={`ml-2 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          voiceActive 
                            ? "bg-rose-500 text-white animate-pulse shadow-md"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100"
                        }`}
                        title="Hacer clic para dictar la cantidad con tu voz (ej: 'ocho')"
                      >
                        <Mic className={`w-4 h-4 ${voiceActive ? "animate-bounce" : ""}`} />
                        {voiceActive ? "Escuchando..." : "Dictar Cantidad"}
                      </button>
                    </div>

                    {/* Estado del reconocimiento por voz */}
                    {voiceStatus !== "Inactivo" && (
                      <div className="text-[10px] text-center font-medium font-mono text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                        {voiceStatus}
                      </div>
                    )}
                  </div>

                  {/* Configuración de Modo */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-[11px]">
                    <span className="text-slate-500">Al escanear un producto:</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setAuditMode("reemplazar")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          auditMode === "reemplazar"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        Fijar Conteo ({auditQty})
                      </button>
                      <button 
                        onClick={() => setAuditMode("sumar")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          auditMode === "sumar"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        Sumar unidades (+{auditQty})
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 2: CÁMARA O SIMULADOR DE ESCANEO */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <ScanLine className="w-4 h-4 text-indigo-500" />
                      2. Escanear Código de Barras
                    </h3>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      LECTOR LISTO
                    </div>
                  </div>

                  {/* VISOR DE CÁMARA */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center text-center p-4 border border-slate-800 group">
                    {cameraActive ? (
                      <>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Brackets de Escaneo Visuales */}
                        <div className="absolute inset-8 border-2 border-dashed border-indigo-400 rounded-lg pointer-events-none flex flex-col justify-between p-4">
                          <div className="flex justify-between">
                            <span className="w-4 h-4 border-t-2 border-l-2 border-indigo-400"></span>
                            <span className="w-4 h-4 border-t-2 border-r-2 border-indigo-400"></span>
                          </div>
                          <div className="flex justify-between">
                            <span className="w-4 h-4 border-b-2 border-l-2 border-indigo-400"></span>
                            <span className="w-4 h-4 border-b-2 border-r-2 border-indigo-400"></span>
                          </div>
                        </div>

                        {/* Línea láser de barrido */}
                        <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite] pointer-events-none"></div>

                        {/* Botón para detener cámara */}
                        <button 
                          onClick={stopCamera}
                          className="absolute bottom-3 bg-red-600/90 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all cursor-pointer"
                        >
                          Apagar Cámara
                        </button>

                        {/* Simular escaneo de producto en pantalla */}
                        <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-[9px] text-slate-300 pointer-events-none">
                          Cámara en vivo (Entorno)
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 z-10 p-2">
                        <div className="mx-auto w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">¿Usar la Cámara del Celular / Notebook?</p>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">Podés encender la cámara trasera para apuntar a un código físico.</p>
                        </div>
                        <button 
                          onClick={startCamera}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-600/20"
                        >
                          Encender Cámara
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ENTRADA MANUAL O SIMULACIÓN RÁPIDA (PERFECT FOR TESTING OUT OF THE BOX) */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                      <span>Simulador Rápido de Escaneo (Un Clic)</span>
                      <span className="text-[9px] text-indigo-500 font-mono">Para pruebas</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {stockData.map((s, idx) => (
                        <button 
                          key={idx}
                          onClick={() => triggerBarcodeScan(s.codigoBarras)}
                          className="p-2 border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl text-left text-[10px] flex flex-col justify-between transition-all cursor-pointer group bg-slate-50/50"
                        >
                          <span className="font-bold text-slate-700 group-hover:text-indigo-950 font-sans line-clamp-1">{s.producto}</span>
                          <span className="text-[9px] font-mono text-slate-400 group-hover:text-indigo-500 mt-0.5">{s.codigoBarras}</span>
                        </button>
                      ))}
                    </div>

                    {/* ENTRADA MANUAL POR TECLADO */}
                    <div className="pt-2 border-t border-slate-50 space-y-1.5">
                      <label htmlFor="barcodeInputField" className="block text-[10px] font-bold text-slate-500 uppercase">Escribir Código Manual o Escaneo por Pistola USB:</label>
                      <div className="flex gap-2">
                        <input 
                          id="barcodeInputField"
                          type="text" 
                          placeholder="Ej: 7790080678912"
                          value={scannedBarcode}
                          onChange={(e) => setScannedBarcode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              triggerBarcodeScan(scannedBarcode);
                            }
                          }}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                          onClick={() => triggerBarcodeScan(scannedBarcode)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          Ingresar
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400">
                        💡 <strong>Lector Físico:</strong> Si conectás una pistola lectora de código de barras por USB o Bluetooth, simplemente dispará al producto en cualquier parte del panel, y se cargará automáticamente con la cantidad indicada arriba.
                      </p>
                    </div>
                  </div>

                  {/* FLASH NOTIFICATION DEL ÚLTIMO ESCANEADO */}
                  {lastScannedItem && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 shadow-sm ${
                        lastScannedItem.isSuccess 
                          ? "bg-emerald-50/90 border-emerald-100 text-emerald-900" 
                          : "bg-rose-50/90 border-rose-100 text-rose-950"
                      }`}
                    >
                      <span className="text-lg mt-0.5">{lastScannedItem.isSuccess ? "✅" : "⚠️"}</span>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold leading-none">{lastScannedItem.msg}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Código: {lastScannedItem.codigo}</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* CARD 3: AUDITORÍA POR FOTO CON MARTÍN IA */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                      3. Foto de Producto con Martín IA
                    </h3>
                    <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Inteligente</span>
                  </div>

                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Sacale una foto al producto o a la góndola. Martín IA extraerá el código de barras, reconocerá el producto y lo cargará en tu planilla en tiempo real.
                  </p>

                  <div className="space-y-3">
                    {/* INPUT DE ARCHIVO NATIVO CON CAPTURA DE CÁMARA */}
                    <div className="flex items-center justify-center w-full">
                      {photoForAI ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-indigo-200">
                          <img 
                            src={photoForAI} 
                            alt="Preview para Martín IA" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={() => setPhotoForAI(null)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow transition-colors cursor-pointer"
                            title="Quitar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 rounded-xl cursor-pointer transition-all">
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <Camera className="w-6 h-6 text-indigo-500 mb-1.5" />
                            <p className="text-[11px] font-bold text-indigo-950">Sacar Foto o Subir Imagen</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Soporta cámara nativa de celular</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoUpload} 
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>

                    {/* TEXT BOX PARA DICTADO / COMENTARIO DE LA FOTO */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                        <span>Dictado o aclaración adicional (Opcional):</span>
                        <span className="text-indigo-600 font-mono">Ej: "son 8"</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder='Escribí o dictá algo (ej: "son 12 unidades")' 
                          value={aiDictation}
                          onChange={(e) => setAiDictation(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-indigo-150 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-9"
                        />
                        <button 
                          onClick={() => {
                            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                            if (!SpeechRecognition) {
                              alert("Tu navegador no soporta dictado por voz directo en campos de texto.");
                              return;
                            }
                            const rec = new SpeechRecognition();
                            rec.lang = "es-AR";
                            rec.onstart = () => setAiDictation("Escuchando...");
                            rec.onresult = (evt: any) => {
                              setAiDictation(evt.results[0][0].transcript);
                            };
                            rec.start();
                          }}
                          className="absolute right-2.5 top-2.5 text-indigo-500 hover:text-indigo-700 cursor-pointer"
                          title="Dictar comentario"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* BOTÓN PROCESAR */}
                    <button 
                      onClick={processPhotoWithAI}
                      disabled={aiAnalyzing || !photoForAI}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                        aiAnalyzing 
                          ? "bg-indigo-400 cursor-not-allowed" 
                          : !photoForAI 
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                          : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                      }`}
                    >
                      {aiAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Martín IA analizando foto...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Procesar con Martín IA
                        </>
                      )}
                    </button>

                    {aiError && (
                      <p className="text-[10px] text-rose-600 font-medium text-center bg-rose-50 p-2 rounded-lg border border-rose-100">
                        ⚠️ {aiError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: PLANILLA DE AUDITORÍA ACTIVA & EXCEL */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                  
                  {/* HEADER DE LA PLANILLA Y SELECTOR DE MODO */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Planilla de Conteo & Auditoría</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Elegí auditoría libre o subí una planilla Excel para contar en tiempo real.</p>
                      </div>

                      {/* INPUT DE EXCEL REUTILIZABLE (OCULTO) */}
                      <input 
                        type="file" 
                        id="excel-template-picker" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleExcelUpload} 
                        className="hidden" 
                      />

                      {/* TABS SELECTOR DE MODO */}
                      <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                        <button
                          onClick={() => setExcelAuditMode(false)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            !excelAuditMode
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Conteo Libre
                        </button>
                        <button
                          onClick={() => {
                            if (!templateFile) {
                              document.getElementById("excel-template-picker")?.click();
                            } else {
                              setExcelAuditMode(true);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            excelAuditMode
                              ? "bg-white text-indigo-700 shadow-sm"
                              : "text-slate-500 hover:text-indigo-600"
                          }`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Modo Plantilla Excel {templateFile && "✔️"}
                        </button>
                      </div>
                    </div>

                    {/* Acciones principales basadas en el modo */}
                    {!excelAuditMode ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-100/60">
                        <span className="text-[10px] font-mono text-slate-500">Modo Conteo Libre Activo (Historial temporal)</span>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button 
                            disabled={auditSession.length === 0}
                            onClick={exportAuditToCSV}
                            className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                              auditSession.length === 0 
                                ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed" 
                                : "border-indigo-150 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                            }`}
                            title="Exportar planilla actual directamente a Microsoft Excel"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Descargar Conteo
                          </button>
                          <button 
                            disabled={auditSession.length === 0}
                            onClick={() => {
                              if (window.confirm("¿Seguro querés vaciar la sesión actual de auditoría?")) {
                                setAuditSession([]);
                              }
                            }}
                            className={`p-1.5 border rounded-xl cursor-pointer ${
                              auditSession.length === 0
                                ? "border-slate-100 text-slate-300 cursor-not-allowed"
                                : "border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-500 hover:text-red-600"
                            }`}
                            title="Vaciar auditoría libre"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : templateFile ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-100/60">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[10px] font-mono text-indigo-600 font-bold block">Plantilla: {templateFile.name}</span>
                          <span className="text-[9px] text-slate-400 block">Manteniendo el orden original del archivo enviado.</span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button 
                            onClick={exportExcelAudit}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                            title="Guardar y exportar archivo Excel respetando el orden original enviado"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Exportar Excel Terminado 📥
                          </button>
                          <button 
                            onClick={() => document.getElementById("excel-template-picker")?.click()}
                            className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                            title="Subir otra planilla Excel"
                          >
                            Cambiar Excel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* VISTA A: CONTEO LIBRE */}
                  {!excelAuditMode ? (
                    <>
                      {/* SECCIÓN RESUMEN EN TIEMPO REAL */}
                      {auditSession.length > 0 && (
                        <div className="p-4 bg-indigo-50/30 border-b border-slate-100 grid grid-cols-3 gap-4 text-center">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Productos Auditados</span>
                            <p className="text-base font-bold text-slate-800 font-mono">{auditSession.length}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Unidades Contadas</span>
                            <p className="text-base font-bold text-indigo-600 font-mono">
                              {auditSession.reduce((acc, curr) => acc + curr.cantidadAuditada, 0)}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Diferencia Total</span>
                            <p className={`text-base font-bold font-mono ${
                              auditSession.reduce((acc, curr) => acc + curr.diferencia, 0) < 0 
                                ? "text-rose-600" 
                                : auditSession.reduce((acc, curr) => acc + curr.diferencia, 0) > 0 
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}>
                              {auditSession.reduce((acc, curr) => acc + curr.diferencia, 0) > 0 ? "+" : ""}
                              {auditSession.reduce((acc, curr) => acc + curr.diferencia, 0)} u.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CUERPO DE LA TABLA DE AUDITORÍA */}
                      <div className="flex-1 overflow-x-auto min-h-[300px]">
                        {auditSession.length === 0 ? (
                          <div className="py-20 text-center space-y-3 px-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-indigo-400 border border-slate-100">
                              <ScanLine className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">La Planilla de Conteo Libre está Vacía</p>
                              <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                                Decí un número (ej: "ocho") y luego escaneá el código de barras, cargalo manualmente o seleccioná uno de los productos del simulador.
                              </p>
                            </div>
                            <button 
                              onClick={() => {
                                document.getElementById("excel-template-picker")?.click();
                              }}
                              className="px-4 py-2 border border-indigo-100 hover:border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl text-indigo-700 text-[10px] font-bold cursor-pointer transition-all"
                            >
                              💡 ¿Preferís subir una plantilla Excel? Subila haciendo clic acá
                            </button>
                          </div>
                        ) : (
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <th className="p-4">Producto</th>
                                <th className="p-4">Código</th>
                                <th className="p-4 text-center">Stock Teórico</th>
                                <th className="p-4 text-center">Físico (Auditado)</th>
                                <th className="p-4 text-center">Diferencia (Mermas)</th>
                                <th className="p-4">Hora</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700 font-sans">
                              {auditSession.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/40">
                                  <td className="p-4 font-bold text-slate-800">{item.producto}</td>
                                  <td className="p-4 font-mono text-slate-400">{item.codigoBarras}</td>
                                  <td className="p-4 text-center font-mono text-slate-500">{item.cantidadOriginal} u.</td>
                                  <td className="p-4 text-center font-mono font-bold text-indigo-600 bg-indigo-50/10">{item.cantidadAuditada} u.</td>
                                  <td className="p-4 text-center font-mono">
                                    <span className={`px-2 py-0.5 rounded font-bold ${
                                      item.diferencia < 0 
                                        ? "bg-rose-100 text-rose-700" 
                                        : item.diferencia > 0 
                                        ? "bg-emerald-100 text-emerald-700" 
                                        : "bg-slate-100 text-slate-600"
                                    }`}>
                                      {item.diferencia > 0 ? "+" : ""}
                                      {item.diferencia} u.
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-slate-400">{item.timestamp}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* PIE DE PLANILLA: APLICAR AJUSTE DE STOCK */}
                      {auditSession.length > 0 && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <p className="text-[10px] text-slate-500 leading-relaxed text-center sm:text-left">
                            ⚠️ Al guardar los cambios, la cantidad auditada reemplazará el stock anterior de la sucursal. Esta operación generará un log de auditoría.
                          </p>
                          <button 
                            onClick={applyAuditToInventory}
                            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/25 shrink-0"
                          >
                            💾 Guardar y Sincronizar Stock Local
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* VISTA B: MODAL DE CONTEO MEDIANTE EXCEL */
                    <div className="flex-1 flex flex-col min-h-[300px]">
                      {!templateFile ? (
                        <div className="py-20 text-center space-y-4 px-6 flex-1 flex flex-col justify-center items-center">
                          <div className="mx-auto w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                            <FileSpreadsheet className="w-7 h-7" />
                          </div>
                          <div className="space-y-1 max-w-sm">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Subí tu Excel para Contar</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Subí el Excel que te mandan. Martín se encargará de mapear los productos y mantener su **orden original intacto**.
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => document.getElementById("excel-template-picker")?.click()}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            Seleccionar Archivo Excel o CSV
                          </button>

                          <div className="pt-4 max-w-xs text-left bg-slate-50/50 border border-slate-100 p-3 rounded-xl space-y-2 text-[10px] text-slate-400 font-sans">
                            <p className="font-bold text-slate-600">✨ ¿Cómo funciona?</p>
                            <p>1. Subís la planilla tal cual te la mandan.</p>
                            <p>2. Escaneás códigos de barras o dictás cantidades.</p>
                            <p>3. El sistema busca, desplaza el scroll y lo cuenta en la fila exacta.</p>
                            <p>4. Exportás el Excel modificado respetando el **orden original**.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col flex-1">
                          
                          {/* RESUMEN EXCEL STATS */}
                          <div className="p-4 bg-indigo-50/30 border-b border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Filas Totales</span>
                              <p className="text-sm font-bold text-slate-800 font-mono">{templateFile.rows.length}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Contados</span>
                              <p className="text-sm font-bold text-indigo-600 font-mono">
                                {templateFile.rows.filter(r => r.cantidadAuditada !== null).length} / {templateFile.rows.length}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Mermas Halladas</span>
                              <p className="text-sm font-bold text-rose-600 font-mono">
                                {templateFile.rows.filter(r => r.cantidadAuditada !== null && r.diferencia < 0).length}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Progreso</span>
                              <p className="text-sm font-bold text-slate-800 font-mono">
                                {Math.round((templateFile.rows.filter(r => r.cantidadAuditada !== null).length / templateFile.rows.length) * 100)}%
                              </p>
                            </div>
                          </div>

                          {/* BUSCADOR DE PRODUCTOS EN EL EXCEL */}
                          <div className="p-3 border-b border-slate-150/60 bg-white flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="🔍 Filtrar o buscar producto en la planilla Excel por nombre o código..." 
                              value={excelSearchQuery}
                              onChange={(e) => setExcelSearchQuery(e.target.value)}
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                            />
                            {excelSearchQuery && (
                              <button 
                                onClick={() => setExcelSearchQuery("")}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Limpiar
                              </button>
                            )}
                          </div>

                          {/* GRID DE FILAS REALES */}
                          <div className="flex-1 overflow-y-auto max-h-[450px]">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                  <th className="p-3 w-8 text-center font-mono">#</th>
                                  <th className="p-3">Producto</th>
                                  <th className="p-3">EAN / Código</th>
                                  <th className="p-3 text-center">Teórico</th>
                                  <th className="p-3 text-center w-28">Físico (Conteo)</th>
                                  <th className="p-3 text-center">Diferencia</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700 font-sans">
                                {templateFile.rows
                                  .map((row, idx) => ({ row, idx }))
                                  .filter(({ row }) => {
                                    if (!excelSearchQuery) return true;
                                    const q = excelSearchQuery.toLowerCase();
                                    return row.producto.toLowerCase().includes(q) || row.codigoBarras.includes(q);
                                  })
                                  .map(({ row, idx }) => {
                                    const isCounted = row.cantidadAuditada !== null;
                                    const diff = row.diferencia;
                                    
                                    return (
                                      <tr 
                                        key={idx} 
                                        id={`excel-row-${idx}`}
                                        className={`hover:bg-slate-50/40 transition-colors ${
                                          isCounted 
                                            ? diff < 0 
                                              ? "bg-rose-50/20" 
                                              : diff > 0 
                                              ? "bg-emerald-50/10" 
                                              : "bg-indigo-50/10" 
                                            : ""
                                        }`}
                                      >
                                        <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="p-3 font-bold text-slate-800 font-mono">{row.producto}</td>
                                        <td className="p-3 font-mono text-slate-400">{row.codigoBarras || "S/C"}</td>
                                        <td className="p-3 text-center font-mono text-slate-500">{row.stockTeorico} u.</td>
                                        <td className="p-3 text-center">
                                          <div className="flex items-center justify-center gap-1">
                                            <input 
                                              type="number" 
                                              value={isCounted ? row.cantidadAuditada : ""}
                                              placeholder="Conteo..."
                                              onChange={(e) => {
                                                const val = e.target.value === "" ? null : parseInt(e.target.value) || 0;
                                                const updated = [...templateFile.rows];
                                                updated[idx] = {
                                                  ...row,
                                                  cantidadAuditada: val,
                                                  diferencia: val !== null ? val - row.stockTeorico : 0
                                                };
                                                setTemplateFile({
                                                  ...templateFile,
                                                  rows: updated
                                                });
                                              }}
                                              className="w-20 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-250 rounded-lg text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                            />
                                          </div>
                                        </td>
                                        <td className="p-3 text-center font-mono">
                                          {isCounted ? (
                                            <span className={`px-2 py-0.5 rounded font-bold ${
                                              diff < 0 
                                                ? "bg-rose-100 text-rose-700" 
                                                : diff > 0 
                                                ? "bg-emerald-100 text-emerald-700" 
                                                : "bg-indigo-100 text-indigo-700"
                                            }`}>
                                              {diff > 0 ? "+" : ""}
                                              {diff} u.
                                            </span>
                                          ) : (
                                            <span className="text-slate-300 font-mono">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>

                          {/* FOOTER DEL EXCEL */}
                          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <p className="text-[10px] text-slate-500 leading-relaxed text-center sm:text-left">
                              💡 <strong>Auto-Guardado:</strong> Los cambios se guardan localmente. Podés continuar escaneando en cualquier momento para actualizar filas. Al terminar, dale a <strong>"Exportar Excel Terminado"</strong>.
                            </p>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button 
                                onClick={() => {
                                  if (window.confirm("¿Seguro querés limpiar la plantilla Excel cargada? Perderás el progreso de conteo actual.")) {
                                    setTemplateFile(null);
                                  }
                                }}
                                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-xl cursor-pointer transition-all"
                              >
                                Limpiar Excel
                              </button>
                              <button 
                                onClick={exportExcelAudit}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/25 whitespace-nowrap"
                              >
                                💾 Exportar Conteo Excel Terminado
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== COMPRAS Y FACTURAS ==================== */}
      {activeTab === "compras" && (
        <div className="space-y-6">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-rose-600 font-bold uppercase font-mono tracking-wider">Cuentas por Pagar</span>
              <h4 className="text-sm font-bold text-rose-950">Monto total de facturas pendientes de pago: {formatARS(pendingInvoicesAmount)}</h4>
            </div>
            <button 
              onClick={() => askMartin("Armá un calendario de pagos de las facturas pendientes de compras_facturas.csv ordenado por urgencia.")}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Organizar Cronograma
            </button>
          </div>

          <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                <Plus className="w-4 h-4 text-indigo-600" />
                Registrar Factura Simulada
              </h4>
              <p className="text-[10px] text-slate-500">Cargá nuevas facturas de proveedores para simular su vencimiento.</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Proveedor" 
                value={newInvoiceProv}
                onChange={(e) => setNewInvoiceProv(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs w-full sm:w-36 focus:outline-none"
              />
              <input 
                type="number" 
                placeholder="Monto ARS" 
                value={newInvoiceMonto}
                onChange={(e) => setNewInvoiceMonto(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono w-full sm:w-32 focus:outline-none"
              />
              <button 
                onClick={() => {
                  if (!newInvoiceProv || !newInvoiceMonto) return;
                  const m = parseFloat(newInvoiceMonto);
                  const refId = `FAC-2026-${Math.floor(100 + Math.random() * 900)}`;
                  const dateStr = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0]; // +7 days
                  setInvoicesData([...invoicesData, { proveedor: newInvoiceProv, fechaVencimiento: dateStr, monto: m, estado: "Pendiente", facturaRef: refId }]);
                  setNewInvoiceProv("");
                  setNewInvoiceMonto("");
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
              >
                Registrar
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Planilla de Egresos & Proveedores (facturas_pendientes.csv)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Auditoría de deudas y facturas activas.</p>
              </div>
              <button 
                onClick={() => askMartin("Analizá de deudas pendientes en facturas_pendientes.csv y sugerime una distribución de fondos para no desfinanciar los locales.")}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Análisis de liquidez con Martín
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-4">Factura de Referencia</th>
                    <th className="p-4">Proveedor</th>
                    <th className="p-4 text-right">Monto Factura</th>
                    <th className="p-4">Fecha Vencimiento</th>
                    <th className="p-4">Estado de Pago</th>
                    <th className="p-4">Acción rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {invoicesData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{d.facturaRef}</td>
                      <td className="p-4 font-sans font-medium text-slate-700">{d.proveedor}</td>
                      <td className="p-4 text-right text-slate-900 font-bold">{formatARS(d.monto)}</td>
                      <td className="p-4 text-slate-400">{d.fechaVencimiento}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          d.estado === "Pendiente" 
                            ? "bg-amber-100 text-amber-700" 
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {d.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        {d.estado === "Pendiente" ? (
                          <button 
                            onClick={() => {
                              setInvoicesData(invoicesData.map(inv => inv.facturaRef === d.facturaRef ? { ...inv, estado: "Pagado" } : inv));
                            }}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Marcar Pagada
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Liquidada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CAJA Y ARQUEO ==================== */}
      {activeTab === "caja" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Cierre Realizado vs Arqueo Físico</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Auditoría cruzada de las 10 sucursales. Las mini-empresas declaran el arqueo vía planilla o chat. El sistema busca discrepancias de forma automática.
              </p>
              <div className="space-y-3">
                {storesClosure.slice(0, 5).map((loc) => (
                  <div key={loc.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800">{loc.label}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Cierre: {formatARS(loc.total)}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                      loc.arqueoStatus === "Cuadrado" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {loc.arqueoStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Simulación de Descalce de Caja</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Simula que una sucursal tiene un faltante de caja de $15,000 en efectivo para ver cómo Martín te sugiere solucionarlo e ingresarlo contablemente.
                </p>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-3">
                <span className="text-[10px] font-bold font-mono text-rose-700">ESCENARIO RECOMENDADO DE CONTROL</span>
                <p className="text-xs text-rose-900 leading-relaxed">
                  "Martín, registramos una discrepancia de $15.000 de faltante de efectivo en el Local 4 de Almagro. ¿Cómo lo imputamos en los egresos operativos?"
                </p>
                <button 
                  onClick={() => askMartin("Registramos una discrepancia de $15.000 de faltante de efectivo en el Local 4 de Almagro hoy. ¿Cuál es el asiento contable o imputación recomendada y qué controles de seguridad adicionales sugerís para el encargado?")}
                  className="w-full text-center py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Consultar imputación contable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CLIENTES Y PROVEEDORES ==================== */}
      {activeTab === "clientes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Directorio de Proveedores y Marcas Oficiales</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Contactos del ecosistema comercial de Noemí.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-4">Razón Social / Proveedor</th>
                    <th className="p-4">Rubro Comercial</th>
                    <th className="p-4">Contacto de Ventas</th>
                    <th className="p-4">Plazo de Pago Pactado</th>
                    <th className="p-4">Estado del Vínculo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Aún no se registraron proveedores. Los proveedores se añadirán cuando proceses facturas o planillas reales.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== REPORTES ==================== */}
      {activeTab === "reportes" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Generador Consolidado de Informes Contables</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Esta sección compila y empaqueta de forma dinámica los archivos de ventas, costos, rentabilidad y stock en un reporte ejecutivo optimizado para auditoría de Noemí y su equipo contable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <span className="text-[10px] font-bold font-mono text-indigo-600">REPORTE FINANCIERO MENSUAL</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Consolida la información total de facturación bruta, costos fijos declarados, ganancia neta consolidada, transacciones y ticket promedio semanal.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      alert("Compilando reporte mensual...\n\nArchivo generado: reporte_consolidado_mensual.csv\nSincronizando de forma virtual con Google Drive.");
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Simular Generación
                  </button>
                  <button 
                    onClick={() => askMartin("Martín, generá un informe de balance mensual simulando que estamos al final del periodo de pruebas actual. Consolidá ventas, costos y stock.")}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Escribir Reporte con Martín
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <span className="text-[10px] font-bold font-mono text-emerald-600">AUDITORÍA DE STOCK Y REORDEN</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Analiza el nivel de rotación de mercadería por categoría, los productos con riesgo inminente de quiebre y estima el presupuesto requerido de compras.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      alert("Compilando reporte de inventario...\n\nArchivo generado: reporte_auditoria_stock.csv\nGuardado en la carpeta Martin Sistema de Google Drive.");
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Generar Reporte
                  </button>
                  <button 
                    onClick={() => askMartin("Armá el reporte de auditoría de quiebre de stock de todas las sucursales, determinando el costo financiero de reponer las góndolas.")}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Escribir con Martín
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== AUDITORÍA DE MOVIMIENTOS EN VIVO ==================== */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-mono font-bold uppercase tracking-wider">TRAZABILIDAD OPERATIVA EN TIEMPO REAL</span>
                <h3 className="font-display font-bold text-sm text-slate-800 tracking-tight mt-1">Auditoría de Movimientos de Base de Datos</h3>
                <p className="text-xs text-slate-400 mt-0.5">Control estricto de entradas de stock, traslados y mermas con marca de tiempo y usuario responsable para evitar boicot u omisión.</p>
              </div>
              <button 
                onClick={() => askMartin(`Martín, haceme una auditoría detallada de los últimos movimientos operacionales. Buscá si hay mermas sospechosas o traslados no autorizados entre sucursales basándose en esta lista: ${JSON.stringify(movementsData.slice(0, 10))}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md shadow-indigo-600/10"
              >
                <Bot className="w-3.5 h-3.5" />
                Auditar con Martín IA
              </button>
            </div>

            {/* Grid for form and live timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form to Simulate a Movement */}
              <div className="lg:col-span-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-150 space-y-4">
                <div className="border-b border-slate-200/60 pb-3">
                  <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Registro Operativo de Transacciones</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ejecutá una nueva operación para registrarla en la base del sistema.</p>
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Tipo de Movimiento</label>
                    <select
                      value={newMovTipo}
                      onChange={(e) => setNewMovTipo(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Entrada de stock">Entrada de stock (Ingreso)</option>
                      <option value="Traslado">Traslado (Redistribución)</option>
                      <option value="Merma">Merma (Pérdida/Descarte)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Producto</label>
                    <select
                      value={newMovProduct}
                      onChange={(e) => setNewMovProduct(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Alfajores Terrabusi Chocolate">Alfajores Terrabusi Chocolate</option>
                      <option value="Chocolate Milka Oreo 100g">Chocolate Milka Oreo 100g</option>
                      <option value="Sándwich de Pollo Teriyaki">Sándwich de Pollo Teriyaki</option>
                      <option value="Cerveza Patagonia Lata">Cerveza Patagonia Lata</option>
                      <option value="Coca-Cola 1.5L">Coca-Cola 1.5L</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Cantidad (Unidades)</label>
                      <input
                        type="number"
                        value={newMovQty}
                        onChange={(e) => setNewMovQty(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Destino / Afectado</label>
                      <select
                        value={newMovStore}
                        onChange={(e) => setNewMovStore(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                      >
                        <option value="Depósito Central">Depósito Central</option>
                        <option value="Palermo (Local 2)">Palermo (Local 2)</option>
                        <option value="Recoleta (Local 7)">Recoleta (Local 7)</option>
                        <option value="Belgrano (Local 3)">Belgrano (Local 3)</option>
                        <option value="Almagro (Local 4)">Almagro (Local 4)</option>
                        <option value="Flores (Local 5)">Flores (Local 5)</option>
                        <option value="Centro (Local 1)">Centro (Local 1)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Usuario Responsable</label>
                    <select
                      value={newMovResponsable}
                      onChange={(e) => setNewMovResponsable(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Noemí Carvallo (Owner)">Noemí Carvallo (Owner)</option>
                      <option value="Leo (Encargado)">Leo (Encargado)</option>
                      <option value="Marta (Depósito)">Marta (Depósito)</option>
                      <option value="Lucas Díaz (Almagro)">Lucas Díaz (Almagro)</option>
                      <option value="Estela Maris (Belgrano)">Estela Maris (Belgrano)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newMovQty || parseInt(newMovQty) <= 0) return;
                      const now = new Date();
                      const HH = String(now.getHours()).padStart(2, "0");
                      const MM = String(now.getMinutes()).padStart(2, "0");
                      const SS = String(now.getSeconds()).padStart(2, "0");
                      const timeStr = `${HH}:${MM}:${SS}`;
                      const dateStr = now.toISOString().split("T")[0];

                      const newMovement = {
                        id: Date.now(),
                        tipo: newMovTipo,
                        producto: newMovProduct,
                        cantidad: parseInt(newMovQty),
                        local: newMovStore,
                        responsable: newMovResponsable,
                        hora: timeStr,
                        fecha: dateStr
                      };

                      setMovementsData([newMovement, ...movementsData]);
                      alert(`¡Movimiento registrado con éxito!\nTipo: ${newMovTipo}\nProducto: ${newMovProduct}\nResponsable: ${newMovResponsable}\nHora: ${timeStr}`);
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar en Base de Datos
                  </button>
                </div>
              </div>

              {/* Timeline of Last 10 database movements */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="text-[11px] font-bold text-slate-700 font-mono">
                    Últimos 10 movimientos registrados en la base de datos:
                  </span>
                  
                  {/* Filters */}
                  <div className="flex gap-1.5 w-full sm:w-auto">
                    {["todos", "Entrada de stock", "Traslado", "Merma"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSearchMovFilter(filter)}
                        className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer capitalize ${
                          searchMovFilter === filter
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white hover:bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {filter === "todos" ? "Todos" : filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline flow */}
                <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-5 py-2 max-h-[480px] overflow-y-auto pr-2">
                  {movementsData
                    .filter(m => searchMovFilter === "todos" || m.tipo === searchMovFilter)
                    .slice(0, 10) // Show last 10 movements in the timeline
                    .map((m) => {
                      const isStockEntry = m.tipo === "Entrada de stock";
                      const isTransfer = m.tipo === "Traslado";
                      const isLoss = m.tipo === "Merma";

                      let iconBg = "bg-indigo-50 text-indigo-600 border-indigo-200";
                      let typeLabel = "TRASLADO";
                      let Icon = RefreshCw;

                      if (isStockEntry) {
                        iconBg = "bg-emerald-50 text-emerald-600 border-emerald-200";
                        typeLabel = "ENTRADA STOCK";
                        Icon = TrendingUp;
                      } else if (isLoss) {
                        iconBg = "bg-rose-50 text-rose-600 border-rose-200";
                        typeLabel = "MERMA CRÍTICA";
                        Icon = TrendingDown;
                      }

                      return (
                        <div key={m.id} className="relative group transition-all">
                          {/* Pulsing indicator node on timeline */}
                          <div className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                            isStockEntry ? "border-emerald-500" : isLoss ? "border-rose-500" : "border-indigo-500"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isStockEntry ? "bg-emerald-500" : isLoss ? "bg-rose-500" : "bg-indigo-500"
                            }`} />
                          </div>

                          {/* Detail Card */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider ${
                                  isStockEntry ? "bg-emerald-100 text-emerald-800" : isLoss ? "bg-rose-100 text-rose-800" : "bg-indigo-100 text-indigo-800"
                                }`}>
                                  {typeLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {m.hora}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{m.fecha}</span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-800">
                                {m.producto} <span className="text-slate-500 font-normal">({m.cantidad} unidades)</span>
                              </h4>
                              
                              <p className="text-[10px] text-slate-500">
                                Sucursal/Origen: <strong className="text-slate-700">{m.local}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-3 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <span className="text-[9px] text-slate-400 block uppercase font-mono tracking-wider">Responsable</span>
                                <span className="text-xs font-bold text-slate-700">{m.responsable}</span>
                              </div>
                              <div className={`p-2 rounded-xl border ${iconBg}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {movementsData.filter(m => searchMovFilter === "todos" || m.tipo === searchMovFilter).length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No hay movimientos registrados que coincidan con el filtro seleccionado.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== CENTRAL DE ALERTAS ==================== */}
      {activeTab === "alertas" && (
        <div className="space-y-6">
          <div className="space-y-3">
            {stockData.filter(s => s.stockActual < s.stockMinimo).length === 0 && invoicesData.filter(i => i.estado === "Pendiente").length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Aún no hay alertas registradas</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  El sistema monitoreará en tiempo real tus planillas de compras y stock. No hay quiebres ni facturas pendientes en este momento.
                </p>
              </div>
            ) : (
              <>
                {stockData.filter(s => s.stockActual < s.stockMinimo).map((item, idx) => (
                  <div key={idx} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3.5">
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold font-mono text-rose-700 uppercase">QUIEBRE DE INVENTARIO</span>
                        <span className="text-[10px] text-slate-400">Ahora</span>
                      </div>
                      <h4 className="text-xs font-bold text-rose-950">{item.producto} por debajo de Stock Mínimo</h4>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        Quedan únicamente {item.stockActual} unidades (mínimo: {item.stockMinimo}).
                      </p>
                    </div>
                  </div>
                ))}
                {invoicesData.filter(i => i.estado === "Pendiente").map((inv, idx) => (
                  <div key={idx} className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold font-mono text-amber-700 uppercase">VENCIMIENTO PENDIENTE</span>
                        <span className="text-[10px] text-slate-400">{inv.fechaVencimiento}</span>
                      </div>
                      <h4 className="text-xs font-bold text-amber-950">Factura de {inv.proveedor} ({formatARS(inv.monto)})</h4>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Ref: {inv.facturaRef} • Vence: {inv.fechaVencimiento}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== PLANIFICACIÓN LOGÍSTICA Y RED DE SEGURIDAD ==================== */}
      {activeTab === "logistica" && (
        <div className="space-y-6">
          {/* Main Navigation Sub-Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Operaciones Inteligentes</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Control logístico homólogo, balanceo justo de stock y cero mermas por vencimiento.</p>
              </div>
            </div>
            
            {/* Sub-tab Navigation */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-150 w-full sm:w-auto">
              <button
                onClick={() => setLogisticsSubTab("radar")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  logisticsSubTab === "radar" 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Radar CABA
              </button>
              <button
                onClick={() => setLogisticsSubTab("vencimientos")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  logisticsSubTab === "vencimientos" 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                Cero Cuadernos
              </button>
              <button
                onClick={() => setLogisticsSubTab("lotes")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  logisticsSubTab === "lotes" 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Control de Lotes
              </button>
            </div>
          </div>

          {/* ==================================== SUB-TAB 1: RADAR DE EVENTOS CABA ==================================== */}
          {logisticsSubTab === "radar" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-950/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase">LOGÍSTICA PREVENTIVA 48H</span>
                  <h3 className="font-display font-bold text-base text-white tracking-tight mt-1">Radar de Eventos CABA & Geolocalización</h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-normal">
                    Martín escanea internet permanentemente con 48 horas de anticipación buscando marchas, conciertos o cortes en Capital. 
                    Calcula qué locales quedan dentro del radio del evento y sugiere inyecciones o recortes de stock para evitar mermas.
                  </p>
                </div>
                <button
                  onClick={() => askMartin("Martín, haceme un reporte rápido del radar de eventos en CABA para las próximas 48 horas y qué locales se verán afectados por cortes.")}
                  className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md shadow-indigo-600/15"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Escanear CABA ahora
                </button>
              </div>

              {/* Grid Layout: Events List & Live Geolocation Map */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Left panel: Scanned Events List */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Eventos Detectados (Próximas 48h)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Hacé clic en un evento para ver el impacto geolocalizado en las sucursales.</p>
                  </div>

                  <div className="space-y-3 my-2 max-h-[350px] overflow-y-auto pr-1">
                    {radarEvents.map((ev) => {
                      const isSelected = selectedRadarEventId === ev.id;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedRadarEventId(ev.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                            isSelected 
                              ? "bg-indigo-50/50 border-indigo-200 shadow-sm ring-1 ring-indigo-100" 
                              : "bg-slate-50 hover:bg-slate-100/50 border-slate-150"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">{ev.nombre}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase whitespace-nowrap ${
                              ev.impacto === "Positivo" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {ev.factor}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ev.desc}</p>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100/60 font-mono">
                            <span>Afecta: <strong>{ev.localNombre}</strong></span>
                            <span className="text-indigo-600 font-semibold">{ev.fecha}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form to inject a new event to the radar */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        const name = prompt("Nombre del Evento (ej: Maratón de Buenos Aires, Recital de Catupecu Machu):");
                        if (!name) return;
                        const store = prompt("Sucursal afectada (ej: Recoleta, Centro, Once, Devoto, Flores):", "Once");
                        if (!store) return;
                        const impactType = confirm("¿El impacto del evento será POSITIVO para la venta de sándwiches y bebidas? (Aceptar = Positivo / Cancelar = Negativo)") ? "Positivo" : "Negativo";
                        const pct = prompt("Porcentaje de variación estimada (ej: +200%, -60%):", impactType === "Positivo" ? "+150%" : "-50%");
                        if (!pct) return;

                        const newEv = {
                          id: Date.now(),
                          nombre: name,
                          fecha: "Inmediato (Manual)",
                          localId: 3,
                          localNombre: `${store} (Local)`,
                          tipo: impactType === "Positivo" ? "Recital" : "Bloqueo",
                          impacto: impactType,
                          factor: pct,
                          sándwichesPeticion: impactType === "Positivo" ? 80 : 2,
                          sándwichesBase: 15,
                          desc: `Evento cargado manualmente. Afecta los alrededores de la sucursal ${store}.`,
                          rutaSugerida: "Tomar vías alternativas secundarias para evitar demoras en la descarga de sándwiches."
                        };

                        setRadarEvents([newEv, ...radarEvents]);
                        setSelectedRadarEventId(newEv.id);
                        alert(`¡Radar Actualizado! Martín detectó e inyectó "${name}" en el radar de CABA con impacto ${pct}.`);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Inyectar Evento Extra en CABA
                    </button>
                  </div>
                </div>

                {/* 2. Right panel: Geolocation Map Visualizer */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between gap-5 lg:col-span-7">
                  {(() => {
                    const activeEv = radarEvents.find(e => e.id === selectedRadarEventId) || radarEvents[0];
                    return (
                      <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-mono font-bold uppercase">MAPA DE CALOR GEOLOCALIZADO</span>
                            <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider mt-1">Radio de Incidencia Operativa en CABA</h4>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Visualizando impacto de: <strong>{activeEv.nombre}</strong></span>
                        </div>

                        {/* Interactive Vector Map Grid representation */}
                        <div className="relative aspect-[16/10] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                          {/* Map background grid representing CABA */}
                          <div className="absolute inset-0 grid grid-cols-8 grid-rows-5 opacity-10 pointer-events-none">
                            {Array.from({ length: 40 }).map((_, i) => (
                              <div key={i} className="border-r border-b border-white" />
                            ))}
                          </div>

                          {/* Map decorative river representing Río de la Plata */}
                          <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-950/40 border-l border-indigo-900/30 transform skew-x-12 translate-x-16 pointer-events-none flex items-center justify-center">
                            <span className="text-[9px] text-indigo-800 font-mono tracking-widest rotate-90 uppercase opacity-30 select-none">RÍO DE LA PLATA</span>
                          </div>

                          {/* Center focus area with pulse based on active event */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/* Pulse rings representing the event radius */}
                            <div className={`absolute w-36 h-36 rounded-full border opacity-30 animate-ping ${
                              activeEv.impacto === "Positivo" ? "border-emerald-500 bg-emerald-500/10" : "border-rose-500 bg-rose-500/10"
                            }`} style={{ animationDuration: "3s" }} />
                            <div className={`absolute w-20 h-20 rounded-full border border-dashed opacity-50 ${
                              activeEv.impacto === "Positivo" ? "border-emerald-400 bg-emerald-500/5" : "border-rose-400 bg-rose-500/5"
                            }`} />
                          </div>

                          {/* Succursals Represented as Pins */}
                          <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                            <MapPin className="w-5 h-5 text-indigo-400 drop-shadow" />
                            <span className="text-[8px] bg-slate-900/90 text-slate-300 font-mono px-1 py-0.5 rounded border border-slate-700 mt-0.5 scale-90">Belgrano</span>
                          </div>

                          <div className="absolute top-1/3 left-1/2 flex flex-col items-center">
                            <MapPin className="w-5 h-5 text-indigo-400 drop-shadow" />
                            <span className="text-[8px] bg-slate-900/90 text-slate-300 font-mono px-1 py-0.5 rounded border border-slate-700 mt-0.5 scale-90">Palermo</span>
                          </div>

                          <div className="absolute bottom-1/3 left-1/3 flex flex-col items-center">
                            <MapPin className="w-5 h-5 text-indigo-400 drop-shadow" />
                            <span className="text-[8px] bg-slate-900/90 text-slate-300 font-mono px-1 py-0.5 rounded border border-slate-700 mt-0.5 scale-90">Flores</span>
                          </div>

                          <div className="absolute bottom-1/4 left-1/2 flex flex-col items-center">
                            <MapPin className="w-5 h-5 text-indigo-400 drop-shadow" />
                            <span className="text-[8px] bg-slate-900/90 text-slate-300 font-mono px-1 py-0.5 rounded border border-slate-700 mt-0.5 scale-90">Almagro</span>
                          </div>

                          {/* Dynamic Active Store Pin inside the pulse */}
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <div className="p-1 bg-slate-900/90 rounded-lg border border-indigo-500/50 shadow-md text-center max-w-[120px] z-10">
                              <span className="text-[8px] font-mono text-indigo-300 uppercase block font-bold">ZONA DE IMPACTO</span>
                              <span className="text-[10px] font-sans text-white block font-bold truncate">{activeEv.localNombre.split(" ")[0]}</span>
                              <span className={`text-[8px] font-mono block mt-0.5 ${activeEv.impacto === "Positivo" ? "text-emerald-400" : "text-rose-400"}`}>
                                Demanda {activeEv.factor}
                              </span>
                            </div>
                            <MapPin className={`w-7 h-7 drop-shadow-md animate-bounce mt-1 ${
                              activeEv.impacto === "Positivo" ? "text-emerald-500" : "text-rose-500"
                            }`} />
                          </div>

                          {/* Map Legend */}
                          <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-slate-400 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              <span>Locales Normales</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Alerta Positiva (Subir Stock)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              <span>Alerta Negativa (Recortar)</span>
                            </div>
                          </div>
                        </div>

                        {/* Event action plan details */}
                        <div className="bg-white p-4 rounded-xl border border-slate-250/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">PLAN DE STOCK JUSTO (JIT)</span>
                            <div className="flex items-center gap-2">
                              <span className={`p-1 rounded ${activeEv.impacto === "Positivo" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                <Activity className="w-4 h-4" />
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {activeEv.impacto === "Positivo" ? "Sugerencia: Aumentar Provisión" : "Sugerencia: Recortar Envío"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              La demanda homóloga es de <strong>{activeEv.sándwichesBase} sándwiches</strong>. Debido al evento de {activeEv.tipo}, sugerimos enviar <strong>{activeEv.sándwichesPeticion} unidades</strong>, previniendo mermas o quiebre de stock.
                            </p>
                          </div>

                          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">EVITACIÓN DE OBSTÁCULOS EN RUTA</span>
                            <div className="flex items-center gap-2">
                              <span className="p-1 bg-amber-50 text-amber-600 rounded">
                                <Truck className="w-4 h-4" />
                              </span>
                              <span className="text-xs font-bold text-slate-800">Ruta de Abastecimiento</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              <strong>Instrucción choferes:</strong> {activeEv.rutaSugerida} Esto previene demoras logísticas y protege la cadena de frío de los elaborados.
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}


          {/* ==================================== SUB-TAB 2: CONTROL DE VENCIMIENTOS "CERO CUADERNOS" ==================================== */}
          {logisticsSubTab === "vencimientos" && (
            <div className="space-y-6">
              {/* Intro Title */}
              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-6 rounded-2xl border border-emerald-900/20 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase">PROGRAMA CERO CUADERNOS</span>
                  <h3 className="font-display font-bold text-base tracking-tight mt-1">Checking Dinámico de Gondolas y Vencimiento</h3>
                  <p className="text-xs text-emerald-200/70 max-w-2xl leading-normal">
                    Reemplazamos las planillas manuales en papel por un control rápido de 15 minutos por turno. 
                    Si se detecta mercadería próxima a vencer (15 días), se genera una orden de redistribución automática para enviarlo al local que más rápido lo vende.
                  </p>
                </div>
                <button
                  onClick={() => askMartin("Martín, explicame qué sucursales tienen mayor velocidad de venta para alfajores y cervezas y cómo calculamos el traslado de mercadería por vencer.")}
                  className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Sugerencia de Rotación
                </button>
              </div>

              {/* Grid: 15-Min Checklists & 15-Day Alert Board */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Left panel: 15-Min Checklist per Shift */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Turno Activo: Check de 15 Minutos</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Control de frenteado y rotación por categorías de golosinas.</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 font-mono font-bold text-[9px] rounded-full animate-pulse flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Margen: 15'
                    </span>
                  </div>

                  {/* Checklist items list */}
                  <div className="space-y-2.5 my-3">
                    {shiftChecklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShiftChecklist(shiftChecklist.map(sc => sc.id === item.id ? { ...sc, revisado: !sc.revisado } : sc));
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                          item.revisado 
                            ? "bg-emerald-50/40 border-emerald-100 opacity-75" 
                            : "bg-slate-50 border-slate-150 hover:bg-slate-100/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.revisado}
                          onChange={() => {}} // handled by div click
                          className="mt-0.5 accent-emerald-600 rounded cursor-pointer"
                        />
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-800">{item.producto}</span>
                            <span className="text-[9px] font-mono text-slate-400">{item.turno}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">{item.notas}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FIFO verification question banner */}
                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2.5">
                    <div className="flex items-start gap-2.5 text-[11px] text-indigo-900 leading-relaxed">
                      <ShieldAlert className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <span>
                        <strong>¡Pregunta obligatoria al personal!</strong> ¿Frenteaste la góndola? Es decir, ¿moviste los productos con vencimiento viejo para adelante y lo nuevo para atrás?
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-1 border-t border-indigo-100/60">
                      <span className="text-[9px] text-indigo-700 font-semibold font-mono">Rotación de góndola:</span>
                      <button
                        onClick={() => {
                          setFifoConfirmed(!fifoConfirmed);
                          if (!fifoConfirmed) {
                            alert("¡Excelente! Rotación FIFO registrada para el turno actual. Cero cuadernos, control digital.");
                          }
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          fifoConfirmed 
                            ? "bg-emerald-600 text-white" 
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        {fifoConfirmed ? "✓ Sí, Todo Rotado" : "Confirmar Rotación FIFO"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Right panel: 15-Day Expiring Alerts & Smart Transfer Orders */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Splash de Alertas: Productos por vencer (Próximos 15 días)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Si encontrás algo en el check de 15 min que vence pronto, ingresalo acá para ver el traslado inteligente.</p>
                  </div>

                  {/* Form to Splash new Expiring item */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newExpProduct || !newExpQty || !newExpDays) return;
                      
                      const newAlert = {
                        id: Date.now(),
                        producto: newExpProduct,
                        sucursalActual: newExpStore,
                        sucursalVendedora: "Local 7 - Recoleta", // Auto calculation helper
                        cantExpiring: parseInt(newExpQty),
                        diasVencer: parseInt(newExpDays),
                        salesPerWeekActual: 8,
                        salesPerWeekDestino: 140,
                        estado: "Pendiente"
                      };

                      setExpiringProductsAlerts([newAlert, ...expiringProductsAlerts]);
                      setNewExpProduct("Alfajores Suchard");
                      setNewExpQty("150");
                      setNewExpDays("10");
                      alert(`¡Alerta publicada! Martín calculó que el local con mayor velocidad de venta para este producto es Recoleta y preparó el traslado sugerido.`);
                    }}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-1 md:grid-cols-4 gap-2.5 items-end"
                  >
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Producto detectado</label>
                      <input
                        type="text"
                        value={newExpProduct}
                        onChange={(e) => setNewExpProduct(e.target.value)}
                        placeholder="Ej: Alfajores Suchard"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={newExpQty}
                        onChange={(e) => setNewExpQty(e.target.value)}
                        placeholder="150"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Días p/Vencer</label>
                      <input
                        type="number"
                        value={newExpDays}
                        onChange={(e) => setNewExpDays(e.target.value)}
                        placeholder="10"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Sucursal Origen</label>
                      <select
                        value={newExpStore}
                        onChange={(e) => setNewExpStore(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Local 8 - Devoto">Local 8 - Devoto</option>
                        <option value="Local 4 - Almagro">Local 4 - Almagro</option>
                        <option value="Local Once">Local Once</option>
                        <option value="Local 5 - Flores">Local 5 - Flores</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Publicar Alerta de Vencimiento
                      </button>
                    </div>
                  </form>

                  {/* List of active Expiring Alerts with sugested Transfers */}
                  <div className="space-y-3 my-2 max-h-[190px] overflow-y-auto pr-1">
                    {filteredExpiringProductsAlerts.map((al) => (
                      <div
                        key={al.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all ${
                          al.estado === "Completado" 
                            ? "bg-emerald-50/30 border-emerald-100 opacity-80" 
                            : "bg-amber-50/30 border-amber-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{al.producto}</span>
                            <span className="text-[10px] text-rose-600 font-semibold font-mono block mt-0.5">
                              ⚠️ Vence en {al.diasVencer} días | Cantidad: {al.cantExpiring} unidades
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                            al.estado === "Completado" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {al.estado === "Completado" ? "Enviado y Salvado" : "Rotación Pendiente"}
                          </span>
                        </div>

                        {/* Comparative Speed Analysis */}
                        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono p-2 bg-white rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px]">Origen ({al.sucursalActual})</span>
                            <span className="text-slate-700 font-bold">Vende: ~{al.salesPerWeekActual} u/sem</span>
                            <span className="text-rose-500 block text-[8px] font-semibold">Tardaría {(al.cantExpiring / Math.max(1, al.salesPerWeekActual)).toFixed(1)} semanas</span>
                          </div>
                          <div className="border-l border-slate-100 pl-3">
                            <span className="text-emerald-600 block uppercase text-[8px] font-bold">Destino sugerido ({al.sucursalVendedora})</span>
                            <span className="text-emerald-700 font-bold">Vende: ~{al.salesPerWeekDestino} u/sem</span>
                            <span className="text-emerald-600 block text-[8px] font-bold">Se liquida en {(al.cantExpiring / al.salesPerWeekDestino).toFixed(1)} semanas</span>
                          </div>
                        </div>

                        {/* Authorized Button */}
                        <div className="flex justify-end pt-1">
                          {al.estado === "Pendiente" ? (
                            <button
                              onClick={() => {
                                setExpiringProductsAlerts(expiringProductsAlerts.map(item => item.id === al.id ? { ...item, estado: "Completado" } : item));
                                alert(`¡Orden emitida! Se autorizó el traslado de ${al.cantExpiring} unidades de ${al.producto} hacia ${al.sucursalVendedora} para liquidar antes de su vencimiento.`);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                            >
                              Autorizar Traslado por Vencimiento
                            </button>
                          ) : (
                            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Traslado Autorizado de Forma Cruzada
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ==================================== SUB-TAB 3: CONTROL DE LOTES ("CERO COMPRA IMPULSIVA") ==================================== */}
          {logisticsSubTab === "lotes" && (
            <div className="space-y-6">
              {/* Main Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-950/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase">SUMINISTRO BALANCEADO</span>
                  <h3 className="font-display font-bold text-base tracking-tight mt-1">Control por Lotes Únicos & Bloqueador de Compras Impulsivas</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-normal">
                    Evitá sobrestocks onerosos en el depósito. El sistema registra las facturas mediante fotos rápidas de recibos, 
                    crea un Lote Único descentralizado entre sucursales, y **bloquea nuevas compras** si aún queda stock remanente en la red, sugiriendo un balanceo cruzado.
                  </p>
                </div>
                <button
                  onClick={() => askMartin("Martín, explicame cómo funciona el balanceo cruzado por Lotes Únicos y cómo el bloqueo de compras impulsivas le ahorra millones a Smart Commerce.")}
                  className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Sugerir Balanceo de Lote
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Left: Register Invoice by Photo/Quick-Scan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-5">
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Ingreso de Compra por Escaneo / Foto</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Saca una foto o subí el comprobante de compra para crear un lote único y su fecha de vencimiento sin tipear testamentos.</p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Simulated Camera/Photo Container */}
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden bg-slate-50">
                      {scanLoading ? (
                        <div className="space-y-2 text-center py-4">
                          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                          <span className="text-xs font-mono font-bold text-indigo-700 block">PROCESANDO FACTURA OCR...</span>
                          <span className="text-[9px] text-slate-400 block">Detectando cantidades y fechas de caducidad</span>
                        </div>
                      ) : invoicePhoto ? (
                        <div className="space-y-2 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                          <span className="text-xs font-bold text-slate-800 block">Foto de Factura Cargada</span>
                          <span className="text-[9px] text-slate-400 block font-mono">factura_compra_alfajores.jpg</span>
                          <button
                            type="button"
                            onClick={() => setInvoicePhoto(null)}
                            className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                          >
                            Eliminar foto
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-600">Cargar remito o factura</div>
                          <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">Capturá el remito de compra del depósito</p>
                          <button
                            type="button"
                            onClick={() => {
                              setScanLoading(true);
                              setTimeout(() => {
                                setScanLoading(false);
                                setInvoicePhoto("simulated_invoice_photo");
                                alert("¡OCR Completado! Se extrajeron automáticamente los datos: Alfajores Terrabusi, 5000 unidades, Vence Noviembre 2026.");
                              }, 1500);
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer transition-all mt-1"
                          >
                            Cargar Foto & Escanear
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inputs to review before generating unique lot */}
                    <div className="space-y-3 text-left">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Producto</label>
                        <select
                          value={invoiceProduct}
                          onChange={(e) => setInvoiceProduct(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Alfajores Terrabusi Chocolate">Alfajores Terrabusi Chocolate</option>
                          <option value="Chocolate Milka Oreo 100g">Chocolate Milka Oreo 100g</option>
                          <option value="Alfajores Havanna">Alfajores Havanna</option>
                          <option value="Cerveza Patagonia Lata">Cerveza Patagonia Lata</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Cantidad Comprada</label>
                          <input
                            type="number"
                            value={invoiceQty}
                            onChange={(e) => setInvoiceQty(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Vencimiento Factura</label>
                          <input
                            type="date"
                            value={invoiceVencimiento}
                            onChange={(e) => setInvoiceVencimiento(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!invoiceQty || !invoiceVencimiento) return;
                          const formattedDate = new Date(invoiceVencimiento).toLocaleString("es-AR", { month: "long", year: "numeric" });
                          const randId = `LOT-2026-${invoiceProduct.substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
                          
                          const newBatch = {
                            id: randId,
                            producto: invoiceProduct,
                            totalInicial: parseInt(invoiceQty),
                            vencimiento: formattedDate,
                            unidadesRestantes: parseInt(invoiceQty),
                            distribucion: [
                              { local: "Recoleta (Local 7)", cant: Math.round(parseInt(invoiceQty) * 0.3), inicial: Math.round(parseInt(invoiceQty) * 0.3) },
                              { local: "Palermo (Local 2)", cant: Math.round(parseInt(invoiceQty) * 0.3), inicial: Math.round(parseInt(invoiceQty) * 0.3) },
                              { local: "Devoto (Local 8)", cant: Math.round(parseInt(invoiceQty) * 0.4), inicial: Math.round(parseInt(invoiceQty) * 0.4) }
                            ],
                            estado: "En Circulación"
                          };

                          setActiveBatches([newBatch, ...activeBatches]);
                          setInvoicePhoto(null);
                          alert(`¡Excelente! Martín generó un LOTE ÚNICO con ID: ${randId} para registrar estas ${invoiceQty} unidades y rastrear sus ventas de forma cruzada.`);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Generar Lote Único de Control
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Right: Active Batch Lifecycle and Cross-Balancing Tracker */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Lotes Activos Descentralizados</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Seguimiento en tiempo real de lotes distribuidos entre sucursales.</p>
                      </div>

                      {/* Blocker Config Panel */}
                      <button
                        onClick={() => {
                          setPurchaseBlockerActive(!purchaseBlockerActive);
                          alert(`Bloqueador de Compras Impulsivas ${!purchaseBlockerActive ? "ACTIVADO" : "DESACTIVADO"}.`);
                        }}
                        className={`px-3 py-1 rounded-full text-[9px] font-bold font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                          purchaseBlockerActive 
                            ? "bg-rose-50 border border-rose-100 text-rose-700" 
                            : "bg-slate-100 border border-slate-200 text-slate-500"
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Bloqueador de Compras: {purchaseBlockerActive ? "ACTIVO" : "INACTIVO"}
                      </button>
                    </div>

                    <div className="space-y-4 my-3 max-h-[290px] overflow-y-auto pr-1">
                      {activeBatches.map((batch) => {
                        const progressPercent = (batch.unidadesRestantes / batch.totalInicial) * 100;
                        return (
                          <div key={batch.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3 text-left">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[10px] font-mono text-indigo-600 font-bold block">{batch.id}</span>
                                <h5 className="text-xs font-bold text-slate-800">{batch.producto}</h5>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-bold text-slate-800 block">
                                  {batch.unidadesRestantes} / {batch.totalInicial} u
                                </span>
                                <span className="text-[9px] text-slate-400 block font-mono">Vence: {batch.vencimiento}</span>
                              </div>
                            </div>

                            {/* Progress bar of the batch consumption */}
                            <div className="space-y-1">
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full rounded-full transition-all" 
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                                <span>Remanente: {progressPercent.toFixed(0)}%</span>
                                <span>Total Inicial: {batch.totalInicial} u</span>
                              </div>
                            </div>

                            {/* Local decentralization breakdown */}
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase">Distribución Actual en Sucursales:</span>
                              <div className="grid grid-cols-3 gap-2">
                                {batch.distribucion.map((dist, idx) => (
                                  <div key={idx} className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                                    <span className="text-[8px] text-slate-400 block truncate">{dist.local}</span>
                                    <span className="text-xs font-mono font-bold text-slate-700">{dist.cant} u</span>
                                    <span className="text-[8px] text-slate-400 block font-mono">inicial: {dist.inicial}u</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Simulated daily cashier purchases subtraction */}
                            <div className="flex items-center justify-between gap-4 pt-1">
                              <button
                                onClick={() => {
                                  // Subtract simulated POS purchase
                                  const unitsToSub = 200;
                                  if (batch.unidadesRestantes <= 0) {
                                    alert("El lote ya fue consumido por completo.");
                                    return;
                                  }
                                  
                                  const updatedDistrib = batch.distribucion.map((d, i) => {
                                    // Subtract from the first local that has stock
                                    if (i === 0 && d.cant >= unitsToSub) return { ...d, cant: d.cant - unitsToSub };
                                    if (i === 1 && d.cant >= unitsToSub) return { ...d, cant: d.cant - unitsToSub };
                                    return d;
                                  });

                                  setActiveBatches(activeBatches.map(b => b.id === batch.id ? { 
                                    ...b, 
                                    unidadesRestantes: Math.max(0, b.unidadesRestantes - unitsToSub),
                                    distribucion: updatedDistrib
                                  } : b));

                                  alert(`Ventas de cajas registradas: se vendieron ${unitsToSub} unidades. Sincronizando planilla DATA.`);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-mono text-slate-600 cursor-pointer"
                              >
                                ⚡ Registrar Venta POS (-200u)
                              </button>

                              {/* Purchase Blocker Alert Suggestion */}
                              {purchaseBlockerActive && batch.unidadesRestantes > 400 && (
                                <span className="text-[9px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100 font-bold block animate-pulse">
                                  🔒 COMPRA BLOQUEADA: Aún hay stock en red
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purchase Block Warning & Cross Balancing action banner */}
                  {purchaseBlockerActive && (
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold font-mono text-rose-700 uppercase tracking-wider block">ALERTA DEL SISTEMA: CONTROL ANTIDEUDA</span>
                        <h4 className="text-xs font-bold text-rose-950">Intento de Compra de Alfajores Bloqueado</h4>
                        <p className="text-[11px] text-rose-800 leading-relaxed max-w-xl">
                          Un encargado intentó realizar una compra de 2000 alfajores. El sistema detectó que todavía quedan <strong>2840 unidades del Lote LOT-2026-TERR-09</strong> distribuidas en la red. 
                          En lugar de gastar capital de trabajo, podés redistribuir stock cruzado entre sucursales de forma gratuita.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          // Perform cross redistribution
                          const updated = activeBatches.map(b => {
                            if (b.id === "LOT-2026-TERR-09") {
                              return {
                                ...b,
                                distribucion: [
                                  { local: "Recoleta (Local 7)", cant: 1000, inicial: 1500 },
                                  { local: "Palermo (Local 2)", cant: 1000, inicial: 1500 },
                                  { local: "Devoto (Local 8)", cant: 840, inicial: 2000 }
                                ]
                              };
                            }
                            return b;
                          });
                          setActiveBatches(updated);
                          alert("¡Éxito! Redistribución Cruzada programada: se balanceó el stock del Lote LOT-2026-TERR-09 equitativamente entre Recoleta, Palermo y Devoto para agotar existencias antes de cualquier compra.");
                        }}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl whitespace-nowrap transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                      >
                        Ejecutar Redistribución Cruzada
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== PREVENCION ESTIVAL E INFRAESTRUCTURA ==================== */}
      {activeTab === "infraestructura" && (
        <div className="space-y-6" id="summer-prevention-panel">
          {/* Main header block */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-900 p-6 rounded-2xl border border-amber-500/20 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
            <div className="space-y-1 text-left">
              <span className="px-2.5 py-0.5 bg-white/20 border border-white/30 text-white rounded-md text-[9px] font-mono font-bold tracking-wider uppercase">
                🌞 SISTEMA DE PLANIFICACIÓN PRE-VERANO / CONTROL DE ESTRUCTURAS
              </span>
              <h3 className="font-display font-bold text-base tracking-tight mt-1">
                Auditoría de Clima, Estructuras y Vidrieras
              </h3>
              <p className="text-xs text-amber-50 max-w-3xl leading-normal">
                Prevé el impacto del sol directo en los kioscos un mes antes del verano. Solicitá reportes fotográficos de la infraestructura, asigná órdenes de colocación de cortinas o túneles blackout, y controlá que se cumplan en menos de 24 horas. Los incumplimientos se exponen automáticamente para auditoría en tus grupos de WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => {
                  setSunMitigationRequested(true);
                  alert("¡Solicitud enviada! Se notificó a todos los encargados de las sucursales que deben enviar fotos reales de la exposición solar y las estructuras antes del plazo estricto de 24 horas.");
                }}
                className="px-3.5 py-2 bg-white text-indigo-900 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                Pedir Fotos de Estructura
              </button>
              <button
                onClick={() => askMartin("Martín, haceme un diagnóstico de riesgo de derretimiento de golosinas por sol directo en las sucursales, indicando qué locales necesitan túnel urgente y quiénes están incumpliendo el plazo de reacomodamiento.")}
                className="px-3.5 py-2 bg-indigo-950/60 border border-indigo-400/30 text-white text-xs font-bold rounded-xl hover:bg-indigo-950/80 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-amber-300" />
                Diagnóstico de Martín
              </button>
            </div>
          </div>

          {/* LÓGICA PREDICTIVA DE CLIMA Y PROTOCOLO ESCUDO TÉRMICO (Paso 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {/* Clima Feed */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h4 className="text-xs font-bold font-mono text-slate-700 uppercase">Monitoreo Meteorológico</h4>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Temperatura Actual:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-850 text-sm">
                    <Thermometer className="w-4.5 h-4.5 text-amber-500" />
                    <span>{currentTemp}°C</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Pronóstico Mañana:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-rose-600 text-sm">
                    <Sun className="w-4.5 h-4.5 text-rose-500 animate-spin-slow" />
                    <span>{forecastTemp}°C</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">API: WEATHER-ALERT-SECURE</span>
                    <button 
                      onClick={() => {
                        const isHot = forecastTemp < 26;
                        const newTemp = isHot ? 27.2 : 21.5;
                        const newForecast = isHot ? 29.5 : 23.4;
                        setCurrentTemp(newTemp);
                        setForecastTemp(newForecast);
                        const isNowActive = newForecast >= 26;
                        setEscudoTermicoActive(isNowActive);
                        setPosLocked(isNowActive);
                        alert(`Ajuste de Clima: Se actualizó el pronóstico a ${newForecast}°C. El protocolo 'Escudo Térmico' se ha ${isNowActive ? "ACTIVADO y bloqueó los POS para verificación" : "DESACTIVADO"}.`);
                      }}
                      className="text-indigo-600 hover:underline font-mono font-bold cursor-pointer"
                    >
                      [Probar Umbral {forecastTemp >= 26 ? "Clima Frío <26°C" : "Ola de Calor >26°C"}]
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Protocol Trigger */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4 text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h4 className="text-xs font-bold font-mono text-slate-700 uppercase">Cerebro de Martín - Escudo Térmico</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Disparo preventivo automático al iniciar Noviembre o ante pronósticos &gt;= 26°C. Bloquea las pantallas POS de los empleados para forzar la reubicación física de chocolates y sándwiches.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  {escudoTermicoActive ? (
                    <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg flex items-center gap-1 font-mono uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-550 animate-ping"></span>
                      🛡️ ESCUDO ACTIVO
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold rounded-lg flex items-center gap-1 font-mono uppercase tracking-wider">
                      💤 EN ESPERA
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 font-mono">Regla Calor &gt; 26°C</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEscudoTermicoActive(true);
                      setPosLocked(true);
                      alert("¡Protocolo Escudo Térmico activado manualmente por Noemí! Se ha bloqueado la terminal de ventas (POS) de todas las sucursales con tareas de prevención obligatorias.");
                    }}
                    className="flex-1 py-2 text-center bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
                  >
                    Activar Escudo
                  </button>
                  <button
                    onClick={() => {
                      setEscudoTermicoActive(false);
                      setPosLocked(false);
                      alert("Protocolo Escudo Térmico desactivado y terminales POS desbloqueadas.");
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-[10px] font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Desactivar
                  </button>
                </div>
              </div>
            </div>

            {/* Sugerencias Preventivas de Martín */}
            <div className="lg:col-span-4 bg-indigo-950 text-indigo-50 p-5 rounded-xl space-y-3 text-left shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-amber-300 rounded text-[8px] font-mono font-bold tracking-wider uppercase block">
                    🤖 DIAGNÓSTICO PREVENTIVO DE MARTÍN
                  </span>
                  <span className="text-[8px] font-mono text-indigo-300 uppercase">Alertas Leo/Noemí</span>
                </div>
                <h5 className="text-xs font-bold mt-1.5 text-white">Recomendación Crítica de Estructuras</h5>
                <div className="text-[10px] text-indigo-200 space-y-2 leading-relaxed mt-2.5 max-h-[105px] overflow-y-auto pr-1">
                  <p className="border-l-2 border-amber-500 pl-1.5">
                    ⚠️ <strong>Sucursal 4 (Almagro):</strong> Tiene vidriera al oeste sin toldo. Riesgo alto de pérdida de stock en chocolates y helados. <span className="text-amber-300 font-semibold">Inversión sugerida:</span> Colocar toldo o mudar isla de frío.
                  </p>
                  <p className="border-l-2 border-amber-500 pl-1.5">
                    ⚠️ <strong>Sucursal 2 (Palermo):</strong> Vidriera oeste desprotegida expuesta al sol de tarde directo. <span className="text-amber-300 font-semibold">Inversión sugerida:</span> Colocar blackout urgente para evitar merma de bombones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => askMartin("Martín, detallame el plan de inversión y presupuesto sugerido para instalar toldos blackout en las sucursales críticas antes de la ola de calor.")}
                className="w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Ver Plan de Inversión Sugerido
              </button>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Riesgo Crítico Sol</span>
                <span className="text-lg font-bold text-slate-800">2 Sucursales</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Fotos Recibidas L2</span>
                <span className="text-lg font-bold text-slate-800">
                  {infrastructureAudits.filter(a => a.fotosRecibidas).length} / {infrastructureAudits.length}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Límite de Ejecución</span>
                <span className="text-lg font-bold text-slate-800">24 Horas Máx.</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Encargados Expuestos</span>
                <span className="text-lg font-bold text-rose-700 font-mono">
                  {infrastructureAudits.filter(a => a.ordenEmitida && !a.ejecutado).length} de Alerta
                </span>
              </div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Workspace: Store Selection List / Supervisor form */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Store selector list */}
              <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-left">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">Relevamiento de Sol por Sucursal</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Hacé clic para ver el estado de la vidriera, fotos de estructura y cumplimiento.</p>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                  {infrastructureAudits.map((item) => {
                    const isSelected = selectedAuditId === item.id;
                    const isCritical = item.exposicionSol.toLowerCase().includes("crítica") || item.exposicionSol.toLowerCase().includes("alta");
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAuditId(item.id)}
                        className={`p-4 transition-all cursor-pointer text-left ${
                          isSelected 
                            ? "bg-amber-50/40 border-l-4 border-amber-500" 
                            : "hover:bg-slate-50/50 border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{item.local}</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Responsable: {item.responsable}</span>
                          </div>
                          
                          {/* Photo Badge */}
                          {item.fotosRecibidas ? (
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] font-bold font-mono rounded uppercase">
                              Foto Cargada L2
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-50 border border-red-150 text-red-600 text-[8px] font-bold font-mono rounded uppercase animate-pulse">
                              FALTA FOTO
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isCritical ? "bg-red-500" : "bg-emerald-500"}`} />
                            <span className="text-[10px] text-slate-600 font-sans leading-none">{item.exposicionSol}</span>
                          </div>

                          {/* WhatsApp Verification status */}
                          <div>
                            {item.ordenEmitida ? (
                              item.ejecutado ? (
                                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                  ✓ Cumplió
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">
                                  ⚠️ Expuesto
                                </span>
                              )
                            ) : (
                              <span className="text-[9px] text-slate-400 italic">Sin Orden</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SIMULADOR MULTIFUNCIÓN (PORTAL DE SUPERVISORES + TERMINAL POS EMPLEADAS) */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-400">Centro de Control de Sucursales</h4>
                      <p className="text-[10px] text-slate-400">Supervisión técnica y terminales de punto de venta</p>
                    </div>
                  </div>
                </div>

                {/* Tab selector buttons */}
                <div className="flex bg-slate-950 p-1 rounded-lg gap-1 border border-slate-800">
                  <button
                    onClick={() => setInfraSimTab("supervisor")}
                    className={`flex-1 py-1.5 text-[10.5px] font-bold font-mono rounded-md transition-all cursor-pointer ${
                      infraSimTab === "supervisor"
                        ? "bg-amber-500 text-slate-950"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🔍 1. Portal Supervisor L2
                  </button>
                  <button
                    onClick={() => setInfraSimTab("pos")}
                    className={`flex-1 py-1.5 text-[10.5px] font-bold font-mono rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      infraSimTab === "pos"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {posLocked ? (
                      <Lock className="w-3 h-3 text-rose-400 animate-pulse" />
                    ) : (
                      <Unlock className="w-3 h-3 text-emerald-400" />
                    )}
                    2. Terminal POS (Caja)
                  </button>
                </div>

                {infraSimTab === "supervisor" ? (
                  /* SUPERVISOR VIEW PORTAL */
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Sucursal a Relevar</label>
                      <select
                        value={supLocalId}
                        onChange={(e) => {
                          const targetId = parseInt(e.target.value);
                          setSupLocalId(e.target.value);
                          const item = infrastructureAudits.find(a => a.id === targetId);
                          if (item) {
                            setSupSolExposicion(item.exposicionSol);
                            setSupNeedsMejora(item.necesitaMejora ? "true" : "false");
                            setSupMejoraPropuesta(item.mejoraPropuesta);
                            setEditSolDirecto(item.solDirecto);
                            setEditUbicacionHeladeras(item.ubicacionHeladeras);
                            setEditFlujoAire(item.flujoAire);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-250 font-medium focus:outline-none cursor-pointer"
                      >
                        {infrastructureAudits.map(item => (
                          <option key={item.id} value={item.id}>{item.local} ({item.responsable.split(" ")[0]})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Exposición Solar</label>
                        <select
                          value={supSolExposicion}
                          onChange={(e) => setSupSolExposicion(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="Crítica (Da directo por la tarde)">Crítica (Sol de Tarde)</option>
                          <option value="Alta (Vidriera principal expuesta desde el mediodía)">Alta (Mediodía)</option>
                          <option value="Baja (Vidriera protegida por marquesina)">Baja (Protegida)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">¿Expuesto al Sol Directo?</label>
                        <select
                          value={editSolDirecto ? "true" : "false"}
                          onChange={(e) => setEditSolDirecto(e.target.value === "true")}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="true">⚠️ Sí (Expuesto)</option>
                          <option value="false">✓ No (Seguro)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Ubicación Heladeras</label>
                        <input
                          type="text"
                          value={editUbicacionHeladeras}
                          onChange={(e) => setEditUbicacionHeladeras(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none"
                          placeholder="Frente a la vidriera..."
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Flujo Aire Acondicionado</label>
                        <input
                          type="text"
                          value={editFlujoAire}
                          onChange={(e) => setEditFlujoAire(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none"
                          placeholder="Directo a bombones..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">¿Necesita Inversión?</label>
                        <select
                          value={supNeedsMejora}
                          onChange={(e) => setSupNeedsMejora(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="true">Sí, urgente</option>
                          <option value="false">No, está protegido</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Simular Foto Real</label>
                        <select
                          value={supPhotoUrl}
                          onChange={(e) => setSupPhotoUrl(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80">Estantería expuesta (Sol de Palermo)</option>
                          <option value="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80">Vidriera con bombones y sol directo</option>
                          <option value="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80">Heladeras sombreadas con cortina</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Mejora Sugerida (Toldos, Cortinas, Vidrieras)</label>
                      <input
                        type="text"
                        value={supMejoraPropuesta}
                        onChange={(e) => setSupMejoraPropuesta(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none placeholder:text-slate-500"
                        placeholder="Ej: Colocar toldo de lona plegable o vinilo microperforado UV"
                      />
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-1 text-left">
                      <span className="text-[9px] font-bold text-amber-400 block uppercase font-mono">ORDEN PREVENTIVA RECIBIDA (24H PLAZO):</span>
                      <p className="text-[10px] text-slate-300 italic">
                        "{infrastructureAudits.find(a => a.id === parseInt(supLocalId))?.ordenEmitida || "No se han emitido órdenes para este local todavía."}"
                      </p>
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-[10px] text-slate-400">¿Cumpliste la orden física en la sucursal?</span>
                        <select
                          value={supOrderExecuted}
                          onChange={(e) => setSupOrderExecuted(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none cursor-pointer font-bold"
                        >
                          <option value="false">❌ No / Pendiente</option>
                          <option value="true">✓ Sí, ejecutado con foto</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const targetId = parseInt(supLocalId);
                        setInfrastructureAudits(infrastructureAudits.map(item => {
                          if (item.id === targetId) {
                            return {
                              ...item,
                              exposicionSol: supSolExposicion,
                              solDirecto: editSolDirecto,
                              ubicacionHeladeras: editUbicacionHeladeras,
                              flujoAire: editFlujoAire,
                              necesitaMejora: supNeedsMejora === "true",
                              mejoraPropuesta: supMejoraPropuesta,
                              fotosRecibidas: true,
                              fotoSimulada: supPhotoUrl,
                              ejecutado: supOrderExecuted === "true",
                              verificadoWhatsApp: supOrderExecuted === "true" 
                                ? "Confirmado con foto por el supervisor en el grupo de WhatsApp de la sucursal (OK)."
                                : `INCUMPLIDO. No hay pruebas de ejecución en el grupo de WhatsApp. El encargado queda expuesto ante Noemí.`
                            };
                          }
                          return item;
                        }));
                        alert("¡Relevamiento y foto de la estructura guardados con éxito! El sistema de Martín ha procesado la información para el control de Noemí.");
                      }}
                      className="w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md shadow-amber-500/10"
                    >
                      Enviar Relevamiento y Foto a Noemí
                    </button>
                  </div>
                ) : (
                  /* PHYSICAL POS EMPLEADAS SIMULATOR (Paso 3) */
                  <div className="space-y-4 text-left">
                    <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-xl space-y-1">
                      <span className="text-[9px] font-mono text-indigo-400 block font-bold uppercase">Terminal POS de Caja (Operación de Sucursal)</span>
                      <p className="text-[10px] text-slate-300">
                        Cada mañana, si la regla de calor de Martín (&gt;=26°C) se dispara, la caja de ventas se bloquea para el cobro. La cajera debe subir foto demostrando que protegió los chocolates para desbloquearla.
                      </p>
                    </div>

                    {posLocked ? (
                      /* LOCKED SCREEN MOCKUP */
                      <div className="p-4 bg-rose-950 border-2 border-rose-500 rounded-xl space-y-3 relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                        
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 bg-rose-500 text-slate-950 rounded-lg shrink-0">
                            <Lock className="w-4 h-4 text-white animate-bounce" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-rose-400 tracking-wider block">🔒 TERMINAL BLOQUEADA</span>
                            <h5 className="text-xs font-bold text-white mt-0.5 font-display">Protocolo Escudo Térmico Activo</h5>
                          </div>
                        </div>

                        <p className="text-[10px] text-rose-200 leading-normal bg-rose-900/40 p-2 rounded border border-rose-500/20">
                          ⚠️ <strong>¡Caja Suspendida!</strong> Se pronostican <strong>{forecastTemp}°C</strong>. Por orden de Martín y Noemí, debes realizar la acción preventiva obligatoria para evitar el derretimiento de chocolates antes de poder cobrar.
                        </p>

                        <div className="space-y-2.5 text-xs">
                          <div>
                            <label className="text-[9px] font-bold text-rose-350 block mb-1 uppercase font-mono">1. Tu Sucursal Actual</label>
                            <select
                              value={supLocalId}
                              onChange={(e) => setSupLocalId(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-rose-500/30 rounded-lg text-white text-xs focus:outline-none"
                            >
                              {infrastructureAudits.map(item => (
                                <option key={item.id} value={item.id} className="bg-slate-900">{item.local}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-rose-350 block mb-1 uppercase font-mono">2. Tarea Obligatoria Solicitada</label>
                            <select
                              value={posSelectedTask}
                              onChange={(e) => setPosSelectedTask(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-rose-500/30 rounded-lg text-white text-xs focus:outline-none cursor-pointer"
                            >
                              <option value="Mover exhibidor de chocolates fuera del rango de luz solar">Mover exhibidor de chocolates fuera de la luz solar</option>
                              <option value="Limpiar filtros de aire acondicionado de la sucursal">Limpiar filtros de aire acondicionado de la sucursal</option>
                              <option value="Colocar cortinas blackout y blindaje de vidriera oeste">Colocar cortinas blackout de protección oeste</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-rose-350 block mb-1 uppercase font-mono">3. Subir Foto del Cumplimiento</label>
                            <select
                              value={posTaskImage}
                              onChange={(e) => setPosTaskImage(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-rose-500/30 rounded-lg text-white text-xs focus:outline-none cursor-pointer"
                            >
                              <option value="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80">Foto: Chocolates movidos a la heladera trasera (OK)</option>
                              <option value="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80">Foto: Cortina temporal de blackout instalada (OK)</option>
                              <option value="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80">Foto: Filtros de aire limpios de pelusas (OK)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const targetId = parseInt(supLocalId);
                            setInfrastructureAudits(infrastructureAudits.map(item => {
                              if (item.id === targetId) {
                                return {
                                  ...item,
                                  fotosRecibidas: true,
                                  fotoSimulada: posTaskImage,
                                  ejecutado: true,
                                  verificadoWhatsApp: `VERIFICACIÓN AUTOMÁTICA POS: Bloqueo de Caja superado con éxito. El empleado cargó la foto real requerida para la tarea preventiva: "${posSelectedTask}" en el sistema.`
                                };
                              }
                              return item;
                            }));
                            setPosLocked(false);
                            setPosTaskSubmitted(true);
                            alert(`¡Éxito! Foto subida. Se verificó el cumplimiento físico de la tarea: "${posSelectedTask}". La terminal POS de cobro de ${infrastructureAudits.find(a => a.id === targetId)?.local} ha sido DESBLOQUEADA de inmediato.`);
                          }}
                          className="w-full py-2.5 bg-rose-650 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/30"
                        >
                          Subir Foto y Desbloquear Caja 🔓
                        </button>
                      </div>
                    ) : (
                      /* UNLOCKED / OPERATIONAL SCREEN */
                      <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-xl space-y-4 text-center">
                        <div className="flex flex-col items-center justify-center p-3 bg-emerald-900/40 rounded-lg space-y-1">
                          <Unlock className="w-8 h-8 text-emerald-400 animate-pulse" />
                          <h5 className="text-xs font-bold text-white font-display">TERMINAL OPERATIVA / VENTAS ABIERTAS</h5>
                          <p className="text-[10px] text-emerald-350">
                            La tarea obligatoria fue completada y enviada a Noemí con éxito.
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-900 rounded-lg border border-emerald-500/20 text-left">
                          <span className="text-[9px] font-mono text-slate-400 block uppercase">Último Reporte Enviado</span>
                          <p className="text-[10px] text-slate-200 mt-1">
                            <strong>Tarea:</strong> {posSelectedTask}
                          </p>
                          <div className="mt-2 rounded overflow-hidden border border-slate-800 h-20 bg-slate-950">
                            <img src={posTaskImage} alt="Foto de comprobación" className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setPosLocked(true);
                            setPosTaskSubmitted(false);
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold text-[10px] rounded-xl transition-colors cursor-pointer"
                        >
                          Verificar Nuevo Cierre Matutino
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Right Workspace: Selected Audit Details & WhatsApp verification */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {(() => {
                const audit = infrastructureAudits.find(a => a.id === selectedAuditId);
                if (!audit) return null;
                const isCritical = audit.exposicionSol.toLowerCase().includes("crítica") || audit.exposicionSol.toLowerCase().includes("alta");
                return (
                  <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-6">
                    
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                      <div>
                        <h3 className="font-display font-bold text-sm text-slate-800">{audit.local}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">Encargado Responsable: {audit.responsable}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold font-mono uppercase rounded-full ${
                        isCritical ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        Exposición Solar: {isCritical ? "Peligro Crítico" : "Seguro / Bajo"}
                      </span>
                    </div>

                    {/* Solar analysis and mockup structure photo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Structure Photo Display */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Foto de la Infraestructura</span>
                        {audit.fotosRecibidas ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-100 shadow-inner group">
                            <img 
                              src={audit.fotoSimulada} 
                              alt="Estructura del local" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-mono uppercase">
                              Relevamiento Verificado
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-red-200 h-44 bg-red-50/30 flex flex-col items-center justify-center p-4 text-center space-y-2">
                            <Camera className="w-8 h-8 text-red-400 animate-pulse" />
                            <span className="text-xs font-bold text-red-700">Sin Reporte de Foto</span>
                            <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed">
                              El encargado de {audit.local.split(" - ")[1]} no cargó fotos de la vidriera antes del plazo de preparación.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Climate Analysis summary */}
                      <div className="space-y-3.5 text-left">
                        <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Análisis Clínico de Estructura</span>
                        
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                          <p className="text-xs text-slate-700">
                            <strong>Diagnóstico de Estructura:</strong> {audit.exposicionSol}
                          </p>
                          <p className="text-xs text-slate-700">
                            <strong>Mejora Necesaria:</strong> {audit.necesitaMejora ? audit.mejoraPropuesta : "No requiere modificaciones urgentes de infraestructura para el verano."}
                          </p>
                        </div>

                        {audit.necesitaMejora && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-red-800 leading-normal">
                              <strong>Riesgo de Pérdida:</strong> Si no se coloca {audit.mejoraPropuesta.toLowerCase()} de forma urgente, la mercadería del sector de <strong>{audit.categoriaAfectada}</strong> (chocolates, alfajores o sándwiches) se derretirá con temperaturas mayores a 28°C.
                            </p>
                          </div>
                        )}

                        {/* Fichas de Posición y Hardware Crítico (Paso 1) */}
                        <div className="p-3.5 bg-indigo-50/45 border border-indigo-100/60 rounded-xl space-y-2.5">
                          <span className="text-[9.5px] font-bold font-mono text-indigo-800 uppercase block tracking-wider">🏷️ Hardware & Posición de la Estructura (Paso 1)</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-left">
                              <span className="text-[8px] text-slate-400 uppercase font-mono block">Exposición Sol Directo</span>
                              <span className={`font-bold block mt-0.5 ${audit.solDirecto ? "text-rose-600" : "text-emerald-600"}`}>
                                {audit.solDirecto ? "⚠️ Sí (Crítica)" : "✓ No (Protegida)"}
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-left">
                              <span className="text-[8px] text-slate-400 uppercase font-mono block">Ubicación de Heladeras</span>
                              <span className="font-semibold text-slate-700 block mt-0.5 truncate" title={audit.ubicacionHeladeras}>
                                {audit.ubicacionHeladeras || "No registrada"}
                              </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-left">
                              <span className="text-[8px] text-slate-400 uppercase font-mono block">Flujo de Aire Acond.</span>
                              <span className="font-semibold text-slate-700 block mt-0.5 truncate" title={audit.flujoAire}>
                                {audit.flujoAire || "No registrado"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Order Details & Compliance Verification (24-hour Limit) */}
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4 text-indigo-600" />
                        Auditoría de Ordenes y Plazo de 24 Horas
                      </h4>

                      {audit.ordenEmitida ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] font-bold font-mono text-indigo-600 uppercase block">ORDEN PREVENTIVA EMITIDA</span>
                              <p className="text-xs text-slate-800 font-semibold mt-0.5">"{audit.ordenEmitida}"</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">Plazo: 24 Horas</span>
                          </div>

                          {/* Compliance Status and exposure badge */}
                          <div className="p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-white text-left">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">CONSTATACIÓN EN GRUPO DE WHATSAPP (AUDITORÍA FÍSICA)</span>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">{audit.verificadoWhatsApp}</p>
                            </div>

                            {audit.ejecutado ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded font-mono uppercase tracking-wider shrink-0 self-start sm:self-center">
                                ✓ CUMPLIDO
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[9px] font-bold rounded font-mono uppercase tracking-wider shrink-0 self-start sm:self-center animate-pulse">
                                ❌ INCUMPLIDO
                              </span>
                            )}
                          </div>

                          {!audit.ejecutado && (
                            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-800 leading-relaxed font-medium">
                              ⚠️ El encargado {audit.responsable.split(" ")[0]} NO cumplió la orden en el plazo asignado de 24hs. Noemí puede verificar el chat para constatar la inacción y proceder con las medidas disciplinarias necesarias por negligencia.
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No se ha emitido ninguna orden preventiva para este local todavía.</p>
                      )}

                      {/* Owner Form: Emit New Order */}
                      {userRole === "owner" && (
                        <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono block">Emitir Orden de Reacomodamiento o Estructura</span>
                            <p className="text-[10px] text-slate-400">Ordená el traslado de mercadería, toldos o instalación de cortinas urgente.</p>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newOrderText}
                              onChange={(e) => setNewOrderText(e.target.value)}
                              placeholder="Ej: Instalar cortina blackout urgente en vidriera oeste y reubicar alfajores Suchard"
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            />
                            <button
                              onClick={() => {
                                if (!newOrderText) {
                                  alert("Ingresá la orden que deseas enviar al encargado.");
                                  return;
                                }
                                setInfrastructureAudits(infrastructureAudits.map(item => {
                                  if (item.id === audit.id) {
                                    return {
                                      ...item,
                                      ordenEmitida: newOrderText,
                                      fechaOrden: new Date().toISOString(),
                                      ejecutado: false,
                                      verificadoWhatsApp: "Pendiente de verificación. El encargado tiene un plazo límite de 24 horas para enviar la foto en el grupo de WhatsApp."
                                    };
                                  }
                                  return item;
                                }));
                                alert(`¡Orden enviada con éxito al encargado ${audit.responsable}! Se estableció un límite estricto de 24 horas.`);
                                setNewOrderText("");
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                            >
                              Enviar Orden
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                );
              })()}

            </div>

          </div>

          {/* Guidelines / Education panel */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4 text-left">
            <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Protocolo Técnico de Prevención Estival (Smart Commerce)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">1. Diagnóstico de Sol</span>
                <p className="text-[11px] text-slate-500">
                  Un mes antes del inicio oficial del verano, se debe hacer un relevamiento estricto de la incidencia del sol directo sobre las vidrieras de las 10 sucursales para mapear la exposición solar de cada local en las horas más calurosas.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">2. Protección Física</span>
                <p className="text-[11px] text-slate-500">
                  Todo local con exposición solar "Alta" o "Crítica" debe contar obligatoriamente con cortinas blackout, toldos externos reparados, o láminas vinílicas con protección UV instaladas para conservar la temperatura interior por debajo de 24°C.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">3. Regla de las 24 Horas</span>
                <p className="text-[11px] text-slate-500">
                  Una vez emitida una orden de traslado de mercadería o colocación de toldo, el encargado dispone de un máximo de 24 horas para su ejecución física y reporte en el grupo de WhatsApp. Vencido el plazo, el sistema lo marcará como incumplido.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================== PANEL DE ALERTAS Y AUDITORÍA DE BOICOT ==================== */}
      {activeTab === "alertas" && (
        <div className="space-y-6 text-left">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 border border-rose-900/50 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded text-[9px] font-mono font-bold uppercase tracking-wider">PANEL DE CONTROL DE PROPIETARIA (NOEMÍ CARVALLO)</span>
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                Auditoría Operativa: Control de Boicot y Omisiones Activas
              </h2>
              <p className="text-xs text-rose-200/70">
                Supervisá y sancioná la inacción, negligencia o incumplimiento de órdenes por parte de los encargados de sucursal.
              </p>
            </div>
            <div className="flex bg-rose-950/40 p-1 rounded-xl border border-rose-500/20 text-rose-300 font-mono text-[10px] px-3 py-1.5 gap-2 items-center">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <span>Estado Operativo General:</span>
              <strong className="text-rose-400 font-bold uppercase">{totalOmissionsCount > 0 ? "CRÍTICO (Boicot Detectado)" : "EXCELENTE"}</strong>
            </div>
          </div>

          {/* FCM Push Notifications Direct Link Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>🔔 Alertas Push en Segundo Plano (Firebase Cloud Messaging)</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono uppercase">En vivo</span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  Recibí alertas instantáneas de facturas por vencer y quiebres de stock en tu celular o PC incluso con la app cerrada.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("notificaciones_push")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              <span>Configurar Notificaciones Push</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards for "Alertas Rojas por Omisión" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-start justify-between border-rose-100 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">ALERTAS TOTALES</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800">{totalOmissionsCount}</h3>
                <span className="text-[10px] font-medium text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded">Omisiones Activas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-start justify-between border-amber-100 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">BOICOT INMOBILIARIO</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800">{auditsOmitted.length}</h3>
                <span className="text-[10px] font-medium text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded">Inacción Solar & AC</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-500 shadow-sm">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-start justify-between border-rose-100 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">DESVÍOS EN ARQUEOS</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800">{closuresOmitted.length}</h3>
                <span className="text-[10px] font-medium text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded">Diferencia de Caja</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-white shadow-sm flex items-start justify-between border-pink-100 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">RESCATES FIFO IGNORADOS</span>
                <h3 className="text-2xl font-bold font-mono text-slate-800">{rescuesOmitted.length}</h3>
                <span className="text-[10px] font-medium text-pink-600 px-1.5 py-0.5 bg-pink-50 rounded">Logística Omitida</span>
              </div>
              <div className="p-2.5 rounded-lg bg-pink-50 text-pink-600 shadow-sm">
                <ListChecks className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Main Layout Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Branches list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2">
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Mapeo del Boicot Operativo de cada Sucursal
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">Actualizado hace unos instantes</span>
              </div>

              {branchesWithOmissions.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-150 rounded-2xl space-y-3 shadow-sm">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">¡Excelente! Sin Boicot Operativo</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Todos los encargados de sucursal cumplieron las órdenes térmicas de prevención estival, cuadraron sus arqueos y completaron sus revisiones de stock.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {branchesWithOmissions.map((branch) => (
                    <motion.div
                      key={branch.id}
                      className="bg-white rounded-2xl border border-rose-150 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Branch Info Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-sm">{branch.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Responsable Encargado: <strong className="text-slate-700 font-semibold">{branch.manager}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {branch.intimado ? (
                            <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[9px] font-bold font-mono tracking-wider uppercase animate-pulse">
                              ⚠️ INTIMADO ({branch.intimado})
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-rose-50 text-rose-700 text-[9px] font-bold font-mono tracking-wider uppercase">
                              🚨 ALERTA ACTIVA ({branch.omissionCount} OMISIONES)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* List of active omissions */}
                      <div className="space-y-2.5 text-left">
                        {branch.activeOmissions.map((om, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                          >
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[8px] font-bold font-mono uppercase tracking-wider">
                                {om.type}
                              </span>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {om.detail}
                              </p>
                            </div>
                            
                            {/* Action Buttons to Resolve each specific omission */}
                            <button
                              onClick={() => {
                                if (om.category === "infraestructura") {
                                  // Mark thermal audit as executed
                                  setInfrastructureAudits(prev =>
                                    prev.map(item => item.id === om.refId ? { ...item, ejecutado: true, verificadoWhatsApp: "Aprobado directamente por Noemí tras auditoría de boicot." } : item)
                                  );
                                } else if (om.category === "caja") {
                                  // Mark cash closure discrepancy as squared
                                  setStoresClosure(prev =>
                                    prev.map(item => item.id === om.refId ? { ...item, arqueoStatus: "Cuadrado" } : item)
                                  );
                                } else if (om.category === "logistica") {
                                  // Mark logistics transfer rescue as approved
                                  setRedistributionRescues(prev =>
                                    prev.map(item => item.id === om.refId ? { ...item, estado: "Aprobado" } : item)
                                  );
                                } else if (om.category === "checklist") {
                                  // Mark shift checklist as revised
                                  setShiftChecklist(prev =>
                                    prev.map(item => item.id === om.refId ? { ...item, revisado: true } : item)
                                  );
                                }
                                alert(`¡Tarea de ${om.type} aprobada y resuelta con éxito por la propietaria Noemí Carvallo! Se actualizó la base de datos de control.`);
                              }}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
                            >
                              Resolver Omisión
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Warnings and Intimations Actions */}
                      <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            setIntimacionesSent(prev => ({ ...prev, [branch.name]: nowStr }));
                            alert(`Se emitió un pedido de descargo y advertencia formal de sanción a ${branch.manager.split(" ")[0]} en el grupo de WhatsApp del local a las ${nowStr}. Se le otorgaron 12 horas para resolver las omisiones.`);
                          }}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Intimar por WhatsApp (Descargo Urgente)</span>
                        </button>
                        <button
                          onClick={() => {
                            alert(`Se ha despachado una Auditoría Física de Campo hacia ${branch.name}. El inspector externo llegará en un máximo de 2 horas para tomar control físico de las góndolas y la caja.`);
                          }}
                          className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mandar Auditoría Física</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Martin's analysis and disciplinary advice */}
            <div className="space-y-6">
              {/* Analista Martín direct help */}
              <div className="bg-[#0a1128] text-slate-300 p-5 rounded-2xl border border-indigo-500/20 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-indigo-500/20 pb-3">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    <Bot className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                      Consejo Técnico de Martín
                    </h4>
                    <p className="text-[9px] text-indigo-300 font-mono">Consolidación del Boicot</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <p>
                    Estimada Noemí, agrupando los desvíos financieros y la omisión climática, vemos un claro patrón de inacción.
                  </p>
                  <p>
                    <strong>Local 4 - Almagro (Lucas Díaz)</strong> es el caso más severo: 
                    no retiró alimentos sensibles del sol, no justificó una diferencia de caja de -$3.500 y omitió un traslado crítico de sándwiches de pollo. Esto constituye una negligencia total que afecta la rentabilidad del sector de elaborados.
                  </p>
                  <p>
                    <strong>Local 2 - Palermo (Juan Pérez)</strong> ignoró la instalación del toldo protector de chocolates y la revisión de planillas. 
                    Recomiendo intimar de inmediato para evitar que el calor arruine la mercadería exhibida.
                  </p>
                  <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/10 text-[10px] text-indigo-200 space-y-1">
                    <span className="font-bold text-indigo-400 font-sans block">⚠️ Acción Propuesta</span>
                    <p>Descontar las mermas de chocolate del incentivo mensual de Palermo e intervenir administrativamente la caja de Almagro.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("chat_martin");
                    alert("Martín está listo. Consultale: 'Martín, dame un informe detallado sobre el boicot operativo de Almagro y Palermo y proponé mermas disciplinarias'");
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                  <span>Elaborar Intimación Formal con Martín</span>
                </button>
              </div>

              {/* Protocol info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-3.5">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Reglamento Operativo</h4>
                  <p className="text-[10px] text-slate-400">Convenio de sanciones y mermas por descuido</p>
                </div>
                
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <div className="flex gap-2 items-start">
                    <span className="p-0.5 bg-rose-50 text-rose-600 font-bold rounded text-[9.5px]">Art. 42</span>
                    <p className="text-[11px] text-slate-500">Toda mercadería que sufra deterioro por exposición solar indebida se considerará merma por negligencia del supervisor a cargo.</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="p-0.5 bg-rose-50 text-rose-600 font-bold rounded text-[9.5px]">Art. 45</span>
                    <p className="text-[11px] text-slate-500">Los desvíos de caja no justificados en el arqueo diario darán lugar a un sumario de apercibimiento con la auditoría central en 24hs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

