import React from "react";
import {
  Zap,
  PhoneCall,
  RefreshCw,
  Send,
  Headphones,
  Smartphone,
  Upload,
  Settings,
  AlertTriangle,
  Check,
  Bell,
  ShieldAlert
} from "lucide-react";

interface AuditItem {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  detail: string;
  risk: "alto" | "medio" | "bajo";
  martinAction: string;
}

interface MartinAuditsSectionProps {
  customTaskTitle: string;
  setCustomTaskTitle: (val: string) => void;
  isTaskProcessing: boolean;
  taskProgress: number;
  handleStartCustomTaskWithCall: (title: string) => void;
  handleDownloadVCard: () => void;
  triggerIncomingAlertCall: (override?: { title?: string; description?: string; user?: string; file?: string; risk?: "alto" | "medio" | "bajo" }) => void;
  minMismatchAmount: string;
  setMinMismatchAmount: (val: string) => void;
  notifyIncomingCall: boolean;
  setNotifyIncomingCall: (val: boolean) => void;
  notifyWhatsapp: boolean;
  setNotifyWhatsapp: (val: boolean) => void;
  noemiPhone: string;
  userDisplayName: string;
  handleStartOutgoingCall: (phone?: string, name?: string) => void;
  auditLog: AuditItem[];
  onOpenChatWithMartin?: (prompt?: string) => void;
}

export const MartinAuditsSection: React.FC<MartinAuditsSectionProps> = ({
  customTaskTitle,
  setCustomTaskTitle,
  isTaskProcessing,
  taskProgress,
  handleStartCustomTaskWithCall,
  handleDownloadVCard,
  triggerIncomingAlertCall,
  minMismatchAmount,
  setMinMismatchAmount,
  notifyIncomingCall,
  setNotifyIncomingCall,
  notifyWhatsapp,
  setNotifyWhatsapp,
  noemiPhone,
  userDisplayName,
  handleStartOutgoingCall,
  auditLog,
  onOpenChatWithMartin
}) => {
  return (
    <div className="space-y-6">
      {/* SECTION A: Encargar Tarea / Análisis de Stock con aviso por llamada al finalizar */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 text-white p-6 md:p-8 rounded-3xl border border-indigo-700/50 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl">
              <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Encargar Tareas a Martín con Aviso por Llamada
              </h2>
              <p className="text-xs text-indigo-200">
                Pide cualquier análisis o trabajo. Martín se encarga y te llama por teléfono cuando tenga todo listo.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold rounded-full">
            📞 Protocolo "Llamame al terminar"
          </span>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
            Consigna o Tarea que le asignas a Martín:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="text"
              value={customTaskTitle}
              onChange={(e) => setCustomTaskTitle(e.target.value)}
              placeholder="Ej: Análisis de planillas de stock y estrategia de redistribución..."
              className="flex-1 px-4 py-3 bg-slate-800/80 border border-indigo-700/60 rounded-2xl text-xs md:text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-500"
            />
            <button
              disabled={isTaskProcessing || !customTaskTitle.trim()}
              onClick={() => handleStartCustomTaskWithCall(customTaskTitle)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <PhoneCall className="w-4 h-4 text-slate-950" />
              <span>{isTaskProcessing ? "Martín Procesando..." : "📞 Encargar y Llamar al Finalizar"}</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="text-slate-400 font-bold text-[11px]">Sugerencias rápidas:</span>
            <button
              onClick={() => setCustomTaskTitle("Análisis de Planillas de Stock y Estrategia de Redistribución")}
              className="px-3 py-1 bg-indigo-950/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
            >
              📦 Stock y Redistribución entre Sucursales
            </button>
            <button
              onClick={() => setCustomTaskTitle("Auditoría de Margen de Ganancia de Proveedores de Bebidas")}
              className="px-3 py-1 bg-indigo-950/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
            >
              📊 Auditoría de Precios y Proveedores
            </button>
            <button
              onClick={() => setCustomTaskTitle("Proyección de Ventas y Arqueos de Caja del Fin de Semana")}
              className="px-3 py-1 bg-indigo-950/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
            >
              📈 Proyección de Ventas Fin de Semana
            </button>
          </div>

          {/* Progress bar if task is running */}
          {isTaskProcessing && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-emerald-500/40 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  Martín está analizando datos y generando la estrategia...
                </span>
                <span className="font-mono">{taskProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                En cuanto el indicador llegue al 100%, tu teléfono/pantalla sonará con la llamada de voz de Martín.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION B: Contacto Directo WhatsApp de Martín para subir Excel y Documentos */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-200 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                Línea Directa de WhatsApp para Enviar Planillas Excel y Documentos
              </h2>
              <p className="text-xs text-slate-500">
                Guardá a Martín en la agenda de tu celular para enviarle archivos directamente desde WhatsApp.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold rounded-full">
            🟢 WhatsApp de Martín Online
          </span>
        </div>

        <div className="w-full">
          {/* Contact Details Card */}
          <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md font-bold text-2xl shrink-0">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Martín • Director de Operaciones Smart Commerce</h3>
                <p className="text-xs text-slate-600 font-mono font-bold">+54 9 11 3988-6278 (3988-MARTN)</p>
                <p className="text-[11px] text-emerald-800 font-medium pt-0.5">
                  Recepción automática de Excel (.xlsx), CSV, fotos de comprobantes, inventarios y notas de voz.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200/80 flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadVCard}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>📲 Guardar Contacto vCard en Celular</span>
              </button>

              <a
                href="https://wa.me/5491139886278?text=Hola%20Mart%C3%ADn,%20te%20env%C3%ADo%20esta%20planilla%20de%20stock%20para%20su%20analisis"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-600" />
                <span>💬 Abrir Chat de WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Rules Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Alarm Thresholds */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base">Reglas de Activación de Llamada</h2>
              <p className="text-xs text-slate-500">Condiciones en las que Martín interviene automáticamente</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Monto Mínimo de Descuadre de Caja
                </span>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-mono font-bold rounded-md">
                  &gt; ${Number(minMismatchAmount).toLocaleString()} ARS
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Si el arqueo subido por un empleado tiene una diferencia mayor a este monto, Martín te llamará.
              </p>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={minMismatchAmount}
                onChange={(e) => setMinMismatchAmount(e.target.value)}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-800 block">Facturas e Imágenes Sospechosas</span>
                <p className="text-slate-500 text-[11px]">
                  Imágenes borrosas, comprobantes sin CUIT o montos mayores a $500.000.
                </p>
              </div>
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Check className="w-4 h-4" />
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-800 block">Cargas fuera de Horario Habitual</span>
                <p className="text-slate-500 text-[11px]">
                  Archivos subidos entre las 00:00 hs y las 06:00 hs sin turno asignado.
                </p>
              </div>
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Check className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notification Channels & Call Center Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-base">Canales de Alarma Integrados</h2>
                <p className="text-xs text-slate-500">Formatos en los que te contacta Martín</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-extrabold text-slate-800 text-xs block">Llamada Entrante con Voz en Pantalla</span>
                    <span className="text-[11px] text-slate-500">Reproduce timbre y voz masculina en vivo</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyIncomingCall}
                  onChange={(e) => setNotifyIncomingCall(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-extrabold text-slate-800 text-xs block">Notificación por WhatsApp</span>
                    <span className="text-[11px] text-slate-500">Envía resumen detallado directo al WhatsApp registrado</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-slate-900 block">Línea Directa de Noemí</span>
              <span className="text-xs font-mono font-bold text-emerald-700">{noemiPhone}</span>
            </div>
            <button
              onClick={() => handleStartOutgoingCall(noemiPhone, `Noemí (${userDisplayName})`)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Probar Llamada</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit & Intervention Log */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-700 rounded-2xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base">Historial de Intervenciones y Llamadas de Martín</h2>
              <p className="text-xs text-slate-500">Registro en tiempo real de archivos auditados y llamadas de alerta</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {auditLog.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.risk === "alto"
                  ? "bg-rose-50/50 border-rose-200"
                  : item.risk === "medio"
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-emerald-50/50 border-emerald-200"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                        item.risk === "alto"
                          ? "bg-red-600 text-white"
                          : item.risk === "medio"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      Riesgo {item.risk}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{item.action}</span>
                    <span className="text-xs text-slate-400">• {item.timestamp}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">{item.detail}</p>
                  <p className="text-xs text-indigo-700 font-bold flex items-center gap-1.5 pt-0.5">
                    <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{item.martinAction}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{item.user}</span>
                  {onOpenChatWithMartin && (
                    <button
                      onClick={() => onOpenChatWithMartin(`Martín, contame en detalle sobre la alerta de ${item.action} realizada por ${item.user}`)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Consultar a Martín</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
