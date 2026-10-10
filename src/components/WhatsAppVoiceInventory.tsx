import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Mic, 
  MicOff, 
  FileSpreadsheet, 
  Share2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Upload, 
  RefreshCw, 
  MessageSquare, 
  Smartphone, 
  Layers,
  Edit2,
  Save,
  Check,
  ShieldCheck,
  Send,
  Phone,
  Trash2,
  Plus,
  Copy,
  Volume2,
  CornerDownLeft,
  X
} from "lucide-react";
import { saveToLocalMemory, loadFromLocalMemory, STORAGE_KEYS } from "../lib/localMemory";
import { parseExcelFile, exportToExcel } from "../lib/excelProcessor";
import { sendWhatsAppMessage } from "../lib/whatsappSender";
import { WhatsAppModeSelector } from "./WhatsAppModeSelector";

interface ExcelRowItem {
  id: number;
  codigo: string;
  producto: string;
  unidad: string;
  cantidadEsperada?: number;
  cantidadContada: number | null;
  estado: "pendiente" | "completado" | "desviado";
  notas?: string;
  // Tracking original cell position if loaded from user Excel
  excelRowIndex?: number;
  excelQtyColIndex?: number;
}

// Sample templates sent via WhatsApp
const SAMPLE_WHATSAPP_TEMPLATES = [
  {
    nombre: "🍹 Heladera & Góndola Variedades (Jugos Cepita, Aguas y Gaseosas)",
    items: [
      { id: 1, codigo: "JUGO-01", producto: "Cepita Naranja 200ml", unidad: "unidades", cantidadEsperada: 20, cantidadContada: null, estado: "pendiente" as const },
      { id: 2, codigo: "JUGO-02", producto: "Cepita Multifruta 200ml", unidad: "unidades", cantidadEsperada: 10, cantidadContada: null, estado: "pendiente" as const },
      { id: 3, codigo: "JUGO-03", producto: "Cepita Manzana 200ml", unidad: "unidades", cantidadEsperada: 5, cantidadContada: null, estado: "pendiente" as const },
      { id: 4, codigo: "AGUA-01", producto: "Agua Mineral Benedictino 500ml", unidad: "unidades", cantidadEsperada: 30, cantidadContada: null, estado: "pendiente" as const },
      { id: 5, codigo: "BEB-01", producto: "Coca Cola Original 1.5L", unidad: "unidades", cantidadEsperada: 15, cantidadContada: null, estado: "pendiente" as const },
      { id: 6, codigo: "BEB-02", producto: "Coca Cola Zero 1.5L", unidad: "unidades", cantidadEsperada: 12, cantidadContada: null, estado: "pendiente" as const }
    ]
  },
  {
    nombre: "📋 Pedido Depósito Central (Bebidas y Artículos)",
    items: [
      { id: 1, codigo: "DEP-01", producto: "Agua Mineral 500ml", unidad: "unidades", cantidadEsperada: 500, cantidadContada: null, estado: "pendiente" as const },
      { id: 2, codigo: "DEP-02", producto: "Coca Cola 1.5L", unidad: "unidades", cantidadEsperada: 25, cantidadContada: null, estado: "pendiente" as const },
      { id: 3, codigo: "DEP-03", producto: "Levite Manzana 1.5L", unidad: "unidades", cantidadEsperada: 3, cantidadContada: null, estado: "pendiente" as const },
      { id: 4, codigo: "DEP-04", producto: "Cepillos de Dientes", unidad: "unidades", cantidadEsperada: 8, cantidadContada: null, estado: "pendiente" as const }
    ]
  },
  {
    nombre: "📦 Control de Rotación Nocturna (Góndola 1)",
    items: [
      { id: 1, codigo: "GON-01", producto: "Galletitas Oreo 118g", unidad: "paquetes", cantidadEsperada: 50, cantidadContada: null, estado: "pendiente" as const },
      { id: 2, codigo: "GON-02", producto: "Chocolate Milka 100g", unidad: "unidades", cantidadEsperada: 30, cantidadContada: null, estado: "pendiente" as const },
      { id: 3, codigo: "GON-03", producto: "Cerveza Quilmes 1L", unidad: "botellas", cantidadEsperada: 40, cantidadContada: null, estado: "pendiente" as const },
      { id: 4, codigo: "GON-04", producto: "Yerba Playadito 1kg", unidad: "paquetes", cantidadEsperada: 15, cantidadContada: null, estado: "pendiente" as const },
      { id: 5, codigo: "GON-05", producto: "Aceite Cocinero 900ml", unidad: "botellas", cantidadEsperada: 20, cantidadContada: null, estado: "pendiente" as const }
    ]
  }
];

export const WhatsAppVoiceInventory: React.FC<{
  userDisplayName?: string;
  onSyncToStoreData?: (items: ExcelRowItem[]) => void;
}> = ({ userDisplayName = "Empleado", onSyncToStoreData }) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [items, setItems] = useState<ExcelRowItem[]>(SAMPLE_WHATSAPP_TEMPLATES[0].items);
  const [pastedWhatsAppText, setPastedWhatsAppText] = useState("");
  const [isPastingMode, setIsPastingMode] = useState(false);

  // Module Tab (Inventory Planillas vs Custom WhatsApp Messages)
  const [moduleTab, setModuleTab] = useState<"messages" | "inventory">("messages");
  const [freeMessageText, setFreeMessageText] = useState("");
  const [freeMessageTitle, setFreeMessageTitle] = useState("Aviso de Turno / Conteo");
  const [freeMessageType, setFreeMessageType] = useState<"general" | "pedido" | "alerta" | "dictado">("general");
  const [freePhoneNumber, setFreePhoneNumber] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Web Speech API states
  const [isWebSpeechListening, setIsWebSpeechListening] = useState(false);
  const [speechInterimText, setSpeechInterimText] = useState("");
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState(true);
  const speechRecognitionRef = useRef<any>(null);

  // Original Uploaded Excel File Preservation
  const [uploadedWorkbook, setUploadedWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedSheetName, setUploadedSheetName] = useState<string | null>(null);

  // Voice recording states for backend audio parsing
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [omittedItems, setOmittedItems] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      setIsWebSpeechSupported(Boolean(hasSpeech));
    }
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Calculate completion
  const totalItemsCount = items.length;
  const completedItemsCount = items.filter(i => i.cantidadContada !== null && i.cantidadContada !== undefined && !isNaN(Number(i.cantidadContada))).length;
  const progressPercent = totalItemsCount > 0 ? Math.min(100, Math.max(0, Math.round((completedItemsCount / totalItemsCount) * 100))) : 0;

  // Restore local memory saved inventory on mount
  useEffect(() => {
    const savedData = loadFromLocalMemory<{
      items: ExcelRowItem[];
      selectedTemplateIndex?: number;
      uploadedFileName?: string;
    } | null>(STORAGE_KEYS.INVENTORY_LOCAL, null);

    if (savedData && savedData.items && Array.isArray(savedData.items) && savedData.items.length > 0) {
      setItems(savedData.items);
      if (typeof savedData.selectedTemplateIndex === "number") {
        setSelectedTemplateIndex(savedData.selectedTemplateIndex);
      }
      if (savedData.uploadedFileName) {
        setUploadedFileName(savedData.uploadedFileName);
      }
    }
  }, []);

  // Auto-save inventory on any change
  useEffect(() => {
    if (items && items.length > 0) {
      saveToLocalMemory(STORAGE_KEYS.INVENTORY_LOCAL, {
        items,
        selectedTemplateIndex,
        uploadedFileName,
        uploadedSheetName,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [items, selectedTemplateIndex, uploadedFileName, uploadedSheetName]);

  // Handle template switch
  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplateIndex(idx);
    const newItems = SAMPLE_WHATSAPP_TEMPLATES[idx].items.map(i => ({ ...i }));
    setItems(newItems);
    setUploadedWorkbook(null);
    setUploadedFileName(null);
    setUploadedSheetName(null);
    setLastFeedback(null);
    setOmittedItems([]);
    setTranscript("");
  };

  // Parse custom text pasted from WhatsApp
  const handleParsePastedText = () => {
    if (!pastedWhatsAppText.trim()) return;
    const lines = pastedWhatsAppText.split("\n").filter(l => l.trim().length > 0);
    const parsed: ExcelRowItem[] = [];

    lines.forEach((line, index) => {
      const cleanLine = line.replace(/^[0-9]+[\.\-\)\s]+/, "").trim();
      if (cleanLine) {
        parsed.push({
          id: index + 1,
          codigo: `WA-${100 + index}`,
          producto: cleanLine,
          unidad: "unidades",
          cantidadEsperada: undefined,
          cantidadContada: null,
          estado: "pendiente"
        });
      }
    });

    if (parsed.length > 0) {
      setItems(parsed);
      setUploadedWorkbook(null);
      setUploadedFileName(null);
      setUploadedSheetName(null);
      setIsPastingMode(false);
      setPastedWhatsAppText("");
      setLastFeedback(`✅ Se cargaron ${parsed.length} ítems desde el texto de WhatsApp y se resguardaron en memoria local.`);
    }
  };

  // Handle Excel file upload (.xlsx / .csv) using resilient excelProcessor
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        if (!bstr) return;

        const result = parseExcelFile(bstr, file.name);
        if (result.success && result.items.length > 0) {
          setItems(result.items);
          setUploadedWorkbook(result.workbook);
          setUploadedFileName(result.fileName);
          setUploadedSheetName(result.sheetName);
          setLastFeedback(`📊 Planilla '${file.name}' importada (${result.items.length} ítems) y resguardada en memoria local.`);
        } else {
          setLastFeedback(`⚠️ ${result.error || "No se pudieron leer filas válidas del archivo Excel."}`);
        }
      } catch (err: any) {
        console.error("Error reading excel:", err);
        setLastFeedback("❌ Error al procesar el archivo Excel. Asegurate de subir un formato .xlsx o .csv válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Web Speech API Voice Dictation Handler for WhatsApp Message
  const toggleWebSpeechDictation = () => {
    if (isWebSpeechListening) {
      stopWebSpeechDictation();
    } else {
      startWebSpeechDictation();
    }
  };

  const startWebSpeechDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsWebSpeechSupported(false);
      setLastFeedback("🎙️ Tu navegador no soporta Web Speech API de forma nativa. Podés usar el micrófono estándar o escribir.");
      startRecording();
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-AR"; // Argentine Spanish

      recognition.onstart = () => {
        setIsWebSpeechListening(true);
        setSpeechInterimText("");
        setLastFeedback("🎙️ Micrófono activado: Dictá tu mensaje para WhatsApp...");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let finalTranscripts = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const part = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscripts += part;
          } else {
            interim += part;
          }
        }

        if (finalTranscripts.trim()) {
          setFreeMessageText((prev) => {
            const cleanFinal = finalTranscripts.trim();
            if (!prev.trim()) return cleanFinal;
            return `${prev.trim()} ${cleanFinal}`;
          });
        }

        setSpeechInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn("Web Speech error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setLastFeedback("🔒 Permiso de micrófono no concedido. Habilitalo en el navegador.");
          setIsWebSpeechListening(false);
        } else if (event.error === "no-speech") {
          // Normal timeout if user was quiet
        } else {
          setLastFeedback(`⚠️ Nota de voz: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsWebSpeechListening(false);
        setSpeechInterimText("");
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.error("Error starting Web Speech Recognition:", err);
      setIsWebSpeechListening(false);
      setLastFeedback("❌ No se pudo iniciar el dictado por voz.");
    }
  };

  const stopWebSpeechDictation = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    setIsWebSpeechListening(false);
    setSpeechInterimText("");
    setLastFeedback("✅ Dictado finalizado. Ya podés revisar y editar tu mensaje antes de enviarlo.");
  };

  // Start voice dictation for AI inventory sum
  const startRecording = async () => {
    try {
      setLastFeedback(null);
      setTranscript("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
        else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        setIsListening(false);
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size < 300) {
          setIsTranscribing(false);
          setLastFeedback("🎙️ La grabación fue muy corta. Por favor hablá con claridad al presionar el botón.");
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;

          const abortCtrl = new AbortController();
          const timeoutId = setTimeout(() => abortCtrl.abort(), 12000);

          try {
            const currentOfficialList = items.map(i => ({
              id: i.id,
              producto: i.producto,
              cantidadEsperada: i.cantidadEsperada
            }));

            const resp = await fetch("/api/parse-voice-inventory", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: abortCtrl.signal,
              body: JSON.stringify({
                audioData: base64Audio,
                mimeType,
                officialList: currentOfficialList
              })
            });
            clearTimeout(timeoutId);

            const data = await resp.json();
            if (data.success && data.data) {
              const resData = data.data;
              setTranscript(resData.transcription || "");
              
              if (resData.matchedItems && resData.matchedItems.length > 0) {
                applyGeminiMatchedCounts(resData.matchedItems);
              } else {
                setLastFeedback("💡 Martín escuchó el audio, pero no detectó coincidencias directas con la planilla oficial.");
              }

              if (resData.omittedItems && resData.omittedItems.length > 0) {
                setOmittedItems(resData.omittedItems);
              }
            } else {
              setLastFeedback("🎙️ No logramos interpretar el dictado de voz claramente.");
            }
          } catch (err: any) {
            clearTimeout(timeoutId);
            console.error("Error transcribing audio:", err);
            if (err.name === "AbortError") {
              setLastFeedback("⏱️ El análisis tardó más de lo previsto. Podés reintentar o cargar las cantidades con los botones rápidos.");
            } else {
              setLastFeedback("❌ Hubo un inconveniente al procesar el audio de voz. Podés reintentar o usar los botones.");
            }
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      recorder.start(250);
      setIsListening(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setLastFeedback("🔒 Acceso de micrófono denegado. Asegurate de dar permisos de micrófono en el navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // Apply Gemini precise multi-location sum results
  const applyGeminiMatchedCounts = (matchedList: Array<{ producto: string; cantidadTotal: number; desglose?: string }>) => {
    const updatedItems = [...items];
    let updatedCount = 0;
    const feedbackDetails: string[] = [];

    matchedList.forEach(m => {
      const matchIdx = updatedItems.findIndex(it => 
        it.producto.toLowerCase().trim() === m.producto.toLowerCase().trim() ||
        it.producto.toLowerCase().includes(m.producto.toLowerCase()) ||
        m.producto.toLowerCase().includes(it.producto.toLowerCase())
      );

      const val = Number(m.cantidadTotal);
      if (matchIdx !== -1) {
        const item = updatedItems[matchIdx];
        updatedItems[matchIdx] = {
          ...item,
          cantidadContada: val,
          estado: item.cantidadEsperada && val !== item.cantidadEsperada ? "desviado" : "completado"
        };
        updatedCount++;
        if (m.desglose) {
          feedbackDetails.push(`${item.producto}: ${val} u. (${m.desglose})`);
        } else {
          feedbackDetails.push(`${item.producto}: ${val} u.`);
        }
      } else {
        // Dynamically append new item in real time
        const formattedProdName = m.producto.charAt(0).toUpperCase() + m.producto.slice(1);
        const newId = updatedItems.length > 0 ? Math.max(...updatedItems.map(i => i.id)) + 1 : 1;
        updatedItems.push({
          id: newId,
          codigo: `VOZ-${100 + updatedItems.length}`,
          producto: formattedProdName,
          unidad: "unidades",
          cantidadEsperada: undefined,
          cantidadContada: val,
          estado: "completado",
          notas: m.desglose ? `Suma de voz: ${m.desglose}` : undefined
        });
        updatedCount++;
        feedbackDetails.push(`${formattedProdName}: ${val} u. (Nuevo)`);
      }
    });

    setItems(updatedItems);
    if (onSyncToStoreData) onSyncToStoreData(updatedItems);
    setLastFeedback(`✨ ${updatedCount} ítems actualizados: ${feedbackDetails.slice(0, 3).join(", ")}${feedbackDetails.length > 3 ? "..." : ""}`);
  };

  // Export modified Excel
  const handleExportExcel = () => {
    if (uploadedWorkbook && uploadedFileName && uploadedSheetName) {
      const wb = XLSX.utils.book_new();
      uploadedWorkbook.SheetNames.forEach(sheetName => {
        const originalSheet = uploadedWorkbook.Sheets[sheetName];
        wb.Sheets[sheetName] = originalSheet;
      });
      wb.SheetNames = [...uploadedWorkbook.SheetNames];

      const ws = wb.Sheets[uploadedSheetName];
      items.forEach((item) => {
        if (item.excelRowIndex !== undefined && item.excelQtyColIndex !== undefined && item.cantidadContada !== null) {
          const cellRef = XLSX.utils.encode_cell({ r: item.excelRowIndex, c: item.excelQtyColIndex });

          if (!ws[cellRef]) {
            ws[cellRef] = { t: "n", v: item.cantidadContada };
          } else {
            ws[cellRef].v = item.cantidadContada;
            ws[cellRef].t = "n";
          }
        }
      });

      const exportName = uploadedFileName ? uploadedFileName.replace(/\.xlsx$/i, "_Completado.xlsx") : "Planilla_WhatsApp_Completada.xlsx";
      XLSX.writeFile(wb, exportName, { cellStyles: true });
      setLastFeedback(`📥 Archivo Excel original '${exportName}' conservando 100% de formatos y colores exportado exitosamente.`);
    } else {
      const excelData = items.map(item => ({
        "Ítem": item.id,
        "Código": item.codigo,
        "Producto Requerido (WhatsApp)": item.producto,
        "Cantidad Esperada": item.cantidadEsperada !== undefined ? item.cantidadEsperada : "N/A",
        "Cantidad Contada (Voz)": item.cantidadContada !== null ? item.cantidadContada : "Pendiente",
        "Estado Auditoría": item.cantidadContada === null ? "PENDIENTE" : item.estado === "desviado" ? "DIFERENCIA DETECTADA" : "CORRECTO",
        "Responsable": userDisplayName,
        "Fecha Carga": new Date().toLocaleString("es-AR")
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario_WhatsApp");

      const exportName = `Inventario_Completado_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, exportName);
      setLastFeedback(`📥 Archivo Excel '${exportName}' listo para enviar a WhatsApp.`);
    }
  };

  // Share Excel / Summary back to WhatsApp
  const getWhatsAppShareUrl = () => {
    let msg = `*📋 RESUMEN DE INVENTARIO COMPLETADO (VOZ Y EXCEL)*\n`;
    msg += `*Responsable:* ${userDisplayName}\n`;
    msg += `*Fecha:* ${new Date().toLocaleDateString("es-AR")}\n`;
    msg += `-----------------------------------\n`;

    items.forEach(i => {
      const cnt = i.cantidadContada !== null ? `${i.cantidadContada} u.` : `❌ PENDIENTE`;
      msg += `• *${i.producto}:* ${cnt}\n`;
    });

    if (omittedItems.length > 0) {
      msg += `\n⚠️ *Aviso de Martín:* Se descartaron ítems fuera de la planilla: ${omittedItems.join(", ")}\n`;
    }

    msg += `\n_Procesado y verificado con Smart Commerce_`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Build the complete WhatsApp message text
  const buildFullWhatsAppMessage = () => {
    const typeIcons: Record<string, string> = {
      general: "📢",
      pedido: "📦",
      alerta: "🚨",
      dictado: "📝"
    };

    const icon = typeIcons[freeMessageType] || "💬";
    let formattedMsg = `${icon} *${(freeMessageTitle || "MENSAJE").toUpperCase()}*\n`;
    formattedMsg += `👤 *Emisor:* ${userDisplayName}\n`;
    formattedMsg += `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')} - ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}\n`;
    formattedMsg += `----------------------------------\n\n`;
    formattedMsg += `${freeMessageText.trim()}\n\n`;
    formattedMsg += `_Enviado desde Smart Commerce_`;
    return formattedMsg;
  };

  // Handler to send custom text/dictated messages to WhatsApp
  const handleSendCustomMessageToWhatsApp = () => {
    if (!freeMessageText.trim()) {
      setLastFeedback("⚠️ Escribí o dictá un mensaje antes de enviar a WhatsApp.");
      return;
    }

    const formattedMsg = buildFullWhatsAppMessage();
    sendWhatsAppMessage({
      phone: freePhoneNumber,
      message: formattedMsg
    });
    setLastFeedback("✅ Mensaje enviado a WhatsApp sin generar pestañas innecesarias.");
  };

  // Copy message to clipboard
  const handleCopyMessage = () => {
    const formattedMsg = buildFullWhatsAppMessage();
    navigator.clipboard.writeText(formattedMsg);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
    setLastFeedback("📋 Mensaje copiado al portapapeles con formato de WhatsApp.");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Integración WhatsApp & Web Speech
                </span>
                <span className="text-[11px] font-mono text-emerald-200">
                  {userDisplayName}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white font-sans mt-0.5">
                Módulo de WhatsApp y Entrada por Voz
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Descargar Excel (.xlsx)
            </button>
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Compartir Resumen
            </a>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 bg-emerald-950/40 p-3 rounded-xl backdrop-blur-md border border-emerald-500/20">
          <div className="flex justify-between items-center text-xs font-medium text-emerald-100 mb-1.5">
            <span>Avance del Conteo ({completedItemsCount} de {totalItemsCount} ítems listos)</span>
            <span className="font-bold text-emerald-200">{progressPercent}% completado</span>
          </div>
          <div className="w-full h-2.5 bg-emerald-950/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module Mode Tabs */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setModuleTab("messages")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            moduleTab === "messages"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>🎙️ Dictado por Voz & Mensajes WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setModuleTab("inventory")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            moduleTab === "inventory"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📊 Planillas de Inventario Excel</span>
        </button>
      </div>

      {/* Feedback banner */}
      {lastFeedback && (
        <div className="mx-4 md:mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastFeedback}</span>
          </div>
          <button 
            onClick={() => setLastFeedback(null)} 
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-md cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body */}
      {moduleTab === "messages" ? (
        <div className="p-4 md:p-6 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-5">
            
            {/* Dictation Banner with Big Animated Mic Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 rounded-2xl text-white shadow-lg border border-emerald-800/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300">
                    Tecnología Web Speech API
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-400" />
                  Dictar Mensaje por Voz en Tiempo Real
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Presioná el botón de micrófono, hablá naturalmente en voz alta y el texto aparecerá instantáneamente. Podés pausar y <strong>editar libremente cualquier palabra</strong> antes de enviarlo por WhatsApp.
                </p>
              </div>

              {/* Main Microphone Button */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleWebSpeechDictation}
                  className={`group relative px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-2xl ${
                    isWebSpeechListening
                      ? "bg-rose-600 hover:bg-rose-700 text-white ring-8 ring-rose-500/30 animate-pulse scale-105"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 ring-4 ring-emerald-400/30"
                  }`}
                  title={isWebSpeechListening ? "Detener dictado por voz" : "Iniciar dictado por voz con Web Speech API"}
                >
                  {isWebSpeechListening ? (
                    <>
                      <MicOff className="w-6 h-6 text-white animate-bounce" />
                      <div className="text-left">
                        <div className="text-xs uppercase tracking-wider text-rose-200">Grabando en Vivo</div>
                        <div className="text-sm font-black">DETENER DICTADO</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6 text-slate-950 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="text-xs uppercase tracking-wider text-emerald-950 font-bold">Entrada por Voz</div>
                        <div className="text-sm font-black">DICTAR POR MICRÓFONO</div>
                      </div>
                    </>
                  )}
                </button>

                {isWebSpeechListening && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-1.5 h-6 bg-emerald-300 rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-8 bg-emerald-200 rounded-full animate-pulse delay-150" />
                    <span className="w-1.5 h-5 bg-emerald-300 rounded-full animate-pulse delay-100" />
                    <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-200" />
                    <span className="text-[11px] text-emerald-300 font-mono ml-2 font-bold">Escuchando...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Dictation Interim Banner */}
            {isWebSpeechListening && speechInterimText && (
              <div className="p-4 bg-emerald-950 border border-emerald-600/60 rounded-xl text-emerald-100 text-xs flex items-start gap-3 animate-fadeIn">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Transcripción en vivo:</span>
                  <p className="italic text-slate-100 mt-0.5 font-sans">"{speechInterimText}"</p>
                </div>
              </div>
            )}

            {/* Form Fields: Category, Title & Target Phone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría del Mensaje:</label>
                <select
                  value={freeMessageType}
                  onChange={(e) => setFreeMessageType(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="general">📢 Aviso General / Equipo</option>
                  <option value="pedido">📦 Pedido de Reposición / Proveedor</option>
                  <option value="alerta">🚨 Alerta Urgente de Stock</option>
                  <option value="dictado">📝 Dictado Libre / Nota de Turno</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título del Asunto:</label>
                <input
                  type="text"
                  value={freeMessageTitle}
                  onChange={(e) => setFreeMessageTitle(e.target.value)}
                  placeholder="Ej: Cambio de Turno / Faltante de Stock"
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  N° WhatsApp Destino (Opcional):
                </label>
                <input
                  type="text"
                  value={freePhoneNumber}
                  onChange={(e) => setFreePhoneNumber(e.target.value)}
                  placeholder="Ej: 5491122334455 (o dejar en blanco para elegir contacto)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick Templates & Text Snippets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Plantillas Rápidas:</span>
                <span className="text-[10px] text-slate-400">Tocá para insertar y luego podés dictar o editar</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setFreeMessageType("pedido");
                    setFreeMessageTitle("Pedido de Reposición de Bebidas");
                    setFreeMessageText("Hola, necesitamos reponer para el local:\n- 10 fardos Coca-Cola 2.25L\n- 5 fardos Agua Villavicencio 1.5L\n- 8 packs Cerveza Quilmes 473ml\n\nPor favor confirmar horario estimado de entrega.");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  📦 Pedido Proveedor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFreeMessageType("alerta");
                    setFreeMessageTitle("Alerta Faltante Crítico de Cajas");
                    setFreeMessageText("Atención equipo: nos estamos quedando sin cambio en caja 1 y sin bolsas medianas en mostrador. Por favor traer repuesto del depósito.");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  🚨 Alerta de Caja
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFreeMessageType("general");
                    setFreeMessageTitle("Resumen Fin de Turno");
                    setFreeMessageText("Hola equipo, dejamos el turno entregado:\n- Arqueo de caja realizado con remanente OK\n- Reposición de góndolas y heladeras lista\n- Sin novedades pendientes en depósito.");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  📢 Cierre de Turno
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFreeMessageType("dictado");
                    setFreeMessageTitle("Conteo Rápido de Stock");
                    setFreeMessageText("Conteo físico realizado:\n- 24 Coca Cola 500ml\n- 15 Cepita Naranja 200ml\n- 8 Alfajores Milka\n- 12 Cervezas Quilmes 1L");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  📝 Conteo Físico
                </button>
              </div>
            </div>

            {/* Editable Textarea with Integrated Mic and Quick Insertion Toolbar */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-black text-slate-800 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-600" />
                  <span>Mensaje Editable (Dictado por Voz o Escrito):</span>
                </label>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFreeMessageText((prev) => prev ? `${prev}\n• ` : "• ")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Insertar viñeta de lista"
                  >
                    • Viñeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreeMessageText((prev) => prev ? `${prev}\n` : "")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Insertar salto de línea"
                  >
                    <CornerDownLeft className="w-3 h-3" /> Salto
                  </button>
                  <button
                    type="button"
                    onClick={toggleWebSpeechDictation}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isWebSpeechListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isWebSpeechListening ? "Pausar Voz" : "🎙️ Dictar Aquí"}</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={6}
                  value={freeMessageText}
                  onChange={(e) => setFreeMessageText(e.target.value)}
                  placeholder="Presioná el botón de micrófono para dictar por voz o escribí directamente tu mensaje aquí... Podés corregir cualquier palabra con tu teclado antes de enviar."
                  className="w-full text-sm p-4 rounded-2xl border-2 border-emerald-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none shadow-inner font-sans leading-relaxed"
                />

                <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm">
                  {freeMessageText.length} caracteres
                </div>
              </div>
            </div>

            {/* Visualización Previa Estilo WhatsApp */}
            {freeMessageText.trim() && (
              <div className="p-4 bg-emerald-950 rounded-2xl border border-emerald-800 text-emerald-100 space-y-2 shadow-md">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Vista Previa Formato Oficial de WhatsApp
                  </span>
                  <span>{new Date().toLocaleDateString('es-AR')}</span>
                </div>
                <div className="p-3.5 bg-[#0b141a] rounded-xl border border-emerald-900 text-xs text-slate-100 font-sans whitespace-pre-wrap leading-relaxed shadow-inner">
                  {buildFullWhatsAppMessage()}
                </div>
              </div>
            )}

            {/* Botones de Envío y Acciones */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFreeMessageText("")}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer w-1/2 sm:w-auto"
                >
                  Limpiar Texto
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  disabled={!freeMessageText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 w-1/2 sm:w-auto"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendCustomMessageToWhatsApp}
                disabled={!freeMessageText.trim()}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 text-white" />
                <span>📲 ENVIAR MENSAJE A WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-6 space-y-6">
        
        {/* Step 1: Select or Upload WhatsApp Excel Sheet */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
              Planilla Excel Recibida por WhatsApp:
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                Subir Planilla Excel (.xlsx)
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => setIsPastingMode(!isPastingMode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                {isPastingMode ? "Ver Plantillas Ejemplos" : "Pegar Texto de WhatsApp"}
              </button>
            </div>
          </div>

          {uploadedFileName && (
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Planilla activa cargada: <strong>{uploadedFileName}</strong> ({items.length} filas detectadas)
              </span>
              <span className="text-[11px] bg-emerald-200 px-2 py-0.5 rounded text-emerald-900 font-mono">Formato Original Conservado</span>
            </div>
          )}

          {!isPastingMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {SAMPLE_WHATSAPP_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTemplate(idx)}
                  className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    selectedTemplateIndex === idx && !uploadedFileName
                      ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 text-emerald-950 font-medium"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50"
                  }`}
                >
                  <span className="text-xs font-semibold">{tmpl.nombre}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold self-start mt-2">
                    {tmpl.items.length} ítems
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={pastedWhatsAppText}
                onChange={(e) => setPastedWhatsAppText(e.target.value)}
                placeholder={"Pegá la lista de WhatsApp, por ejemplo:\n1. Cepita Naranja 200ml\n2. Cepita Multifruta 200ml\n3. Agua Mineral Benedictino 500ml"}
                className="w-full h-24 p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleParsePastedText}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Cargar Lista
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Big Mobile Voice Dictation Button */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-lg border border-emerald-800">
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              Dictá Libremente el Conteo (Martín Agrupa y Suma Todas las Repeticiones)
            </h3>
            <p className="text-xs text-emerald-100/80">
              No necesitas pausar ni avisar ubicaciones. Dictá como vas contando: <br />
              <span className="font-semibold text-white bg-emerald-800/60 px-2 py-0.5 rounded italic">
                "24 cocas de 500, 10 alfajores... 35 cocas de 500, 5 cepitas... y 5 cocas de 500" → Martín suma 24+35+5 = 64 Coca 500ml en la celda del Excel.
              </span>
            </p>

            <div className="py-2 flex justify-center">
              <button
                onClick={isListening ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`relative group p-6 rounded-full transition-all duration-300 shadow-xl flex items-center justify-center cursor-pointer ${
                  isListening
                    ? "bg-rose-500 ring-8 ring-rose-500/30 animate-pulse scale-110"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 ring-8 ring-emerald-500/20"
                }`}
                title="Presionar para dictar conteo por voz"
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-emerald-950" />
                )}
              </button>
            </div>

            <div className="text-xs font-semibold">
              {isListening && (
                <span className="text-rose-300 animate-pulse flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  Escuchando conteo de voz... Tocá de nuevo para procesar.
                </span>
              )}
              {isTranscribing && (
                <span className="text-emerald-300 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  Martín está interpretando, sumando ubicaciones y completando las celdas...
                </span>
              )}
              {!isListening && !isTranscribing && (
                <span className="text-emerald-200/90">
                  Tocá el micrófono para iniciar el conteo por voz
                </span>
              )}
            </div>

            {transcript && (
              <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700/50 text-xs text-left">
                <span className="text-emerald-400 font-bold block mb-1">🗣️ Audio dictado:</span>
                <p className="text-emerald-100 italic">"{transcript}"</p>
              </div>
            )}
          </div>
        </div>

        {omittedItems.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">⚠️ Ítems Descartados por Martín (Fuera de la Planilla Oficial):</strong>
              <div className="mt-1 font-mono text-[11px] text-amber-800 bg-amber-100/60 p-1.5 rounded">
                {omittedItems.join(" • ")}
              </div>
            </div>
          </div>
        )}

        {/* Table of Requested WhatsApp Items */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Planilla Oficial Organizada ({items.length} ítems)
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const name = prompt("Nombre del nuevo producto a ingresar:");
                  if (name && name.trim()) {
                    const newId = items.length > 0 ? Math.max(...items.map(i => typeof i.id === 'number' ? i.id : 0)) + 1 : 1;
                    const newProd: ExcelRowItem = {
                      id: newId,
                      codigo: `MANUAL-${Math.floor(100 + Math.random() * 900)}`,
                      producto: name.trim(),
                      unidad: "u.",
                      cantidadContada: null,
                      estado: "pendiente"
                    };
                    const updated = [...items, newProd];
                    setItems(updated);
                    if (onSyncToStoreData) onSyncToStoreData(updated);
                    setLastFeedback(`✅ Producto '${name.trim()}' agregado a la planilla.`);
                  }
                }}
                className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>

              <button
                onClick={() => {
                  const updated = items.map(i => ({
                    ...i,
                    cantidadContada: i.cantidadContada !== null ? i.cantidadContada : (i.cantidadEsperada ?? 1),
                    estado: "completado" as const
                  }));
                  setItems(updated);
                  if (onSyncToStoreData) onSyncToStoreData(updated);
                  setLastFeedback("✨ Todos los ítems pendientes fueron completados al 100%.");
                }}
                className="px-2.5 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Completar automáticamente los ítems pendientes para avanzar al 100%"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Completar con Esperados
              </button>

              <button
                onClick={() => {
                  const updated = items.map(i => ({
                    ...i,
                    cantidadContada: i.cantidadContada !== null ? i.cantidadContada : 0,
                    estado: i.cantidadEsperada && i.cantidadEsperada > 0 ? "desviado" as const : "completado" as const
                  }));
                  setItems(updated);
                  if (onSyncToStoreData) onSyncToStoreData(updated);
                  setLastFeedback("✨ Ítems pendientes completados con 0 unidades.");
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Poner en 0 los ítems pendientes"
              >
                0️⃣ Completar con 0
              </button>

              <button
                onClick={() => {
                  const updated = items.map(i => ({ ...i, cantidadContada: null, estado: "pendiente" as const }));
                  setItems(updated);
                  if (onSyncToStoreData) onSyncToStoreData(updated);
                  setLastFeedback("🔄 Conteo de celdas reiniciado a 0%.");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium px-2 py-1.5 rounded bg-slate-100 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reiniciar
              </button>
              
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de vaciar completamente la planilla y borrar todos los ítems?")) {
                    setItems([]);
                    setUploadedFileName(null);
                    if (onSyncToStoreData) onSyncToStoreData([]);
                    setLastFeedback("🗑️ Planilla vaciada completamente en tiempo real.");
                  }
                }}
                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vaciar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold border-b border-slate-200">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Producto Requerido (Excel/WhatsApp)</th>
                  <th className="py-3 px-4 text-center">Esperado</th>
                  <th className="py-3 px-4 text-center">Contado (Voz / Rápido)</th>
                  <th className="py-3 px-4 text-center">Estado Auditoría</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium italic">
                      Planilla vacía en tiempo real. Dictá por voz o hacé clic en "+ Agregar Producto" para comenzar.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                  <tr 
                    key={item.id}
                    className={`transition-colors ${
                      item.cantidadContada !== null 
                        ? "bg-emerald-50/40 hover:bg-emerald-50/70" 
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{item.codigo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.producto}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {item.cantidadEsperada !== undefined ? `${item.cantidadEsperada} u.` : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            const current = item.cantidadContada ?? 0;
                            const next = Math.max(0, current - 1);
                            const updated = [...items];
                            updated[idx] = {
                              ...item,
                              cantidadContada: next,
                              estado: item.cantidadEsperada && next !== item.cantidadEsperada ? "desviado" : "completado"
                            };
                            setItems(updated);
                            if (onSyncToStoreData) onSyncToStoreData(updated);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-300"
                          title="Restar 1 unidad"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.cantidadContada ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value.trim();
                            const val = raw === "" || isNaN(parseInt(raw, 10)) ? null : parseInt(raw, 10);
                            const updated = [...items];
                            updated[idx] = {
                              ...item,
                              cantidadContada: val,
                              estado: val === null ? "pendiente" : item.cantidadEsperada && val !== item.cantidadEsperada ? "desviado" : "completado"
                            };
                            setItems(updated);
                            if (onSyncToStoreData) onSyncToStoreData(updated);
                          }}
                          placeholder="--"
                          className="w-16 text-center py-1 px-1 border rounded-lg font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = item.cantidadContada ?? 0;
                            const next = current + 1;
                            const updated = [...items];
                            updated[idx] = {
                              ...item,
                              cantidadContada: next,
                              estado: item.cantidadEsperada && next !== item.cantidadEsperada ? "desviado" : "completado"
                            };
                            setItems(updated);
                            if (onSyncToStoreData) onSyncToStoreData(updated);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-300"
                          title="Sumar 1 unidad"
                        >
                          +
                        </button>
                        {item.cantidadEsperada !== undefined && (
                          <button
                            type="button"
                            onClick={() => {
                              const val = item.cantidadEsperada!;
                              const updated = [...items];
                              updated[idx] = {
                                ...item,
                                cantidadContada: val,
                                estado: "completado"
                              };
                              setItems(updated);
                              if (onSyncToStoreData) onSyncToStoreData(updated);
                            }}
                            className="px-1.5 py-1 text-[10px] font-bold rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer border border-emerald-300"
                            title={`Fijar en esperado (${item.cantidadEsperada} u.)`}
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.cantidadContada === null ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          PENDIENTE
                        </span>
                      ) : item.estado === "desviado" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> DIFERENCIA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OK
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          const updated = items.filter((_, i) => i !== idx);
                          setItems(updated);
                          if (onSyncToStoreData) onSyncToStoreData(updated);
                          setLastFeedback(`🗑️ Ítem '${item.producto}' eliminado de la planilla.`);
                        }}
                        title="Eliminar producto de la planilla"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
