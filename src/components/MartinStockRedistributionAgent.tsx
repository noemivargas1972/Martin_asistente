import React, { useState, useMemo, useRef } from "react";
import { 
  Bot, 
  Sparkles, 
  Package, 
  Building2, 
  Send, 
  Volume2, 
  Upload, 
  RefreshCw, 
  Layers, 
  Share2, 
  Download, 
  Filter, 
  Eye, 
  TrendingDown, 
  TrendingUp, 
  X 
} from "lucide-react";
import { 
  calcularYGenerarRemitos, 
  extraerInventarioDesdeExcel, 
  analizarPlanillaMultiProducto,
  descargarWorkbookAnalisisRico,
  crearBufferEjemploGolosinas,
  crearBufferEjemploBebidas,
  MultiProductAnalysisResult,
  SKUAnalysis,
  ComandaRemito,
  RedistribucionResultado
} from "../lib/stockRedistribution";
import { 
  sendWhatsAppMessage, 
  WhatsAppLaunchMode, 
  getSavedWhatsAppMode, 
  saveWhatsAppMode 
} from "../lib/whatsappSender";
import { cleanTextForSpeech } from "../lib/speechCleaner";

interface MartinStockRedistributionAgentProps {
  onSendToMartinChat?: (promptText: string) => void;
}

export default function MartinStockRedistributionAgent({
  onSendToMartinChat
}: MartinStockRedistributionAgentProps) {
  // Modes: "multi_product" (Rich Analyst Mode) vs "single_product" (Direct quick adjuster) vs "matrix_38" (Store matrix)
  const [activeTab, setActiveTab] = useState<"multi_product" | "single_product" | "matrix_38">("multi_product");
  
  // Filters in multi-product mode
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("TODAS");
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Multi-Product Master Analysis State (Initialized with 38-store golosinas demo buffer)
  const [multiReport, setMultiReport] = useState<MultiProductAnalysisResult>(() => {
    return analizarPlanillaMultiProducto(crearBufferEjemploGolosinas(), "Inventario_Golosinas_38_Locales.xlsx");
  });

  // Selected product from multi-report for detail inspection
  const [selectedSKU, setSelectedSKU] = useState<string>(() => {
    return multiReport.analisisPorSKU[0]?.sku || "";
  });

  // Single-Product Mode State
  const [producto, setProducto] = useState<string>("Alfajor Jorgelín Blanco");
  const [destinatarios, setDestinatarios] = useState<string>("@Valeria y @Priscila");
  const [branches, setBranches] = useState<Array<{ local: string; stock: number }>>([
    { local: "Local 1 - Centro", stock: 12 },
    { local: "Local 2 - Palermo (Sobrestock)", stock: 48 },
    { local: "Local 3 - Belgrano (Quiebre)", stock: 0 },
    { local: "Local 4 - Almagro", stock: 6 },
    { local: "Local 7 - Recoleta (Sobrestock)", stock: 54 },
    { local: "Local 16 - Liniers (Quiebre)", stock: 1 },
    { local: "Local 24 - Quilmes (Quiebre)", stock: 2 },
    { local: "Local 29 - Callao 1", stock: 8 }
  ]);

  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchStock, setNewBranchStock] = useState<number>(0);
  
  // WhatsApp dispatch options & mode
  const [waMode, setWaMode] = useState<WhatsAppLaunchMode>(getSavedWhatsAppMode());
  const [sentRemitoIds, setSentRemitoIds] = useState<string[]>([]);
  const [speakingRemitoId, setSpeakingRemitoId] = useState<string | null>(null);

  // Status and feedback
  const [excelStatus, setExcelStatus] = useState<string | null>(null);

  // AI Chat & Analysis States
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle WhatsApp launch mode change
  const handleChangeWaMode = (mode: WhatsAppLaunchMode) => {
    setWaMode(mode);
    saveWhatsAppMode(mode);
  };

  // Currently inspected SKU in detail
  const currentSelectedSKU: SKUAnalysis | undefined = useMemo(() => {
    return multiReport.analisisPorSKU.find(s => s.sku === selectedSKU) || multiReport.analisisPorSKU[0];
  }, [multiReport, selectedSKU]);

  // Single-product calculation
  const resultadoSingle: RedistribucionResultado = useMemo(() => {
    const inventarioObj: Record<string, number> = {};
    branches.forEach(b => {
      if (b.local.trim()) {
        inventarioObj[b.local.trim()] = Number(b.stock) || 0;
      }
    });
    return calcularYGenerarRemitos(inventarioObj, producto.trim() || "Producto General", destinatarios);
  }, [branches, producto, destinatarios]);

  // Filtered SKUs list for multi-report
  const filteredSKUs = useMemo(() => {
    return multiReport.analisisPorSKU.filter(item => {
      const matchCat = selectedCategoryFilter === "TODAS" || item.classification.categoria === selectedCategoryFilter;
      const matchSub = selectedSubcategoryFilter === "TODAS" || item.classification.subcategoria === selectedSubcategoryFilter;
      const matchSearch = searchTerm.trim() === "" || 
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.classification.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.classification.variedad.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSub && matchSearch;
    });
  }, [multiReport, selectedCategoryFilter, selectedSubcategoryFilter, searchTerm]);

  // Available categories in current report
  const availableCategories = useMemo(() => {
    return Object.keys(multiReport.resumenPorCategoria);
  }, [multiReport]);

  // Available subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    const subcats = new Set<string>();
    multiReport.analisisPorSKU.forEach(item => {
      if (selectedCategoryFilter === "TODAS" || item.classification.categoria === selectedCategoryFilter) {
        subcats.add(item.classification.subcategoria);
      }
    });
    return ["TODAS", ...Array.from(subcats)];
  }, [multiReport, selectedCategoryFilter]);

  // File Upload Handler (Parses any spreadsheet directly into rich multi-product analysis)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setExcelStatus(`Analizando "${file.name}"...`);
      const buffer = await file.arrayBuffer();
      const report = analizarPlanillaMultiProducto(buffer, file.name);

      if (report.analisisPorSKU.length > 0) {
        setMultiReport(report);
        setSelectedSKU(report.analisisPorSKU[0].sku);
        setActiveTab("multi_product");
        setExcelStatus(`✅ ¡Análisis Rico Completado! ${report.totalSKUs} productos/variedades detectados en ${report.totalLocalesDetectados} sucursales.`);
      } else {
        // Fallback to single product extractor
        const parsed = extraerInventarioDesdeExcel(buffer, producto);
        if (parsed.success && parsed.branches.length > 0) {
          setBranches(parsed.branches);
          if (parsed.detectedProductCol) setProducto(parsed.detectedProductCol);
          setActiveTab("single_product");
          setExcelStatus(`✅ ${parsed.branches.length} sucursales cargadas.`);
        } else {
          setExcelStatus(`❌ Error: ${parsed.error || "No se detectaron columnas de stock válidas."}`);
        }
      }
    } catch (err: any) {
      setExcelStatus(`❌ Error al procesar el archivo: ${err.message || "Formato inválido"}`);
    }

    if (e.target) e.target.value = "";
  };

  // Load Preset Demos
  const handleLoadGolosinasDemo = () => {
    const report = analizarPlanillaMultiProducto(crearBufferEjemploGolosinas(), "Inventario_Golosinas_38_Locales.xlsx");
    setMultiReport(report);
    setSelectedSKU(report.analisisPorSKU[0]?.sku || "");
    setSelectedCategoryFilter("Golosinas");
    setSelectedSubcategoryFilter("TODAS");
    setActiveTab("multi_product");
    setExcelStatus("🍬 Inventario Maestro de Golosinas (Alfajores, Chocolates, Gomitas en 38 locales) cargado.");
  };

  const handleLoadBebidasDemo = () => {
    const report = analizarPlanillaMultiProducto(crearBufferEjemploBebidas(), "Inventario_Bebidas_38_Locales.xlsx");
    setMultiReport(report);
    setSelectedSKU(report.analisisPorSKU[0]?.sku || "");
    setSelectedCategoryFilter("TODAS");
    setSelectedSubcategoryFilter("TODAS");
    setActiveTab("multi_product");
    setExcelStatus("🍾 Inventario Maestro de Bebidas (Fernet, Cervezas, Gaseosas en 38 locales) cargado.");
  };

  // Download Rich Excel (.xlsx) Multi-Tab File
  const handleDownloadRichExcel = () => {
    descargarWorkbookAnalisisRico(multiReport, `Analisis_Rico_Stock_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Safe single WhatsApp sender
  const handleSendSingleRemito = (remito: ComandaRemito) => {
    sendWhatsAppMessage({
      message: remito.mensajeWhatsApp,
      mode: waMode
    });
    setSentRemitoIds(prev => prev.includes(remito.id) ? prev : [...prev, remito.id]);
  };

  // Batch compilation into a single message
  const handleSendCompiledWhatsAppBatch = (comandas: ComandaRemito[], title: string) => {
    if (comandas.length === 0) return;
    
    let compiled = `📦 *BOLETÍN DE REDISTRIBUCIÓN DE STOCK & REMITOS OFICIALES*\n`;
    compiled += `🏷️ *Análisis:* ${title}\n`;
    compiled += `👥 *Destinatarios:* ${destinatarios}\n`;
    compiled += `🏢 *Alcance:* 38 Sucursales de Cadena\n`;
    compiled += `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}\n`;
    compiled += `═══════════════════════════════════\n\n`;

    comandas.forEach((c, idx) => {
      compiled += `*REMITO N° ${c.numeroRemito}* (${idx + 1}/${comandas.length})\n`;
      compiled += `• Producto: *${c.producto}*\n`;
      compiled += `• Origen: *${c.localOrigen}*\n`;
      compiled += `• Destino: *${c.localDestino}*\n`;
      compiled += `• Trasladar: *${c.cantidad} unidades*\n`;
      compiled += `-----------------------------------\n\n`;
    });

    compiled += `✅ *Por favor confirmar recepción respondiendo este mensaje.*`;

    sendWhatsAppMessage({
      message: compiled,
      mode: waMode
    });

    setSentRemitoIds(comandas.map(c => c.id));
  };

  // AI Strategic Analysis using Gemini / Server API
  const handleAskMartinAI = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const promptText = `
Sos Martín, el Analista de Logística y Operaciones de Smart Commerce.
Efectuá un análisis estratégico rico sobre el inventario analizado.

Resumen del inventario:
- Total de Artículos/Variedades: ${multiReport.totalSKUs}
- Unidades Totales en Cadena: ${multiReport.totalUnidadesCadena} unidades
- Locales Evaluados: ${multiReport.totalLocalesDetectados} locales
- Total de Remitos de Transferencia Generados: ${multiReport.todasLasComandas.length}

Categorías presentes:
${Object.entries(multiReport.resumenPorCategoria).map(([cat, data]: [string, any]) => `- ${cat}: ${data.totalUnidades} unidades en ${data.skus} variedades`).join('\n')}

Variedades destacadas:
${multiReport.analisisPorSKU.slice(0, 8).map(p => `- ${p.classification.marca} ${p.classification.variedad} (${p.classification.categoria} > ${p.classification.subcategoria}): ${p.totalCadena} u. total | Target por local: ${p.objetivoEquitativoPorLocal} u. | Quiebres: ${p.localesCriticos.length} locales | Sobrestock: ${p.localesExcedentes.length} locales`).join('\n')}

Pregunta específica del usuario: "${aiQuestion || 'Analizá el sobrestock, los locales en quiebre crítico y recomendá el plan de traslados prioritario para equilibrar los 38 locales.'}"

Por favor respondé con tono profesional de analista de operaciones, estructurado con viñetas, destacando las golosinas o productos más críticos y las rutas de traslados recomendadas.
`;

      const res = await fetch("/api/martin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptText })
      });

      if (!res.ok) {
        throw new Error("Error en el servidor de IA");
      }

      const data = await res.json();
      setAiAnalysisResult(data.reply || data.text || "Análisis completado satisfactoriamente.");
    } catch (err: any) {
      // Fallback structured analysis
      let fallbackText = `📊 **Informe Estratégico de Analista Martín**\n\n`;
      fallbackText += `• **Volumen de Red:** ${multiReport.totalUnidadesCadena} unidades distribuidas en ${multiReport.totalLocalesDetectados} sucursales.\n`;
      fallbackText += `• **Categorías Clave:** ${Object.entries(multiReport.resumenPorCategoria).map(([k, v]: [string, any]) => `${k} (${v.totalUnidades} u.)`).join(', ')}.\n`;
      fallbackText += `• **Fórmula Aplicada:** Target Equitativo = Total Red / 38 Locales.\n\n`;
      fallbackText += `💡 **Plan de Acción Inmediato:**\n`;
      fallbackText += `1. Ejecutar los **${multiReport.todasLasComandas.length} remitos de transferencia** para que todos los locales queden con la misma cuota de stock.\n`;
      fallbackText += `2. Priorizar la salida desde sucursales con sobrestock masivo para evitar quiebres en locales de alta rotación.\n`;
      fallbackText += `3. Descargar la planilla Excel multi-hoja (.xlsx) para auditoría formal.`;

      setAiAnalysisResult(fallbackText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // TTS Locution for operators
  const handleSpeakRemito = (remito: ComandaRemito) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingRemitoId === remito.id) {
      window.speechSynthesis.cancel();
      setSpeakingRemitoId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `Remito número ${remito.numeroRemito}. Producto: ${remito.producto}. Trasladar ${remito.cantidad} unidades desde ${remito.localOrigen} hacia ${remito.localDestino}.`;
    const clean = cleanTextForSpeech(textToRead);

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "es-AR";
    utterance.rate = 0.95;

    utterance.onstart = () => setSpeakingRemitoId(remito.id);
    utterance.onend = () => setSpeakingRemitoId(null);
    utterance.onerror = () => setSpeakingRemitoId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 text-white space-y-6 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/30">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/40 shadow-inner">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Analista Martín: Inteligencia de Stock & 38 Sucursales
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-full border border-emerald-500/30">
                V5.0 Multi-Categoría
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Transformación de cualquier planilla en <strong>Datos Ricos</strong>: desglose por categoría, variedad, marcas, gran total y balance equitativo en 38 locales
            </p>
          </div>
        </div>

        {/* Action Buttons & WhatsApp Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Demo Buttons */}
          <button
            type="button"
            onClick={handleLoadGolosinasDemo}
            className="px-3 py-1.5 bg-pink-950/70 hover:bg-pink-900 text-pink-200 border border-pink-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Carga inventario de golosinas: alfajores, chocolates, gomitas en 38 sucursales"
          >
            <span>🍬 Demo Golosinas (38 Locales)</span>
          </button>

          <button
            type="button"
            onClick={handleLoadBebidasDemo}
            className="px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Carga inventario de bebidas: fernet, cervezas, gaseosas en 38 sucursales"
          >
            <span>🍾 Demo Bebidas (38 Locales)</span>
          </button>

          {/* WhatsApp Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 pl-1">WhatsApp:</span>
            <button
              type="button"
              onClick={() => handleChangeWaMode("app")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                waMode === "app"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Abre en WhatsApp Desktop o Móvil directamente"
            >
              App
            </button>
            <button
              type="button"
              onClick={() => handleChangeWaMode("web")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                waMode === "web"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Usa una sola pestaña de WhatsApp Web"
            >
              Web
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Total Unidades Cadena</span>
          <span className="text-xl font-black text-indigo-300">{multiReport.totalUnidadesCadena.toLocaleString('es-AR')} u.</span>
        </div>
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Variedades / SKUs</span>
          <span className="text-xl font-black text-emerald-400">{multiReport.totalSKUs}</span>
        </div>
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Sucursales Analizadas</span>
          <span className="text-xl font-black text-amber-300">{multiReport.totalLocalesDetectados} Locales</span>
        </div>
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Remitos de Balance</span>
          <span className="text-xl font-black text-white">{multiReport.todasLasComandas.length} Traslados</span>
        </div>
      </div>

      {/* Top Controls Bar: Subir Archivo + Exportar Excel + Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("multi_product")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "multi_product"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Datos Ricos & Categorías ({multiReport.analisisPorSKU.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix_38")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "matrix_38"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Matriz 38 Locales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("single_product")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "single_product"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Ajuste Rápido 1 Producto</span>
          </button>
        </div>

        {/* Upload & Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Planilla (.xlsx/.csv)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleDownloadRichExcel}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
            title="Descarga el libro Excel con 4 hojas: Resumen, Categorías, Matriz 38 Locales y Remitos"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Excel Multi-Hoja (.xlsx)</span>
          </button>
        </div>
      </div>

      {excelStatus && (
        <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
          <span>{excelStatus}</span>
          <button type="button" onClick={() => setExcelStatus(null)} className="text-slate-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Prompt Box for Live Strategic Analysis */}
      <div className="p-4 bg-gradient-to-r from-indigo-950/60 via-slate-800/80 to-slate-900/90 rounded-2xl border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-indigo-300 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Consultar al Analista Martín sobre la Planilla
          </span>
          <span className="text-[10px] text-indigo-200 bg-indigo-900/50 px-2 py-0.5 rounded-full border border-indigo-500/30">
            Análisis de Quiebres & Sobrestock
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ej: ¿Cuáles son las sucursales más críticas en alfajores? o ¿Qué marcas conviene transferir primero?"
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAskMartinAI}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
          >
            {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Analizar con Martín</span>
          </button>
        </div>

        {aiAnalysisResult && (
          <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/20 text-xs text-indigo-100 font-sans leading-relaxed whitespace-pre-line">
            {aiAnalysisResult}
          </div>
        )}
      </div>

      {/* VIEW 1: MULTI-PRODUCT & CATEGORIES RICH BREAKDOWN */}
      {activeTab === "multi_product" && (
        <div className="space-y-6">
          {/* Category Badges & Filters */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800/40 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 flex items-center gap-1 pl-1">
              <Filter className="w-3 h-3" />
              Categoría:
            </span>
            <button
              type="button"
              onClick={() => { setSelectedCategoryFilter("TODAS"); setSelectedSubcategoryFilter("TODAS"); }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedCategoryFilter === "TODAS"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Todas ({multiReport.analisisPorSKU.length})
            </button>
            {availableCategories.map(cat => {
              const data = multiReport.resumenPorCategoria[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setSelectedCategoryFilter(cat); setSelectedSubcategoryFilter("TODAS"); }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategoryFilter === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-950/60 rounded-full text-indigo-300">
                    {data ? data.totalUnidades : 0} u.
                  </span>
                </button>
              );
            })}

            {/* Subcategory dropdown if category selected */}
            {availableSubcategories.length > 1 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[11px] font-bold text-slate-400">Subcategoría:</span>
                <select
                  value={selectedSubcategoryFilter}
                  onChange={(e) => setSelectedSubcategoryFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                >
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Master Table of Products & Varieties */}
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  Desglose de Productos por Marca y Variedad ({filteredSKUs.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Fórmula: Target Equitativo = Total Cadena / 38 Locales. Detecta sucursales en quiebre y sobrante.
                </p>
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar marca, sabor o variedad..."
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none w-full sm:w-60"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="p-3 font-extrabold">Categoría / Subcategoría</th>
                    <th className="p-3 font-extrabold">Marca & Producto</th>
                    <th className="p-3 font-extrabold">Variedad / Formato</th>
                    <th className="p-3 font-extrabold text-right">Total Cadena</th>
                    <th className="p-3 font-extrabold text-right">Target Equitativo / Local</th>
                    <th className="p-3 font-extrabold text-center">Estado de Red</th>
                    <th className="p-3 font-extrabold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSKUs.map(item => {
                    const isSelected = item.sku === selectedSKU;
                    const hasQuiebres = item.localesCriticos.length > 0;
                    const hasSobrestock = item.localesExcedentes.length > 0;

                    return (
                      <tr 
                        key={item.sku}
                        className={`transition-all hover:bg-slate-800/80 cursor-pointer ${
                          isSelected ? "bg-indigo-950/40 border-l-4 border-indigo-500" : ""
                        }`}
                        onClick={() => setSelectedSKU(item.sku)}
                      >
                        <td className="p-3">
                          <span className="font-bold text-white block">{item.classification.categoria}</span>
                          <span className="text-[10px] text-indigo-300 font-mono">{item.classification.subcategoria}</span>
                        </td>
                        <td className="p-3">
                          <strong className="text-white font-extrabold">{item.classification.marca}</strong>
                          <span className="text-[11px] text-slate-400 block">{item.sku}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-900 text-indigo-200 border border-slate-700 text-[11px] font-semibold rounded-md">
                            {item.classification.variedad} ({item.classification.formato})
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <strong className="text-indigo-300 font-mono font-black text-sm">{item.totalCadena} u.</strong>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-emerald-400 font-mono font-bold">{item.objetivoEquitativoPorLocal} u. / local</span>
                          {item.sobranteRemanente > 0 && (
                            <span className="text-[10px] text-amber-400 block font-mono">+{item.sobranteRemanente} buffer</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {hasQuiebres ? (
                              <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {item.localesCriticos.length} Quiebres
                              </span>
                            ) : null}
                            {hasSobrestock ? (
                              <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {item.localesExcedentes.length} Sobrestock
                              </span>
                            ) : null}
                            {!hasQuiebres && !hasSobrestock && (
                              <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                                Equilibrado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSKU(item.sku);
                              setActiveTab("matrix_38");
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver 38 Locales</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Product Redistribution Detail & Remitos */}
          {currentSelectedSKU && (
            <div className="bg-slate-800/80 rounded-2xl border border-indigo-500/40 p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold rounded-md uppercase">
                      {currentSelectedSKU.classification.categoria} ➔ {currentSelectedSKU.classification.subcategoria}
                    </span>
                    <h3 className="text-base font-extrabold text-white">
                      {currentSelectedSKU.classification.marca} - {currentSelectedSKU.classification.variedad}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Stock Total Cadena: <strong>{currentSelectedSKU.totalCadena} u.</strong> | Target Equitativo: <strong className="text-emerald-400">{currentSelectedSKU.objetivoEquitativoPorLocal} u. / local</strong> | Remitos Calculados: <strong className="text-indigo-300">{currentSelectedSKU.comandasRedistribucion.length}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendCompiledWhatsAppBatch(currentSelectedSKU.comandasRedistribucion, `${currentSelectedSKU.classification.marca} ${currentSelectedSKU.classification.variedad}`)}
                    disabled={currentSelectedSKU.comandasRedistribucion.length === 0}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Boletín de Remitos WhatsApp (1 Tab)</span>
                  </button>
                </div>
              </div>

              {/* Remitos List for Selected Product */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Remitos de Transferencia Calculados ({currentSelectedSKU.comandasRedistribucion.length})
                </h4>

                {currentSelectedSKU.comandasRedistribucion.length === 0 ? (
                  <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                    ✨ El stock de este producto ya se encuentra perfectamente distribuido de forma homogénea en toda la red.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    {currentSelectedSKU.comandasRedistribucion.map((c) => {
                      const isSent = sentRemitoIds.includes(c.id);
                      const isSpeaking = speakingRemitoId === c.id;

                      return (
                        <div
                          key={c.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isSent
                              ? "bg-slate-900/80 border-emerald-500/40 opacity-90"
                              : "bg-slate-900 border-slate-700 hover:border-indigo-500/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
                            <span className="font-extrabold text-indigo-300">
                              Remito N° {c.numeroRemito}
                            </span>
                            <span className="font-bold text-emerald-400 font-mono">
                              {c.cantidad} u.
                            </span>
                          </div>

                          <div className="py-2 text-xs flex items-center gap-1.5 text-slate-300">
                            <span className="text-slate-500">De:</span>
                            <strong className="text-white truncate">{c.localOrigen}</strong>
                            <span className="text-indigo-400 font-bold">➔</span>
                            <span className="text-slate-500">A:</span>
                            <strong className="text-white truncate">{c.localDestino}</strong>
                          </div>

                          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 whitespace-pre-line">
                            {c.mensajeWhatsApp}
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleSpeakRemito(c)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{isSpeaking ? "Parar" : "Escuchar"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendSingleRemito(c)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                isSent
                                  ? "bg-emerald-800 text-white"
                                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
                              }`}
                            >
                              <Share2 className="w-3 h-3" />
                              <span>{isSent ? "Reenviar" : "Enviar a WhatsApp"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 38 BRANCHES MATRIX VIEW */}
      {activeTab === "matrix_38" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Matriz de Stock en los 38 Locales para: {currentSelectedSKU?.classification.marca} - {currentSelectedSKU?.classification.variedad}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Objetivo Equitativo: <strong>{currentSelectedSKU?.objetivoEquitativoPorLocal} u. por local</strong> | Total Cadena: <strong>{currentSelectedSKU?.totalCadena} u.</strong>
              </p>
            </div>

            {/* Product Selector for Matrix */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Producto:</span>
              <select
                value={selectedSKU}
                onChange={(e) => setSelectedSKU(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none max-w-xs"
              >
                {multiReport.analisisPorSKU.map(item => (
                  <option key={item.sku} value={item.sku}>
                    {item.classification.marca} - {item.classification.variedad} ({item.totalCadena} u.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 38 Branches Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {multiReport.localesInvolucrados.map((localName, idx) => {
              const currentStock = currentSelectedSKU ? (currentSelectedSKU.inventarioPorLocal[localName] ?? 0) : 0;
              const target = currentSelectedSKU?.objetivoEquitativoPorLocal || 0;
              const diff = currentStock - target;
              const isSuperavit = diff > 0;
              const isDeficit = diff < 0;

              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDeficit 
                      ? "bg-rose-950/30 border-rose-500/30" 
                      : isSuperavit 
                      ? "bg-emerald-950/30 border-emerald-500/30" 
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <strong className="text-white truncate font-bold">{localName}</strong>
                    <span className={`font-mono font-black text-sm ${
                      isDeficit ? "text-rose-400" : isSuperavit ? "text-emerald-400" : "text-slate-300"
                    }`}>
                      {currentStock} u.
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Target: {target} u.</span>
                    <span className={isSuperavit ? "text-emerald-400 font-bold" : isDeficit ? "text-rose-400 font-bold" : "text-slate-400"}>
                      {isSuperavit ? `+${diff} (Sobrestock)` : isDeficit ? `-${Math.abs(diff)} (Quiebre)` : "Balanceado"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: SINGLE PRODUCT DIRECT ADJUSTER */}
      {activeTab === "single_product" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Product & Branches */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                Parámetros Individuales
              </h3>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Producto:</label>
                  <input
                    type="text"
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Responsables / Menciones:</label>
                  <input
                    type="text"
                    value={destinatarios}
                    onChange={(e) => setDestinatarios(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Branch Stock Editor */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Stock por Sucursal ({branches.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {branches.map((b, idx) => {
                  const diff = b.stock - resultadoSingle.objetivoPorLocal;
                  const isSuperavit = diff > 0;
                  const isDeficit = diff < 0;

                  return (
                    <div key={idx} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={b.local}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBranches(prev => {
                              const next = [...prev];
                              next[idx].local = val;
                              return next;
                            });
                          }}
                          className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                        />
                        <span className={`text-[10px] font-mono ${isSuperavit ? 'text-emerald-400' : isDeficit ? 'text-rose-400' : 'text-slate-400'}`}>
                          {isSuperavit ? `Sobrestock +${diff} u.` : isDeficit ? `Déficit -${Math.abs(diff)} u.` : 'Balanceado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          value={b.stock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setBranches(prev => {
                              const next = [...prev];
                              next[idx].stock = Math.max(0, val);
                              return next;
                            });
                          }}
                          className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-right text-indigo-300 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">u.</span>
                        <button
                          type="button"
                          onClick={() => setBranches(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Branch Inline */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-700">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Nueva sucursal..."
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                />
                <input
                  type="number"
                  value={newBranchStock}
                  onChange={(e) => setNewBranchStock(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-12 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-right text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBranchName.trim()) return;
                    setBranches(prev => [...prev, { local: newBranchName.trim(), stock: Math.max(0, newBranchStock) }]);
                    setNewBranchName("");
                    setNewBranchStock(0);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Single Product Remitos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                  Boletín de Remitos ({resultadoSingle.comandas.length})
                </h3>
                <p className="text-[11px] text-slate-300">
                  Stock Total: {resultadoSingle.totalStock} u. | Target: {resultadoSingle.objetivoPorLocal} u. / local
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSendCompiledWhatsAppBatch(resultadoSingle.comandas, producto)}
                disabled={resultadoSingle.comandas.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Boletín (1 Tab)</span>
              </button>
            </div>

            <div className="space-y-3">
              {resultadoSingle.comandas.map((c) => (
                <div key={c.id} className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-indigo-300">Remito N° {c.numeroRemito}</span>
                    <span className="font-bold text-emerald-400">{c.cantidad} u. de {c.producto}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-slate-300 whitespace-pre-line">
                    {c.mensajeWhatsApp}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSendSingleRemito(c)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Enviar a WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
