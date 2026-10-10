import React, { useState, useRef } from "react";
import {
  Search,
  Smartphone,
  PhoneCall,
  MessageSquare,
  Calendar,
  Truck,
  Target,
  RefreshCw,
  Plus,
  Clipboard,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Tag,
  DollarSign,
  Edit3,
  Trash2,
  Share2,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Boxes,
  FileText,
  MapPin,
  Clock,
  ArrowUpRight,
  Phone,
  Copy
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import { ProspectLead, CustomSalesSpeechConfig, CommunicationMode, SalesStrategy } from "../types";
import { speakMartin, stopMartinSpeech } from "../lib/maleVoicePicker";
import { sendWhatsAppMessage } from "../lib/whatsappSender";
import { WhatsAppModeSelector } from "./WhatsAppModeSelector";

export interface FlexPricing {
  motoFlex: string;
  caminante: string;
  puntoRetiro: string;
  furgon: string;
  promoDiscount: string;
}

// 📦 GENERADOR DE DOSSIER DE INFORMACIÓN COMPLETA Y TARIFARIO DETALLADO
export const generateCompleteInfoMessage = (
  prospectName: string,
  pricing: FlexPricing,
  clientNote?: string,
  customStrategy: string = "cierre_agresivo"
): string => {
  const cleanName = prospectName || "Estimado cliente";
  const noteSection = clientNote && clientNote.trim()
    ? `\n📌 *Sobre tu consulta ("${clientNote.trim()}"):*\nEntendemos tu necesidad y la cubrimos de forma prioritaria con nuestra flota de motos y furgones.\n`
    : "";

  return `¡Hola ${cleanName}! 📦 Les escribe Martín, Director de Operaciones de Logística X (Buenos Aires Flex).

Muchas gracias por su respuesta. Con gusto les acerco la *Información Completa y Tarifario Detallado* para sus envíos e-commerce en CABA y AMBA:

🚀 *TARIFARIO DETALLADO & SERVICIOS FLEX:*
• 🛵 *Moto Flex Same-Day (En el Día):* ${pricing.motoFlex} (CABA y 1er cordón)
• 🚶 *Caminantes Radio Corto:* ${pricing.caminante}
• 📦 *Red de 10 Puntos de Retiro CABA:* ${pricing.puntoRetiro} (Modalidad drop-off con retiro sin costo para el comprador)
• 🚐 *Furgón / Bultos Medianos y Grandes:* ${pricing.furgon}
• 🎁 *Beneficio Exclusivo:* ${pricing.promoDiscount} bonificado en sus primeros 15 días sin costo de activación ni contratos de permanencia.${noteSection}
⏰ *HORARIOS Y LOGÍSTICA DE OPERACIÓN:*
• Colecta en su local o depósito: 13:00 a 14:30 hs.
• Entrega garantizada a domicilio: 15:00 a 21:00 hs con seguimiento en tiempo real.
• Rendición de cobros contra entrega (efectivo/transferencia) en 24 hs.

¿Les gustaría que activemos su cuenta de prueba piloto hoy mismo o prefieren coordinar una breve llamada de 5 minutos?

Quedo a su entera disposición.
*Martín • Director de Operaciones Logística X*
Buenos Aires Flex`;
};

// 📍 GENERADOR DE ENFOQUE EN RED DE 10 PUNTOS DE RETIRO EN CABA
export const generatePickupPointsMessage = (
  prospectName: string,
  pricing: FlexPricing
): string => {
  const cleanName = prospectName || "Estimado cliente";
  return `¡Hola ${cleanName}! 📍 Les escribe Martín de Logística X (Buenos Aires Flex).

Con gusto les detallo nuestra *Red Estratégica de 10 Puntos de Retiro en CABA* para e-commerce:

🏬 *COBERTURA DE PUNTOS DROP-OFF & PICK-UP:*
1. Palermo Soho / Hollywood
2. Recoleta / Barrio Norte
3. Belgrano / Colegiales
4. Caballito Centro
5. Villa Urquiza / Villa del Parque
6. Microcentro / San Nicolás
7. Almagro / Abasto
8. Flores / Parque Chacabuco
9. San Telmo / Puerto Madero
10. Villa Crespo

💰 *Tarifa por paquete retirado:* ${pricing.puntoRetiro} (con ${pricing.promoDiscount} de descuento de bienvenida).
📦 Sus compradores retiran cuando les queda cómodo, sin costo adicional.

¿Les gustaría sumar estos 10 puntos de retiro a su tienda online esta misma semana?`;
};

// 📅 GENERADOR PARA AGENDAR LLAMADA RÁPIDA DE 5 MINUTOS
export const generateQuickCallBookingMessage = (
  prospectName: string,
  pricing: FlexPricing
): string => {
  const cleanName = prospectName || "Estimado cliente";
  return `¡Hola ${cleanName}! 📞 Les saluda Martín, Director de Operaciones de Logística X.

Muchas gracias por su respuesta. Para mostrarles cómo podemos bajar sus costos logísticos con Moto Flex a ${pricing.motoFlex} y 10 puntos de retiro con ${pricing.promoDiscount}:

¿Les queda bien coordinar una breve llamada de 5 minutos hoy a la tarde o mañana a las 11:00 hs?

Quedo atento a su confirmación. ¡Muchas gracias!`;
};

interface MartinProspectingCenterProps {
  prospects: ProspectLead[];
  setProspects: React.Dispatch<React.SetStateAction<ProspectLead[]>>;
  searchNiche: string;
  setSearchNiche: (niche: string) => void;
  searchLocation: string;
  setSearchLocation: (location: string) => void;
  isSearchingProspects: boolean;
  handleSearchWebProspects: () => void;
  campaignService: string;
  setCampaignService: (service: string) => void;
  campaignGoal: "agendar_reunion" | "enviar_whatsapp" | "prueba_piloto";
  setCampaignGoal: (goal: "agendar_reunion" | "enviar_whatsapp" | "prueba_piloto") => void;
  campaignCustomInstruction: string;
  setCampaignCustomInstruction: React.Dispatch<React.SetStateAction<string>>;
  handleStartProspectCall: (prospect: ProspectLead) => void;
  handleSendProspectWhatsApp: (prospect: ProspectLead) => void;
  handleOpenAppointmentModal: (prospect: ProspectLead) => void;
  userDisplayName?: string;
  flexPricing: FlexPricing;
  setFlexPricing: React.Dispatch<React.SetStateAction<FlexPricing>>;
  speechConfig?: CustomSalesSpeechConfig;
  setSpeechConfig?: React.Dispatch<React.SetStateAction<CustomSalesSpeechConfig>>;
  onOpenSpeechConfig?: () => void;
  onOpenContactsIntegration?: () => void;
  onOpenBranchOrders?: () => void;
}

export const MartinProspectingCenter: React.FC<MartinProspectingCenterProps> = ({
  prospects,
  setProspects,
  searchNiche,
  setSearchNiche,
  searchLocation,
  setSearchLocation,
  isSearchingProspects,
  handleSearchWebProspects,
  campaignService,
  setCampaignService,
  campaignGoal,
  setCampaignGoal,
  campaignCustomInstruction,
  setCampaignCustomInstruction,
  handleStartProspectCall,
  handleSendProspectWhatsApp,
  handleOpenAppointmentModal,
  userDisplayName = "Noemí Carvallo",
  flexPricing,
  setFlexPricing,
  speechConfig,
  setSpeechConfig,
  onOpenSpeechConfig,
  onOpenContactsIntegration,
  onOpenBranchOrders
}) => {

  // Modal for Manual Prospect / WhatsApp Entry
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"single" | "bulk" | "file">("single");
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualCategory, setManualCategory] = useState("Indumentaria & Calzado");
  const [manualLocation, setManualLocation] = useState("Buenos Aires Flex / CABA");
  const [manualVolume, setManualVolume] = useState("300 envíos/mes");
  const [manualPainPoint, setManualPainPoint] = useState("Búsqueda de entregas rápidas Flex en el día y reducción de costos de flete.");
  const [manualWebsite, setManualWebsite] = useState("");
  const [manualPasteInput, setManualPasteInput] = useState("");
  const [bulkText, setBulkText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agenda Send Modal State (for sending proposal to WhatsApp contacts and tracking them)
  const [isAgendaSendModalOpen, setIsAgendaSendModalOpen] = useState(false);
  const [agendaContactName, setAgendaContactName] = useState("");
  const [agendaContactPhone, setAgendaContactPhone] = useState("");

  // Universal Client Reply & Complete Info Modal State
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyMode, setReplyMode] = useState<"existing" | "new">("existing");
  const [selectedProspectForReply, setSelectedProspectForReply] = useState<ProspectLead | null>(null);
  const [replyNewName, setReplyNewName] = useState("");
  const [replyNewPhone, setReplyNewPhone] = useState("");
  const [clientReplyText, setClientReplyText] = useState("");
  const [followupType, setFollowupType] = useState<"complete_info" | "ai_custom" | "pickup_points" | "schedule_call">("complete_info");
  const [preparedFollowupMessage, setPreparedFollowupMessage] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [lastActionProspect, setLastActionProspect] = useState<ProspectLead | null>(null);

  // Live Real-Time Martin Assistant in Call Center
  const [martinInputPrompt, setMartinInputPrompt] = useState("");
  const [isMartinTalking, setIsMartinTalking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [martinResponseText, setMartinResponseText] = useState<string | null>(
    "Hola Noemí, acá estoy firme en el Call Center. Decime con qué e-commerce o zona arrancamos a buscar clientes hoy para Buenos Aires Flex y armamos la prospección al toque."
  );
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const micRecognitionRef = useRef<any>(null);

  // Toggle Pricing & Speech Editor Panel
  const [showEditorPanel, setShowEditorPanel] = useState(true);

  // Quick command chips for Martin
  const quickCommands = [
    { label: "🛵 Clientes para Buenos Aires Flex", text: "Martín, hoy vamos a trabajar desde el call center buscando clientes para Logística Buenos Aires Flex con entregas en el día." },
    { label: "👗 Tiendas de Ropa en CABA", text: "Martín, busquemos tiendas de ropa e indumentaria en CABA que necesiten puntos de retiro y entregas 24hs." },
    { label: "💄 E-commerce de Cosmética", text: "Martín, busquemos tiendas de cosmética y estética en Gran Buenos Aires para ofrecer packaging y distribución." },
    { label: "💰 Actualizar Tarifas y Descuentos", text: "Martín, ajustemos la tarifa de moto Flex a $2.800 y apliquemos 25% de descuento en la primera semana." }
  ];

  // Paste / parse from clipboard
  const handlePasteFromWhatsApp = async () => {
    try {
      let text = manualPasteInput;
      if (!text && navigator.clipboard) {
        text = await navigator.clipboard.readText();
      }
      if (text) {
        setManualPasteInput(text);
        const phoneMatch = text.match(/(?:\+?54\s*9?)?\s*(?:11|\d{2,4})\s*\d{3,4}[-\s]?\d{4}/);
        if (phoneMatch) {
          setManualPhone(phoneMatch[0].trim());
        }
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 0 && !lines[0].includes("+") && !lines[0].includes("http")) {
          setManualName(lines[0]);
        }
      }
    } catch (e) {
      console.warn("Could not read clipboard:", e);
    }
  };

  // Helper to render customized sales speech with variables
  const renderCustomSpeechTemplate = (type: "whatsapp" | "call" | "reply", name: string, category: string = "E-commerce") => {
    let tpl = "";
    if (type === "whatsapp") {
      tpl = speechConfig?.whatsappSpeechTemplate || `¡Hola equipo de {nombre_comercio}! 📦 Les escribe Martín, Director de Operaciones de Logística X (Buenos Aires Flex).\n\nQueremos presentarles nuestra solución de distribución express y puntos de retiro para e-commerce en CABA y GBA:\n\n🚀 *Tarifas Especiales E-commerce:*\n• Moto Flex Same-Day (En el Día): {tarifa_moto}\n• Caminantes Radio Corto: {tarifa_caminante}\n• 10 Puntos de Retiro Estratégicos: {tarifa_puntos}\n• Furgón / Bultos Grandes: {tarifa_furgon}\n• Beneficio Exclusivo: {descuento_promo} en tus primeros 15 días.\n\n¿Les gustaría coordinar una breve llamada de 10 minutos o recibir el tarifario completo en PDF?`;
    } else if (type === "call") {
      tpl = speechConfig?.callOpeningSpeechTemplate || `Hola, ¿qué tal? Te habla Martín, Director de Operaciones de Logística X (Buenos Aires Flex). Te contacto porque estuvimos analizando los envíos de {nombre_comercio}. Contamos con entregas en el día desde {tarifa_moto} y una red de 10 puntos de retiro en CABA desde {tarifa_puntos} con {descuento_promo} de bienvenida. ¿Tenés 2 minutos para contarte cómo podemos reducir sus costos de logística?`;
    } else {
      tpl = speechConfig?.replyFollowupSpeechTemplate || `Hola {nombre_comercio}, ¡muchas gracias por tu respuesta! 📦 Para coordinar los envíos Flex y el beneficio del {descuento_promo}, ¿te queda cómodo que te llame en 5 minutos o preferís que te pase los detalles de retiro por acá?`;
    }

    tpl = tpl.replace(/\{nombre_comercio\}/g, name);
    tpl = tpl.replace(/\{rubro\}/g, category);
    tpl = tpl.replace(/\{tarifa_moto\}/g, flexPricing.motoFlex);
    tpl = tpl.replace(/\{tarifa_caminante\}/g, flexPricing.caminante);
    tpl = tpl.replace(/\{tarifa_puntos\}/g, flexPricing.puntoRetiro);
    tpl = tpl.replace(/\{tarifa_furgon\}/g, flexPricing.furgon);
    tpl = tpl.replace(/\{descuento_promo\}/g, flexPricing.promoDiscount);
    return tpl;
  };

  // Process Bulk Numbers from text
  const handleProcessBulkNumbers = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    const added: ProspectLead[] = [];

    lines.forEach((line, idx) => {
      const phoneMatch = line.match(/(?:\+?54\s*9?)?\s*(?:11|\d{2,4})\s*\d{3,4}[-\s]?\d{4}/) || line.match(/\d{8,14}/);
      if (phoneMatch) {
        const rawPhone = phoneMatch[0].trim();
        const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanDigits.startsWith("549") 
          ? `+${cleanDigits}` 
          : cleanDigits.startsWith("11") 
          ? `+54 9 ${cleanDigits}` 
          : `+54 9 ${cleanDigits}`;
        
        let candidateName = line.replace(rawPhone, "").replace(/[-:;,•]/g, " ").trim();
        if (!candidateName || candidateName.length < 2) {
          candidateName = `Contacto E-commerce #${idx + 1}`;
        }

        const generatedPitch = renderCustomSpeechTemplate("call", candidateName, "E-Commerce / Tienda Online");
        const generatedWhatsApp = renderCustomSpeechTemplate("whatsapp", candidateName, "E-Commerce / Tienda Online");

        added.push({
          id: `bulk-${Date.now()}-${idx}`,
          name: candidateName,
          phone: formattedPhone,
          category: "E-Commerce / Tienda Online",
          location: "CABA / Buenos Aires Flex",
          websiteOrIg: "@tienda.online",
          estimatedVolume: "300 envíos/mes",
          painPoint: "Búsqueda de entregas rápidas Flex en el día y tarifas convenientes.",
          callPitch: generatedPitch,
          whatsappMessage: generatedWhatsApp,
          status: "nuevo"
        });
      }
    });

    if (added.length > 0) {
      setProspects(prev => [...added, ...prev]);
      setBulkText("");
      setIsManualModalOpen(false);
      const msg = `¡Excelente Noemí! Cargué ${added.length} nuevos números al directorio de Buenos Aires Flex con sus propuestas listas para enviar o llamar.`;
      setMartinResponseText(msg);
      speakMartin(msg);
    } else {
      alert("No se detectaron números de teléfono válidos en el texto. Asegurate de incluir números como 1123456789 o +54 9 11...");
    }
  };

  // Upload contact file (.vcf, .csv, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = (ev.target?.result as string) || "";
      if (file.name.endsWith(".vcf")) {
        const vcardCards = content.split(/BEGIN:VCARD/i);
        const added: ProspectLead[] = [];
        vcardCards.forEach((card, idx) => {
          const fnMatch = card.match(/FN:(.+)/i) || card.match(/N:(.+)/i);
          const telMatch = card.match(/TEL[^:]*:(.+)/i);
          if (telMatch) {
            const rawPhone = telMatch[1].trim();
            const name = fnMatch ? fnMatch[1].replace(/;/g, " ").trim() : `Contacto WhatsApp #${idx + 1}`;
            const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
            const formattedPhone = cleanDigits.startsWith("54") ? `+${cleanDigits}` : `+54 9 ${cleanDigits}`;
            
            const generatedPitch = renderCustomSpeechTemplate("call", name, "Contacto WhatsApp");
            const generatedWhatsApp = renderCustomSpeechTemplate("whatsapp", name, "Contacto WhatsApp");

            added.push({
              id: `vcf-${Date.now()}-${idx}`,
              name,
              phone: formattedPhone,
              category: "Contacto WhatsApp",
              location: "Buenos Aires Flex",
              websiteOrIg: "@contacto",
              estimatedVolume: "200 envíos/mes",
              painPoint: "Logística y envíos rápidos en CABA y AMBA.",
              callPitch: generatedPitch,
              whatsappMessage: generatedWhatsApp,
              status: "nuevo"
            });
          }
        });
        if (added.length > 0) {
          setProspects(prev => [...added, ...prev]);
          setIsManualModalOpen(false);
          const msg = `¡Listo Noemí! Se importaron ${added.length} contactos desde tu archivo de WhatsApp vCard.`;
          setMartinResponseText(msg);
          speakMartin(msg);
          return;
        }
      }
      setBulkText(content);
      setModalTab("bulk");
    };
    reader.readAsText(file);
  };

  // submit Manual Prospect
  const handleSubmitManualProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      alert("Por favor ingresá al menos el nombre del comercio y su número de teléfono / WhatsApp.");
      return;
    }

    const cleanPhone = manualPhone.startsWith("+") ? manualPhone : `+54 9 ${manualPhone.replace(/[^0-9]/g, "")}`;
    const generatedPitch = renderCustomSpeechTemplate("call", manualName.trim(), manualCategory);
    const generatedWhatsApp = renderCustomSpeechTemplate("whatsapp", manualName.trim(), manualCategory);

    const newProspect: ProspectLead = {
      id: `manual-pros-${Date.now()}`,
      name: manualName.trim(),
      phone: cleanPhone,
      category: manualCategory,
      location: manualLocation,
      websiteOrIg: manualWebsite.trim() || "@tienda.online",
      estimatedVolume: manualVolume,
      painPoint: manualPainPoint,
      callPitch: generatedPitch,
      whatsappMessage: generatedWhatsApp,
      status: "nuevo"
    };

    setProspects(prev => [newProspect, ...prev]);

    // Reset and close
    setManualName("");
    setManualPhone("");
    setManualWebsite("");
    setManualPasteInput("");
    setIsManualModalOpen(false);
  };

  // Open Reply Modal for a specific prospect
  const handleOpenReplyModal = (prospect: ProspectLead) => {
    setSelectedProspectForReply(prospect);
    setReplyMode("existing");
    setReplyNewName(prospect.name);
    setReplyNewPhone(prospect.phone);
    setClientReplyText(prospect.clientResponseNote || "");
    setFollowupType("complete_info");
    const fullMsg = generateCompleteInfoMessage(prospect.name, flexPricing, prospect.clientResponseNote);
    setPreparedFollowupMessage(fullMsg);
    setIsReplyModalOpen(true);
  };

  // Open modal specifically focused on Complete Information Dossier
  const handleOpenCompleteInfoModal = (prospect: ProspectLead) => {
    setSelectedProspectForReply(prospect);
    setReplyMode("existing");
    setReplyNewName(prospect.name);
    setReplyNewPhone(prospect.phone);
    setClientReplyText(prospect.clientResponseNote || "");
    setFollowupType("complete_info");
    const fullMsg = generateCompleteInfoMessage(prospect.name, flexPricing, prospect.clientResponseNote);
    setPreparedFollowupMessage(fullMsg);
    setIsReplyModalOpen(true);
  };

  // Open Universal Reply Modal (works for ANY contact, even if not yet in the list)
  const handleOpenUniversalReplyModal = () => {
    const target = prospects.length > 0 ? prospects[0] : null;
    setSelectedProspectForReply(target);
    setReplyMode(target ? "existing" : "new");
    setReplyNewName(target ? target.name : "");
    setReplyNewPhone(target ? target.phone : "");
    setClientReplyText("");
    setFollowupType("complete_info");
    const fullMsg = generateCompleteInfoMessage(target ? target.name : "Contacto WhatsApp", flexPricing, "");
    setPreparedFollowupMessage(fullMsg);
    setIsReplyModalOpen(true);
  };

  // Switch follow-up type inside modal
  const handleChangeFollowupType = async (type: "complete_info" | "ai_custom" | "pickup_points" | "schedule_call") => {
    setFollowupType(type);
    const targetName = replyMode === "new" ? (replyNewName || "Contacto WhatsApp") : (selectedProspectForReply?.name || "Estimado cliente");
    
    if (type === "complete_info") {
      setPreparedFollowupMessage(generateCompleteInfoMessage(targetName, flexPricing, clientReplyText));
    } else if (type === "pickup_points") {
      setPreparedFollowupMessage(generatePickupPointsMessage(targetName, flexPricing));
    } else if (type === "schedule_call") {
      setPreparedFollowupMessage(generateQuickCallBookingMessage(targetName, flexPricing));
    } else if (type === "ai_custom") {
      await handleGenerateAIReply(targetName);
    }
  };

  // Generate customized AI follow-up using Gemini API
  const handleGenerateAIReply = async (customTargetName?: string) => {
    const targetName = customTargetName || (replyMode === "new" ? (replyNewName || "Contacto WhatsApp") : (selectedProspectForReply?.name || "Estimado cliente"));
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/martin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `El cliente ${targetName} nos respondió por WhatsApp: "${clientReplyText || "Me interesa, pasame la información completa y tarifas"}".
Escribe la respuesta comercial de seguimiento EXACTA para enviar por WhatsApp. 
Debe ser en primera persona como Martín (Director de Operaciones de Logística X / Buenos Aires Flex).
Incluye de forma clara y atractiva:
- Agradecimiento por su respuesta
- Tarifario completo: Moto Flex ${flexPricing.motoFlex} (CABA y 1er cordón), Caminante ${flexPricing.caminante}, Red de 10 Puntos de Retiro CABA ${flexPricing.puntoRetiro}, Furgón ${flexPricing.furgon}
- Beneficio de bienvenida: ${flexPricing.promoDiscount} en los primeros 15 días sin costo de activación ni contratos de permanencia
- Horarios de colecta (13:00 a 14:30 hs) y entrega garantizada en el día (15:00 a 21:00 hs)
- Pregunta de cierre para activar prueba piloto o llamada de 5 minutos.
IMPORTANTE: Escribe DIRECTAMENTE el texto que recibirá el cliente en WhatsApp (con formato WhatsApp: negritas *así* y emojis). NO agregues saludos para Noemí ni frases introductorias como 'Hola Noemí te sugiero'.`,
          systemInstruction: `Sos Martín, Director de Operaciones de Logística X (Buenos Aires Flex). Generá directamente el texto del mensaje de WhatsApp que le enviaremos al cliente ${targetName}.`
        })
      });
      const data = await response.json();
      let aiText = data.text || data.response || data.message;
      if (aiText) {
        aiText = aiText.replace(/^Hola Noemí[^\n]*\n+/i, "").replace(/^Estimada Noemí[^\n]*\n+/i, "");
        setPreparedFollowupMessage(aiText.trim());
      } else {
        setPreparedFollowupMessage(generateCompleteInfoMessage(targetName, flexPricing, clientReplyText));
      }
    } catch (err) {
      console.warn("AI Follow-up fallback:", err);
      setPreparedFollowupMessage(generateCompleteInfoMessage(targetName, flexPricing, clientReplyText));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Send Complete Info / Follow-up directly to WhatsApp
  const handleSendFollowupNow = () => {
    if (!preparedFollowupMessage.trim()) return;

    let targetProspect: ProspectLead;
    let isNew = false;

    if (replyMode === "new" || !selectedProspectForReply) {
      isNew = true;
      const cleanName = replyNewName.trim() || `Contacto WhatsApp #${prospects.length + 1}`;
      const rawDigits = replyNewPhone.replace(/[^0-9]/g, "");
      const cleanPhone = rawDigits 
        ? (rawDigits.startsWith("54") ? `+${rawDigits}` : `+54 9 ${rawDigits}`) 
        : "+54 9 11 (WhatsApp)";

      targetProspect = {
        id: `pros-reply-${Date.now()}`,
        name: cleanName,
        phone: cleanPhone,
        category: "Contacto de WhatsApp",
        location: "Buenos Aires Flex / CABA",
        websiteOrIg: "@contacto.whatsapp",
        estimatedVolume: "200 envíos/mes",
        painPoint: "Logística y envíos express Flex.",
        callPitch: renderCustomSpeechTemplate("call", cleanName),
        whatsappMessage: preparedFollowupMessage,
        status: "info_completa_enviada",
        hasReceivedCompleteInfo: true,
        clientResponseNote: clientReplyText.trim() || "Solicitó info completa",
        lastContactDate: new Date().toLocaleDateString("es-AR")
      };

      setProspects(prev => [targetProspect, ...prev]);
    } else {
      targetProspect = selectedProspectForReply;
      setProspects(prev => prev.map(p => {
        if (p.id === targetProspect.id) {
          return {
            ...p,
            status: "info_completa_enviada",
            hasReceivedCompleteInfo: true,
            clientResponseNote: clientReplyText.trim() || p.clientResponseNote || "Solicitó info completa",
            whatsappMessage: preparedFollowupMessage,
            lastContactDate: new Date().toLocaleDateString("es-AR")
          };
        }
        return p;
      }));
    }

    setLastActionProspect(targetProspect);

    // Send immediately via WhatsApp
    sendWhatsAppMessage({
      phone: targetProspect.phone,
      message: preparedFollowupMessage
    });

    const notifyMsg = `¡Enviado! Le mandamos la información completa a ${targetProspect.name} por WhatsApp. Su ficha quedó actualizada con el tarifario y seguimiento listo.`;
    setMartinResponseText(notifyMsg);
    speakMartin(`¡Impecable Noemí! Le mandamos la información completa y el tarifario a ${targetProspect.name}. Ficha actualizada.`);

    setIsReplyModalOpen(false);
  };

  // Save Complete Info to Prospect Card for later 1-click WhatsApp sending
  const handleSaveFollowupToProspect = () => {
    if (!preparedFollowupMessage.trim()) return;

    let targetProspect: ProspectLead;

    if (replyMode === "new" || !selectedProspectForReply) {
      const cleanName = replyNewName.trim() || `Contacto WhatsApp #${prospects.length + 1}`;
      const rawDigits = replyNewPhone.replace(/[^0-9]/g, "");
      const cleanPhone = rawDigits 
        ? (rawDigits.startsWith("54") ? `+${rawDigits}` : `+54 9 ${rawDigits}`) 
        : "+54 9 11 (WhatsApp)";

      targetProspect = {
        id: `pros-reply-${Date.now()}`,
        name: cleanName,
        phone: cleanPhone,
        category: "Contacto de WhatsApp",
        location: "Buenos Aires Flex / CABA",
        websiteOrIg: "@contacto.whatsapp",
        estimatedVolume: "200 envíos/mes",
        painPoint: "Logística y envíos express Flex.",
        callPitch: renderCustomSpeechTemplate("call", cleanName),
        whatsappMessage: preparedFollowupMessage,
        status: "info_completa_enviada",
        hasReceivedCompleteInfo: true,
        clientResponseNote: clientReplyText.trim() || "Info completa guardada",
        lastContactDate: new Date().toLocaleDateString("es-AR")
      };

      setProspects(prev => [targetProspect, ...prev]);
    } else {
      targetProspect = selectedProspectForReply;
      setProspects(prev => prev.map(p => {
        if (p.id === selectedProspectForReply.id) {
          return {
            ...p,
            status: "info_completa_enviada",
            hasReceivedCompleteInfo: true,
            clientResponseNote: clientReplyText.trim() || p.clientResponseNote,
            whatsappMessage: preparedFollowupMessage,
            lastContactDate: new Date().toLocaleDateString("es-AR")
          };
        }
        return p;
      }));
    }

    setLastActionProspect(targetProspect);

    const saveMsg = `Guardé la información completa en la ficha de ${targetProspect.name}. Al presionar WhatsApp en su tarjeta, se enviará este mensaje.`;
    setMartinResponseText(saveMsg);
    speakMartin(`¡Listo Noemí! Guardé la información completa en la ficha de ${targetProspect.name}.`);
    setIsReplyModalOpen(false);
  };

  // Confirm sending to Agenda Contact and automatically integrate it into panel
  const handleConfirmSendToAgendaContact = (customName?: string, customPhone?: string) => {
    const finalName = customName?.trim() || agendaContactName.trim() || `Contacto WhatsApp #${prospects.length + 1}`;
    const rawDigits = (customPhone || agendaContactPhone).replace(/[^0-9]/g, "");
    const cleanDigits = rawDigits ? (rawDigits.startsWith("54") ? rawDigits : `549${rawDigits}`) : "";
    const displayPhone = cleanDigits ? `+${cleanDigits}` : "+54 9 11 (WhatsApp)";

    const generatedPitch = renderCustomSpeechTemplate("call", finalName, "Contacto WhatsApp");
    const generatedWhatsApp = renderCustomSpeechTemplate("whatsapp", finalName, "Contacto WhatsApp");

    const newLead: ProspectLead = {
      id: `agenda-pros-${Date.now()}`,
      name: finalName,
      phone: displayPhone,
      category: "Contacto de mi Agenda",
      location: "Buenos Aires Flex / CABA",
      websiteOrIg: "@whatsapp",
      estimatedVolume: "200 envíos/mes",
      painPoint: "Distribución Flex y puntos de retiro.",
      callPitch: generatedPitch,
      whatsappMessage: generatedWhatsApp,
      status: "whatsapp_enviado"
    };

    // Integrate prospect into the panel immediately
    setProspects(prev => [newLead, ...prev]);

    sendWhatsAppMessage({
      phone: cleanDigits || agendaContactPhone,
      message: generatedWhatsApp
    });

    setIsAgendaSendModalOpen(false);
    setAgendaContactName("");
    setAgendaContactPhone("");

    const msg = `¡Listo Noemí! Agregué a ${finalName} al panel con el WhatsApp enviado. Cuando te conteste, presioná el botón "El cliente me respondió" en su ficha para que analicemos su respuesta con IA.`;
    setMartinResponseText(msg);
    speakMartin(msg);
  };

  // Open WhatsApp to send proposal to ANY contact from user's own agenda
  const handleOpenMyWhatsAppToAnyContact = () => {
    setIsAgendaSendModalOpen(true);
  };

  // Reset / Clear all mock prospects
  const handleClearProspectsList = () => {
    if (window.confirm("¿Querés limpiar la lista de prospectos para empezar con una lista vacía o fresca?")) {
      setProspects([]);
    }
  };

  // Interactive Live Chat with Martin in Call Center (Gemini Agent)
  const handleTalkToMartin = async (overrideText?: string) => {
    const textToSend = (overrideText || martinInputPrompt).trim();
    if (!textToSend) return;

    setMartinInputPrompt("");
    setIsProcessingAI(true);
    stopMartinSpeech();
    setIsMartinTalking(false);

    const lower = textToSend.toLowerCase();

    // 1. Detection of Client Reply / Follow-up / Complete Info request
    const isReplyOrCompleteInfoRequest = 
      lower.includes("contestó") || lower.includes("contesto") ||
      lower.includes("respondió") || lower.includes("respondio") ||
      lower.includes("info completa") || lower.includes("más completa") || lower.includes("mas completa") ||
      lower.includes("tarifas") || lower.includes("dossier") ||
      lower.includes("le aviso") || lower.includes("le aviso a martín") || lower.includes("le aviso a martin") ||
      lower.includes("mandale info") || lower.includes("mandar info");

    if (isReplyOrCompleteInfoRequest) {
      // Find matching prospect in list or select first
      let matchedProspect: ProspectLead | null = null;
      for (const p of prospects) {
        const pLower = p.name.toLowerCase();
        const pFirstName = p.name.split(" ")[0].toLowerCase();
        if (lower.includes(pLower) || (pFirstName.length > 2 && lower.includes(pFirstName))) {
          matchedProspect = p;
          break;
        }
      }

      if (!matchedProspect && prospects.length > 0) {
        matchedProspect = prospects[0];
      }

      if (matchedProspect) {
        const completeMsg = generateCompleteInfoMessage(matchedProspect.name, flexPricing);
        const updatedTarget = {
          ...matchedProspect,
          status: "info_completa_enviada" as const,
          hasReceivedCompleteInfo: true,
          whatsappMessage: completeMsg,
          lastContactDate: new Date().toLocaleDateString("es-AR")
        };

        setProspects(prev => prev.map(p => p.id === matchedProspect!.id ? updatedTarget : p));
        setLastActionProspect(updatedTarget);

        const responseMsg = `¡Excelente Noemí! Ya le preparé el **Dossier de Información Completa** a **${matchedProspect.name}** con todo el tarifario de Moto Flex (${flexPricing.motoFlex}), Puntos de Retiro (${flexPricing.puntoRetiro}), horarios de colecta (13:00 a 14:30 hs) y entrega en el día. Hacé clic en el botón verde de abajo para enviárselo directo por WhatsApp.`;
        setMartinResponseText(responseMsg);
        speakMartin(`¡Buenísimo Noemí! Ya le armé a ${matchedProspect.name} la información completa con todo el tarifario de Moto Flex y puntos de retiro. Tocá el botón verde para mandárselo a WhatsApp al toque.`);
        setIsProcessingAI(false);
        return;
      }
    }

    // Dynamically auto-adjust search terms and settings based on user's instruction
    if (lower.includes("ropa") || lower.includes("indumentaria") || lower.includes("calzado") || lower.includes("moda")) {
      setSearchNiche("Tiendas E-commerce de Ropa, Calzado e Indumentaria");
      setSearchLocation("CABA y Gran Buenos Aires (AMBA)");
      setCampaignCustomInstruction("Hola, te habla Martín de Logística X (Buenos Aires Flex). Vimos sus productos de indumentaria y ofrecemos entregas Same-Day en CABA desde $2.800 y 10 puntos de retiro con 25% de descuento. ¿Querés agendar una llamada de 10 min o te mando el tarifario por WhatsApp?");
    } else if (lower.includes("cosmética") || lower.includes("cosmetica") || lower.includes("estética") || lower.includes("perfumería")) {
      setSearchNiche("Cosmética, Perfumería y Cuidado Personal");
      setSearchLocation("Gran Buenos Aires y Capital");
      setCampaignCustomInstruction("Hola, te habla Martín de Logística X. Entendemos el cuidado de frascos y packaging que requiere la cosmética con entregas Flex en el día y tarifas especiales. ¿Te gustaría recibir nuestro tarifario por WhatsApp?");
    } else if (lower.includes("tecnología") || lower.includes("tecnologia") || lower.includes("audio") || lower.includes("gadget")) {
      setSearchNiche("Tecnología, Celulares y Accesorios");
      setSearchLocation("CABA y AMBA");
      setCampaignCustomInstruction("Hola, te habla Martín de Logística X. Ofrecemos seguro total de mercadería y envíos express Flex para e-commerce de tecnología. ¿Coordinamos 10 minutos para presentarles la propuesta?");
    } else if (lower.includes("tarifa") || lower.includes("precio") || lower.includes("descuento") || lower.includes("2800") || lower.includes("2.800")) {
      setFlexPricing(prev => ({
        ...prev,
        motoFlex: "$2.800",
        promoDiscount: "25% OFF"
      }));
    }

    try {
      const prompt = `Estás hablando EN VIVO con ${userDisplayName} en el Centro de Operaciones y Call Center de Buenos Aires Flex / Logística X.
El usuario te indica: "${textToSend}".
Servicio seleccionado: "${campaignService}".
Objetivo: "${campaignGoal}".
Tarifas vigentes: Moto Flex: ${flexPricing.motoFlex}, Caminante: ${flexPricing.caminante}, Punto Retiro: ${flexPricing.puntoRetiro}, Furgón: ${flexPricing.furgon}, Descuento: ${flexPricing.promoDiscount}.

REGLAS FUNDAMENTALES DE MARTÍN:
1. Responde de forma muy humana, ejecutiva, cálida y natural (estilo analista comercial argentino de confianza, sin sonar a bot rígido).
2. Confirma lo que vamos a hacer de inmediato (por ejemplo, buscar e-commerce en esa zona, ajustar el speech o preparar los mensajes de WhatsApp para Buenos Aires Flex).
3. NUNCA menciones códigos técnicos, ni digas "carpeta vacía" salvo que te pregunten expresamente por Google Drive.
4. Mantén la respuesta concisa y orientada a la acción (2 a 4 oraciones) para ser escuchada fluidamente por voz.`;

      const res = await fetch("/api/martin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      let responseMsg = "";

      if (res.ok) {
        const data = await res.json();
        responseMsg = data.text || data.response || data.message;
      }

      if (!responseMsg) {
        if (lower.includes("ropa") || lower.includes("indumentaria")) {
          responseMsg = `¡De una, ${userDisplayName}! Ya configuré el Call Center para buscar **Tiendas de Ropa e Indumentaria** en CABA. Tenemos la propuesta de Moto Flex a ${flexPricing.motoFlex} y 10 puntos de retiro a ${flexPricing.puntoRetiro} con ${flexPricing.promoDiscount}. Podés usar el buscador o llamarlos directo desde la lista.`;
        } else if (lower.includes("cosmética") || lower.includes("estética")) {
          responseMsg = `¡Excelente nicho, ${userDisplayName}! Ajusté la campaña para **E-commerce de Cosmética**. Destacamos el packaging acolchado, cuidado de frascos y entrega express en el día con tarifas diferenciales.`;
        } else if (lower.includes("tarifa") || lower.includes("precio") || lower.includes("descuento")) {
          responseMsg = `¡Tarifas actualizadas, ${userDisplayName}! Dejé la Moto Flex a ${flexPricing.motoFlex} y el descuento promocional en ${flexPricing.promoDiscount}. Todos los guiones y mensajes de WhatsApp quedaron sincronizados.`;
        } else {
          responseMsg = `¡Impecable, ${userDisplayName}! Recibí tu indicación ("${textToSend}"). Ya tengo el Call Center listo para prospectar y contactar marcas para Buenos Aires Flex.`;
        }
      }

      setMartinResponseText(responseMsg);

      // Voice playback
      speakMartin(
        responseMsg,
        () => setIsMartinTalking(true),
        () => setIsMartinTalking(false),
        () => setIsMartinTalking(false)
      );

    } catch (e) {
      console.warn("Error contacting Martin:", e);
      const fallback = `¡De una, ${userDisplayName}! Ya tomo nota de la consigna y ajusto el call center para buscar clientes para Buenos Aires Flex.`;
      setMartinResponseText(fallback);
      speakMartin(fallback);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Mic recording for real-time speech
  const handleToggleMic = () => {
    if (isListeningMic) {
      if (micRecognitionRef.current) {
        try { micRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsListeningMic(false);
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Tu navegador no soporta reconocimiento de voz nativo. Podés escribirle a Martín directamente en el cuadro de texto.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = "es-AR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setMartinInputPrompt(transcript.trim());
          handleTalkToMartin(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      micRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Mic recognition failed:", err);
      setIsListeningMic(false);
    }
  };

  // Delete individual prospect
  const handleDeleteProspect = (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 🌟 1. DIÁLOGO UNIFICADO CON MARTÍN EN TIEMPO REAL (AGENTE GEMINI) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 md:p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              {isMartinTalking && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base md:text-lg flex items-center gap-2">
                Martín • Agente Comercial en Tiempo Real (Buenos Aires Flex)
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold rounded-full">
                  Gemini IA Conectado
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                Dale consignas a Martín por voz o chat: qué ofrecer, a quién llamar o qué precios mandar a los e-commerce.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMartinTalking ? (
              <button
                type="button"
                onClick={() => { stopMartinSpeech(); setIsMartinTalking(false); }}
                className="px-3.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Silenciar Voz</span>
              </button>
            ) : martinResponseText ? (
              <button
                type="button"
                onClick={() => speakMartin(martinResponseText, () => setIsMartinTalking(true), () => setIsMartinTalking(false))}
                className="px-3.5 py-1.5 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar a Martín</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Martin's Live Speech Bubble */}
        {martinResponseText && (
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-indigo-700/50 space-y-3 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-600/30 rounded-xl text-indigo-300 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-400">Martín te responde:</p>
                <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed">
                  "{martinResponseText}"
                </p>
              </div>
            </div>

            {/* Quick action button for Dossier / Complete Info */}
            {lastActionProspect && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl mt-2">
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dossier de Info Completa listo para <strong>{lastActionProspect.name}</strong> ({lastActionProspect.phone})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCompleteInfoModal(lastActionProspect)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-600 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ver / Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = lastActionProspect.whatsappMessage || generateCompleteInfoMessage(lastActionProspect.name, flexPricing);
                      sendWhatsAppMessage({
                        phone: lastActionProspect.phone,
                        message: msg
                      });
                      setProspects(prev => prev.map(p => p.id === lastActionProspect.id ? { ...p, status: "info_completa_enviada", hasReceivedCompleteInfo: true, lastContactDate: new Date().toLocaleDateString("es-AR") } : p));
                      speakMartin(`¡Enviando la información completa a ${lastActionProspect.name} por WhatsApp!`);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar a WhatsApp Ahora</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Input & Voice Microphone */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={martinInputPrompt}
            onChange={(e) => setMartinInputPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleTalkToMartin(); }}
            placeholder="Escribile o dictale una consigna a Martín (ej: 'Martín, busquemos tiendas de ropa para Buenos Aires Flex hoy')..."
            className="flex-1 px-4 py-3 bg-slate-800/90 border border-indigo-700/60 rounded-2xl text-xs md:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
              isListeningMic
                ? "bg-rose-600 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-600/30"
                : "bg-indigo-900/70 hover:bg-indigo-800 border-indigo-700/60 text-indigo-200"
            }`}
            title={isListeningMic ? "Detener grabación de voz" : "Hablar con Martín por micrófono"}
          >
            {isListeningMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            disabled={isProcessingAI || !martinInputPrompt.trim()}
            onClick={() => handleTalkToMartin()}
            className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isProcessingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Enviar Consigna</span>
          </button>
        </div>

        {/* Quick Command Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400">💡 Consignas directas:</span>
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setMartinInputPrompt(cmd.text); handleTalkToMartin(cmd.text); }}
              className="px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 rounded-xl text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        {/* 🎛️ Selector de Canal y Comunicación del Agente Inteligente (Gemini IA) */}
        {speechConfig && setSpeechConfig && (
          <div className="pt-3 border-t border-indigo-800/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-indigo-700/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Modo del Agente Inteligente:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "omnicanal", label: "🔄 Omnicanal Inteligente", desc: "WhatsApp + Cierre en Llamada" },
                { id: "whatsapp_directo", label: "💬 WhatsApp Directo", desc: "Propuestas con tarifario" },
                { id: "llamada_ia", label: "📞 Llamada de Voz IA", desc: "Martín dialoga en vivo" }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSpeechConfig(prev => ({ ...prev, communicationMode: m.id as CommunicationMode }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    speechConfig.communicationMode === m.id
                      ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              ))}

              {onOpenSpeechConfig && (
                <button
                  type="button"
                  onClick={onOpenSpeechConfig}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  title="Abrir editor completo de Speeches y Tarifas"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Speeches</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🚀 2. LAS 4 ACCIONES PRINCIPALES Y CLARAS PARA CONTACTOS Y RESPUESTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BOTÓN 1: ABRIR EN MI WHATSAPP (PARA ELEGIR DE MI AGENDA) */}
        <div className="p-5 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl border border-emerald-500/40 shadow-lg flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Opción 1: Mis Contactos</span>
            </div>
            <h4 className="font-extrabold text-base text-white">Enviar por WhatsApp</h4>
            <p className="text-xs text-emerald-100/80">
              Elegí un contacto de tu celular o agenda. Martín le envía la propuesta y lo guarda en el panel para registrar su respuesta.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenMyWhatsAppToAnyContact}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>📲 Abrir WhatsApp & Registrar</span>
          </button>
        </div>

        {/* BOTÓN 2: CARGAR O PEGAR NÚMEROS NO AGENDADOS */}
        <div className="p-5 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/40 shadow-lg flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-wider">
              <Plus className="w-4 h-4" />
              <span>Opción 2: Carga Rápida</span>
            </div>
            <h4 className="font-extrabold text-base text-white">Cargar / Pegar Número</h4>
            <p className="text-xs text-indigo-200">
              Ingresá o pegá un número de teléfono que te hayan pasado. Martín le arma el speech a medida y lo guarda en la lista.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>➕ Cargar Número o Lista</span>
          </button>
        </div>

        {/* BOTÓN 3: BUSCADOR WEB CON GEMINI */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-700 shadow-lg flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Search className="w-4 h-4" />
              <span>Opción 3: Prospección Web</span>
            </div>
            <h4 className="font-extrabold text-base text-white">Buscar Tiendas Online</h4>
            <p className="text-xs text-slate-300">
              Martín rastrea tiendas online de Buenos Aires Flex en CABA y AMBA para ofrecerles entregas en el día.
            </p>
          </div>
          <button
            type="button"
            disabled={isSearchingProspects}
            onClick={handleSearchWebProspects}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSearchingProspects ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Buscando con Gemini...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>🌐 Rastrear Tiendas Web</span>
              </>
            )}
          </button>
        </div>

        {/* BOTÓN 4: ¡EL CLIENTE ME RESPONDIÓ! (UNIVERSAL) */}
        <div className="p-5 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl border-2 border-amber-500/70 shadow-xl shadow-amber-900/30 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-md animate-pulse">
              Nuevo
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Opción 4: Respuesta de Cliente</span>
            </div>
            <h4 className="font-extrabold text-base text-white">¡El cliente me contestó!</h4>
            <p className="text-xs text-amber-100/90">
              Pegá lo que te respondió cualquier cliente por WhatsApp (de tu agenda o nuevo) para que Martín elabore la respuesta comercial al instante.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenUniversalReplyModal}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-950" />
            <span>📥 Pegar Respuesta de WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ✏️ 3. PANEL DE EDICIÓN EN VIVO: SPEECHES, MENSAJES Y PRECIOS DE BUENOS AIRES FLEX */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Editor en Vivo: Speeches, Propuesta & Tarifario de Precios
              </h3>
              <p className="text-xs text-slate-500">
                Lo que configures o edites acá es exactamente lo que Martín dirá en las llamadas y enviará por WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditorPanel(!showEditorPanel)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showEditorPanel ? "Ocultar Editor" : "Ver Editor"}</span>
            </button>
          </div>
        </div>

        {showEditorPanel && (
          <div className="space-y-5">
            {/* Grid 1: Tarifario de Precios Editable */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Precios & Tarifas Buenos Aires Flex (Editables en Pantalla):
                </span>
                <span className="text-[11px] text-emerald-700 font-mono font-bold">
                  ✓ Se actualizan automáticamente en los mensajes
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    🛵 Moto Flex (CABA):
                  </label>
                  <input
                    type="text"
                    value={flexPricing.motoFlex}
                    onChange={(e) => setFlexPricing(prev => ({ ...prev, motoFlex: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    🚶 Caminante (Radio Corto):
                  </label>
                  <input
                    type="text"
                    value={flexPricing.caminante}
                    onChange={(e) => setFlexPricing(prev => ({ ...prev, caminante: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    📍 Punto de Retiro (10 Locales):
                  </label>
                  <input
                    type="text"
                    value={flexPricing.puntoRetiro}
                    onChange={(e) => setFlexPricing(prev => ({ ...prev, puntoRetiro: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    🚚 Furgón / AMBA:
                  </label>
                  <input
                    type="text"
                    value={flexPricing.furgon}
                    onChange={(e) => setFlexPricing(prev => ({ ...prev, furgon: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    🎁 Descuento Promo:
                  </label>
                  <input
                    type="text"
                    value={flexPricing.promoDiscount}
                    onChange={(e) => setFlexPricing(prev => ({ ...prev, promoDiscount: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Grid 2: Speech & Argumento Comercial */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Speech Comercial & Mensaje de WhatsApp que enviará Martín:
              </label>
              <textarea
                rows={3}
                value={campaignCustomInstruction}
                onChange={(e) => setCampaignCustomInstruction(e.target.value)}
                placeholder="Escribí o modificá el texto de propaganda que Martín enviará a los clientes..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* 📋 4. LISTADO DE CONTACTOS & PROSPECTOS ACTIVOS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              Contactos & E-Commerce para Contactar ({prospects.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenContactsIntegration && (
              <button
                type="button"
                onClick={onOpenContactsIntegration}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-xs border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Mapear números de WhatsApp y vincularlos directamente a este panel"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📲 Mapear de WhatsApp</span>
              </button>
            )}

            {onOpenBranchOrders && (
              <button
                type="button"
                onClick={onOpenBranchOrders}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold rounded-xl text-xs border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Directivas de reposición para WhatsApp, pedidos de locales y consolidación"
              >
                <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                <span>📦 Pedidos & Grupos de WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenUniversalReplyModal}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Pegar lo que contestó el cliente por WhatsApp para que Martín lo analice"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>📥 Pegar Respuesta</span>
            </button>

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cargar Número</span>
            </button>

            {prospects.length > 0 && (
              <button
                type="button"
                onClick={handleClearProspectsList}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Limpiar la lista de contactos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Lista</span>
              </button>
            )}
          </div>
        </div>

        {prospects.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">La lista de contactos está limpia y lista</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Podés abrir tus contactos de WhatsApp, cargar un número manual o buscar e-commerce con IA usando los botones de arriba.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenMyWhatsAppToAnyContact}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                📲 Abrir en mi WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                ➕ Cargar Número
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prospects.map((prospect) => (
              <div
                key={prospect.id}
                className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-md hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-base">{prospect.name}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            prospect.status === "cita_agendada"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : prospect.status === "whatsapp_enviado"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : prospect.status === "llamado"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {prospect.status === "cita_agendada"
                            ? "📅 Cita Agendada"
                            : prospect.status === "whatsapp_enviado"
                            ? "💬 WhatsApp Enviado"
                            : prospect.status === "llamado"
                            ? "📞 Llamado"
                            : "✨ Nuevo"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-emerald-700 font-extrabold flex items-center gap-1.5 flex-wrap">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{prospect.phone}</span>
                        {prospect.websiteOrIg && (
                          <span className="text-slate-400">• {prospect.websiteOrIg}</span>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProspect(prospect.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este contacto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pain Point & Value Prop */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Rubro:</strong> {prospect.category || "E-commerce"} {prospect.location ? `• ${prospect.location}` : ""}
                    </p>
                    {prospect.callPitch && (
                      <div className="pt-1.5 border-t border-slate-200/80">
                        <p className="text-[11px] text-indigo-900 font-medium line-clamp-2">
                          <strong className="text-indigo-950 font-bold">Propuesta / Speech:</strong> "{prospect.callPitch}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReplyModal(prospect)}
                      className="py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Registrar lo que te contestó el cliente y preparar seguimiento"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>📥 Pegar Respuesta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCompleteInfoModal(prospect)}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Generar y enviar Dossier de Información Completa con tarifas y colectas"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>📦 Info Completa</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartProspectCall(prospect)}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Llamar con Martín en vivo"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Llamar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendProspectWhatsApp(prospect)}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Enviar Propuesta por WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAppointmentModal(prospect)}
                      className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Agendar Cita Comercial"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Agendar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📲 MODAL PARA ENVIAR PROPUESTA A CONTACTO DE AGENDA & REGISTRARLO EN PANEL */}
      <AnimatePresence>
        {isAgendaSendModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col space-y-4 p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Enviar Propuesta por WhatsApp</h3>
                    <p className="text-xs text-slate-500">
                      Martín envía la propuesta comercial y guarda la ficha en el panel para esperar su respuesta
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAgendaSendModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <p className="text-xs text-emerald-950 font-medium">
                    Podés escribir el nombre o teléfono del contacto para que aparezca identificado en el panel, o abrir WhatsApp directamente:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Nombre / Comercio (Opcional):
                    </label>
                    <input
                      type="text"
                      value={agendaContactName}
                      onChange={(e) => setAgendaContactName(e.target.value)}
                      placeholder="Ej: Calzados Roma, Tienda Sol..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Número / Celular (Opcional):
                    </label>
                    <input
                      type="text"
                      value={agendaContactPhone}
                      onChange={(e) => setAgendaContactPhone(e.target.value)}
                      placeholder="Ej: 11 4455-8899"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Proposal Preview box */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">Mensaje de propuesta a enviar:</span>
                  <p className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 line-clamp-3">
                    {speechConfig?.whatsappSpeechTemplate 
                      ? renderCustomSpeechTemplate("whatsapp", agendaContactName || "Comercio", "E-commerce")
                      : `¡Hola! Te escribe Martín de Logística X (Buenos Aires Flex). Moto Flex: ${flexPricing.motoFlex} | Puntos de Retiro: ${flexPricing.puntoRetiro} | Descuento: ${flexPricing.promoDiscount}.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAgendaSendModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmSendToAgendaContact()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar WhatsApp & Guardar en Panel</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📦 MODAL UNIVERSAL DE RESPUESTA DE CLIENTE & DOSSIER DE INFORMACIÓN COMPLETA */}
      <AnimatePresence>
        {isReplyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      Información Completa & Respuesta al Cliente
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-full border border-emerald-500/30">
                        Buenos Aires Flex
                      </span>
                    </h3>
                    <p className="text-xs text-indigo-200">
                      Enviá la propuesta detallada con tarifas actualizadas, colectas y puntos de retiro (evita respuestas repetitivas)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Target Contact Selector / Input */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Destinatario del Mensaje:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyMode("existing")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          replyMode === "existing"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        Prospecto del Panel
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyMode("new")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          replyMode === "new"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        Nuevo Contacto
                      </button>
                    </div>
                  </div>

                  {replyMode === "existing" ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <select
                        value={selectedProspectForReply?.id || ""}
                        onChange={(e) => {
                          const found = prospects.find(p => p.id === e.target.value) || null;
                          setSelectedProspectForReply(found);
                          if (found) {
                            setPreparedFollowupMessage(generateCompleteInfoMessage(found.name, flexPricing, clientReplyText));
                          }
                        }}
                        className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {prospects.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.phone}) {p.hasReceivedCompleteInfo ? "✓ Info Enviada" : ""}
                          </option>
                        ))}
                      </select>
                      {selectedProspectForReply && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg font-mono shrink-0">
                          {selectedProspectForReply.phone}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={replyNewName}
                        onChange={(e) => {
                          setReplyNewName(e.target.value);
                          setPreparedFollowupMessage(generateCompleteInfoMessage(e.target.value || "Contacto WhatsApp", flexPricing, clientReplyText));
                        }}
                        placeholder="Nombre / Tienda (Ej: Calzados Palermo)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={replyNewPhone}
                        onChange={(e) => setReplyNewPhone(e.target.value)}
                        placeholder="Teléfono / WhatsApp (Ej: 11 4455-8899)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* What the client responded */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    ¿Qué contestó el cliente por WhatsApp? (Opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={clientReplyText}
                      onChange={(e) => setClientReplyText(e.target.value)}
                      placeholder="Ej: 'Me interesa, pasame los precios y cómo es el servicio' o '¿Llegan a CABA?'"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={() => handleGenerateAIReply()}
                      className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                      title="Martín redacta una respuesta inteligente adaptada a lo que contestó el cliente"
                    >
                      {isGeneratingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Redactar con Martín IA</span>
                    </button>
                  </div>
                </div>

                {/* Follow-up Type Selector Tabs */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Seleccionar Tipo de Información a Enviar:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangeFollowupType("complete_info")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        followupType === "complete_info"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Info Completa</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Tarifario total + colectas + promo</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeFollowupType("pickup_points")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        followupType === "pickup_points"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Puntos de Retiro</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">10 sucursales en CABA ($1.800)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeFollowupType("schedule_call")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        followupType === "schedule_call"
                          ? "bg-amber-50 border-amber-500 text-amber-950 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>Agendar Llamada</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Cierre directo en 5 min</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeFollowupType("ai_custom")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        followupType === "ai_custom"
                          ? "bg-purple-50 border-purple-500 text-purple-950 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Personalizado IA</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Adaptado a la respuesta</p>
                    </button>
                  </div>
                </div>

                {/* Prepared Message Preview & Editable Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Mensaje Listo para WhatsApp (Podés editarlo directamente):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(preparedFollowupMessage);
                        alert("Mensaje copiado al portapapeles");
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Texto</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={preparedFollowupMessage}
                    onChange={(e) => setPreparedFollowupMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-y"
                    placeholder="El mensaje preparado por Martín aparecerá acá..."
                  />
                </div>

                {/* Pricing Summary Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Moto Flex</span>
                    <span className="font-extrabold text-slate-900">{flexPricing.motoFlex}</span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Caminante</span>
                    <span className="font-extrabold text-slate-900">{flexPricing.caminante}</span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Punto Retiro</span>
                    <span className="font-extrabold text-slate-900">{flexPricing.puntoRetiro}</span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Descuento</span>
                    <span className="font-extrabold text-emerald-700">{flexPricing.promoDiscount}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleSaveFollowupToProspect}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Guardar en Ficha</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendFollowupNow}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar WhatsApp Ahora</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ➕ MODAL DE CARGA MANUAL DE PROSPECTO / WHATSAPP */}
      <AnimatePresence>
        {isManualModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Cargar Número / Contacto</h3>
                    <p className="text-xs text-indigo-200">Ingresá el número que conseguiste para ofrecerle Buenos Aires Flex</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModalTab("single")}
                  className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                    modalTab === "single"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  ➕ Carga Individual
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("bulk")}
                  className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                    modalTab === "bulk"
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📋 Pegar Lista de Números
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("file")}
                  className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                    modalTab === "file"
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📲 Importar Archivo WhatsApp
                </button>
              </div>

              {/* Body Content by Tab */}
              {modalTab === "single" && (
                <form onSubmit={handleSubmitManualProspect} className="p-6 space-y-4 overflow-y-auto">
                  {/* Paste from Clipboard helper */}
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Clipboard className="w-4 h-4 text-indigo-600" />
                        Pegar texto copiado de WhatsApp / Chat:
                      </span>
                      <button
                        type="button"
                        onClick={handlePasteFromWhatsApp}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shadow-sm"
                      >
                        📋 Pegar Portapapeles
                      </button>
                    </div>
                    <input
                      type="text"
                      value={manualPasteInput}
                      onChange={(e) => setManualPasteInput(e.target.value)}
                      placeholder="Pegá acá el texto o número que te pasaron..."
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Nombre de la Tienda / E-Commerce *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Ej: Calzados Palermo, Tienda Glamour, etc."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Phone & Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        placeholder="Ej: +54 9 11 2345-6789"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Instagram / Web (Opcional)
                      </label>
                      <input
                        type="text"
                        value={manualWebsite}
                        onChange={(e) => setManualWebsite(e.target.value)}
                        placeholder="Ej: @tiendacalzados"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Category & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Rubro / Nicho
                      </label>
                      <select
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="Indumentaria & Calzado">👗 Indumentaria & Calzado</option>
                        <option value="Tecnología & Gadgets">📱 Tecnología & Gadgets</option>
                        <option value="Cosmética & Estética">💄 Cosmética & Estética</option>
                        <option value="Alimentos & Suplementos">🏋️‍♂️ Alimentos & Suplementos</option>
                        <option value="Bazar & Hogar">🏠 Bazar & Hogar</option>
                        <option value="Ferretería & Repuestos">🔧 Ferretería & Repuestos</option>
                        <option value="Otro Rubro E-commerce">📦 Otro Rubro</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Ubicación / Zona
                      </label>
                      <input
                        type="text"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        placeholder="Ej: Palermo, CABA, Gran Buenos Aires..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Estimated Volume */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Volumen de Envíos Estimado
                    </label>
                    <input
                      type="text"
                      value={manualVolume}
                      onChange={(e) => setManualVolume(e.target.value)}
                      placeholder="Ej: 300 envíos/mes o 20 envíos diarios"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(false)}
                      className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs md:text-sm rounded-2xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Prospecto & Armar Propuesta</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab Bulk Numbers */}
              {modalTab === "bulk" && (
                <div className="p-6 space-y-4 overflow-y-auto">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                    <p className="text-xs text-indigo-950 font-medium">
                      Pegá acá una lista con múltiples números o contactos (un contacto por renglón). Podés incluir el nombre y teléfono juntos.
                    </p>
                  </div>

                  <textarea
                    rows={6}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"Ejemplo:\nCalzados Palermo - 11 4455-8899\nTienda Glow Cosmética: +54 9 11 6789-1234\n11 3988-6278\nModa Express 11 5566-7788"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs md:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                  />

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(false)}
                      className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs md:text-sm rounded-2xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessBulkNumbers}
                      disabled={!bulkText.trim()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Procesar y Agregar Todos</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab File Upload */}
              {modalTab === "file" && (
                <div className="p-6 space-y-4 text-center">
                  <div className="p-8 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-3xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base">
                      Subir archivo de contactos (.vcf, .csv, .txt)
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Exportá contactos de WhatsApp o de tu celular en formato .vcf o .csv y subilos acá para que Martín los agregue automáticamente.
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".vcf,.csv,.txt"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>📁 Seleccionar Archivo</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(false)}
                      className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs md:text-sm rounded-2xl transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
