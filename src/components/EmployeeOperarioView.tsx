import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Paperclip, 
  Link as LinkIcon, 
  Send, 
  Bot, 
  Sparkles, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  CheckCircle2, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  X, 
  ArrowRight,
  Smartphone,
  ShieldCheck,
  UserCheck,
  FolderOpen,
  Upload,
  FileText,
  Search,
  Truck,
  HelpCircle,
  Trash2
} from "lucide-react";
import { ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";
import BotonWhatsAppExcel from "./BotonWhatsAppExcel";
import EscaneoPaquetesLogistica from "./EscaneoPaquetesLogistica";
import { saveToLocalMemory, loadFromLocalMemory, STORAGE_KEYS } from "../lib/localMemory";
import { useBusinessReportData, downloadBusinessReportCsv, updateBusinessReportData } from "../lib/businessReport";
import { speakMartin, stopMartinSpeech } from "../lib/maleVoicePicker";

interface EmployeeOperarioViewProps {
  userDisplayName?: string;
  googleToken: string | null;
  onSwitchToManager?: () => void;
}

export const EmployeeOperarioView: React.FC<EmployeeOperarioViewProps> = ({
  userDisplayName = "Operario de Local",
  googleToken,
  onSwitchToManager
}) => {
  const [businessReport] = useBusinessReportData();
  const [vistaModo, setVistaModo] = useState<'chat' | 'logistica'>('chat');
  const knownName = userDisplayName && userDisplayName !== "Operario de Local" && userDisplayName !== "Operario" ? userDisplayName : "";
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const greetingText = knownName
      ? `¡Hola ${knownName}! 👋 Soy **Martín**, tu asistente de gestión. ¿En qué te puedo dar una mano en tu turno? Podés dictarme en voz alta las cantidades, subir fotos de facturas/stock o pegarme un enlace.`
      : `¡Hola! 👋 Soy **Martín**, tu asistente de gestión. ¿Con quién tengo el gusto de hablar hoy o cómo te llamás? Podés dictarme en voz alta las cantidades, subir fotos de facturas o pegarme un enlace.`;
    return [
      {
        id: "welcome-op",
        role: "model",
        text: greetingText
      }
    ];
  });

  const [inputText, setInputValue] = useState(() => {
    return loadFromLocalMemory<string>(STORAGE_KEYS.OPERARIO_DRAFT, "");
  });

  // Auto-restore operario chat history from local memory
  useEffect(() => {
    const savedMessages = loadFromLocalMemory<ChatMessage[] | null>(STORAGE_KEYS.OPERARIO_CHAT, null);
    if (savedMessages && Array.isArray(savedMessages) && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // Auto-save operario chat messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      saveToLocalMemory(STORAGE_KEYS.OPERARIO_CHAT, messages);
    }
  }, [messages]);

  // Auto-save operario draft text
  useEffect(() => {
    saveToLocalMemory(STORAGE_KEYS.OPERARIO_DRAFT, inputText);
  }, [inputText]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ base64: string; name: string; mimeType?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);

  // Attachment & Google Drive modal states
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [cargandoDrive, setCargandoDrive] = useState(false);
  const [busquedaDrive, setBusquedaDrive] = useState("");
  
  // Voice Recording & Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const baseTextRef = useRef<string>("");

  // Speech synthesis
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear chat history & server memory reset handler
  const clearChatHistory = async () => {
    if (!confirm("¿Querés reiniciar la conversación con Martín y borrar la memoria del chat?")) return;
    
    localStorage.removeItem("martin_chat_history_v2");
    localStorage.removeItem("martin_operario_chat");
    localStorage.removeItem("martin_operario_draft");

    try {
      await fetch("/api/martin/memory", { method: "DELETE" });
    } catch (e) {
      console.warn("Could not delete server chat memory:", e);
    }

    const greetingText = knownName
      ? `¡Hola ${knownName}! 👋 Soy **Martín**, tu asistente de gestión. ¿En qué te puedo dar una mano en tu turno? Podés dictarme en voz alta las cantidades, subir fotos de facturas/stock o pegarme un enlace.`
      : `¡Hola! 👋 Soy **Martín**, tu asistente de gestión. ¿Con quién tengo el gusto de hablar hoy o cómo te llamás? Podés dictarme en voz alta las cantidades, subir fotos de facturas o pegarme un enlace.`;

    setMessages([
      {
        id: "welcome-op-reset",
        role: "model",
        text: greetingText
      }
    ]);

    setVoiceStatus("✅ Chat reiniciado. Conexión con Martín IA limpia.");
    setTimeout(() => setVoiceStatus(null), 4000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Dual Voice Dictation Handler (Web Speech API + MediaRecorder Fallback)
  const toggleRecording = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    baseTextRef.current = inputText.trim();

    // 1. Web Speech Recognition (Browser instant dictation)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = "es-AR";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceStatus("🎙️ Escuchando... Hablá ahora de forma clara.");
        };

        recognition.onresult = (event: any) => {
          let fullSpeech = "";
          for (let i = 0; i < event.results.length; i++) {
            fullSpeech += event.results[i][0].transcript;
          }
          let cleanSpeech = fullSpeech.trim();
          if (cleanSpeech) {
            // Deduplicate repeated phrases if Web Speech API hallucinated repetitions
            const words = cleanSpeech.split(/\s+/);
            if (words.length >= 2) {
              for (let phraseLen = 1; phraseLen <= Math.floor(words.length / 2); phraseLen++) {
                const phrase = words.slice(0, phraseLen).join(" ");
                let isRepeated = true;
                let count = 0;
                for (let i = 0; i < words.length; i += phraseLen) {
                  const sub = words.slice(i, i + phraseLen).join(" ");
                  if (sub.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, "") === phrase.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, "")) {
                    count++;
                  } else {
                    isRepeated = false;
                    break;
                  }
                }
                if (isRepeated && count > 1) {
                  cleanSpeech = phrase;
                  break;
                }
              }
            }

            const base = baseTextRef.current;
            setInputValue(base ? `${base} ${cleanSpeech}` : cleanSpeech);
            setVoiceStatus(`✅ Escuchado: "${cleanSpeech}"`);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("SpeechRecognition error, switching to MediaRecorder fallback:", event.error);
          recognitionRef.current = null;
          setIsListening(false);
          if (event.error !== "no-speech") {
            startMediaRecorderFallback();
          } else {
            setVoiceStatus("🎙️ No se detectó audio. Tocá de nuevo el micrófono.");
            setTimeout(() => setVoiceStatus(null), 3000);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
          setTimeout(() => setVoiceStatus(null), 3000);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Error starting SpeechRecognition:", err);
      }
    }

    // 2. Fallback to MediaRecorder + Gemini /api/transcribe
    startMediaRecorderFallback();
  };

  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = "audio/webm";
      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" };
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
          mimeType = "audio/mp4";
        }
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Crucial: ALWAYS stop audio tracks to release microphone hardware
        stream.getTracks().forEach((track) => track.stop());

        setIsListening(false);
        setIsTranscribing(true);
        setVoiceStatus("⏳ Transcribiendo tu voz a texto con Martín...");

        const actualMime = recorder.mimeType || mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });

        if (audioBlob.size < 300) {
          setIsTranscribing(false);
          setVoiceStatus("🎙️ Grabación muy corta. Hablá de nuevo claramente.");
          setTimeout(() => setVoiceStatus(null), 3000);
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const resp = await fetch("/api/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio: base64Audio, mimeType: actualMime })
            });
            const data = await resp.json();
            if (data.text) {
              let textToInsert = data.text.trim();
              const words = textToInsert.split(/\s+/);
              if (words.length >= 2) {
                for (let phraseLen = 1; phraseLen <= Math.floor(words.length / 2); phraseLen++) {
                  const phrase = words.slice(0, phraseLen).join(" ");
                  let isRepeated = true;
                  let count = 0;
                  for (let i = 0; i < words.length; i += phraseLen) {
                    const sub = words.slice(i, i + phraseLen).join(" ");
                    if (sub.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, "") === phrase.toLowerCase().replace(/[^a-záéíóúñ0-9]/gi, "")) {
                      count++;
                    } else {
                      isRepeated = false;
                      break;
                    }
                  }
                  if (isRepeated && count > 1) {
                    textToInsert = phrase;
                    break;
                  }
                }
              }

              const base = baseTextRef.current;
              setInputValue(base ? `${base} ${textToInsert}` : textToInsert);
              setVoiceStatus(`✅ Transcripción recibida: "${textToInsert}"`);
            } else {
              setVoiceStatus("🎙️ No se logró interpretar la voz. Intentá hablar con más volumen.");
            }
          } catch (err) {
            console.error("Transcription error:", err);
            setVoiceStatus("⚠️ Error de conexión con el servidor de voz.");
          } finally {
            setIsTranscribing(false);
            setTimeout(() => setVoiceStatus(null), 4000);
          }
        };
      };

      recorder.start(250);
      setIsListening(true);
      setVoiceStatus("🎙️ Grabando audio... Tocá el micrófono cuando termines.");
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setIsListening(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setVoiceStatus("🔒 Permiso de micrófono denegado en el navegador. Habilitá el micrófono en la barra de direcciones.");
      } else {
        setVoiceStatus("🎙️ No se pudo activar el micrófono.");
      }
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        base64: reader.result as string,
        name: file.name,
        mimeType: file.type
      });
      setShowAttachOptions(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Google Drive Files fetcher
  const cargarArchivosDrive = async () => {
    setCargandoDrive(true);
    try {
      const resp = await fetch("/api/whatsapp/scan-drive");
      const data = await resp.json();
      if (data.files) {
        setDriveFiles(data.files);
      }
    } catch (err) {
      console.error("Error al cargar archivos de Drive:", err);
    } finally {
      setCargandoDrive(false);
    }
  };

  // Send attached file directly to OCR Logistics Manifest
  const procesarAdjuntoAOCRLogistica = async () => {
    if (!attachedFile) return;
    setLoading(true);
    setOcrStatus("📸 Leyendo datos del paquete con Inteligencia Artificial OCR...");

    try {
      const resp = await fetch("/api/process-package-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ocr",
          imageBase64: attachedFile.base64,
          mimeType: attachedFile.mimeType || "image/jpeg"
        })
      });
      const resData = await resp.json();

      if (resData.success && resData.data) {
        const botMsg: ChatMessage = {
          id: `bot-ocr-${Date.now()}`,
          role: "model",
          text: `✅ ¡Paquete leídos y registrado correctamente!
📍 **Dirección:** ${resData.data.direccion || "Detectada por OCR"}
👤 **Destinatario:** ${resData.data.destinatario || "Cliente"}
📦 **Tracking:** ${resData.data.trackingCode || "PKG-1001"}

Se ha agregado automáticamente a tu **Hoja de Ruta de Reparto**. Podés ver la lista completa cambiando al módulo de logística.`
        };

        setMessages(prev => [...prev, botMsg]);
        setAttachedFile(null);
        setOcrStatus("✅ Paquete cargado con éxito en el manifiesto logístico.");
        // Switch to logistics route view automatically
        setTimeout(() => setVistaModo('logistica'), 1500);
      } else {
        setOcrStatus("⚠️ No se logró leer la etiqueta con nitidez. Redirigiendo a la Cámara de Trípode...");
        setTimeout(() => setVistaModo('logistica'), 1000);
      }
    } catch (err) {
      console.error("Error en OCR:", err);
      setOcrStatus("❌ Error procesando el archivo adjunto.");
    } finally {
      setLoading(false);
      setTimeout(() => setOcrStatus(null), 3500);
    }
  };

  // Send message to Martin API
  const handleSend = async (overrideText?: string) => {
    let textToSend = overrideText || inputText;
    if (urlInput.trim()) {
      textToSend += `\n[Enlace adjunto: ${urlInput.trim()}]`;
    }

    if (!textToSend.trim() && !attachedFile) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: "user",
      text: textToSend,
      image: attachedFile?.base64
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setUrlInput("");
    setShowUrlField(false);
    setAttachedFile(null);
    setLoading(true);

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (googleToken) headers["Authorization"] = `Bearer ${googleToken}`;
      const customKey = localStorage.getItem("user_gemini_api_key");
      if (customKey && customKey.trim()) {
        headers["X-Gemini-API-Key"] = customKey.trim();
      }

      // Build conversation history for context
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: textToSend,
          image: userMsg.image,
          userDisplayName,
          userRole: "employee",
          urlLink: urlInput.trim() || undefined,
          history
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.text || "Recibido. Martín procesó la solicitud correctamente.";

      // Dynamically update reactive business report state with dictated products or table data
      updateBusinessReportData(replyText || textToSend, "Control_Productos_Dictados_Operario");

      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "model",
        text: replyText
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error("Error asking Martin:", err);
      // Fallback assistant response so employee is never left without feedback
      updateBusinessReportData(textToSend, "Control_Productos_Dictados_Operario");
      setMessages(prev => [
        ...prev,
        {
          id: `m-resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: "model",
          text: `Hola ${userDisplayName}, recibí tu mensaje: "${textToSend.slice(0, 50)}...". Martín registró la novedad en el sistema de inventario local del turno. Podés continuar dictando o adjuntando los siguientes artículos.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech Output
  const speakText = (msgId: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      stopMartinSpeech();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    speakMartin(
      text,
      () => setSpeakingMsgId(msgId),
      () => setSpeakingMsgId(null),
      () => setSpeakingMsgId(null)
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 text-slate-800 rounded-none md:rounded-2xl overflow-hidden border-none md:border border-slate-200 shadow-none md:shadow-sm flex-1">
      
      {/* Top Header: Ultra-compact Role Status & Switcher */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-2 px-3 md:px-4 flex items-center justify-between border-b border-indigo-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
            <UserCheck className="w-3.5 h-3.5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs md:text-sm font-bold text-white tracking-tight">
                Vista Operario
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono font-bold uppercase tracking-wider">
                Sin Distracciones
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate max-w-xs sm:max-w-md">
              Operador: <strong className="text-indigo-200">{userDisplayName}</strong> • Interfaz directa con Martín
            </p>
          </div>
        </div>

        {onSwitchToManager && (
          <button
            onClick={onSwitchToManager}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Cambiar a la vista con tableros completos de gerencia"
          >
            <span>💼 Ver Gerencia</span>
          </button>
        )}
      </header>

      {/* Operario Action Chips Banner */}
      <div className="bg-white border-b border-slate-200 p-2 px-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setVistaModo('chat')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              vistaModo === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>💬 Chat Asistente</span>
          </button>

          <button
            onClick={() => setVistaModo('logistica')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              vistaModo === 'logistica'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>📦 Recepción Paquetes</span>
          </button>

          {/* PROMINENT RED RESET BUTTON ALWAYS VISIBLE */}
          <button
            onClick={clearChatHistory}
            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
            title="Reiniciar chat y borrar memoria previa de Martín"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>🔴 Reiniciar Chat</span>
          </button>
        </div>

        {vistaModo === 'chat' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleSend("Martín, quiero registrar el conteo de stock del turno.")}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold border border-indigo-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Conteo Stock</span>
            </button>

            <button
              onClick={() => downloadBusinessReportCsv(businessReport)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              title={`Descargar Excel (.csv) actualizado con los ${businessReport.totalItemsCount} productos dictados`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>📥 Descargar Excel ({businessReport.totalItemsCount})</span>
            </button>

            <BotonWhatsAppExcel
              datosInventario={businessReport.products.map(p => ({
                Producto: p.product,
                Cantidad: parseInt(p.quantity) || 1,
                Unidad: "u",
                Observaciones: p.observations || "Dictado por voz"
              }))}
              responsable={userDisplayName || "Operario/a"}
            />
          </div>
        )}
      </div>

      {vistaModo === 'logistica' ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          <EscaneoPaquetesLogistica />
        </div>
      ) : (
        <>
          {/* URL Drawer if open */}
      <AnimatePresence>
        {showUrlField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50/80 border-b border-blue-200 p-3 px-4 flex items-center gap-2 text-xs"
          >
            <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Pegá aquí el enlace URL de Google Drive, Google Sheet o documento..."
              className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={() => setShowUrlField(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Messages Feed - Expands to occupy full height for easy reading */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-5 space-y-3 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={`${msg.id || 'msg'}-${idx}`}
            className={`flex items-start gap-3 max-w-3xl ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white font-bold"
                  : "bg-gradient-to-br from-indigo-700 to-blue-800 text-white"
              }`}
            >
              {msg.role === "user" ? userDisplayName.charAt(0).toUpperCase() : <Bot className="w-5 h-5 text-indigo-200" />}
            </div>

            <div
              className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative group ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Adjunto"
                  className="max-w-xs max-h-48 rounded-xl mb-2 object-cover border border-white/20"
                />
              )}
              
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.role === "model" && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[10px]">Martín • Asistente</span>
                  <button
                    onClick={() => speakText(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer p-1 rounded hover:bg-indigo-50"
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span className="text-rose-500">Detener Voz</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Escuchar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 mr-auto max-w-md">
            <div className="w-9 h-9 rounded-2xl bg-indigo-700 text-white flex items-center justify-center">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              Martín está procesando la solicitud...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* OCR Status Banner */}
      {ocrStatus && (
        <div className="bg-indigo-50 border-t border-indigo-200 px-4 py-2 flex items-center justify-between text-xs text-indigo-900 font-semibold shadow-inner">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-spin" />
            <span>{ocrStatus}</span>
          </div>
          <button onClick={() => setOcrStatus(null)} className="text-indigo-700 hover:text-indigo-950 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Status Notification Banner */}
      {voiceStatus && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 font-semibold shadow-inner">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <span>{voiceStatus}</span>
          </div>
          <button onClick={() => setVoiceStatus(null)} className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attached File Preview Badge with Direct OCR Action */}
      {attachedFile && (
        <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Adjunto listo: {attachedFile.name}</span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={procesarAdjuntoAOCRLogistica}
              disabled={loading}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>Escanear OCR y Cargar a Hoja de Ruta</span>
            </button>

            <button
              onClick={() => setAttachedFile(null)}
              className="text-slate-500 hover:text-slate-800 font-bold text-xs p-1 cursor-pointer"
            >
              Quitar
            </button>
          </div>
        </div>
      )}

      {/* Attachment Options Popover Menu */}
      <AnimatePresence>
        {showAttachOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border-t border-slate-200 p-3 shadow-xl space-y-2 text-xs"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between px-1">
              <span>Elegí el origen de los datos o fotos de paquetes:</span>
              <button onClick={() => setShowAttachOptions(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">1. Foto / Archivo Local</div>
                  <div className="text-[10px] text-slate-500">Galería, Imágenes, PDF, Excel</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowAttachOptions(false);
                  setShowDriveModal(true);
                  cargarArchivosDrive();
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg shrink-0">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">2. Google Drive / Sheets</div>
                  <div className="text-[10px] text-slate-500">Buscar chats exportados o fotos</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowAttachOptions(false);
                  setVistaModo('logistica');
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">3. Cámara OCR Logística</div>
                  <div className="text-[11px] text-slate-500">Ir al panel de escaneo en trípode</div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Drive Selector Modal */}
      <AnimatePresence>
        {showDriveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-100 text-cyan-800 rounded-xl">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Archivos y Chats en Google Drive</h3>
                    <p className="text-xs text-slate-500">Elegí el chat exportado de WhatsApp o la foto del paquete</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDriveModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Refresh Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={busquedaDrive}
                    onChange={(e) => setBusquedaDrive(e.target.value)}
                    placeholder="Buscar foto o chat en Drive..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={cargarArchivosDrive}
                  disabled={cargandoDrive}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 border cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${cargandoDrive ? 'animate-spin' : ''}`} />
                  <span>Refrescar</span>
                </button>
              </div>

              {/* Drive Files List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                {cargandoDrive ? (
                  <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                    <span>Conectando con Google Drive...</span>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">No se encontraron archivos no procesados en Drive.</p>
                    <p className="text-[11px]">Si exportaste el chat de WhatsApp a Drive, asegurate de presionar "Refrescar". También podés subir el archivo guardado en tu teléfono con la opción "Subir Foto Local".</p>
                  </div>
                ) : (
                  driveFiles
                    .filter(f => f.name.toLowerCase().includes(busquedaDrive.toLowerCase()))
                    .map((file, idx) => (
                      <div
                        key={file.id || idx}
                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg text-cyan-700 shrink-0">
                            {file.mimeType?.includes('image') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-500">Modificado: Recientemente en Google Drive</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setAttachedFile({
                                name: file.name,
                                base64: file.base64 || 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
                                mimeType: file.mimeType || 'image/jpeg'
                              });
                              setShowDriveModal(false);
                            }}
                            className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Adjuntar
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-xs text-slate-500">
                <span className="text-[11px]">💡 Tip: Podés adjuntar fotos de WhatsApp directamente a tu Hoja de Ruta de Reparto.</span>
                <button
                  onClick={() => setShowDriveModal(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prominent Bottom Operario Control Deck */}
      <div className="bg-white p-4 border-t border-slate-200 shrink-0 space-y-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*, .pdf, .csv, .xlsx, .txt, .zip"
          className="hidden"
        />

        <div className="flex items-center gap-2">
          {/* Big Voice Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRecording(); }}
            disabled={isTranscribing}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 ${
              isListening
                ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-300"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            title={isListening ? "Detener dictado de voz" : "Activar dictado de voz"}
          >
            {isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {/* Big File Attachment Button (Ganchito) */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAttachOptions(!showAttachOptions); }}
            className={`p-3.5 rounded-2xl border transition-colors shrink-0 cursor-pointer ${
              showAttachOptions || attachedFile
                ? "bg-cyan-600 text-white border-cyan-700 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            }`}
            title="Adjuntar foto de paquete, Google Drive o chat de WhatsApp"
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {/* Text Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSend();
              }
            }}
            placeholder={
              isListening
                ? "🎙️ Escuchando dictado de voz..."
                : isTranscribing
                ? "⏳ Transcribiendo audio..."
                : "Escribí o dictá tu mensaje para Martín..."
            }
            rows={1}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
          />

          {/* Big Send Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSend(); }}
            disabled={loading || (!inputText.trim() && !attachedFile)}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
            title="Enviar mensaje"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        {/* Recording status note */}
        {isListening && (
          <p className="text-center text-xs text-rose-600 font-bold animate-pulse">
            🔴 Dictado en progreso... Hablá con claridad y tocá el micrófono rojo para enviar.
          </p>
        )}
      </div>
      </>
      )}

    </div>
  );
};
