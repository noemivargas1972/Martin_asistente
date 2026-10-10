import React, { useState } from "react";
import {
  Sliders,
  PhoneCall,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  CheckCircle2,
  Zap,
  Tag,
  Eye,
  Bot
} from "lucide-react";
import { CustomSalesSpeechConfig, CommunicationMode, SalesStrategy } from "../types";
import { WhatsAppModeSelector } from "./WhatsAppModeSelector";

interface MartinSpeechConfigSectionProps {
  speechConfig: CustomSalesSpeechConfig;
  setSpeechConfig: React.Dispatch<React.SetStateAction<CustomSalesSpeechConfig>>;
  flexPricing: {
    motoFlex: string;
    caminante: string;
    puntoRetiro: string;
    furgon: string;
    promoDiscount: string;
  };
  setFlexPricing: React.Dispatch<React.SetStateAction<{
    motoFlex: string;
    caminante: string;
    puntoRetiro: string;
    furgon: string;
    promoDiscount: string;
  }>>;
  onSaveConfig?: () => void;
}

export const MartinSpeechConfigSection: React.FC<MartinSpeechConfigSectionProps> = ({
  speechConfig,
  setSpeechConfig,
  flexPricing,
  setFlexPricing,
  onSaveConfig
}) => {
  const [activeSpeechTab, setActiveSpeechTab] = useState<"whatsapp" | "call" | "reply">("whatsapp");
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [isSpeakingPreview, setIsSpeakingPreview] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Variables that can be inserted
  const dynamicVariables = [
    { tag: "{nombre_comercio}", label: "Nombre Comercio", desc: "Ej: Zapatos Palermo" },
    { tag: "{rubro}", label: "Rubro / Nicho", desc: "Ej: Calzado & Indumentaria" },
    { tag: "{tarifa_moto}", label: "Tarifa Moto Flex", desc: flexPricing.motoFlex },
    { tag: "{tarifa_caminante}", label: "Tarifa Caminante", desc: flexPricing.caminante },
    { tag: "{tarifa_puntos}", label: "Tarifa Punto Retiro", desc: flexPricing.puntoRetiro },
    { tag: "{tarifa_furgon}", label: "Tarifa Furgón", desc: flexPricing.furgon },
    { tag: "{descuento_promo}", label: "Descuento", desc: flexPricing.promoDiscount }
  ];

  // Insert variable into active speech template
  const insertVariable = (tag: string) => {
    if (activeSpeechTab === "whatsapp") {
      setSpeechConfig(prev => ({
        ...prev,
        whatsappSpeechTemplate: prev.whatsappSpeechTemplate + " " + tag
      }));
    } else if (activeSpeechTab === "call") {
      setSpeechConfig(prev => ({
        ...prev,
        callOpeningSpeechTemplate: prev.callOpeningSpeechTemplate + " " + tag
      }));
    } else {
      setSpeechConfig(prev => ({
        ...prev,
        replyFollowupSpeechTemplate: prev.replyFollowupSpeechTemplate + " " + tag
      }));
    }
  };

  // Get current active template text
  const currentTemplateText = activeSpeechTab === "whatsapp" 
    ? speechConfig.whatsappSpeechTemplate 
    : activeSpeechTab === "call" 
    ? speechConfig.callOpeningSpeechTemplate 
    : speechConfig.replyFollowupSpeechTemplate;

  const handleUpdateCurrentTemplate = (newVal: string) => {
    if (activeSpeechTab === "whatsapp") {
      setSpeechConfig(prev => ({ ...prev, whatsappSpeechTemplate: newVal }));
    } else if (activeSpeechTab === "call") {
      setSpeechConfig(prev => ({ ...prev, callOpeningSpeechTemplate: newVal }));
    } else {
      setSpeechConfig(prev => ({ ...prev, replyFollowupSpeechTemplate: newVal }));
    }
  };

  // Live preview string replacing variables with actual sample values
  const getRenderedPreview = () => {
    let raw = currentTemplateText;
    raw = raw.replace(/\{nombre_comercio\}/g, "Tienda Urban Shoes");
    raw = raw.replace(/\{rubro\}/g, "Calzado & Accesorios");
    raw = raw.replace(/\{tarifa_moto\}/g, flexPricing.motoFlex);
    raw = raw.replace(/\{tarifa_caminante\}/g, flexPricing.caminante);
    raw = raw.replace(/\{tarifa_puntos\}/g, flexPricing.puntoRetiro);
    raw = raw.replace(/\{tarifa_furgon\}/g, flexPricing.furgon);
    raw = raw.replace(/\{descuento_promo\}/g, flexPricing.promoDiscount);
    return raw;
  };

  // Optimize speech with Gemini AI
  const handleOptimizeWithAI = async () => {
    setIsAiOptimizing(true);
    try {
      const typeLabel = activeSpeechTab === "whatsapp" 
        ? "mensaje de propuesta inicial de WhatsApp" 
        : activeSpeechTab === "call" 
        ? "speech de apertura para llamada telefónica de voz" 
        : "mensaje de seguimiento cuando el cliente responde";

      const prompt = `Sos un director comercial experto en logística para e-commerce en Buenos Aires (Buenos Aires Flex).
Mejora y optimiza este ${typeLabel} para que sea más persuasivo, vendedor, cálido y profesional sin sonar a bot rígido.
Mantené las variables que aparezcan como {nombre_comercio}, {tarifa_moto}, {tarifa_puntos}, {descuento_promo} si aplican.
Estrategia seleccionada: ${speechConfig.salesStrategy}.

Texto original:
"${currentTemplateText}"

Devuelve ÚNICAMENTE el texto optimizado listo para usar, sin explicaciones ni comillas.`;

      const response = await fetch("/api/martin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      const data = await response.json();
      const optimized = (data.text || data.response || data.message || "").trim();
      if (optimized && optimized.length > 20) {
        handleUpdateCurrentTemplate(optimized);
      }
    } catch (e) {
      console.warn("AI Optimization failed:", e);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  // Preview Speech with Voice (TTS)
  const handleToggleSpeakPreview = () => {
    if (typeof window === "undefined") return;
    if (isSpeakingPreview) {
      window.speechSynthesis?.cancel();
      setIsSpeakingPreview(false);
      return;
    }

    const textToSpeak = getRenderedPreview();
    if (!textToSpeak.trim()) return;

    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "es-AR";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis?.getVoices() || [];
    const argVoice = voices.find(v => v.lang === "es-AR") || voices.find(v => v.lang.startsWith("es"));
    if (argVoice) utterance.voice = argVoice;

    utterance.onstart = () => setIsSpeakingPreview(true);
    utterance.onend = () => setIsSpeakingPreview(false);
    utterance.onerror = () => setIsSpeakingPreview(false);

    window.speechSynthesis?.speak(utterance);
  };

  // Restore Default Speeches
  const handleResetDefaults = () => {
    if (!window.confirm("¿Restablecer los speeches a las plantillas predeterminadas de Buenos Aires Flex?")) return;
    setSpeechConfig({
      communicationMode: "omnicanal",
      salesStrategy: "cierre_agresivo",
      aiPersonalizationEnabled: true,
      autoVoiceEnabled: true,
      whatsappSpeechTemplate: `¡Hola equipo de {nombre_comercio}! 📦 Les escribe Martín, Director de Operaciones de Logística X (Buenos Aires Flex).\n\nQueremos presentarles nuestra solución de distribución express y puntos de retiro para e-commerce en CABA y GBA:\n\n🚀 *Tarifas Especiales:*\n• Moto Flex Same-Day (En el Día): {tarifa_moto}\n• Caminantes Radio Corto: {tarifa_caminante}\n• 10 Puntos de Retiro Estratégicos: {tarifa_puntos}\n• Furgón / Bultos Grandes: {tarifa_furgon}\n• Beneficio Exclusivo: {descuento_promo} en tus primeros 15 días.\n\n¿Les gustaría coordinar una breve llamada de 10 minutos o recibir el tarifario completo en PDF?`,
      callOpeningSpeechTemplate: `Hola, ¿qué tal? Te habla Martín, Director de Operaciones de Logística X (Buenos Aires Flex). Te contacto porque estuvimos analizando los envíos de {nombre_comercio}. Contamos con entregas en el día desde {tarifa_moto} y una red de 10 puntos de retiro en CABA desde {tarifa_puntos} con {descuento_promo} de bienvenida. ¿Tenés 2 minutos para contarte cómo podemos reducir sus costos de logística?`,
      replyFollowupSpeechTemplate: `Hola {nombre_comercio}, ¡muchas gracias por tu respuesta! 📦 Para coordinar los envíos Flex y el beneficio del {descuento_promo}, ¿te queda cómodo que te llame en 5 minutos o preferís que te pase los detalles de retiro por acá?`
    });
  };

  // Save Settings
  const handleSave = () => {
    try {
      localStorage.setItem("martin_speech_config", JSON.stringify(speechConfig));
      localStorage.setItem("martin_flex_pricing", JSON.stringify(flexPricing));
      setSaveSuccessNotice(true);
      if (onSaveConfig) onSaveConfig();
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-md shadow-indigo-600/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Configuración del Agente & Speeches de Venta
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold rounded-full">
                Gemini IA Activo
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Personalizá cómo se comunica Martín, qué canal utiliza y los mensajes exactos que enviará a los e-commerce.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessNotice && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Guardado exitosamente</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Speeches</span>
          </button>
        </div>
      </div>

      {/* 🎛️ 1. SELECTOR DE MODO DE COMUNICACIÓN DEL AGENTE (GEMINI) */}
      <div className="space-y-3 p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm md:text-base">
              Selector de Canal & Comunicación del Agente Inteligente
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Modo: {speechConfig.communicationMode.toUpperCase()}
          </span>
        </div>

        <p className="text-xs text-indigo-200">
          Elegí cómo querés que interactúe Martín cuando presiones contactar a un prospecto o e-commerce:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Opción 1: Llamadas de Voz IA */}
          <button
            type="button"
            onClick={() => setSpeechConfig(prev => ({ ...prev, communicationMode: "llamada_ia" }))}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              speechConfig.communicationMode === "llamada_ia"
                ? "bg-emerald-600/25 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/50"
                : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              {speechConfig.communicationMode === "llamada_ia" && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-xs md:text-sm text-white">1. Llamada de Voz IA Directa</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Martín inicia la llamada telefónica en vivo y dialoga con voz natural argentina usando Gemini.
              </p>
            </div>
          </button>

          {/* Opción 2: WhatsApp Directo */}
          <button
            type="button"
            onClick={() => setSpeechConfig(prev => ({ ...prev, communicationMode: "whatsapp_directo" }))}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              speechConfig.communicationMode === "whatsapp_directo"
                ? "bg-emerald-600/25 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/50"
                : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              {speechConfig.communicationMode === "whatsapp_directo" && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-xs md:text-sm text-white">2. WhatsApp Directo</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Abre WhatsApp con la propuesta, tarifas y descuento ya redactados y listos para enviar en 1 clic.
              </p>
            </div>
          </button>

          {/* Opción 3: Omnicanal Inteligente */}
          <button
            type="button"
            onClick={() => setSpeechConfig(prev => ({ ...prev, communicationMode: "omnicanal" }))}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              speechConfig.communicationMode === "omnicanal"
                ? "bg-emerald-600/25 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/50"
                : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              {speechConfig.communicationMode === "omnicanal" && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-xs md:text-sm text-white">3. Omnicanal Inteligente</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Envía por WhatsApp y permite activar la llamada con Martín si el cliente contesta positivamente.
              </p>
            </div>
          </button>
        </div>

        {/* Estrategia Comercial de Gemini */}
        <div className="pt-3 border-t border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-indigo-200">Estrategia Comercial de Ventas (Gemini IA):</span>
            <p className="text-[11px] text-slate-400">Define el enfoque con el que Martín defenderá la propuesta de Buenos Aires Flex.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "cierre_agresivo", label: "🚀 Cierre Rápido (Descuento 25% + Same-Day)" },
              { id: "consultivo_puntos", label: "🤝 Consultivo (10 Puntos de Retiro CABA)" },
              { id: "express_flex", label: "⚡ Express (Motos Flex y Tarifas Fijas)" }
            ].map((strat) => (
              <button
                key={strat.id}
                type="button"
                onClick={() => setSpeechConfig(prev => ({ ...prev, salesStrategy: strat.id as SalesStrategy }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  speechConfig.salesStrategy === strat.id
                    ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {strat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📝 2. EDITOR DE SPEECHES PERSONALIZADOS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Editor del 'Speech' de Ventas Personalizado
            </h3>
            <p className="text-xs text-slate-500">
              Editá los mensajes automáticos. Podés insertar variables dinámicas o pedirle a Gemini que lo optimice.
            </p>
          </div>

          {/* Selector de Pestaña de Speech */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => setActiveSpeechTab("whatsapp")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSpeechTab === "whatsapp"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Inicial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSpeechTab("call")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSpeechTab === "call"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Apertura de Llamada</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSpeechTab("reply")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSpeechTab === "reply"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Seguimiento de Respuestas</span>
            </button>
          </div>
        </div>

        {/* Botones de Variables Dinámicas Insertables */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              Variables Dinámicas (Tocá para insertar en el texto):
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Se reemplazan automáticamente con los datos de cada tienda
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {dynamicVariables.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => insertVariable(v.tag)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-300 hover:border-indigo-300 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title={`Insertar ${v.label} (${v.desc})`}
              >
                <span>{v.tag}</span>
                <span className="text-[10px] font-sans text-slate-400 font-normal">({v.label})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea del Speech Activo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Texto del {activeSpeechTab === "whatsapp" ? "Mensaje de WhatsApp" : activeSpeechTab === "call" ? "Speech de Llamada" : "Seguimiento"}:</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentTemplateText.length} caracteres
            </span>
          </div>

          <textarea
            rows={5}
            value={currentTemplateText}
            onChange={(e) => handleUpdateCurrentTemplate(e.target.value)}
            placeholder="Escribí acá el texto del speech..."
            className="w-full p-4 bg-white border border-slate-300 rounded-2xl text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans shadow-inner"
          />
        </div>

        {/* Herramientas de IA y Prueba de Audio */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOptimizeWithAI}
              disabled={isAiOptimizing}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAiOptimizing ? "Gemini optimizando..." : "🪄 Mejorar Speech con Gemini IA"}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSpeakPreview}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSpeakingPreview ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isSpeakingPreview ? "Detener Audio" : "Escuchar a Martín"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Restablecer plantilla original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* 👁️ Vista Previa en Tiempo Real */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-bold flex items-center gap-1.5 text-emerald-400">
              <Eye className="w-3.5 h-3.5" />
              Vista Previa en Vivo (Ejemplo con Tienda Urban Shoes):
            </span>
            <span className="font-mono text-[10px] text-slate-500">Renderizado final</span>
          </div>

          <p className="text-xs md:text-sm text-slate-200 font-mono whitespace-pre-line leading-relaxed">
            {getRenderedPreview()}
          </p>
        </div>

        {/* 📱 Configuración de Conexión y Lanzamiento de WhatsApp */}
        <WhatsAppModeSelector />
      </div>
    </div>
  );
};
