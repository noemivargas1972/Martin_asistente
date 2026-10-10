import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Database, 
  FolderOpen,
  ArrowRight,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  X,
  CreditCard,
  Percent,
  MessageSquare,
  Search,
  ArrowDownToLine,
  Sparkles,
  FileSpreadsheet,
  Table,
  Mic,
  MicOff,
  Volume2,
  CheckSquare,
  Square,
  ToggleLeft,
  ToggleRight,
  Bot,
  Info,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  Layers,
  Send,
  Boxes,
  Copy,
  Check,
  FileCode,
  ArrowUpRight,
  Edit3
} from "lucide-react";
import { DriveFile, DataRow, StockActualRow, HistorialMovimientoRow } from "../types";

interface DriveManagerProps {
  googleToken: string | null;
  onSyncComplete?: () => void;
}

const localesInfo = [
  { id: 1, label: "Local 1 - Centro", address: "Av. Corrientes 1400", baseEf: 380000, baseDig: 450000, color: "border-l-blue-500" },
  { id: 2, label: "Local 2 - Palermo", address: "Honduras 4800", baseEf: 420000, baseDig: 730000, color: "border-l-emerald-500" },
  { id: 3, label: "Local 3 - Belgrano", address: "Av. Cabildo 2200", baseEf: 350000, baseDig: 600000, color: "border-l-purple-500" },
  { id: 4, label: "Local 4 - Almagro", address: "Av. Rivadavia 3900", baseEf: 310000, baseDig: 410000, color: "border-l-amber-500" },
  { id: 5, label: "Local 5 - Flores", address: "Av. Rivadavia 6500", baseEf: 450000, baseDig: 440000, color: "border-l-pink-500" },
  { id: 6, label: "Local 6 - Caballito", address: "Av. Acoyte 100", baseEf: 390000, baseDig: 520000, color: "border-l-cyan-500" },
  { id: 7, label: "Local 7 - Recoleta", address: "Av. Santa Fe 1900", baseEf: 410000, baseDig: 870000, color: "border-l-indigo-500" },
  { id: 8, label: "Local 8 - Devoto", address: "Av. Beiró 4200", baseEf: 290000, baseDig: 390000, color: "border-l-slate-500" },
  { id: 9, label: "Local 9 - San Telmo", address: "Defensa 800", baseEf: 340000, baseDig: 410000, color: "border-l-yellow-500" },
  { id: 10, label: "Local 10 - Nuñez", address: "Av. Libertador 7200", baseEf: 360000, baseDig: 660000, color: "border-l-sky-500" },
  { id: 11, label: "Local 11 - Villa Urquiza", address: "Av. Triunvirato 4500", baseEf: 370000, baseDig: 510000, color: "border-l-rose-500" },
  { id: 12, label: "Local 12 - Villa Crespo", address: "Av. Corrientes 5200", baseEf: 330000, baseDig: 480000, color: "border-l-teal-500" },
  { id: 13, label: "Local 13 - Barracas", address: "Av. Montes de Oca 900", baseEf: 290000, baseDig: 370000, color: "border-l-orange-500" },
  { id: 14, label: "Local 14 - Colegiales", address: "Av. Federico Lacroze 2400", baseEf: 350000, baseDig: 590000, color: "border-l-violet-500" },
  { id: 15, label: "Local 15 - Saavedra", address: "Av. Balbín 3800", baseEf: 310000, baseDig: 430000, color: "border-l-lime-500" },
  { id: 16, label: "Local 16 - Liniers", address: "Av. Rivadavia 11500", baseEf: 410000, baseDig: 390000, color: "border-l-red-500" },
  { id: 17, label: "Local 17 - San Martín", address: "Calle 85 2100", baseEf: 340000, baseDig: 420000, color: "border-l-fuchsia-500" },
  { id: 18, label: "Local 18 - Vicente López", address: "Av. Maipú 1200", baseEf: 390000, baseDig: 610000, color: "border-l-emerald-500" },
  { id: 19, label: "Local 19 - Olivos", address: "Av. Maipú 2800", baseEf: 420000, baseDig: 680000, color: "border-l-blue-500" },
  { id: 20, label: "Local 20 - Martínez", address: "Av. Santa Fe 2100", baseEf: 440000, baseDig: 720000, color: "border-l-purple-500" },
  { id: 21, label: "Local 21 - San Isidro", address: "Belgrano 300", baseEf: 460000, baseDig: 790000, color: "border-l-amber-500" },
  { id: 22, label: "Local 22 - Tigre", address: "Av. Cazón 1100", baseEf: 380000, baseDig: 530000, color: "border-l-cyan-500" },
  { id: 23, label: "Local 23 - Avellaneda", address: "Av. Mitre 1400", baseEf: 390000, baseDig: 480000, color: "border-l-pink-500" },
  { id: 24, label: "Local 24 - Quilmes", address: "Peatonal Rivadavia 250", baseEf: 410000, baseDig: 520000, color: "border-l-indigo-500" },
  { id: 25, label: "Local 25 - Lanús", address: "9 de Julio 1200", baseEf: 370000, baseDig: 460000, color: "border-l-rose-500" },
  { id: 26, label: "Local 26 - Lomas de Zamora", address: "Peatonal Laprida 300", baseEf: 430000, baseDig: 550000, color: "border-l-sky-500" },
  { id: 27, label: "Local 27 - Banfield", address: "Maipú 200", baseEf: 320000, baseDig: 440000, color: "border-l-teal-500" },
  { id: 28, label: "Local 28 - Temperley", address: "Av. Almirante Brown 3100", baseEf: 310000, baseDig: 410000, color: "border-l-yellow-500" },
  { id: 29, label: "Local 29 - Callao 1", address: "Av. Callao 100", baseEf: 400000, baseDig: 490000, color: "border-l-emerald-500" },
  { id: 30, label: "Local 30 - Ramos Mejía", address: "Av. de Mayo 600", baseEf: 420000, baseDig: 580000, color: "border-l-purple-500" },
  { id: 31, label: "Local 31 - Castelar", address: "Carlos Casares 900", baseEf: 360000, baseDig: 490000, color: "border-l-blue-500" },
  { id: 32, label: "Local 32 - Ituzaingó", address: "Las Heras 200", baseEf: 330000, baseDig: 420000, color: "border-l-amber-500" },
  { id: 33, label: "Local 33 - San Justo", address: "Arieta 3200", baseEf: 440000, baseDig: 510000, color: "border-l-cyan-500" },
  { id: 34, label: "Local 34 - Merlo", address: "Av. del Libertador 500", baseEf: 380000, baseDig: 430000, color: "border-l-pink-500" },
  { id: 35, label: "Local 35 - Callao 2", address: "Av. Callao 800", baseEf: 390000, baseDig: 420000, color: "border-l-indigo-500" },
  { id: 36, label: "Local 36 - Pilar", address: "Peatonal Rivadavia 600", baseEf: 450000, baseDig: 640000, color: "border-l-slate-500" },
  { id: 37, label: "Local 37 - Ezeiza", address: "Paso de la Patria 200", baseEf: 310000, baseDig: 390000, color: "border-l-fuchsia-500" },
  { id: 38, label: "Local 38 - San Fernando", address: "Constitución 900", baseEf: 350000, baseDig: 470000, color: "border-l-lime-500" },
];

const getLocalHourlyRows = (localId: number, baseEfectivo: number, baseDigital: number) => {
  const rows = [];
  let totalEfectivo = 0;
  let totalDigital = 0;
  let totalTrans = 0;
  
  for (let hour = 8; hour < 20; hour++) {
    const nextHour = hour + 1;
    const hourStr = `${hour.toString().padStart(2, "0")}:00 - ${nextHour.toString().padStart(2, "0")}:00`;
    
    // Hourly factors: peaks in the evening (17:00-20:00) and lunch (12:00-14:00)
    const timeFactor = hour >= 17 && hour <= 20 ? 1.4 : hour >= 12 && hour <= 14 ? 1.1 : 0.7;
    const localFactor = 0.85 + (Math.sin(hour + localId) * 0.15);
    const finalFactor = timeFactor * localFactor;

    const ef = Math.floor((baseEfectivo / 12) * finalFactor);
    const dig = Math.floor((baseDigital / 12) * finalFactor);
    const trans = Math.floor(10 * finalFactor + 2);
    const total = ef + dig;
    
    totalEfectivo += ef;
    totalDigital += dig;
    totalTrans += trans;
    
    rows.push({ hour: hourStr, efectivo: ef, digital: dig, transacciones: trans, total });
  }
  
  return { rows, totalEfectivo, totalDigital, totalTrans, grandTotal: totalEfectivo + totalDigital };
};

export default function DriveManager({ googleToken, onSyncComplete }: DriveManagerProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [sheetRecords, setSheetRecords] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"drive" | "sheet" | "locales" | "whatsapp" | "sheets_reader" | "inventario_maestro" | "make_config">("drive");
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null);

  // Master Inventory & Normalization States
  const [masterStock, setMasterStock] = useState<StockActualRow[]>([]);
  const [masterHistorial, setMasterHistorial] = useState<HistorialMovimientoRow[]>([]);
  const [masterLoading, setMasterLoading] = useState<boolean>(false);
  const [masterSearchTerm, setMasterSearchTerm] = useState<string>("");
  const [normalizationText, setNormalizationText] = useState<string>("");
  const [normalizationFileName, setNormalizationFileName] = useState<string>("inventario_sucursal.csv");
  const [normalizing, setNormalizing] = useState<boolean>(false);
  const [normalizationResult, setNormalizationResult] = useState<any>(null);
  
  // Quick Edit Stock Modal State
  const [showEditStockModal, setShowEditStockModal] = useState<boolean>(false);
  const [editProductQuery, setEditProductQuery] = useState<string>("");
  const [editLocalQuery, setEditLocalQuery] = useState<string>("");
  const [editQtyValue, setEditQtyValue] = useState<number>(1);
  const [editMode, setEditMode] = useState<"add" | "subtract" | "set">("add");
  const [editingStock, setEditingStock] = useState<boolean>(false);

  // Make.com Config State
  const [makeConfigData, setMakeConfigData] = useState<any>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // File selection & filter states
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDeduplicating, setIsDeduplicating] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);

  // Voice Interaction with Martín States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>("");
  const [martinVoiceFeedback, setMartinVoiceFeedback] = useState<string>("");
  const [voiceInputText, setVoiceInputText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Voice speech synthesis output
  const speakFeedback = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-AR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Speech API Voice Recognition
  const startVoiceRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUploadError("Tu navegador no tiene activado el micrófono por voz. Podés escribirle tu indicación a Martín en el campo de texto.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-AR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript("");
        setMartinVoiceFeedback("🎙️ Escuchando... Hablale a Martín (ej: 'Dejá solo el más nuevo' o 'Borrá los duplicados')");
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setSpeechTranscript(transcriptText);
        setVoiceInputText(transcriptText);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (voiceInputText || speechTranscript) {
          handleExecuteMartinCommand(voiceInputText || speechTranscript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      setIsListening(false);
    }
  };

  // Google Sheets Selector & Reader states
  const [availableSheets, setAvailableSheets] = useState<Array<{ id: string; name: string; mimeType: string; modifiedTime?: string }>>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string>("");
  const [customSheetUrl, setCustomSheetUrl] = useState<string>("");
  const [loadingSheetsList, setLoadingSheetsList] = useState<boolean>(false);
  const [readingSheet, setReadingSheet] = useState<boolean>(false);
  const [extractedSheetData, setExtractedSheetData] = useState<{
    fileName: string;
    csvData: string;
    rows: string[][];
    rowCount: number;
    colCount: number;
  } | null>(null);
  const [sheetReaderError, setSheetReaderError] = useState<string>("");
  const [sheetReaderSuccess, setSheetReaderSuccess] = useState<string>("");

  const fetchAvailableSheets = async () => {
    setLoadingSheetsList(true);
    setSheetReaderError("");
    try {
      const headers: HeadersInit = {};
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/sheets/list-sheets", { headers });
      const data = await res.json();
      if (res.ok && data.sheets) {
        setAvailableSheets(data.sheets);
        if (data.sheets.length > 0 && !selectedSheetId) {
          setSelectedSheetId(data.sheets[0].id);
        }
      } else {
        setSheetReaderError(data.error || "No se pudieron obtener las planillas de Drive.");
      }
    } catch (err) {
      setSheetReaderError("Error de conexión al buscar planillas de Google Sheets.");
    } finally {
      setLoadingSheetsList(false);
    }
  };

  useEffect(() => {
    fetchAvailableSheets();
  }, [googleToken]);

  const handleReadSelectedSheet = async () => {
    if (!selectedSheetId && !customSheetUrl.trim()) {
      setSheetReaderError("Por favor seleccioná una planilla o ingresá una URL / ID de Google Sheets.");
      return;
    }

    setReadingSheet(true);
    setSheetReaderError("");
    setSheetReaderSuccess("");
    setExtractedSheetData(null);

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/sheets/read-sheet", {
        method: "POST",
        headers,
        body: JSON.stringify({
          fileId: selectedSheetId || undefined,
          sheetUrl: customSheetUrl.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setExtractedSheetData({
          fileName: data.fileName,
          csvData: data.csvData,
          rows: data.rows,
          rowCount: data.rowCount,
          colCount: data.colCount
        });
        setSheetReaderSuccess(data.message || `¡Se leyeron exitosamente ${data.rowCount} filas de '${data.fileName}'!`);
      } else {
        setSheetReaderError(data.error || "No se pudo leer la planilla seleccionada.");
      }
    } catch (err) {
      setSheetReaderError("Error de comunicación con la API de Google Sheets.");
    } finally {
      setReadingSheet(false);
    }
  };

  const handleSendSheetToMartin = () => {
    if (!extractedSheetData) return;
    window.dispatchEvent(
      new CustomEvent("ask-martin", {
        detail: {
          text: `Martín, por favor realiza un análisis financiero completo y auditoría detallada de esta planilla de Google Sheets: '${extractedSheetData.fileName}'. Identifica totales, métricas clave, alertas e inconsistencias.`,
          attachedDoc: {
            name: extractedSheetData.fileName,
            content: extractedSheetData.csvData
          }
        }
      })
    );
    alert(`¡Planilla '${extractedSheetData.fileName}' enviada a Martín IA!\n\nRevisá la ventana del chat de Martín a la derecha para ver su análisis interactivo en tiempo real.`);
  };

  // WhatsApp Chat Parser state
  const [whatsAppInput, setWhatsAppInput] = useState<string>("");
  const [parsedMessages, setParsedMessages] = useState<any[]>([]);
  const [convertedFileName, setConvertedFileName] = useState<string>("whatsapp_procesado.csv");
  const [filterTBestOnly, setFilterTBestOnly] = useState<boolean>(true);
  const [discardedCount, setDiscardedCount] = useState<number>(0);

  // WhatsApp Drive scanner states
  const [detectedDriveChats, setDetectedDriveChats] = useState<any[]>([]);
  const [scanningDrive, setScanningDrive] = useState<boolean>(false);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);

  const scanDriveForWhatsApp = async () => {
    setScanningDrive(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      const headers: HeadersInit = {};
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/whatsapp/scan-drive", { headers });
      const data = await res.json();
      if (res.ok && data.files) {
        setDetectedDriveChats(data.files);
        if (data.files.length === 0) {
          setUploadError("No se encontraron nuevos chats de WhatsApp (.txt) sin procesar en tu Google Drive.");
        } else {
          setUploadSuccess(`¡Se detectaron ${data.files.length} chats de WhatsApp listos para procesar en tu Drive!`);
        }
      } else {
        if (res.status === 401 || (data.error && (data.error.includes("401") || data.error.includes("Unauthorized") || data.error.includes("credentials")))) {
          setUploadError("🔐 Conexión con Drive pendiente: Se requiere autenticación OAuth con Google. Podés cargar chats pegando el texto exportado o simulando con Martín.");
        } else {
          setUploadError(data.error || "Error al buscar archivos en Google Drive.");
        }
      }
    } catch (err) {
      setUploadError("Error de conexión al escanear tu Google Drive. Verificá tu token o intentá pegando el texto manualmente.");
    } finally {
      setScanningDrive(false);
    }
  };

  const importDriveWhatsAppFile = async (fileId: string, fileName: string) => {
    setImportingFileId(fileId);
    setUploadError("");
    setUploadSuccess("");
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/whatsapp/import-file", {
        method: "POST",
        headers,
        body: JSON.stringify({ fileId, fileName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadSuccess(`¡Martín procesó '${fileName}' con éxito! Extrajo ${data.messagesCount} transacciones de control, generó el archivo de reporte estructurado en tu carpeta 'Martin Sistema', lo sincronizó en tu Google Sheet 'DATA' y renombró el origen como [PROCESADO] en tu Drive.`);
        setDetectedDriveChats((prev) => prev.filter((f) => f.id !== fileId));
        fetchFiles();
        handleSync();
      } else {
        setUploadError(data.error || "Error al procesar el archivo.");
      }
    } catch (err) {
      setUploadError("Error de conexión al importar el chat de WhatsApp.");
    } finally {
      setImportingFileId(null);
    }
  };

  const analyzeWhatsAppMessage = (text: string) => {
    const lower = text.toLowerCase();
    
    let type = "Relevamiento";
    let category = "Inventario & Stock";
    let concept = "Relevamiento de Mercadería";
    let amount = 0;
    let quantity = 1;
    let localDetected = "Cadena TBest";
    let hasLinkOrExcel = false;
    let isRelevamiento = false;
    let isIrrelevantChatter = false;

    // 1. Detect TBest 38 Locales
    const localNumMatch = text.match(/(?:local|sucursal|tbest|tb)[_\s#\-]*(\d{1,2})/i);
    if (localNumMatch) {
      const num = parseInt(localNumMatch[1]);
      if (num >= 1 && num <= 38) {
        const found = localesInfo.find(l => l.id === num);
        localDetected = found ? found.label : `Local ${num}`;
      }
    } else {
      // Neighborhood search
      const found = localesInfo.find(l => {
        const labelLow = l.label.toLowerCase();
        const parts = labelLow.split("-");
        const area = parts[1] ? parts[1].trim() : labelLow;
        return lower.includes(area);
      });
      if (found) {
        localDetected = found.label;
      }
    }

    // 2. Detect Links, Drive, Docs, Excel or CSV
    if (lower.includes("http") || lower.includes("drive.google") || lower.includes("docs.google") || lower.includes("sheets") || lower.includes(".xlsx") || lower.includes(".csv") || lower.includes(".xls") || lower.includes("excel") || lower.includes("planilla")) {
      hasLinkOrExcel = true;
      type = "Link / Excel";
      category = "Documento Externo";
      concept = "Enlace / Planilla Excel Relevada";
    }

    // 3. Extract amount ($ values)
    const amountRegex = /(?:\$|ars|pesos)\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      amount = parseInt(amountMatch[1].replace(/\./g, "").replace(/,/g, ""));
    } else {
      const simpleNumberRegex = /(?:por|total de|pagué|gasto de|cierre de|monto de)\s*(\d+)/i;
      const simpleMatch = text.match(simpleNumberRegex);
      if (simpleMatch) {
        amount = parseInt(simpleMatch[1]);
      }
    }
    
    // 4. Extract quantity & detect product list / relevamiento
    const qtyRegex = /(?:compré|lleva|trae|x|tenemos|quedan|sobrante|cant|cantidad)\s*(\d+)/i;
    const qtyMatch = text.match(qtyRegex);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1]);
      isRelevamiento = true;
    } else {
      const precedingQtyRegex = /(\d+)\s*(?:gaseosas|bebidas|coca|fanta|alfajor|caramelos|chocolates|unidades|u\.|botellas|cajas|pack|packs|fernet|corona)/i;
      const precedingMatch = text.match(precedingQtyRegex);
      if (precedingMatch) {
        quantity = parseInt(precedingMatch[1]);
        isRelevamiento = true;
      }
    }

    // Detect explicit stock requests / inventory count lines
    if (lower.includes("relevamiento") || lower.includes("cantidad que tienen") || lower.includes("cuanto tienen") || lower.includes("stock") || lower.includes("inventario") || lower.includes("mercadera") || lower.includes("mercadería")) {
      isRelevamiento = true;
    }

    // 5. Determine type, category and clean concept
    if (lower.includes("compr") || lower.includes("gasto") || lower.includes("pagu") || lower.includes("factura") || lower.includes("insumo")) {
      type = "Gasto";
      if (lower.includes("coca") || lower.includes("gaseosa") || lower.includes("bebida") || lower.includes("fanta")) {
        category = "Bebidas";
        concept = "Compra de Bebidas / Reposición";
      } else if (lower.includes("golosina") || lower.includes("alfajor") || lower.includes("caramelo") || lower.includes("chocolate")) {
        category = "Golosinas";
        concept = "Compra de Golosinas / Snack";
      } else if (lower.includes("limpieza") || lower.includes("lavandina") || lower.includes("desinfectante") || lower.includes("jabón")) {
        category = "Limpieza";
        concept = "Insumos de Limpieza local";
      } else {
        category = "Egresos Varios";
        concept = "Gasto Operativo";
      }
    } else if (lower.includes("cierre") || lower.includes("caja") || lower.includes("arqueo")) {
      type = "Cierre";
      category = "Cierre de Caja";
      concept = `Cierre de Caja ${localDetected}`;
    } else if (lower.includes("vend") || lower.includes("venta") || lower.includes("cobré") || lower.includes("ingreso")) {
      type = "Venta";
      category = "Venta Manual";
      concept = "Ingreso por Venta";
    } else if (isRelevamiento) {
      type = "Relevamiento";
      category = "Conteo Stock";
      concept = `Relevamiento ${localDetected}`;
    }

    // Specific product concept extraction
    if (lower.includes("coca-cola") || lower.includes("coca cola") || lower.includes("coca 1.5l")) {
      concept = "Coca-Cola 1.5L";
    } else if (lower.includes("fernet")) {
      concept = "Fernet Branca 750cc";
    } else if (lower.includes("corona")) {
      concept = "Cerveza Corona";
    } else if (lower.includes("guaymallen") || lower.includes("alfajor guaymallén")) {
      concept = "Alfajores Guaymallén";
    } else if (lower.includes("pepitos")) {
      concept = "Galletitas Pepitos";
    }

    // 6. Detect chatter / non-operational personal messages
    if (!isRelevamiento && !hasLinkOrExcel && amount === 0 && !lower.includes("caja") && !lower.includes("stock") && !lower.includes("local") && !lower.includes("tbest") && !lower.includes("factura")) {
      if (lower.includes("pizarrón") || lower.includes("pizarron") || lower.includes("copa de agua") || lower.includes("vaso de agua") || lower.includes("no quiero") || lower.includes("estás bien") || lower.includes("pasa algo") || lower.includes("tarea") || lower.includes("hola chicas") || lower.includes("amor")) {
        isIrrelevantChatter = true;
      }
    }
    
    return { type, category, concept, amount, quantity, localDetected, hasLinkOrExcel, isRelevamiento, isIrrelevantChatter };
  };

  const parseWhatsAppChat = (text: string, filterActive = filterTBestOnly) => {
    if (!text.trim()) {
      setParsedMessages([]);
      setDiscardedCount(0);
      return;
    }
    
    const lines = text.split("\n");
    const messages: any[] = [];
    let discarded = 0;
    
    const lineRegex = /^(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+-\s+|\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+)([^:]+):\s+(.+)$/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const match = line.match(lineRegex);
      if (match) {
        const date = match[1] || match[3];
        const time = match[2] || match[4];
        const sender = match[5].trim();
        const msgText = match[6].trim();
        
        const analysis = analyzeWhatsAppMessage(msgText);
        
        if (filterActive && analysis.isIrrelevantChatter) {
          discarded++;
          continue; // Filter out chatter!
        }

        messages.push({
          id: `wa-${i}`,
          date,
          time,
          sender,
          message: msgText,
          ...analysis
        });
      } else {
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          lastMsg.message += " " + line;
          const updatedAnalysis = analyzeWhatsAppMessage(lastMsg.message);
          if (filterActive && updatedAnalysis.isIrrelevantChatter) {
            messages.pop();
            discarded++;
          } else {
            Object.assign(lastMsg, updatedAnalysis);
          }
        }
      }
    }
    
    setParsedMessages(messages);
    setDiscardedCount(discarded);
  };

  const loadWhatsAppDemo = () => {
    const demo = 
      "12/07/2026, 08:30 - Noemí: Hola equipo TBest! Arrancamos el relevamiento de stock para los 38 locales de la cadena.\n" +
      "12/07/2026, 08:35 - Carlos (Local 4 - Almagro): Relevamiento Local 4 Almagro: Tenemos 45 unidades de Coca-Cola 1.5L, 18 Fernet Branca 750cc y 30 alfajores Pepitos.\n" +
      "12/07/2026, 08:42 - Valeria (Local 12 - Villa Crespo): Me dicen la cantidad que tienen de cerveza Corona? En Local 12 tenemos solo 4 botellas en stock.\n" +
      "12/07/2026, 08:45 - Mario (Local 1 - Centro): Subí la planilla completa de inventario a Google Drive: https://docs.google.com/spreadsheets/d/1tbest_inventario_central_2026/edit.xlsx\n" +
      "12/07/2026, 09:02 - Priscila (Local 7 - Recoleta): Local 7 Recoleta - Relevamiento de mercadería: 120 Gaseosas 500ml, 50 Aguas con gas Cellier, 25 Energizantes Red Bull.\n" +
      "12/07/2026, 09:15 - Mariana (Local 38 - San Fernando): En Local 38 nos quedan 12 Fernet y 0 Coca 1.5L. Necesitamos envío de rebalanceo urgente desde Depósito Central.\n" +
      "12/07/2026, 09:20 - Juan: Esta es una copa de agua.\n" +
      "12/07/2026, 09:21 - Juan: ¿Tenés mi pizarrón?\n" +
      "12/07/2026, 09:22 - María: No, no. ¿Qué trae su pizarrón?\n" +
      "12/07/2026, 09:23 - Juan: ¿Y le pongo a hacer una tarea o no?\n" +
      "12/07/2026, 09:24 - María: No. ¿Pasa algo? No quiero. ¿Estás bien vos? No amor.\n" +
      "12/07/2026, 10:15 - Rodrigo (Local 22 - Tigre): Adjunto el archivo Excel de compras del mes para Local 22: inventario_compras_local22.xlsx con 15 facturas registradas.\n" +
      "12/07/2026, 11:30 - Noemí: Excelente chicos! Registrado el relevamiento de los 38 locales de TBest.";
    setWhatsAppInput(demo);
    parseWhatsAppChat(demo, filterTBestOnly);
  };

  const saveWhatsAppCSV = async () => {
    if (parsedMessages.length === 0) return;
    
    let csvContent = "Fecha,Hora,Remitente,Tipo,Categoria,Concepto,Cantidad,Monto\n";
    parsedMessages.forEach((msg) => {
      const safeMsgConcept = msg.concept.replace(/"/g, '""');
      csvContent += `${msg.date},${msg.time},${msg.sender},${msg.type},${msg.category},"${safeMsgConcept}",${msg.quantity},${msg.amount}\n`;
    });
    
    setLoading(true);
    setUploadError("");
    setUploadSuccess("");
    
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/drive/upload", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: convertedFileName.toLowerCase().endsWith(".csv") ? convertedFileName : `${convertedFileName}.csv`,
          content: csvContent,
          mimeType: "text/csv",
          isImage: false
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setUploadSuccess(`¡Excelente! El archivo procesado '${convertedFileName}' se guardó en tu carpeta Martin Sistema de Drive y se sincronizó con Sheets.`);
        setWhatsAppInput("");
        setParsedMessages([]);
        fetchFiles();
        handleSync();
      } else {
        setUploadError(data.error || "Ocurrió un error al guardar el archivo.");
      }
    } catch (err) {
      setUploadError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // New file form state
  const [newFileName, setNewFileName] = useState<string>("");
  const [newFileContent, setNewFileContent] = useState<string>("");
  const [newFileType, setNewFileType] = useState<"csv" | "txt" | "image">("csv");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<string>("");
  const [simulating7, setSimulating7] = useState<boolean>(false);

  const runSimulacro7Locales = async () => {
    setSimulating7(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      const headers: HeadersInit = {};
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/drive/simulacro-7-locales", {
        method: "POST",
        headers
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadSuccess(`¡Excelente Noemí! Se inyectó con éxito el simulacro de la cadena de 7 minimercados (${data.count} archivos sincronizados). Ahora podés pedirle a Martín un análisis cruzado del simulacro en el chat.`);
        fetchFiles();
        fetchSheetData();
        if (onSyncComplete) onSyncComplete();
      } else {
        setUploadError(data.error || "Ocurrió un error al lanzar el simulacro.");
      }
    } catch (e) {
      setUploadError("Error de conexión al iniciar el simulacro.");
    } finally {
      setSimulating7(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchSheetData();
  }, [googleToken]);

  const fetchFiles = async () => {
    try {
      const headers: HeadersInit = {};
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/drive/files", { headers });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          if (data.files) {
            setFiles(data.files);
          }
        }
      }
    } catch (err) {
      console.warn("Notice fetching drive files:", err);
    }
  };

  const fetchSheetData = async () => {
    try {
      const headers: HeadersInit = {};
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/sheet/data", { headers });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          if (data.records) {
            setSheetRecords(data.records);
          }
        }
      }
    } catch (err) {
      console.warn("Notice fetching sheet data:", err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const headers: HeadersInit = {};
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/drive/sync", { method: "POST", headers });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          if (data.success && data.records) {
            setSheetRecords(data.records);
            if (onSyncComplete) onSyncComplete();
            const btn = document.getElementById("sync-btn");
            if (btn) {
              btn.classList.add("bg-emerald-600", "text-white");
              setTimeout(() => {
                btn.classList.remove("bg-emerald-600", "text-white");
              }, 1500);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Notice syncing files:", err);
    } finally {
      setSyncing(false);
    }
  };

  // 1. Toggle individual file inclusion for Martín's context
  const handleToggleInclude = async (fileId: string, currentIncluded?: boolean) => {
    const newStatus = currentIncluded === false ? true : false;
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/drive/toggle-martin-include", {
        method: "POST",
        headers,
        body: JSON.stringify({ fileId, include: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, includedInMartin: newStatus } : f));
        const fileObj = files.find(f => f.id === fileId);
        const fileName = fileObj ? fileObj.name : "archivo";
        const msg = newStatus 
          ? `✅ '${fileName}' ACTIVADO para el análisis de Martín.`
          : `⏸️ '${fileName}' PAUSADO. Martín no lo leerá.`;
        setUploadSuccess(msg);
        speakFeedback(newStatus ? `Archivo ${fileName} activado para Martín` : `Archivo ${fileName} ignorado`);
      }
    } catch (err) {
      console.error("Error toggling inclusion:", err);
      setUploadError("Error al actualizar la configuración de análisis del archivo.");
    }
  };

  // 2. Batch toggle inclusion for selected files
  const handleBatchToggleInclude = async (include: boolean) => {
    if (selectedFileIds.length === 0 && files.length === 0) return;
    const targetIds = selectedFileIds.length > 0 ? selectedFileIds : files.map(f => f.id);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      for (const id of targetIds) {
        await fetch("/api/drive/toggle-martin-include", {
          method: "POST",
          headers,
          body: JSON.stringify({ fileId: id, include })
        });
      }
      setFiles(prev => prev.map(f => targetIds.includes(f.id) ? { ...f, includedInMartin: include } : f));
      setUploadSuccess(`Se ${include ? "activaron" : "pausaron"} ${targetIds.length} archivo(s) para Martín.`);
      speakFeedback(include ? "Archivos activados para Martín" : "Archivos ignorados");
    } catch (err) {
      console.error("Error batch toggling inclusion:", err);
    }
  };

  // 3. Deduplicate files (Keep only newest version per document/inventory)
  const handleDeduplicateFiles = async () => {
    setIsDeduplicating(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/drive/deduplicate-files", {
        method: "POST",
        headers
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess(data.message || `¡Se desduplicaron ${data.removedCount || 0} archivos repetidos! Quedaron únicamente las versiones más recientes.`);
        speakFeedback(`¡Listo Noemí! Se desduplicaron los archivos y se mantuvieron solo las versiones más nuevas.`);
        fetchFiles();
        fetchSheetData();
        handleSync();
      } else {
        setUploadError(data.error || "No se pudo realizar la desduplicación.");
      }
    } catch (err) {
      console.error("Error deduplicating:", err);
      setUploadError("Error de conexión al intentar desduplicar archivos.");
    } finally {
      setIsDeduplicating(false);
    }
  };

  // 4. Purge test & simulation data to start with real data
  const handlePurgeTestData = async (wipeAll: boolean = false) => {
    setIsPurging(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/drive/purge-all-test-data", {
        method: "POST",
        headers,
        body: JSON.stringify({ wipeAll })
      });
      const data = await res.json();
      if (data.success) {
        setShowPurgeModal(false);
        setUploadSuccess(data.message || "¡Sistema limpio! Se eliminaron los datos de prueba. Ahora podés cargar tus inventarios reales.");
        speakFeedback(wipeAll ? "Se eliminaron todos los archivos del sistema." : "Se purgaron todos los datos de simulacro y prueba. El sistema quedó limpio para tus datos reales.");
        fetchFiles();
        fetchSheetData();
        handleSync();
      } else {
        setUploadError(data.error || "No se pudo purgar los datos.");
      }
    } catch (err) {
      console.error("Error purging test data:", err);
      setUploadError("Error al purgar los datos de prueba.");
    } finally {
      setIsPurging(false);
    }
  };

  // 5. Batch delete selected files
  const handleBatchDelete = async (explicitIds?: string[]) => {
    const idsToDelete = explicitIds || selectedFileIds;
    if (idsToDelete.length === 0) return;
    if (!confirm(`¿Estás segura de eliminar los ${idsToDelete.length} archivos seleccionados?`)) return;

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/drive/batch-delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ fileIds: idsToDelete })
      });
      const data = await res.json();
      if (data.success) {
        setFiles(prev => prev.filter(f => !idsToDelete.includes(f.id)));
        setSelectedFileIds([]);
        setUploadSuccess(`Se eliminaron ${data.deletedCount || idsToDelete.length} archivos correctamente.`);
        speakFeedback(`Se eliminaron ${idsToDelete.length} archivos.`);
        handleSync();
      }
    } catch (err) {
      console.error("Error deleting selected files:", err);
      setUploadError("Error al eliminar los archivos seleccionados.");
    }
  };

  // 6. Delete individual WhatsApp file
  const handleDeleteWhatsAppFile = async (fileId: string) => {
    if (!confirm("¿Eliminar este chat de WhatsApp detectado?")) return;
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/whatsapp/delete-file", {
        method: "POST",
        headers,
        body: JSON.stringify({ fileId })
      });
      const data = await res.json();
      if (data.success) {
        setDetectedDriveChats(prev => prev.filter(c => c.id !== fileId));
        setUploadSuccess("Chat de WhatsApp eliminado.");
      }
    } catch (err) {
      console.error("Error deleting WhatsApp file:", err);
    }
  };

  // Master Inventory & Normalization API Handlers
  const fetchMasterInventory = async () => {
    setMasterLoading(true);
    try {
      const headers: HeadersInit = {};
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;
      const res = await fetch("/api/inventario/maestro", { headers });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          setMasterStock(data.stockActual || []);
          setMasterHistorial(data.historial || []);
        }
      }
    } catch (err) {
      console.warn("Notice fetching master inventory:", err);
    } finally {
      setMasterLoading(false);
    }
  };

  const fetchMakeConfig = async () => {
    try {
      const res = await fetch("/api/make/config");
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          setMakeConfigData(data);
        }
      }
    } catch (err) {
      console.warn("Notice fetching Make config:", err);
    }
  };

  useEffect(() => {
    if (activeSubTab === "inventario_maestro") {
      fetchMasterInventory();
    } else if (activeSubTab === "make_config") {
      fetchMakeConfig();
    }
  }, [activeSubTab]);

  const handleNormalizeInput = async (contentToNormalize?: string, fileName?: string) => {
    const rawData = contentToNormalize || normalizationText;
    const name = fileName || normalizationFileName || "inventario_cargado.csv";
    if (!rawData.trim()) {
      setUploadError("Por favor ingresa o selecciona el contenido a normalizar.");
      return;
    }

    setNormalizing(true);
    setNormalizationResult(null);
    setUploadError("");
    setUploadSuccess("");

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/inventario/normalizar", {
        method: "POST",
        headers,
        body: JSON.stringify({
          rawData,
          fileName: name,
          usuario: "Noemí Carvallo"
        })
      });

      const data = await res.json();
      if (data.success) {
        setNormalizationResult(data);
        setUploadSuccess(`¡${data.message || "Inventario procesado"}! Se estandarizaron ${data.summary?.productosDetectados || 0} productos.`);
        speakFeedback(`Inventario procesado correctamente. Se detectaron ${data.summary?.productosDetectados || 0} productos y se guardaron en la base maestra.`);
        fetchMasterInventory();
        handleSync();
      } else {
        setUploadError(data.error || "El archivo está corrupto o no contiene columnas legibles.");
        speakFeedback(data.error === "El archivo está corrupto" ? "El archivo está corrupto." : "Error al procesar el archivo.");
      }
    } catch (err) {
      console.error("Error normalizing inventory:", err);
      setUploadError("Error de conexión al procesar la normalización.");
    } finally {
      setNormalizing(false);
    }
  };

  const handleNormalizeExistingFile = async (file: DriveFile) => {
    if (!file.content) {
      setUploadError("El archivo no tiene contenido para procesar.");
      return;
    }
    setActiveSubTab("inventario_maestro");
    await handleNormalizeInput(file.content, file.name);
  };

  const handleExecuteEditStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProductQuery.trim() || !editLocalQuery.trim()) {
      setUploadError("Por favor ingresa el nombre del producto y el local.");
      return;
    }

    setEditingStock(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/inventario/editar", {
        method: "POST",
        headers,
        body: JSON.stringify({
          producto: editProductQuery,
          local: editLocalQuery,
          cantidad: editQtyValue,
          modo: editMode,
          usuario: "Noemí Carvallo",
          observacion: `Ajuste manual directo vía Gestor Maestra (${editMode === "add" ? "+" : editMode === "subtract" ? "-" : "="}${editQtyValue})`
        })
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess(`Stock actualizado: ${data.item?.producto} en ${data.item?.local} ahora tiene ${data.item?.cantidad} u.`);
        speakFeedback(`Stock actualizado para ${data.item?.producto}. Cantidad resultante: ${data.item?.cantidad} unidades.`);
        setShowEditStockModal(false);
        setEditProductQuery("");
        fetchMasterInventory();
        handleSync();
      } else {
        setUploadError(data.error || "No se pudo actualizar el stock.");
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      setUploadError("Error al actualizar el stock.");
    } finally {
      setEditingStock(false);
    }
  };

  const handleSyncMasterSheets = async () => {
    setMasterLoading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;

      const res = await fetch("/api/inventario/sync-sheets", {
        method: "POST",
        headers
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess(data.message || "¡Base de datos maestra sincronizada con Google Sheets en hojas STOCK_ACTUAL e HISTORIAL!");
        speakFeedback("Base de datos maestra sincronizada con Google Sheets.");
      } else {
        setUploadError(data.error || "Error al sincronizar con Google Sheets.");
      }
    } catch (err) {
      console.error("Error syncing master inventory to sheets:", err);
      setUploadError("Error al sincronizar con Google Sheets.");
    } finally {
      setMasterLoading(false);
    }
  };

  // 7. Natural language / voice command interpreter for Martín
  const handleExecuteMartinCommand = async (rawCommand?: string) => {
    const cmd = (rawCommand || voiceInputText || speechTranscript).trim();
    if (!cmd) return;

    const lower = cmd.toLowerCase();
    setVoiceInputText("");
    setSpeechTranscript("");

    // Deduplication command
    if (lower.includes("desduplica") || lower.includes("duplica") || lower.includes("deja solo el") || lower.includes("dejá solo el") || lower.includes("mas nuevo") || lower.includes("más nuevo") || lower.includes("copias") || lower.includes("copia")) {
      setMartinVoiceFeedback("🤖 Martín: Procesando desduplicación inteligente... Manteniendo solo los inventarios más recientes.");
      await handleDeduplicateFiles();
      return;
    }

    // Purge test data command
    if (lower.includes("limpiar") || lower.includes("simulacro") || lower.includes("prueba") || lower.includes("datos reales") || lower.includes("purgar")) {
      setMartinVoiceFeedback("🤖 Martín: Abriendo ventana para limpiar datos de prueba y comenzar con tus datos reales...");
      setShowPurgeModal(true);
      speakFeedback("Abriendo ventana para limpiar datos de prueba.");
      return;
    }

    // Activate/Include all
    if (lower.includes("activar todo") || lower.includes("incluir todo") || lower.includes("tomar todo") || lower.includes("todos si")) {
      await handleBatchToggleInclude(true);
      const msg = "¡Listo Noemí! Todos los archivos fueron activados para mi análisis.";
      setMartinVoiceFeedback(`🤖 Martín: ${msg}`);
      speakFeedback(msg);
      return;
    }

    // Exclude/Ignore all
    if (lower.includes("desactivar todo") || lower.includes("ignorar todo") || lower.includes("no tomar nada") || lower.includes("todos no")) {
      await handleBatchToggleInclude(false);
      const msg = "¡Listo Noemí! Todos los archivos quedaron en pausa y no serán analizados.";
      setMartinVoiceFeedback(`🤖 Martín: ${msg}`);
      speakFeedback(msg);
      return;
    }

    // Delete matching file
    if (lower.includes("eliminar") || lower.includes("borrar")) {
      const matching = files.filter(f => lower.includes(f.name.toLowerCase().replace(".csv", "").replace(".txt", "")));
      if (matching.length > 0) {
        await handleBatchDelete(matching.map(m => m.id));
        const msg = `¡Listo Noemí! Eliminé ${matching.length} archivo(s) que me indicaste.`;
        setMartinVoiceFeedback(`🤖 Martín: ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // Forward to general Martín assistant
    const reply = `¡Entendido Noemí! Le transmití tu orden '${cmd}' a Martín.`;
    setMartinVoiceFeedback(`🤖 Martín: ${reply}`);
    speakFeedback(reply);
    window.dispatchEvent(
      new CustomEvent("ask-martin", {
        detail: {
          text: `Noemí (desde el gestor de archivos y Drive): "${cmd}"`
        }
      })
    );
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este archivo de la carpeta Martin Sistema?")) return;
    try {
      const headers: HeadersInit = {};
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch(`/api/drive/files/${id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (data.success) {
        setFiles(files.filter(f => f.id !== id));
        setSelectedFileIds(prev => prev.filter(x => x !== id));
        setUploadSuccess("Archivo eliminado correctamente.");
        handleSync();
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setUploadError("La imagen no debe superar los 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageBase64(reader.result as string);
        setNewFileName(file.name);
        setUploadError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!newFileName.trim()) {
      setUploadError("Por favor, ingresa el nombre del archivo.");
      return;
    }

    let finalContent = newFileContent;
    let mimeType = "text/plain";
    let isImage = false;

    if (newFileType === "csv") {
      mimeType = "text/csv";
      if (!newFileName.toLowerCase().endsWith(".csv")) {
        setNewFileName(prev => prev + ".csv");
      }
    } else if (newFileType === "image") {
      if (!selectedImageBase64) {
        setUploadError("Por favor, selecciona o arrastra una imagen primero.");
        return;
      }
      finalContent = selectedImageBase64;
      mimeType = selectedImageBase64.substring(5, selectedImageBase64.indexOf(";"));
      isImage = true;
    }

    setLoading(true);

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) {
        headers["Authorization"] = `Bearer ${googleToken}`;
      }
      const res = await fetch("/api/drive/upload", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newFileName.toLowerCase().endsWith(".csv") || newFileType !== "csv" ? newFileName : `${newFileName}.csv`,
          content: finalContent,
          mimeType,
          isImage
        })
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess("¡Archivo creado con éxito en Drive!");
        setNewFileName("");
        setNewFileContent("");
        setSelectedImageBase64("");
        fetchFiles();
        handleSync();
      } else {
        setUploadError(data.error || "Ocurrió un error al crear el archivo.");
      }
    } catch (err) {
      setUploadError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const formatARS = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compute overall KPI aggregates for the 10 stores
  const totals = localesInfo.reduce((acc, loc) => {
    const efTotal = loc.baseEf;
    const digTotal = loc.baseDig;
    return {
      totalRevenue: acc.totalRevenue + efTotal + digTotal,
      totalEfectivo: acc.totalEfectivo + efTotal,
      totalDigital: acc.totalDigital + digTotal,
    };
  }, { totalRevenue: 0, totalEfectivo: 0, totalDigital: 0 });

  const selectedLocal = localesInfo.find(l => l.id === selectedLocalId);
  const selectedLocalData = selectedLocal ? getLocalHourlyRows(selectedLocal.id, selectedLocal.baseEf, selectedLocal.baseDig) : null;

  return (
    <div id="drive-manager-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Lister, Tab selector, & interactive Dashboard */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col space-y-4 relative">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">
                Sistema de Datos & Locales
              </h2>
              <p className="text-xs text-slate-500">
                Gestión de archivos en Drive, sincronización de planilla DATA y auditoría de sucursales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="sync-btn"
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando..." : "Sincronizar todo"}
            </button>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab("inventario_maestro")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeSubTab === "inventario_maestro"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Base Maestra (STOCK_ACTUAL)
          </button>
          <button
            onClick={() => setActiveSubTab("make_config")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeSubTab === "make_config"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-purple-600 hover:bg-purple-50/50"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Make.com & Webhooks
          </button>
          <button
            onClick={() => setActiveSubTab("locales")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeSubTab === "locales"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            Auditoría de 10 Locales
          </button>
          <button
            onClick={() => setActiveSubTab("drive")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeSubTab === "drive"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
            Carpeta "Martin Sistema" (Drive)
          </button>
          <button
            onClick={() => setActiveSubTab("sheet")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeSubTab === "sheet"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            Planilla "DATA" (Sheets)
          </button>
          <button
            onClick={() => setActiveSubTab("whatsapp")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeSubTab === "whatsapp"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
            Importar WhatsApp
          </button>
          <button
            onClick={() => setActiveSubTab("sheets_reader")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeSubTab === "sheets_reader"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Lector de Google Sheets
          </button>
        </div>

        {activeSubTab === "locales" && (
          /* NEW DETAILED LOCALES DASHBOARD TAB */
          <div className="space-y-4 animate-fadeIn">
            {/* KPI Summary Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-500 uppercase font-mono font-bold">Total Facturado</span>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{formatARS(totals.totalRevenue)}</p>
                </div>
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-600 uppercase font-mono font-bold">Cobrado en Efectivo</span>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{formatARS(totals.totalEfectivo)}</p>
                  <span className="text-[9px] text-slate-400">({((totals.totalEfectivo / totals.totalRevenue) * 100).toFixed(1)}%)</span>
                </div>
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-600 uppercase font-mono font-bold">Cobrado en Digital</span>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{formatARS(totals.totalDigital)}</p>
                  <span className="text-[9px] text-slate-400">({((totals.totalDigital / totals.totalRevenue) * 100).toFixed(1)}%)</span>
                </div>
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Instruction Warning banner */}
            <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Auditoría de Cierre (12 Horas):</strong> Martín ya cuenta con estas planillas indexadas en su base de conocimiento en la carpeta virtual. Podés pedirle en el chat de la derecha: <em className="underline cursor-pointer font-semibold" onClick={() => {
                  const chatInput = document.getElementById("chat-input-area") as HTMLTextAreaElement;
                  if (chatInput) {
                    chatInput.value = "Hacé un informe general consolidando los 10 locales del sistema.";
                    chatInput.focus();
                  }
                }}>"Hacé un informe general consolidando los 10 locales del sistema"</em> para ver el análisis de Martín.
              </div>
            </div>

            {/* Grid of 10 Locales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
              {localesInfo.map((loc) => {
                const totalLoc = loc.baseEf + loc.baseDig;
                const efPercent = (loc.baseEf / totalLoc) * 100;
                return (
                  <div
                    key={loc.id}
                    className={`bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border-l-4 ${loc.color} flex flex-col justify-between space-y-2`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{loc.label}</h4>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{loc.address}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {formatARS(totalLoc)}
                      </span>
                    </div>

                    {/* Progress bars showing cash vs digital split */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Efectivo: {formatARS(loc.baseEf)}</span>
                        <span>Digital: {formatARS(loc.baseDig)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${efPercent}%` }} title="Efectivo" />
                        <div className="h-full bg-blue-500 flex-1" title="Digital" />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedLocalId(loc.id)}
                      className="w-full text-center py-1.5 bg-indigo-50 hover:bg-indigo-100/80 active:bg-indigo-100 text-[10px] font-bold text-indigo-700 rounded-lg border border-indigo-150 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Ver Registro Horario (12 hs)
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === "drive" && (
          /* DRIVE FILE LIST WITH ADVANCED MANAGEMENT & VOICE INTERACTION */
          <div className="space-y-4 animate-fadeIn">
            {/* VOICE / MICROPHONE CONTROL WITH MARTÍN */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-4 rounded-2xl border border-indigo-800 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600/40 text-indigo-200 rounded-xl border border-indigo-500/30">
                    <Bot className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      Control por Voz con Martín
                      {isSpeaking && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                          <Volume2 className="w-3 h-3" /> Hablando...
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-indigo-200">
                      Decile a Martín: <em>"Dejá solo el más nuevo"</em>, <em>"Borrá los duplicados"</em> o <em>"Purgar datos de prueba"</em>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={startVoiceRecognition}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isListening 
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-600/30" 
                      : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30"
                  }`}
                  title={isListening ? "Detener micrófono" : "Hablar con Martín"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Escuchando...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Hablar con Martín</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text input fallback for voice command */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={voiceInputText}
                    onChange={(e) => setVoiceInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleExecuteMartinCommand();
                    }}
                    placeholder="Escribí o hablá tu orden a Martín (ej: 'Dejá solo el inventario más nuevo')..."
                    className="w-full pl-3 pr-8 py-2 bg-slate-900/80 border border-indigo-700/50 rounded-xl text-xs text-indigo-100 placeholder-indigo-400/60 focus:outline-none focus:border-indigo-400"
                  />
                  {voiceInputText && (
                    <button 
                      onClick={() => setVoiceInputText("")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleExecuteMartinCommand()}
                  disabled={!voiceInputText.trim()}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>

              {martinVoiceFeedback && (
                <div className="bg-indigo-900/60 border border-indigo-700/60 p-2.5 rounded-xl text-xs text-indigo-100 flex items-start gap-2 animate-fadeIn">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{martinVoiceFeedback}</p>
                </div>
              )}
            </div>

            {/* FEEDBACK STATUS ALERTS */}
            {uploadSuccess && (
              <div className="bg-emerald-50 border border-emerald-200/60 text-emerald-800 p-3 rounded-xl text-xs flex items-start justify-between gap-2.5 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{uploadSuccess}</p>
                </div>
                <button onClick={() => setUploadSuccess("")} className="text-emerald-500 hover:text-emerald-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {uploadError && (
              <div className="bg-amber-50 border border-amber-200/60 text-amber-800 p-3 rounded-xl text-xs flex items-start justify-between gap-2.5 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{uploadError}</p>
                </div>
                <button onClick={() => setUploadError("")} className="text-amber-500 hover:text-amber-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* QUICK ACTIONS & SMART CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Deduplicate button */}
                <button
                  onClick={handleDeduplicateFiles}
                  disabled={isDeduplicating || files.length === 0}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title="Detecta duplicados del mismo inventario o planilla y conserva únicamente el más reciente."
                >
                  <Layers className={`w-3.5 h-3.5 ${isDeduplicating ? "animate-spin" : ""}`} />
                  <span>{isDeduplicating ? "Desduplicando..." : "Dejar Solo Más Nuevo (Desduplicar)"}</span>
                </button>

                {/* Purge / Start real data button */}
                <button
                  onClick={() => setShowPurgeModal(true)}
                  disabled={files.length === 0}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Elimina todos los datos de simulacro para comenzar a cargar inventarios e información real."
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpiar Datos de Prueba</span>
                </button>

                {/* Batch Delete */}
                {selectedFileIds.length > 0 && (
                  <button
                    onClick={() => handleBatchDelete()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-sm animate-fadeIn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar ({selectedFileIds.length})</span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar archivo..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Select All & Summary Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedFileIds.length === files.length) {
                      setSelectedFileIds([]);
                    } else {
                      setSelectedFileIds(files.map(f => f.id));
                    }
                  }}
                  className="flex items-center gap-1.5 font-medium hover:text-slate-800 cursor-pointer text-[11px]"
                >
                  {selectedFileIds.length === files.length && files.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Seleccionar todos</span>
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-mono">{files.filter(f => f.includedInMartin !== false).length} activos para Martín / {files.length} totales</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBatchToggleInclude(true)}
                  className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Activar todos
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => handleBatchToggleInclude(false)}
                  className="text-[10px] text-slate-500 hover:underline font-semibold cursor-pointer"
                >
                  Pausar todos
                </button>
              </div>
            </div>

            {/* DRIVE FILE LIST ITEMS */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {files.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No hay archivos en la carpeta de Drive.</p>
                  <p className="text-xs text-slate-400 mt-1">Podés subir inventarios reales usando el formulario de la derecha o importando desde WhatsApp.</p>
                </div>
              ) : (
                files
                  .filter(f => !searchTerm || f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((file) => {
                    const isIncluded = file.includedInMartin !== false;
                    const isSelected = selectedFileIds.includes(file.id);

                    return (
                      <div 
                        key={file.id} 
                        id={`drive-file-${file.id}`}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all duration-150 gap-3 ${
                          isSelected ? "bg-indigo-50/40 border-indigo-200 shadow-sm" : isIncluded ? "bg-white hover:bg-slate-50/80 border-slate-100" : "bg-slate-50/60 border-slate-200/60 opacity-75"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Selection Checkbox */}
                          <button
                            onClick={() => {
                              setSelectedFileIds(prev => 
                                isSelected ? prev.filter(x => x !== file.id) : [...prev, file.id]
                              );
                            }}
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                          </button>

                          <div className={`p-2.5 rounded-lg shrink-0 ${file.isImage ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}>
                            {file.isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-semibold text-slate-800 font-mono truncate max-w-xs">{file.name}</h4>
                              {isIncluded ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Martín lo analiza
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md">
                                  <ShieldAlert className="w-3 h-3 text-slate-400" /> Pausado / No se analiza
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-semibold text-slate-500 uppercase">{file.mimeType.split("/")[1]}</span>
                              <span>•</span>
                              <span>Tamaño: {file.size}</span>
                              <span>•</span>
                              <span>Sinc: {new Date(file.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {/* Toggle Include button */}
                          <button
                            onClick={() => handleToggleInclude(file.id, file.includedInMartin)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                              isIncluded
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                            }`}
                            title={isIncluded ? "Hacé clic para excluir este archivo del análisis de Martín" : "Hacé clic para que Martín incluya este archivo en sus respuestas"}
                          >
                            {isIncluded ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                            <span>{isIncluded ? "Este Sí" : "Este No"}</span>
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const resp = await fetch("/api/process-package-label", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    mode: "ocr",
                                    imageBase64: file.content.startsWith("data:") ? file.content : `data:${file.mimeType};base64,${file.content}`,
                                    mimeType: file.mimeType
                                  })
                                });
                                const data = await resp.json();
                                if (data.success && data.data) {
                                  alert(`✅ Paquete procesado exitosamente por OCR desde Drive:\n\n📍 Dirección: ${data.data.direccion || "Extraída"}\n👤 Destinatario: ${data.data.destinatario || "Cliente"}\n📦 Tracking: ${data.data.trackingCode || "PKG"}\n\n¡Se ha añadido a la Hoja de Ruta Logística!`);
                                } else {
                                  alert(`ℹ️ Archivo leído. Si contiene datos de paquete o guía de reparto, ingresá al módulo "Cámara OCR Logística" para ver la hoja de ruta.`);
                                }
                              } catch (e) {
                                alert(`⚠️ No se pudo procesar el archivo por OCR.`);
                              }
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Procesar con Inteligencia Artificial OCR para Hoja de Ruta"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>OCR</span>
                          </button>

                          <button
                            onClick={() => handleNormalizeExistingFile(file)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Normalizar y registrar en la Base Maestra de Stock"
                          >
                            <Boxes className="w-3 h-3 text-emerald-600" />
                            <span>Normalizar</span>
                          </button>

                          <button
                            onClick={() => {
                              alert(`Contenido de ${file.name}:\n\n${file.isImage ? "[Archivo de imagen base64]" : file.content.substring(0, 1000) + (file.content.length > 1000 ? "..." : "")}`);
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold cursor-pointer border border-slate-200"
                            title="Ver contenido del archivo"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer border border-transparent hover:border-rose-100 transition-colors"
                            title="Eliminar de Martin Sistema"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {activeSubTab === "sheet" && (
          /* GOOGLE SHEETS "DATA" */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-semibold">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Planilla Sincronizada</span>
              <span>{sheetRecords.length} Registros</span>
            </div>
            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-inner max-h-[350px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold sticky top-0">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Nombre del Archivo</th>
                    <th className="p-3">Tipo (MIME)</th>
                    <th className="p-3">Link de Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600 bg-white">
                  {sheetRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400 font-sans">
                        No hay registros consolidados en la pestaña DATA.<br/>
                        Hace click en <strong className="text-indigo-600">Sincronizar</strong> para correr la macro.
                      </td>
                    </tr>
                  ) : (
                    sheetRecords.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 whitespace-nowrap text-slate-400">{row.fecha}</td>
                        <td className="p-3 font-semibold text-slate-800">{row.nombre}</td>
                        <td className="p-3 text-slate-500">{row.tipo}</td>
                        <td className="p-3 text-blue-600 hover:underline flex items-center gap-1 cursor-pointer" onClick={() => {
                          if (row.link && row.link.startsWith("http")) {
                            window.open(row.link, "_blank");
                          } else {
                            alert(`Documento registrado en Drive:\n${row.nombre}\nUbicación: Carpeta "Martin Sistema"`);
                          }
                        }}>
                          <span>drive.google.com...</span>
                          <ExternalLink className="w-3 h-3" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Esta tabla representa exactamente la estructura que lee la función `obtenerDatosDePlanilla()` del Apps Script de Noemi.
            </p>
          </div>
        )}

        {activeSubTab === "whatsapp" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-2xl shrink-0">📱</span>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 flex-wrap">
                    Importador & Estructurador de WhatsApp (38 Locales TBest)
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold">
                      RELEVAMIENTOS & CONTROL
                    </span>
                  </h3>
                  <p className="text-[11px] text-rose-700 leading-normal max-w-2xl">
                    Noemí, Martín extrae automáticamente fechas, remitentes, productos, cantidades, enlaces, planillas Excel y cifras de relevamiento para los 38 locales de TBest, descartando la charla informal no operativa.
                  </p>
                </div>
              </div>

              {/* FILTER TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => {
                  const newFilter = !filterTBestOnly;
                  setFilterTBestOnly(newFilter);
                  if (whatsAppInput) {
                    parseWhatsAppChat(whatsAppInput, newFilter);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  filterTBestOnly
                    ? "bg-rose-600 text-white border border-rose-700 hover:bg-rose-700"
                    : "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{filterTBestOnly ? "Filtro 38 Locales TBest: ACTIVO" : "Filtro 38 Locales TBest: INACTIVO (Ver Todo)"}</span>
              </button>
            </div>

            {/* FEEDBACK STATUS ALERTS & GRACEFUL OAUTH/401 ADVICE */}
            {uploadSuccess && (
              <div className="bg-emerald-50 border border-emerald-200/60 text-emerald-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">¡Operación exitosa!</span>
                  <p className="text-[11px] leading-relaxed text-emerald-700">{uploadSuccess}</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="bg-amber-50 border border-amber-200/60 text-amber-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <span className="font-bold">Aviso de Conexión</span>
                  <p className="text-[11px] leading-relaxed text-amber-700">{uploadError}</p>
                  {uploadError.includes("OAuth") || uploadError.includes("Drive") || uploadError.includes("401") ? (
                    <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={loadWhatsAppDemo}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10.5px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>Cargar Demo de los 38 Locales</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* AUTOMATED GOOGLE DRIVE SCANNING WIDGET */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    ☁️ Escanear mi Google Drive
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal max-w-md">
                    Si exportás el chat de WhatsApp a Drive, Martín lo encuentra solo. No necesitás copiar y pegar texto de tu celular.
                  </p>
                </div>
                <button
                  onClick={scanDriveForWhatsApp}
                  disabled={scanningDrive}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  {scanningDrive ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Escanear Drive</span>
                </button>
              </div>

              {detectedDriveChats.length > 0 && (
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white animate-fadeIn max-h-[170px] overflow-y-auto shadow-sm">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Chats Exportados Detectados (.txt)</span>
                    <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[8px] font-bold">Nuevos</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {detectedDriveChats.map((file) => (
                      <div key={file.id} className="p-3 flex items-center justify-between gap-4 hover:bg-rose-50/10 transition-colors">
                        <div className="space-y-0.5 max-w-[70%]">
                          <span className="text-xs font-bold text-slate-700 block truncate" title={file.name}>
                            📱 {file.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            Tamaño: {file.size || "1 KB"} • Modificado: {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString() : "Recientemente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => importDriveWhatsAppFile(file.id, file.name)}
                            disabled={importingFileId !== null}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                          >
                            {importingFileId === file.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowDownToLine className="w-3 h-3" />
                            )}
                            <span>Martín Procesar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteWhatsAppFile(file.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer border border-transparent hover:border-rose-100 transition-colors"
                            title="Eliminar este archivo de WhatsApp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  O pegá el chat exportado manualmente:
                </label>
                <button
                  onClick={loadWhatsAppDemo}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700 text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cargar Chat de Prueba TBest (38 Locales)</span>
                </button>
              </div>
              <textarea
                value={whatsAppInput}
                onChange={(e) => {
                  setWhatsAppInput(e.target.value);
                  parseWhatsAppChat(e.target.value, filterTBestOnly);
                }}
                rows={4}
                placeholder="Pegá aquí fragmentos de tu chat de WhatsApp exportado...&#10;Ejemplo:&#10;12/07/2026, 08:35 - Carlos (Local 4 - Almagro): Relevamiento: Tenemos 45 Coca 1.5L y 18 Fernet Branca.&#10;12/07/2026, 08:45 - Mario (Local 1): https://docs.google.com/spreadsheets/d/1tbest_inventario.xlsx"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:border-rose-500 focus:outline-none transition-all resize-none"
              />
            </div>

            {parsedMessages.length > 0 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Micro KPIs & Filter Stat Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Mensajes Extraídos</span>
                    <span className="text-sm font-extrabold text-slate-800 font-mono">{parsedMessages.length}</span>
                  </div>
                  <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <span className="text-[9px] text-indigo-600 font-bold uppercase block">Locales TBest Detectados</span>
                    <span className="text-sm font-extrabold text-indigo-700 font-mono">
                      {new Set(parsedMessages.map(m => m.localDetected)).size}
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <span className="text-[9px] text-emerald-600 font-bold uppercase block">Relevamientos / Links</span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">
                      {parsedMessages.filter(m => m.isRelevamiento || m.hasLinkOrExcel).length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <span className="text-[9px] text-amber-600 font-bold uppercase block">Charla Informal Descartada</span>
                    <span className="text-sm font-extrabold text-amber-700 font-mono">
                      {discardedCount} líneas
                    </span>
                  </div>
                </div>

                {discardedCount > 0 && filterTBestOnly && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Martín filtró automáticamente <strong>{discardedCount} líneas de charla informal o irrelevante</strong> (ej: "copa de agua", "pizarrón", etc.) conservando únicamente datos de relevamiento de los 38 locales de TBest.
                    </span>
                  </div>
                )}

                {/* Table with Extracted Data */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[280px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                        <th className="p-2.5 text-[10px]">Fecha / Remitente</th>
                        <th className="p-2.5 text-[10px]">Local TBest</th>
                        <th className="p-2.5 text-[10px]">Mensaje Original</th>
                        <th className="p-2.5 text-[10px]">Registro Extraído</th>
                        <th className="p-2.5 text-[10px] text-right">Cantidad / Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600 bg-white font-sans">
                      {parsedMessages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono text-[10px] leading-tight shrink-0 whitespace-nowrap">
                            <span className="text-slate-400 block">{msg.date} {msg.time}</span>
                            <span className="font-bold text-slate-700">{msg.sender}</span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[10px] font-mono">
                              📍 {msg.localDetected || "TBest"}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 leading-relaxed italic text-[10px] max-w-[200px] truncate" title={msg.message}>
                            {msg.message}
                          </td>
                          <td className="p-2.5 leading-tight">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase font-mono ${
                                msg.hasLinkOrExcel
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : msg.type === "Gasto"
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : msg.type === "Cierre"
                                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                                  : msg.type === "Venta"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}>
                                {msg.hasLinkOrExcel ? "🔗 Excel / Link" : msg.type}
                              </span>
                              <span className="text-slate-400 text-[9px]">{msg.category}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 block mt-0.5">{msg.concept}</span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                            {msg.amount > 0 ? (
                              <span className="text-emerald-700">
                                {formatARS(msg.amount)} 
                              </span>
                            ) : null}
                            {msg.quantity > 0 && (
                              <span className="text-[10px] text-slate-600 block">
                                📦 <strong>{msg.quantity} un.</strong>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Save and Convert Actions */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Nombre de la planilla a guardar:
                      </label>
                      <input
                        type="text"
                        value={convertedFileName}
                        onChange={(e) => setConvertedFileName(e.target.value)}
                        placeholder="whatsapp_procesado.csv"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:border-rose-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={saveWhatsAppCSV}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>Guardar CSV y Sincronizar en Drive</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PURGE TEST DATA CONFIRMATION MODAL */}
        {showPurgeModal && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs rounded-2xl z-30 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-2xl w-full max-w-md flex flex-col space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Limpiar Sistema para Datos Reales
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Noemí, esta acción te permite comenzar desde cero con tus inventarios reales y descartar los archivos de prueba o simulacro creados anteriormente.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-[11px] text-amber-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Opciones de limpieza:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-amber-700">
                  <li><strong>Purgar datos de prueba:</strong> Elimina únicamente planillas de simulacro, demos y archivos temporales generados al inicio.</li>
                  <li><strong>Vaciar todo por completo:</strong> Borra todos los archivos cargados para un reinicio 100% limpio.</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handlePurgeTestData(false)}
                  disabled={isPurging}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPurging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                  <span>Purgar Solo Simulacro y Datos de Prueba (Recomendado)</span>
                </button>

                <button
                  onClick={() => handlePurgeTestData(true)}
                  disabled={isPurging}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Vaciar Todo por Completo</span>
                </button>

                <button
                  onClick={() => setShowPurgeModal(false)}
                  disabled={isPurging}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedLocalId !== null && selectedLocal && selectedLocalData && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xl w-full max-w-lg flex flex-col space-y-4 max-h-[90%] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">{selectedLocal.label}</h3>
                  <p className="text-[10px] text-slate-400">{selectedLocal.address} • Planilla de Arqueo Diario</p>
                </div>
                <button
                  onClick={() => setSelectedLocalId(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick totals */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono block">Recaudado</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{formatARS(selectedLocalData.grandTotal)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono block">Efectivo (Cash)</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{formatARS(selectedLocalData.totalEfectivo)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono block">Tarjeta / Transf</span>
                  <span className="text-xs font-bold text-blue-600 font-mono">{formatARS(selectedLocalData.totalDigital)}</span>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold sticky top-0">
                      <th className="p-2">Hora (Turno 12h)</th>
                      <th className="p-2 text-right">Efectivo</th>
                      <th className="p-2 text-right">Digital</th>
                      <th className="p-2 text-center">Op.</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px] text-slate-600 bg-white">
                    {selectedLocalData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 font-sans font-medium text-slate-700">{row.hour}</td>
                        <td className="p-2 text-right text-emerald-600">{formatARS(row.efectivo)}</td>
                        <td className="p-2 text-right text-blue-600">{formatARS(row.digital)}</td>
                        <td className="p-2 text-center text-slate-400">{row.transacciones}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{formatARS(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>* Datos simulados basados en promedios reales de sucursal.</span>
                <button
                  onClick={() => setSelectedLocalId(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/15 cursor-pointer transition-all duration-150"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "sheets_reader" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  Lector y Analizador Directo de Google Sheets
                </h3>
                <p className="text-[11px] text-emerald-800 leading-normal">
                  Seleccioná cualquier hoja de cálculo de tu Google Drive o pegá un enlace directo. La API de Google Sheets extraerá sus celdas para que Martín el Analista las analice al instante.
                </p>
              </div>
            </div>

            {/* ERROR & SUCCESS MESSAGES */}
            {sheetReaderError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{sheetReaderError}</span>
              </div>
            )}
            {sheetReaderSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{sheetReaderSuccess}</span>
              </div>
            )}

            {/* FILE SELECTOR FORM */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Dropdown list of detected sheets */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>1. Seleccionar Hoja de Cálculo en Drive</span>
                    <button
                      type="button"
                      onClick={fetchAvailableSheets}
                      disabled={loadingSheetsList}
                      className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingSheetsList ? "animate-spin" : ""}`} />
                      Refrescar
                    </button>
                  </label>
                  <select
                    value={selectedSheetId}
                    onChange={(e) => setSelectedSheetId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {availableSheets.length === 0 ? (
                      <option value="">No se encontraron planillas en Drive (Usar enlace URL de abajo)</option>
                    ) : (
                      availableSheets.map((s) => (
                        <option key={s.id} value={s.id}>
                          📊 {s.name} ({s.id.slice(0, 8)}...)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Direct Google Sheets URL input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    2. O Ingresar URL / Enlace de Google Sheets
                  </label>
                  <input
                    type="text"
                    value={customSheetUrl}
                    onChange={(e) => setCustomSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleReadSelectedSheet}
                  disabled={readingSheet}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FileSpreadsheet className={`w-4 h-4 ${readingSheet ? "animate-bounce" : ""}`} />
                  <span>{readingSheet ? "Extrayendo Datos con API de Google..." : "Leer y Extraer Datos de la Planilla"}</span>
                </button>
              </div>
            </div>

            {/* EXTRACTED PREVIEW & ACTION */}
            {extractedSheetData && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase tracking-wide">
                        API Google Sheets
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 font-mono">
                        {extractedSheetData.fileName}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {extractedSheetData.rowCount} filas leídas • {extractedSheetData.colCount} columnas detectadas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendSheetToMartin}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: "3s" }} />
                    <span>Analizar esta Hoja con Martín IA</span>
                  </button>
                </div>

                {/* PREVIEW TABLE */}
                <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[260px] overflow-auto bg-slate-50/50">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                        {extractedSheetData.rows[0]?.map((colName, cIdx) => (
                          <th key={cIdx} className="p-2.5 whitespace-nowrap bg-slate-100 border-r border-slate-200 font-mono text-[11px]">
                            {colName || `Col ${cIdx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px] text-slate-700">
                      {extractedSheetData.rows.slice(1, 15).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-slate-100 whitespace-nowrap max-w-[200px] truncate">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {extractedSheetData.rows.length > 15 && (
                  <p className="text-[10px] text-slate-400 text-center font-mono">
                    ... Mostrando primeras 15 filas de {extractedSheetData.rowCount} en vista previa ...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "inventario_maestro" && (
          /* BASE MAESTRA DE INVENTARIO: STOCK_ACTUAL & HISTORIAL */
          <div className="space-y-4 animate-fadeIn">
            {/* Header / Stats & Quick Sync Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/20 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      Base Maestra de Inventario
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                        STOCK_ACTUAL & HISTORIAL
                      </span>
                    </h3>
                    <p className="text-xs text-indigo-200/80">
                      Normalización estandarizada: Producto, Cantidad y Local sincronizados en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditStockModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Stock (+/-)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncMasterSheets}
                    disabled={masterLoading}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${masterLoading ? "animate-spin" : ""}`} />
                    <span>Sincronizar Sheets</span>
                  </button>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-indigo-500/20">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Productos Únicos</span>
                  <span className="text-lg font-extrabold text-white font-mono">{masterStock.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Unidades Totales</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">
                    {masterStock.reduce((acc, curr) => acc + (curr.cantidad || 0), 0)} u.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Locales Cubiertos</span>
                  <span className="text-lg font-extrabold text-indigo-300 font-mono">
                    {new Set(masterStock.map(s => s.local)).size}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Historial Movimientos</span>
                  <span className="text-lg font-extrabold text-purple-300 font-mono">{masterHistorial.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Normalizer Box */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Normalizador con Cerebro Contable (Pegar Texto o Planilla)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  Detecta columnas automáticamente: Producto, Cantidad y Local
                </span>
              </div>

              <textarea
                value={normalizationText}
                onChange={(e) => setNormalizationText(e.target.value)}
                placeholder="Pegá cualquier planilla cruda o texto, ej:&#10;Artículo,Stock,Sucursal&#10;Coca Cola 500ml,25,Local 1&#10;Alfajor Havanna,40,Local 2"
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all resize-none"
              />

              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={normalizationFileName}
                  onChange={(e) => setNormalizationFileName(e.target.value)}
                  placeholder="Nombre de archivo (ej: inventario_tarde.csv)"
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleNormalizeInput()}
                  disabled={normalizing || !normalizationText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${normalizing ? "animate-spin" : ""}`} />
                  <span>{normalizing ? "Normalizando..." : "Normalizar y Guardar en STOCK_ACTUAL"}</span>
                </button>
              </div>

              {normalizationResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      <strong>Estado: {normalizationResult.estado}</strong> • {normalizationResult.summary?.productosDetectados || 0} productos normalizados ({normalizationResult.summary?.totalUnidades || 0} unidades).
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* STOCK_ACTUAL Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Hoja STOCK_ACTUAL ({masterStock.length} productos)
                  </h4>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={masterSearchTerm}
                    onChange={(e) => setMasterSearchTerm(e.target.value)}
                    placeholder="Buscar producto o local..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-56 font-mono"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 whitespace-nowrap">Producto</th>
                      <th className="p-2.5 whitespace-nowrap">Local</th>
                      <th className="p-2.5 whitespace-nowrap text-right">Cantidad</th>
                      <th className="p-2.5 whitespace-nowrap text-center">Estado</th>
                      <th className="p-2.5 whitespace-nowrap">Última Actualización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-[11.5px]">
                    {masterStock
                      .filter(item => 
                        !masterSearchTerm ||
                        item.producto.toLowerCase().includes(masterSearchTerm.toLowerCase()) ||
                        item.local.toLowerCase().includes(masterSearchTerm.toLowerCase())
                      )
                      .map((item, idx) => {
                        const isSinStock = item.cantidad === 0;
                        const isCritico = item.cantidad > 0 && item.cantidad <= 5;
                        const isExceso = item.cantidad >= 50;

                        return (
                          <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                            <td className="p-2.5 font-bold text-slate-900 max-w-[220px] truncate">
                              {item.producto}
                            </td>
                            <td className="p-2.5 text-slate-600">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10.5px]">
                                {item.local}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-extrabold text-slate-900">
                              {item.cantidad} u.
                            </td>
                            <td className="p-2.5 text-center">
                              {isSinStock ? (
                                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                                  SIN STOCK
                                </span>
                              ) : isCritico ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  CRÍTICO
                                </span>
                              ) : isExceso ? (
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
                                  EXCESO
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  NORMAL
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-400 text-[10px]">
                              {item.ultimaActualizacion || "-"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* HISTORIAL Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Hoja HISTORIAL (Auditoría de Movimientos)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {masterHistorial.length} registros
                </span>
              </div>

              <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 whitespace-nowrap">Fecha/Hora</th>
                      <th className="p-2 whitespace-nowrap">Producto</th>
                      <th className="p-2 whitespace-nowrap">Local</th>
                      <th className="p-2 whitespace-nowrap">Tipo</th>
                      <th className="p-2 whitespace-nowrap text-right">Variación</th>
                      <th className="p-2 whitespace-nowrap text-right">Stock Resultante</th>
                      <th className="p-2 whitespace-nowrap">Usuario / Obs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-[11px]">
                    {masterHistorial.slice(0, 30).map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400 text-[10px] whitespace-nowrap">{h.fechaHora}</td>
                        <td className="p-2 font-bold text-slate-800">{h.producto}</td>
                        <td className="p-2">{h.local}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9.5px] font-bold">
                            {h.tipoMovimiento}
                          </span>
                        </td>
                        <td className={`p-2 text-right font-bold ${h.cantidadVariacion >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {h.cantidadVariacion >= 0 ? `+${h.cantidadVariacion}` : h.cantidadVariacion}
                        </td>
                        <td className="p-2 text-right font-extrabold text-slate-800">
                          {h.stockResultante} u.
                        </td>
                        <td className="p-2 text-slate-500 text-[10px] max-w-[200px] truncate">
                          {h.usuarioOrigen} • {h.observacion || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "make_config" && (
          /* MAKE.COM & WEBHOOKS CONFIGURATION VIEW */
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-purple-500/20 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Configuración para Make.com
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                      CEREBRO CONTABLE
                    </span>
                  </h3>
                  <p className="text-xs text-purple-200/80">
                    Copiá el Prompt de Sistema y los datos JSON para tu escenario de Make.com conectado a WhatsApp y Sheets.
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt de Normalización */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Prompt de Normalización (Cerebro Contable)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `"Sos el Administrador Logístico de Tbest. Tu misión es estandarizar datos. Cada vez que recibas una planilla:\nDetectá las columnas de: 'Producto', 'Cantidad' y 'Local'. No importa cómo se llamen los encabezados, vos los normalizás internamente como Producto, Cantidad y Local.\nSi el archivo no tiene formato legible, avisame: 'El archivo está corrupto'.\nAl procesar, guardá el resultado en la hoja 'STOCK_ACTUAL' de la base de datos maestra.\nSi te pido editar algo, buscá el producto por nombre, localizá la celda de cantidad, y actualizala sumando o restando según mi pedido."`;
                    navigator.clipboard.writeText(prompt);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? "¡Copiado!" : "Copiar Prompt"}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-900 text-purple-200 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
                <p className="text-white font-bold mb-1">// Pegar este System Prompt en el módulo de OpenAI / Gemini en Make.com:</p>
                <p className="text-slate-300">
                  "Sos el Administrador Logístico de Tbest. Tu misión es estandarizar datos. Cada vez que recibas una planilla:<br/>
                  Detectá las columnas de: 'Producto', 'Cantidad' y 'Local'. No importa cómo se llamen los encabezados, vos los normalizás internamente como Producto, Cantidad y Local.<br/>
                  Si el archivo no tiene formato legible, avisame: 'El archivo está corrupto'.<br/>
                  Al procesar, guardá el resultado en la hoja 'STOCK_ACTUAL' de la base de datos maestra.<br/>
                  Si te pido editar algo, buscá el producto por nombre, localizá la celda de cantidad, y actualizala sumando o restando según mi pedido."
                </p>
              </div>
            </div>

            {/* Endpoints Webhooks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Endpoints del Servidor Tbest para Webhooks
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (makeConfigData) {
                      navigator.clipboard.writeText(JSON.stringify(makeConfigData, null, 2));
                      setCopiedJson(true);
                      setTimeout(() => setCopiedJson(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? "¡JSON Copiado!" : "Copiar Config JSON"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Normalización de Archivo</span>
                  <p className="text-slate-800 font-bold">POST /api/inventario/normalizar</p>
                  <p className="text-slate-500 text-[10.5px]">Recibe {`{ rawData, fileName, usuario }`}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Ajuste Directo de Stock</span>
                  <p className="text-slate-800 font-bold">POST /api/inventario/editar</p>
                  <p className="text-slate-500 text-[10.5px]">Recibe {`{ producto, local, cantidad, modo }`}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Mensajes Entrantes de WhatsApp</span>
                  <p className="text-slate-800 font-bold">POST /api/make/whatsapp-incoming</p>
                  <p className="text-slate-500 text-[10.5px]">Recibe {`{ from, senderName, text, fileData }`}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Generación de Remitos Oficiales</span>
                  <p className="text-slate-800 font-bold">POST /api/logistica/generar-remitos</p>
                  <p className="text-slate-500 text-[10.5px]">Genera links descargables Excel y PDF</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Edit Stock Modal */}
        {showEditStockModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 w-full max-w-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Ajustar Stock Manualmente
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditStockModal(false)}
                  className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleExecuteEditStock} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Producto</label>
                  <input
                    type="text"
                    value={editProductQuery}
                    onChange={(e) => setEditProductQuery(e.target.value)}
                    placeholder="Ej: Coca Cola 500ml"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Local</label>
                  <input
                    type="text"
                    value={editLocalQuery}
                    onChange={(e) => setEditLocalQuery(e.target.value)}
                    placeholder="Ej: Local 1 - Centro o General"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Modo</label>
                    <select
                      value={editMode}
                      onChange={(e: any) => setEditMode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
                    >
                      <option value="add">Sumar (+)</option>
                      <option value="subtract">Restar (-)</option>
                      <option value="set">Fijar Valor (=)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Cantidad</label>
                    <input
                      type="number"
                      value={editQtyValue}
                      onChange={(e) => setEditQtyValue(parseInt(e.target.value) || 0)}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditStockModal(false)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editingStock}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                  >
                    {editingStock ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Guardar y Registrar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Upload/Create New File Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
        <form onSubmit={handleCreateFile} className="space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              Subir a "Martin Sistema"
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Agrega reportes, inventarios, facturas o imágenes para alimentar el análisis de Martín.
            </p>
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => { setNewFileType("csv"); setSelectedImageBase64(""); }}
              className={`py-1.5 text-center text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                newFileType === "csv" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              CSV (Tabla)
            </button>
            <button
              type="button"
              onClick={() => { setNewFileType("txt"); setSelectedImageBase64(""); }}
              className={`py-1.5 text-center text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                newFileType === "txt" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              TXT (Informe)
            </button>
            <button
              type="button"
              onClick={() => setNewFileType("image")}
              className={`py-1.5 text-center text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                newFileType === "image" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              Imagen (Factura)
            </button>
          </div>

          {/* Input file name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Nombre del Archivo
            </label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder={newFileType === "csv" ? "ventas_del_mes" : newFileType === "txt" ? "notas_financieras" : "factura_proveedor.png"}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Input Content Area or Image Upload Box */}
          {newFileType !== "image" ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Contenido del Archivo ({newFileType.toUpperCase()})
              </label>
              <textarea
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                rows={4}
                placeholder={
                  newFileType === "csv"
                    ? "Producto,Cantidad,Monto\nCoca Cola 1.5L,10,12500\nChocolate,5,4500"
                    : "Escribe aquí las observaciones o datos financieros..."
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all resize-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Seleccionar Imagen
              </label>
              {selectedImageBase64 ? (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2 text-center">
                  <img 
                    src={selectedImageBase64} 
                    alt="Preview" 
                    className="max-h-[120px] mx-auto rounded-lg object-contain shadow-sm border border-slate-100" 
                  />
                  <button
                    type="button"
                    onClick={() => { setSelectedImageBase64(""); setNewFileName(""); }}
                    className="absolute top-2 right-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-[10px] font-bold shadow-md cursor-pointer"
                  >
                    Eliminar
                  </button>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{newFileName}</p>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition-all">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-600 font-medium">Subir Imagen / Factura</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG de hasta 4MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Feedback labels */}
          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {loading ? "Subiendo..." : "Agregar Archivo"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 leading-normal">
            <strong>Cómo funciona:</strong> Al subir un archivo, este se almacena en el Drive virtual. La macro sincroniza automáticamente el archivo en la planilla, permitiendo que Martín analice su información estructurada.
          </p>
        </div>
      </div>
    </div>
  );
}
