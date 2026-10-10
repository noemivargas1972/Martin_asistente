import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PhoneCall, 
  PhoneOff, 
  PhoneIncoming, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Mic, 
  MicOff,
  Volume2, 
  Settings, 
  Send, 
  Bell, 
  Clock, 
  User, 
  FileText, 
  Upload, 
  Play, 
  Square,
  Sparkles,
  Smartphone,
  RefreshCw,
  Zap,
  Sliders,
  Check,
  Building2,
  Users,
  MessageSquare,
  Delete,
  Hash,
  Activity,
  Headphones,
  FileSpreadsheet,
  Share2,
  X,
  Search,
  Globe,
  Calendar,
  Briefcase,
  Target,
  ExternalLink,
  Layers,
  Compass,
  CheckCircle,
  Truck,
  Boxes
} from "lucide-react";

import { speakMartin, stopMartinSpeech } from "../lib/maleVoicePicker";
import { sendWhatsAppMessage } from "../lib/whatsappSender";
import { WhatsAppModeSelector } from "./WhatsAppModeSelector";
import { MartinProspectingCenter } from "./MartinProspectingCenter";
import { MartinDialerSection } from "./MartinDialerSection";
import { MartinAppointmentsSection } from "./MartinAppointmentsSection";
import { MartinAuditsSection } from "./MartinAuditsSection";
import { MartinSpeechConfigSection } from "./MartinSpeechConfigSection";
import { MartinContactsIntegrationSection } from "./MartinContactsIntegrationSection";
import { MartinBranchOrdersConsolidator } from "./MartinBranchOrdersConsolidator";
import { MASTER_38_BRANCHES, SPECIAL_LOGISTIC_CONTACTS } from "../data/branchesData";
import { CustomSalesSpeechConfig } from "../types";

interface MartinCallAlertsModuleProps {
  userDisplayName?: string;
  onOpenChatWithMartin?: (prompt?: string) => void;
  googleToken?: string | null;
}

const LOCAL_PRESETS = [
  ...MASTER_38_BRANCHES.map(b => ({
    id: b.id,
    name: b.name,
    phone: b.phone,
    manager: b.manager
  })),
  ...SPECIAL_LOGISTIC_CONTACTS
];

export default function MartinCallAlertsModule({ 
  userDisplayName = "Noemí Carvallo",
  onOpenChatWithMartin,
  googleToken = null
}: MartinCallAlertsModuleProps) {
  // Contact phone settings
  const [noemiPhone, setNoemiPhone] = useState(() => localStorage.getItem("martin_noemi_phone") || "+54 9 11 5555-8899");
  const [isModuleActive, setIsModuleActive] = useState(() => {
    const saved = localStorage.getItem("martin_call_module_active");
    return saved !== null ? saved === "true" : true;
  });
  const [sensitivity, setSensitivity] = useState<"alta" | "media" | "baja">(() => {
    return (localStorage.getItem("martin_call_sensitivity") as any) || "alta";
  });
  const [minMismatchAmount, setMinMismatchAmount] = useState(() => {
    return localStorage.getItem("martin_call_min_mismatch") || "5000";
  });
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyIncomingCall, setNotifyIncomingCall] = useState(true);

  // Active Section Tab inside Call Center
  const [activeSection, setActiveSection] = useState<"prospeccion" | "integracion_contactos" | "directivas_pedidos" | "citas" | "configuracion" | "auditorias">("prospeccion");

  // Flex Pricing State (Editable in UI and spoken by Martin)
  const [flexPricing, setFlexPricing] = useState({
    motoFlex: "$2.800",
    caminante: "$1.900",
    puntoRetiro: "$1.400",
    furgon: "$4.500",
    promoDiscount: "25% OFF"
  });

  // Custom Sales Speech Config (Gemini Agent & Automation)
  const [speechConfig, setSpeechConfig] = useState<CustomSalesSpeechConfig>(() => {
    try {
      const saved = localStorage.getItem("martin_speech_config");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      communicationMode: "omnicanal",
      salesStrategy: "cierre_agresivo",
      aiPersonalizationEnabled: true,
      autoVoiceEnabled: true,
      whatsappSpeechTemplate: `¡Hola equipo de {nombre_comercio}! 📦 Les escribe Martín, Director de Operaciones de Logística X (Buenos Aires Flex).\n\nQueremos presentarles nuestra solución de distribución express y puntos de retiro para e-commerce en CABA y GBA:\n\n🚀 *Tarifas Especiales E-commerce:*\n• Moto Flex Same-Day (En el Día): {tarifa_moto}\n• Caminantes Radio Corto: {tarifa_caminante}\n• 10 Puntos de Retiro Estratégicos: {tarifa_puntos}\n• Furgón / Bultos Grandes: {tarifa_furgon}\n• Beneficio Exclusivo: {descuento_promo} en tus primeros 15 días.\n\n¿Les gustaría coordinar una breve llamada de 10 minutos o recibir el tarifario completo en PDF?`,
      callOpeningSpeechTemplate: `Hola, ¿qué tal? Te habla Martín, Director de Operaciones de Logística X (Buenos Aires Flex). Te contacto porque estuvimos analizando los envíos de {nombre_comercio}. Contamos con entregas en el día desde {tarifa_moto} y una red de 10 puntos de retiro en CABA desde {tarifa_puntos} con {descuento_promo} de bienvenida. ¿Tenés 2 minutos para contarte cómo podemos reducir sus costos de logística?`,
      replyFollowupSpeechTemplate: `Hola {nombre_comercio}, ¡muchas gracias por tu respuesta! 📦 Para coordinar los envíos Flex y el beneficio del {descuento_promo}, ¿te queda cómodo que te llame en 5 minutos o preferís que te pase los detalles de retiro por acá?`
    };
  });

  const renderSpeechForProspect = (template: string, prospect: any) => {
    if (!template) return "";
    let text = template;
    text = text.replace(/\{nombre_comercio\}/g, prospect.name || "su comercio");
    text = text.replace(/\{rubro\}/g, prospect.category || "E-commerce");
    text = text.replace(/\{tarifa_moto\}/g, flexPricing.motoFlex);
    text = text.replace(/\{tarifa_caminante\}/g, flexPricing.caminante);
    text = text.replace(/\{tarifa_puntos\}/g, flexPricing.puntoRetiro);
    text = text.replace(/\{tarifa_furgon\}/g, flexPricing.furgon);
    text = text.replace(/\{descuento_promo\}/g, flexPricing.promoDiscount);
    return text;
  };

  // Outbound Campaign & Prospecting State (Buenos Aires Flex / Logística X)
  const [campaignService, setCampaignService] = useState("Buenos Aires Flex: Envíos en el Día (Same-Day) con Flota Propia");
  const [campaignCustomInstruction, setCampaignCustomInstruction] = useState(
    "Hola, te habla Martín de Logística X (Buenos Aires Flex). Ofrecemos entregas en el día (Same-Day) en CABA y AMBA desde $2.800, y 10 puntos de retiro desde $1.400 con 25% OFF en los primeros 15 días. ¿Querés agendar una breve reunión de 10 min o te mando el tarifario por WhatsApp?"
  );
  const [campaignGoal, setCampaignGoal] = useState<"agendar_reunion" | "enviar_whatsapp" | "prueba_piloto">("agendar_reunion");
  const [searchNiche, setSearchNiche] = useState("Tiendas E-commerce de Ropa, Calzado e Indumentaria");
  const [searchLocation, setSearchLocation] = useState("CABA y Gran Buenos Aires (AMBA)");
  const [isSearchingProspects, setIsSearchingProspects] = useState(false);

  // Prospects List (Clean E-Commerce for Buenos Aires Flex)
  const [prospects, setProspects] = useState<Array<{
    id: string;
    name: string;
    phone: string;
    category: string;
    websiteOrIg: string;
    estimatedVolume: string;
    painPoint: string;
    callPitch: string;
    whatsappMessage: string;
    status: "nuevo" | "llamado" | "whatsapp_enviado" | "cita_agendada";
  }>>([
    {
      id: "pros-1",
      name: "Moda Urbana BA (E-commerce Ropa)",
      phone: "+54 9 11 4455-8899",
      category: "Indumentaria & Calzado",
      websiteOrIg: "@modaurbanaba.store",
      estimatedVolume: "350 envíos/mes",
      painPoint: "Altos costos en correos tradicionales y reclamos por demoras en entregas en CABA.",
      callPitch: "Hola, ¿cómo estás? Te habla Martín, Director de Operaciones de Logística X (Buenos Aires Flex). Vimos su tienda online de indumentaria y sabemos que la clave es entregar en el día. Contamos con motos y caminantes en CABA y 10 puntos de retiro con 25% de ahorro. ¿Te gustaría que te envíe el tarifario por WhatsApp o coordinemos 10 minutos?",
      whatsappMessage: "¡Hola equipo de Moda Urbana BA! 📦 Les escribe Martín, Director de Logística X (Buenos Aires Flex).\n\nQueremos acercarles nuestra propuesta de Logística Express & Puntos de Retiro en CABA y GBA:\n\n✨ *Tarifas Especiales:*\n• Moto Flex Same-Day: $2.800\n• 10 Puntos de Retiro CABA: $1.400\n• 25% OFF en tus primeros 15 días.\n\n¿Les gustaría coordinar una breve llamada de 10 minutos?",
      status: "nuevo"
    },
    {
      id: "pros-2",
      name: "TechStore Argentina (Gadgets & Audio)",
      phone: "+54 9 11 6789-1234",
      category: "Tecnología & Accesorios",
      websiteOrIg: "www.techstorearg.com.ar",
      estimatedVolume: "520 envíos/mes",
      painPoint: "Necesidad de empaquetado seguro contra golpes y seguro de mercadería.",
      callPitch: "Hola, buenas tardes. Te habla Martín de Logística X. Veo que despachan productos tecnológicos de alto valor. Ofrecemos servicio de empaquetado reforzado, seguro total de carga y entrega express Flex en CABA. Me gustaría presentarte nuestra propuesta para optimizar sus costos logísticos. ¿Te paso la propuesta por WhatsApp?",
      whatsappMessage: "Hola equipo de TechStore Argentina ⚡\n\nSoy Martín, Director de Logística X. Diseñamos un plan logístico a medida para e-commerce de tecnología con entregas Flex y cobertura total.\n\nQuedo a su disposición para enviarles el tarifario por WhatsApp.",
      status: "nuevo"
    },
    {
      id: "pros-3",
      name: "BioCosmética Natural",
      phone: "+54 9 11 3322-7711",
      category: "Cosmética & Cuidado Personal",
      websiteOrIg: "@biocosmetica.ba",
      estimatedVolume: "280 envíos/mes",
      painPoint: "Frascos de vidrio frágiles y necesidad de depósitos con control térmico.",
      callPitch: "Hola, ¿qué tal? Habla Martín, Director de Logística X. Vimos la calidad de sus productos cosméticos. Contamos con packaging acolchado y entregas en el día con Buenos Aires Flex. ¿Querés que agendemos una llamada para ver cómo podemos bajar sus costos de envío?",
      whatsappMessage: "¡Hola BioCosmética Natural! 🌿\n\nLes saluda Martín, Director de Logística X. Entendemos el cuidado que requieren los productos de cosmética y vidrio con entregas express Same-Day en CABA.\n\n¿Les interesaría recibir una cotización personalizada?",
      status: "nuevo"
    }
  ]);

  // Appointments Scheduled (Persisted and starting clean without mock data)
  const [appointments, setAppointments] = useState<Array<{
    id: string;
    prospectName: string;
    phone: string;
    date: string;
    time: string;
    service: string;
    notes: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem("martin_scheduled_appointments");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.filter(a => a.id !== id);
      try { localStorage.setItem("martin_scheduled_appointments", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  // Appointment Modal State
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    prospect: any | null;
    date: string;
    time: string;
    notes: string;
  }>({
    isOpen: false,
    prospect: null,
    date: "Mañana",
    time: "16:00",
    notes: ""
  });

  // Dialer State
  const [dialedNumber, setDialedNumber] = useState("");
  const [dialedName, setDialedName] = useState("");

  // Live Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<"incoming" | "outgoing">("outgoing");
  const [callContactName, setCallContactName] = useState("");
  const [callContactNumber, setCallContactNumber] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [callTranscript, setCallTranscript] = useState<{ sender: "martin" | "user"; text: string }[]>([]);
  const [callStatusMessage, setCallStatusMessage] = useState("Conectando con la línea de voz...");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [callReasonData, setCallReasonData] = useState<{
    title: string;
    description: string;
    user: string;
    file: string;
    risk: "alto" | "medio" | "bajo";
  } | null>(null);

  const callTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Custom Task Assignment State
  const [customTaskTitle, setCustomTaskTitle] = useState("Análisis de Planilla de Stock y Estrategia de Redistribución");
  const [isTaskProcessing, setIsTaskProcessing] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);

  // Audit history
  const [auditLog, setAuditLog] = useState([
    {
      id: "log-1",
      timestamp: "Hoy, 23:45 hs",
      user: "Juan Pérez (Turno Noche)",
      action: "Subida de Arqueo_Caja_Liniers.xlsx",
      risk: "alto" as const,
      detail: "Descuadre en caja de -$14.500 entre comprobantes digitales y saldo físico.",
      martinAction: "📞 Llamada de Alarma realizada a Noemí & Mensaje enviado por WhatsApp.",
      status: "resuelto"
    },
    {
      id: "log-2",
      timestamp: "Hoy, 19:12 hs",
      user: "Pedro Gómez (Depósito)",
      action: "Foto de Comprobante Proveedor_Bebidas.jpg",
      risk: "medio" as const,
      detail: "Imagen con reflejo borroso que no permite validar CUIT ni fecha de emisión.",
      martinAction: "⚠️ Alerta solicitando re-subida en alta definición.",
      status: "pendiente"
    },
    {
      id: "log-3",
      timestamp: "Ayer, 16:30 hs",
      user: "Mariana Silva (Cajera)",
      action: "Carga de Inventario_Golosinas.csv",
      risk: "bajo" as const,
      detail: "15 productos con precio de costo inferior al precio sugerido de lista.",
      martinAction: "🟢 Notificación de sugerencia de actualización de margen.",
      status: "resuelto"
    }
  ]);

  // Call timer and Escape key effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCallActive) {
        handleEndCall();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      stopMartinSpeech();
    };
  }, [isCallActive]);

  // Format call duration
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Dialpad helpers
  const handleDialDigit = (digit: string) => {
    setDialedNumber(prev => prev + digit);
  };

  const handleDialBackspace = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const handleSelectPreset = (preset: { name: string; phone: string }) => {
    setDialedNumber(preset.phone);
    setDialedName(preset.name);
  };

  // Play ringtone with Web Audio API
  const playRingtone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(480, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();

      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          audioCtx.close();
        } catch (e) {}
      }, 1600);
    } catch (e) {
      console.warn("AudioContext ringtone error:", e);
    }
  };

  // Start live speech recognition for conversation
  const startListeningUserVoice = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRec();
      recognition.lang = "es-AR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsMicListening(true);
        setCallStatusMessage("🎙️ Escuchando tu voz...");
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          handleUserSpokeInCall(transcript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsMicListening(false);
        setCallStatusMessage("Presioná el micrófono para responder a Martín.");
      };

      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsMicListening(false);
    }
  };

  // Handle user input in live call (Sends to real Gemini backend, not a bot!)
  const handleUserSpokeInCall = async (userText: string) => {
    setCallTranscript(prev => [...prev, { sender: "user", text: userText }]);
    setIsAiProcessing(true);
    setCallStatusMessage("⚡ Martín analizando con Inteligencia Artificial...");

    try {
      const prompt = `Estás en una LLAMADA TELEFÓNICA EN VIVO con ${userDisplayName} (Dueña/Directora de Smart Commerce).
Actúas como Martín, Director de Operaciones y Analista Financiero General.
El usuario te acaba de decir por teléfono: "${userText}".
Responde de forma ejecutiva, concisa, natural y profesional en 1 a 3 oraciones como en una llamada telefónica real. Sin códigos, sin markdown excesivo.`;

      const res = await fetch("/api/martin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (res.ok) {
        const data = await res.json();
        const martinResponse = data.text || data.response || data.message || "Comprendido perfectamente. Estoy coordinando las acciones correspondientes.";
        
        setCallTranscript(prev => [...prev, { sender: "martin", text: martinResponse }]);
        setCallStatusMessage("🔊 Martín respondiendo con voz en vivo...");
        
        speakMartin(
          martinResponse,
          () => setIsSpeaking(true),
          () => {
            setIsSpeaking(false);
            setCallStatusMessage("Tu turno: tocá el micrófono para hablar o responder.");
          },
          () => setIsSpeaking(false)
        );
      }
    } catch (err) {
      console.error("Call Gemini error:", err);
      const fallback = "Entendido, estoy registrando tu instrucción en el sistema central.";
      setCallTranscript(prev => [...prev, { sender: "martin", text: fallback }]);
      speakMartin(fallback);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Outgoing Call Handler (To any number)
  const handleStartOutgoingCall = (targetNumber?: string, targetName?: string) => {
    const num = targetNumber || dialedNumber || noemiPhone;
    const name = targetName || dialedName || (num === noemiPhone ? `Noemí (${userDisplayName})` : "Contacto Externo");

    if (!num.trim()) {
      alert("Por favor ingresá un número de teléfono para llamar.");
      return;
    }

    setCallContactNumber(num);
    setCallContactName(name);
    setCallType("outgoing");
    setCallReasonData(null);
    setIsCallActive(true);
    playRingtone();

    const greeting = `Hola ${name.includes("Noemí") ? userDisplayName : name}, te habla Martín, Director de Operaciones de Smart Commerce. Te llamo para coordinar las operaciones y revisar el estado del negocio. ¿En qué te puedo colaborar en este momento?`;

    setCallTranscript([
      { sender: "martin", text: greeting }
    ]);

    setTimeout(() => {
      setCallStatusMessage("📞 Llamada conectada • Voz masculina en vivo");
      speakMartin(
        greeting,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          setCallStatusMessage("Llamada en curso. Tocá el micrófono para hablar con Martín.");
        },
        () => setIsSpeaking(false)
      );
    }, 1200);
  };

  // Incoming Simulated Call (Alerts)
  const triggerIncomingAlertCall = (customReason?: {
    title: string;
    description: string;
    user: string;
    file: string;
    risk: "alto" | "medio" | "bajo";
  }) => {
    const reason = customReason || {
      title: "Descuadre crítico detectado en subida de datos",
      description: "Hola Noemí, te habla Martín. Acaban de subir un reporte de caja con una diferencia no justificada de $18.500 y una factura sin número de CUIT.",
      user: "Empleado Turno Noche",
      file: "Cierre_Caja_Nocturno.pdf",
      risk: "alto"
    };

    setCallReasonData(reason);
    setCallContactName("Martín IA (Director Financiero)");
    setCallContactNumber("+54 9 11 3988-6278");
    setCallType("incoming");
    setIsCallActive(true);
    playRingtone();

    const text = `Hola ${userDisplayName}, te habla Martín. Te llamo de emergencia porque ${reason.user} subió el archivo ${reason.file} y detecté una anomalía importante: ${reason.description}. ¿Querés que revisemos la factura en detalle o bloqueemos la aprobación?`;

    setCallTranscript([
      { sender: "martin", text }
    ]);

    setTimeout(() => {
      speakMartin(
        text,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          setCallStatusMessage("Llamada en curso. Podés responderle a Martín por voz.");
        },
        () => setIsSpeaking(false)
      );
    }, 1000);
  };

  // End Call
  const handleEndCall = () => {
    stopMartinSpeech();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsSpeaking(false);
    setIsMicListening(false);
    setIsCallActive(false);
    setCallDuration(0);
    setCallStatusMessage("");
  };

  // Open Direct WhatsApp to Dialed Number (even if not in contacts!)
  const handleOpenDirectWhatsApp = (customNum?: string) => {
    const raw = customNum || dialedNumber || noemiPhone;
    if (!raw) {
      alert("Por favor ingresá un número de teléfono válido para enviar WhatsApp.");
      return;
    }
    const defaultMsg = `Hola, te contacto desde la Central de Smart Commerce (Martín IA).`;
    sendWhatsAppMessage({
      phone: raw,
      message: defaultMsg
    });
  };

  // Download vCard
  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
N:IA;Martín;Director de Operaciones;Smart Commerce;
FN:Martín - Director de Operaciones Smart Commerce IA
ORG:Smart Commerce
TITLE:Director de Operaciones & Call Center
TEL;TYPE=CELL,VOICE,MSG:+5491139886278
EMAIL:martin.director@smartcommerce.ai
NOTE:Central Inteligente de Smart Commerce. Recibe llamadas, WhatsApps, Excel y notas de voz.
END:VCARD`;

    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Martin_Director_SmartCommerce.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Search Web Prospects with Gemini IA
  const handleSearchWebProspects = async () => {
    setIsSearchingProspects(true);
    try {
      const res = await fetch("/api/martin/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchNiche,
          serviceType: campaignService,
          location: searchLocation,
          customPitch: campaignCustomInstruction
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prospects && Array.isArray(data.prospects)) {
          setProspects(data.prospects.map((p: any) => ({ ...p, status: "nuevo" })));
        }
      }
    } catch (err) {
      console.warn("Prospect search error, keeping current list:", err);
    } finally {
      setIsSearchingProspects(false);
    }
  };

  // 2. Start Live Phone Call to a Specific Prospect with Tailored Sales Pitch
  const handleStartProspectCall = (prospect: any) => {
    setCallContactNumber(prospect.phone);
    setCallContactName(`${prospect.name} (E-commerce)`);
    setCallType("outgoing");
    setCallReasonData(null);
    setIsCallActive(true);
    playRingtone();

    // Mark as called
    setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, status: "llamado" } : p));

    const pitch = renderSpeechForProspect(speechConfig.callOpeningSpeechTemplate, prospect) || prospect.callPitch || campaignCustomInstruction;
    setCallTranscript([
      { sender: "martin", text: pitch }
    ]);

    setTimeout(() => {
      setCallStatusMessage(`📞 Llamada conectada con ${prospect.name} • Martín presentando Logística X`);
      speakMartin(
        pitch,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          setCallStatusMessage("Llamada en curso. Tocá el micrófono para responder o simular la conversación con el cliente.");
        },
        () => setIsSpeaking(false)
      );
    }, 1200);
  };

  // 3. Send WhatsApp Proposal to Prospect (Respects custom follow-up & complete info if set!)
  const handleSendProspectWhatsApp = (prospect: any) => {
    // If the prospect has an updated custom/follow-up message, prioritize it!
    const msg = (prospect.hasReceivedCompleteInfo || prospect.clientResponseNote || (prospect.whatsappMessage && !prospect.whatsappMessage.includes("¡Hola equipo de {nombre_comercio}!")))
      ? prospect.whatsappMessage
      : (renderSpeechForProspect(speechConfig.whatsappSpeechTemplate, prospect) || prospect.whatsappMessage || `Hola equipo de ${prospect.name}, les escribe Martín, Director de Logística X.\n\nQueremos presentarles nuestra solución de Distribución Express & Puntos de Retiro para E-commerce.`);
    
    // Mark as whatsapp sent
    setProspects(prev => prev.map(p => p.id === prospect.id ? { 
      ...p, 
      status: p.status === "nuevo" ? "whatsapp_enviado" : p.status,
      whatsappMessage: msg,
      lastContactDate: new Date().toLocaleDateString("es-AR")
    } : p));

    sendWhatsAppMessage({
      phone: prospect.phone,
      message: msg
    });
  };

  // 4. Open Modal to Schedule Appointment
  const handleOpenAppointmentModal = (prospect: any) => {
    setAppointmentModal({
      isOpen: true,
      prospect,
      date: "Mañana",
      time: "15:00",
      notes: `Reunión de 10 min para presentar tarifario y puntos de retiro para ${prospect.estimatedVolume}.`
    });
  };

  // 5. Confirm and Save Appointment
  const handleConfirmScheduleAppointment = () => {
    if (!appointmentModal.prospect) return;
    const newApt = {
      id: `apt-${Date.now()}`,
      prospectName: appointmentModal.prospect.name,
      phone: appointmentModal.prospect.phone,
      date: `${appointmentModal.date}, ${appointmentModal.time} hs`,
      time: appointmentModal.time,
      service: campaignService,
      notes: appointmentModal.notes || "Reunión de presentación comercial Logística X."
    };

    setAppointments(prev => {
      const updated = [newApt, ...prev];
      try { localStorage.setItem("martin_scheduled_appointments", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setProspects(prev => prev.map(p => p.id === appointmentModal.prospect.id ? { ...p, status: "cita_agendada" } : p));

    // WhatsApp confirmation
    const confirmMsg = `¡Hola ${appointmentModal.prospect.name}! 👋 Confirmamos la reunión agendada con Martín (Director de Logística X) para el día ${newApt.date}.\n\n📌 *Detalle:* Presentación de tarifas express y red de 10 puntos de retiro en CABA.\n\n¡Muchas gracias y nos encontramos pronto!`;

    const prospectPhone = appointmentModal.prospect.phone;
    setAppointmentModal({ isOpen: false, prospect: null, date: "Mañana", time: "16:00", notes: "" });
    sendWhatsAppMessage({
      phone: prospectPhone,
      message: confirmMsg
    });
  };

  // Start Custom Task with Call on Completion
  const handleStartCustomTaskWithCall = (taskPrompt: string) => {
    setIsTaskProcessing(true);
    setTaskProgress(10);

    let current = 10;
    const interval = setInterval(() => {
      current += 20;
      if (current >= 100) {
        clearInterval(interval);
        setTaskProgress(100);
        setTimeout(() => {
          setIsTaskProcessing(false);
          triggerIncomingAlertCall({
            title: "Tarea Finalizada: " + taskPrompt,
            description: `Hola ${userDisplayName}, te habla Martín. Ya terminé el análisis completo de las planillas de stock y diseñé la estrategia de redistribución óptima entre las sucursales. Detecté 420 unidades sobre-stockeadas que podemos trasladar para evitar quiebres este fin de semana.`,
            user: "Martín (Director IA)",
            file: "Estrategia_Redistribucion_Stock_Final.xlsx",
            risk: "bajo"
          });
        }, 500);
      } else {
        setTaskProgress(current);
      }
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Emergency Call Active Banner */}
      {isCallActive && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <div>
              <p className="font-extrabold text-sm">Llamada en Curso con Martín ({callContactName})</p>
              <p className="text-xs text-rose-100 font-mono">Duración: {formatTime(callDuration)} • No consume créditos por tiempo en espera</p>
            </div>
          </div>
          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <PhoneOff className="w-4 h-4" />
            <span>🔴 Cortar y Apagar Llamada</span>
          </button>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 md:p-8 border border-indigo-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Director de Call Center & Central Telefónica IA
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-[10px] font-mono font-bold">
                Voz Masculina Real • Gemini 24/7
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Headphones className="w-8 h-8 text-emerald-400" />
              Central Telefónica y Marcador Directo
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Martín actúa como <strong className="text-white font-bold">Director de Call Center</strong>: podés llamar a cualquier número de tu agenda o a números externos no guardados, recibir alertas de auditoría por voz en vivo y enviar mensajes por WhatsApp a cualquier teléfono del mundo.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleStartOutgoingCall(noemiPhone, `Noemí (${userDisplayName})`)}
                className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-105 active:scale-95"
              >
                <PhoneCall className="w-5 h-5 text-slate-950" />
                <span>📞 Llamar a mi Celular</span>
              </button>
              <button
                onClick={() => triggerIncomingAlertCall()}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneIncoming className="w-5 h-5 text-indigo-200" />
                <span>Simular Alerta de Caja</span>
              </button>
            </div>
            <WhatsAppModeSelector compact />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSection("prospeccion")}
          className={`flex-1 min-w-[180px] py-3.5 px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "prospeccion"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>🛵 Call Center Buenos Aires Flex</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${activeSection === "prospeccion" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 font-bold"}`}>
            {prospects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("integracion_contactos")}
          className={`flex-1 min-w-[180px] py-3.5 px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "integracion_contactos"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>📲 Contactos WhatsApp</span>
          <span className="px-1.5 py-0.5 bg-emerald-400 text-slate-950 text-[10px] font-black uppercase rounded-md shadow-sm">
            Mapeo
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("directivas_pedidos")}
          className={`flex-1 min-w-[200px] py-3.5 px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "directivas_pedidos"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25"
              : "text-slate-700 hover:text-slate-950 hover:bg-emerald-50"
          }`}
        >
          <Boxes className="w-4 h-4 text-emerald-300" />
          <span>📦 Pedidos & Presupuestos</span>
          <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-md shadow-sm">
            Grupos
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("configuracion")}
          className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "configuracion"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>⚙️ Configuración & Speeches</span>
          <span className="px-1.5 py-0.2 bg-emerald-400/30 text-emerald-800 text-[10px] font-bold rounded-md">
            Gemini
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("citas")}
          className={`flex-1 min-w-[150px] py-3.5 px-4 rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "citas"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Citas ({appointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("auditorias")}
          className={`flex-1 min-w-[150px] py-3.5 px-4 rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "auditorias"
              ? "bg-slate-800 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>🛡️ Auditorías & Alertas</span>
        </button>
      </div>

      {/* SECTION 1: PROSPECCIÓN WEB E-COMMERCE & BUENOS AIRES FLEX (UNIFICADO) */}
      {activeSection === "prospeccion" && (
        <MartinProspectingCenter
          prospects={prospects}
          setProspects={setProspects}
          searchNiche={searchNiche}
          setSearchNiche={setSearchNiche}
          searchLocation={searchLocation}
          setSearchLocation={setSearchLocation}
          isSearchingProspects={isSearchingProspects}
          handleSearchWebProspects={handleSearchWebProspects}
          campaignService={campaignService}
          setCampaignService={setCampaignService}
          campaignGoal={campaignGoal}
          setCampaignGoal={setCampaignGoal}
          campaignCustomInstruction={campaignCustomInstruction}
          setCampaignCustomInstruction={setCampaignCustomInstruction}
          handleStartProspectCall={handleStartProspectCall}
          handleSendProspectWhatsApp={handleSendProspectWhatsApp}
          handleOpenAppointmentModal={handleOpenAppointmentModal}
          userDisplayName={userDisplayName}
          flexPricing={flexPricing}
          setFlexPricing={setFlexPricing}
          speechConfig={speechConfig}
          setSpeechConfig={setSpeechConfig}
          onOpenSpeechConfig={() => setActiveSection("configuracion")}
          onOpenContactsIntegration={() => setActiveSection("integracion_contactos")}
          onOpenBranchOrders={() => setActiveSection("directivas_pedidos")}
        />

      )}

      {/* SECTION 1.5: INTEGRACIÓN Y MAPEO DE CONTACTOS DE WHATSAPP */}
      {activeSection === "integracion_contactos" && (
        <MartinContactsIntegrationSection
          prospects={prospects}
          setProspects={setProspects}
          flexPricing={flexPricing}
          speechConfig={speechConfig}
          userDisplayName={userDisplayName}
          onNavigateToProspects={() => setActiveSection("prospeccion")}
        />
      )}

      {/* SECTION 1.7: DIRECTIVAS DE WHATSAPP, PEDIDOS DE SUCURSALES & CONSOLIDADOR */}
      {activeSection === "directivas_pedidos" && (
        <MartinBranchOrdersConsolidator
          userDisplayName={userDisplayName}
          onOpenChatWithMartin={onOpenChatWithMartin}
          googleToken={googleToken}
        />
      )}


      {/* SECTION 2: CONFIGURACIÓN DE SPEECHES Y CANAL GEMINI */}
      {activeSection === "configuracion" && (
        <MartinSpeechConfigSection
          speechConfig={speechConfig}
          setSpeechConfig={setSpeechConfig}
          flexPricing={flexPricing}
          setFlexPricing={setFlexPricing}
        />
      )}

      {/* SECTION 3: AGENDA DE CITAS Y REUNIONES COMERCIALES */}
      {activeSection === "citas" && (
        <MartinAppointmentsSection
          appointments={appointments}
          handleStartOutgoingCall={handleStartOutgoingCall}
          setActiveSection={setActiveSection}
          onDeleteAppointment={handleDeleteAppointment}
        />
      )}

      {/* SECTION 4: AUDITORÍAS, ALARMAS Y TAREAS CON AVISO POR LLAMADA */}
      {activeSection === "auditorias" && (
        <MartinAuditsSection
          customTaskTitle={customTaskTitle}
          setCustomTaskTitle={setCustomTaskTitle}
          isTaskProcessing={isTaskProcessing}
          taskProgress={taskProgress}
          handleStartCustomTaskWithCall={handleStartCustomTaskWithCall}
          handleDownloadVCard={handleDownloadVCard}
          triggerIncomingAlertCall={triggerIncomingAlertCall}
          minMismatchAmount={minMismatchAmount}
          setMinMismatchAmount={setMinMismatchAmount}
          notifyIncomingCall={notifyIncomingCall}
          setNotifyIncomingCall={setNotifyIncomingCall}
          notifyWhatsapp={notifyWhatsapp}
          setNotifyWhatsapp={setNotifyWhatsapp}
          noemiPhone={noemiPhone}
          userDisplayName={userDisplayName}
          handleStartOutgoingCall={handleStartOutgoingCall}
          auditLog={auditLog}
          onOpenChatWithMartin={onOpenChatWithMartin}
        />
      )}

      {/* Appointment Scheduling Modal */}
      <AnimatePresence>
        {appointmentModal.isOpen && appointmentModal.prospect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setAppointmentModal(prev => ({ ...prev, isOpen: false }));
            }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Agendar Cita Comercial</h3>
                    <p className="text-xs text-slate-500">{appointmentModal.prospect.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAppointmentModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Teléfono:</strong> {appointmentModal.prospect.phone}
                  </p>
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Rubro:</strong> {appointmentModal.prospect.category}
                  </p>
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Servicio a Presentar:</strong> {campaignService}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Día / Fecha:</label>
                    <input
                      type="text"
                      value={appointmentModal.date}
                      onChange={(e) => setAppointmentModal(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="Ej: Mañana, Jueves 15..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Hora:</label>
                    <input
                      type="text"
                      value={appointmentModal.time}
                      onChange={(e) => setAppointmentModal(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="Ej: 15:30"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Notas & Puntos Clave para la Reunión:</label>
                  <textarea
                    rows={2}
                    value={appointmentModal.notes}
                    onChange={(e) => setAppointmentModal(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Objetivos de la reunión, tarifas a negociar..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAppointmentModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmScheduleAppointment}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar & Notificar WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Phone Call Overlay Modal (Full-Duplex Voice & Gemini Real Dialogue) */}
      <AnimatePresence>
        {isCallActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleEndCall();
            }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden flex flex-col cursor-default"
            >
              {/* Close X Button in top right */}
              <button
                onClick={handleEndCall}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-rose-600 rounded-full transition-all cursor-pointer z-20"
                title="Cerrar y Apagar Llamada (ESC)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Pulsing Call Glow Background */}
              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />

              {/* Call Header info */}
              <div className="space-y-3 relative z-10">
                <div className="inline-flex p-4 rounded-full bg-slate-800 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 relative">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-3xl font-black text-white">
                    <Headphones className="w-9 h-9 text-white animate-bounce" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
                </div>

                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                    {callType === "outgoing" ? "📞 LLAMADA SALIENTE EN CURSO" : "🔔 LLAMADA ENTRANTE DE ALERTA"} • {formatTime(callDuration)}
                  </span>
                  <h2 className="text-xl font-extrabold text-white">{callContactName}</h2>
                  <p className="text-xs font-mono text-slate-400">{callContactNumber}</p>
                </div>
              </div>

              {/* Call Reason if Alert */}
              {callReasonData && (
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-left space-y-1.5 relative z-10 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-rose-400 uppercase font-mono text-[10px]">
                      ⚠️ Motivo de la Alarma
                    </span>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[10px]">
                      {callReasonData.risk.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-bold text-white text-sm">{callReasonData.title}</p>
                  <p className="text-slate-300 text-xs">{callReasonData.description}</p>
                </div>
              )}

              {/* Live Audio Dialogue Box */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-left space-y-3 relative z-10 max-h-48 overflow-y-auto scrollbar-thin">
                {callTranscript.map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 text-xs ${
                      t.sender === "martin" ? "text-emerald-300 font-medium" : "text-white font-bold justify-end"
                    }`}
                  >
                    {t.sender === "martin" && (
                      <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded text-[9px] font-mono shrink-0">
                        MARTÍN
                      </span>
                    )}
                    <p className={`p-2.5 rounded-xl max-w-[85%] ${t.sender === "martin" ? "bg-slate-800/90 text-slate-100" : "bg-indigo-600 text-white"}`}>
                      {t.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status bar */}
              <div className="p-3 bg-slate-800/80 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-300 relative z-10">
                {isSpeaking ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    Martín está hablando con voz masculina...
                  </span>
                ) : isMicListening ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 animate-pulse" />
                    Escuchando lo que dices...
                  </span>
                ) : isAiProcessing ? (
                  <span className="text-indigo-300 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Martín procesando con Gemini...
                  </span>
                ) : (
                  <span>{callStatusMessage}</span>
                )}
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 relative z-10 pt-1">
                <button
                  onClick={startListeningUserVoice}
                  className={`p-3.5 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-lg ${
                    isMicListening 
                      ? "bg-amber-500 text-slate-950 scale-110 shadow-amber-500/40" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                  title="Hablar por micrófono con Martín"
                >
                  <Mic className="w-6 h-6" />
                </button>

                <button
                  onClick={handleEndCall}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  title="Finalizar llamada"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Cortar Llamada</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
