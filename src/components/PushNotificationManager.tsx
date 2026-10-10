import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  BellRing, 
  BellOff, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Smartphone, 
  Check, 
  Sliders, 
  Calendar, 
  Package, 
  DollarSign, 
  Zap, 
  Copy, 
  ExternalLink,
  Volume2,
  VolumeX,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { 
  getNotificationPermission, 
  getSavedPushPreferences, 
  savePushPreferences, 
  requestFcmPushSubscription, 
  sendTestPushAlert, 
  checkAndTriggerPushAlerts, 
  getPushAlertsHistory, 
  getStoredFcmToken,
  PushPreferences,
  isPushSupported,
  isRunningInIframe
} from "../lib/fcmService";

interface PushNotificationManagerProps {
  userDisplayName?: string;
  onNavigateToTab?: (tab: string) => void;
}

export default function PushNotificationManager({
  userDisplayName = "Noemí Carvallo",
  onNavigateToTab
}: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testSending, setTestSending] = useState<boolean>(false);
  const [autoChecking, setAutoChecking] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<PushPreferences>(getSavedPushPreferences());
  const [history, setHistory] = useState<any[]>([]);
  const [activeSubscribersCount, setActiveSubscribersCount] = useState<number>(1);

  // Monitored items (populated exclusively from real uploaded data or user inputs)
  const monitoredInvoices: any[] = [];
  const monitoredStock: any[] = [];

  useEffect(() => {
    setPermission(getNotificationPermission());
    setFcmToken(getStoredFcmToken());
    fetchStatusAndHistory();
  }, []);

  const fetchStatusAndHistory = async () => {
    try {
      const statusRes = await fetch("/api/push/status");
      const statusData = await statusRes.json();
      if (statusData.success) {
        setActiveSubscribersCount(statusData.activeSubscribersCount || 1);
      }

      const histData = await getPushAlertsHistory();
      if (histData.success && Array.isArray(histData.history)) {
        setHistory(histData.history);
      }
    } catch (e) {
      console.warn("Could not load push status:", e);
    }
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleActivatePush = async () => {
    setIsLoading(true);
    try {
      const result = await requestFcmPushSubscription("noemicarvallo1972@gmail.com");
      setPermission(result.permission);
      if (result.success && result.token) {
        setFcmToken(result.token);
        showToast("🔔 ¡Notificaciones Push de Firebase activadas exitosamente en este dispositivo!", "success");
        fetchStatusAndHistory();
      } else {
        showToast(result.error || "No se pudo activar las notificaciones.", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Error al activar notificaciones.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePref = (key: keyof PushPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    savePushPreferences(updated);
    showToast("Preferencias de alerta actualizadas", "info");
  };

  const handleSendTestPush = async (type: "stock" | "factura" | "general") => {
    setTestSending(true);
    try {
      const res = await sendTestPushAlert(type);
      if (res.success) {
        showToast(`📲 ¡Notificación Push (${type.toUpperCase()}) enviada a Noemí!`, "success");
        fetchStatusAndHistory();
      } else {
        showToast(res.error || "Error al emitir notificación de prueba.", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setTestSending(false);
    }
  };

  const handleAutoCheckAlerts = async () => {
    setAutoChecking(true);
    try {
      const res = await checkAndTriggerPushAlerts();
      if (res.success) {
        showToast(`⚡ ${res.message}`, "success");
        fetchStatusAndHistory();
      } else {
        showToast(res.error || "Error en el chequeo automático.", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setAutoChecking(false);
    }
  };

  const handleCopyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
      showToast("Token FCM copiado al portapapeles", "info");
    }
  };

  const isGranted = permission === "granted";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-medium ${
              toastMessage.type === "success"
                ? "bg-emerald-900/95 text-emerald-100 border-emerald-500/50 backdrop-blur-md"
                : toastMessage.type === "error"
                ? "bg-red-900/95 text-red-100 border-red-500/50 backdrop-blur-md"
                : "bg-neutral-900/95 text-neutral-100 border-neutral-700 backdrop-blur-md"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
            {toastMessage.type === "info" && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-neutral-900 to-emerald-950 border border-emerald-800/40 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Firebase Cloud Messaging (FCM Push Service)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <BellRing className="w-8 h-8 text-emerald-400 shrink-0" />
              <span>Centro de Notificaciones Push en Segundo Plano</span>
            </h1>
            <p className="text-sm md:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Alertas automáticas enviadas directamente a los dispositivos de <strong>{userDisplayName}</strong> sobre <span className="text-emerald-300 font-medium">vencimientos de facturas de proveedores</span> y <span className="text-amber-300 font-medium">quiebres críticos de stock</span>, <em>incluso cuando el dashboard o la pestaña estén cerrados</em>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {!isGranted ? (
              <button
                id="btn-activate-push-notifications"
                onClick={handleActivatePush}
                disabled={isLoading}
                className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                <span>Activar Notificaciones Push</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-900/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Notificaciones Push Activas</span>
              </div>
            )}

            <button
              id="btn-auto-check-alerts"
              onClick={handleAutoCheckAlerts}
              disabled={autoChecking}
              className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl border border-neutral-700 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              title="Evaluar facturas y stock en este instante"
            >
              <RefreshCw className={`w-4 h-4 ${autoChecking ? "animate-spin text-emerald-400" : ""}`} />
              <span>Escanear Alertas Hoy</span>
            </button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div className="mt-6 pt-6 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2.5 text-neutral-300">
            <div className={`w-3 h-3 rounded-full ${isGranted ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>
              Estado del Navegador: <strong className={isGranted ? "text-emerald-400" : "text-amber-400"}>{isGranted ? "Permiso Concedido" : "Sin Activar / Denegado"}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-neutral-300">
            <Smartphone className="w-4 h-4 text-neutral-400" />
            <span>
              Dispositivos de Noemí: <strong className="text-white">{activeSubscribersCount} conectado(s)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-neutral-300">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>
              Canal: <strong className="text-white">FCM Service Worker PWA</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Guide for Denied / Blocked Notifications in Chrome Android / AI Studio Iframe */}
      {!isGranted && (
        <div className="bg-gradient-to-br from-amber-950/80 via-neutral-900 to-neutral-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl text-neutral-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-3 w-full">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>¿Por qué salió "Permiso de notificaciones denegado"?</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] uppercase font-mono font-bold">Solución Fácil</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  En Google Chrome en teléfonos Android, cuando la app se carga dentro de la vista previa de AI Studio, <strong>el navegador bloquea las solicitudes de notificaciones emergentes por seguridad de contenedores</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Option 1: Open in full tab */}
                <div className="p-4 bg-neutral-950/80 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Zap className="w-4 h-4" />
                    <span>OPCIÓN 1 (RECOMENDADA): Abrir en Pestaña Completa</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Al abrir la aplicación en su propia pestaña directa, Chrome te permitirá presionar <strong>"Permitir"</strong> de inmediato sin bloqueos de iframe.
                  </p>
                  <button
                    onClick={() => window.open(window.location.href, "_blank")}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir App en Pestaña Independiente</span>
                  </button>
                </div>

                {/* Option 2: Unblock in Chrome Android */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-700 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Sliders className="w-4 h-4" />
                    <span>OPCIÓN 2: Habilitar Permiso en Chrome Android</span>
                  </div>
                  <ol className="space-y-1.5 text-neutral-300 text-[11px] list-decimal list-inside">
                    <li>Toca el <strong>candado 🔒</strong> o los <strong>3 puntos ⋮</strong> arriba en Chrome.</li>
                    <li>Toca en <strong>"Permisos"</strong> o <strong>"Configuración del sitio"</strong>.</li>
                    <li>Toca en <strong>"Notificaciones"</strong> y cámbialo a <strong>"Permitir"</strong>.</li>
                    <li>Vuelve y pulsa el botón verde <strong>"Activar Notificaciones Push"</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FCM Token & Integration Card (Collapsible info) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm text-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Identificador de Dispositivo FCM (Token de Registro)</h3>
              <p className="text-xs text-neutral-400">
                {fcmToken ? "Dispositivo vinculado para Noemí Carvallo (noemicarvallo1972@gmail.com)" : "Pulsa 'Activar Notificaciones Push' para generar el token de este equipo."}
              </p>
            </div>
          </div>

          {fcmToken && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyToken}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? "Copiado" : "Copiar Token"}</span>
              </button>
            </div>
          )}
        </div>

        {fcmToken && (
          <div className="mt-3 p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/80 font-mono text-[11px] text-neutral-400 break-all select-all">
            {fcmToken}
          </div>
        )}
      </div>

      {/* Grid: Test Triggers & Channel Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Push Dispatcher Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Simulador y Envío de Pruebas Inmediatas</span>
              </h2>
              <span className="text-xs text-neutral-400">Prueba instantánea</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Prueba la recepción de alertas en segundo plano minimizando esta pestaña o enviando las notificaciones de prueba para verificar cómo llegarán las alertas a Noemí:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="btn-test-push-factura"
                onClick={() => handleSendTestPush("factura")}
                disabled={testSending}
                className="p-3.5 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Prueba Notificación Factura</span>
                </div>
                <p className="text-[11px] text-neutral-400 group-hover:text-neutral-300">
                  Prueba de recepción de alerta de vencimiento de pago.
                </p>
              </button>

              <button
                id="btn-test-push-stock"
                onClick={() => handleSendTestPush("stock")}
                disabled={testSending}
                className="p-3.5 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-red-500/50 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-red-400 font-semibold text-xs mb-1">
                  <Package className="w-4 h-4" />
                  <span>Prueba Notificación Stock</span>
                </div>
                <p className="text-[11px] text-neutral-400 group-hover:text-neutral-300">
                  Prueba de recepción de aviso de falta de stock.
                </p>
              </button>
            </div>

            <button
              id="btn-test-push-general"
              onClick={() => handleSendTestPush("general")}
              disabled={testSending}
              className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Emitir Ping General de Conectividad Push</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>Al hacer click en la notificación push recibida, el sistema te redirigirá automáticamente a la solapa correspondiente.</span>
          </div>
        </div>

        {/* Notification Channel Preferences */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Canales y Reglas de Alerta para Noemí</span>
            </h2>
            <span className="text-xs text-neutral-400">Personalización</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Facturas */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Vencimientos de Facturas</h4>
                  <p className="text-[11px] text-neutral-400">Alertas 48h y 24h antes del vencimiento de proveedores</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePref("invoiceDueDatesAlerts")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  preferences.invoiceDueDatesAlerts ? "bg-emerald-500" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    preferences.invoiceDueDatesAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Stock */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Quiebres Críticos de Stock</h4>
                  <p className="text-[11px] text-neutral-400">Alerta cuando un producto baje del stock de seguridad</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePref("stockCriticalAlerts")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  preferences.stockCriticalAlerts ? "bg-emerald-500" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    preferences.stockCriticalAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Descuadres de Caja */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Descuadres y Auditoría (Martín)</h4>
                  <p className="text-[11px] text-neutral-400">Diferencias en cierres de caja superiores a $5.000</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePref("martinDiscrepancyCalls")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  preferences.martinDiscrepancyCalls ? "bg-emerald-500" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    preferences.martinDiscrepancyCalls ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Sonido de Notificación */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Sonido y Vibración de Alerta</h4>
                  <p className="text-[11px] text-neutral-400">Tono sonoro en móviles y escritorios</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePref("soundEnabled")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  preferences.soundEnabled ? "bg-emerald-500" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    preferences.soundEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Monitored Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitored Invoices */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Vencimientos de Facturas Monitoreados</span>
            </h3>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("compras")}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Compras</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {monitoredInvoices.length === 0 ? (
              <div className="py-6 text-center text-neutral-500 text-xs">
                Aún no hay vencimientos de facturas registrados. Carga tus comprobantes para monitoreo.
              </div>
            ) : (
              monitoredInvoices.map((inv, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{inv.proveedor}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">({inv.facturaRef})</span>
                    </div>
                    <div className="text-neutral-400">
                      Vencimiento: <strong className="text-neutral-200">{inv.vencimiento}</strong> • Monto: <strong className="text-emerald-400">${inv.monto.toLocaleString("es-AR")}</strong>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inv.urgency === "critica"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : inv.urgency === "alta"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {inv.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monitored Stock */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-red-400" />
              <span>Productos en Stock Crítico Monitoreados</span>
            </h3>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("stock")}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Stock</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {monitoredStock.length === 0 ? (
              <div className="py-6 text-center text-neutral-500 text-xs">
                Aún no hay productos en stock crítico registrados.
              </div>
            ) : (
              monitoredStock.map((stk, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{stk.producto}</div>
                    <div className="text-neutral-400">
                      Stock actual: <strong className="text-red-400">{stk.actual} u.</strong> (Mínimo: {stk.minimo} u.) • Faltan: <strong className="text-amber-300">{stk.faltante} u.</strong>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      stk.urgency === "critica"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {stk.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dispatched Push History Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Historial de Notificaciones Push Emitidas</h3>
          </div>
          <button
            onClick={fetchStatusAndHistory}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar Historial</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs">
            No hay notificaciones push emitidas recientemente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Título & Mensaje</th>
                  <th className="pb-3 font-semibold">Destinatario</th>
                  <th className="pb-3 font-semibold">Hora de Envío</th>
                  <th className="pb-3 font-semibold">Canal</th>
                  <th className="pb-3 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3 pr-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.type === "factura"
                            ? "bg-amber-500/20 text-amber-300"
                            : item.type === "stock"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {item.type === "factura" && "📅 Factura"}
                        {item.type === "stock" && "🚨 Stock"}
                        {item.type === "general" && "🔔 Ping"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 max-w-xs">
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="text-[11px] text-neutral-400 line-clamp-1">{item.body}</div>
                    </td>
                    <td className="py-3 pr-2 font-mono text-[11px] text-neutral-400">
                      {item.targetEmail || "noemicarvallo1972@gmail.com"}
                    </td>
                    <td className="py-3 pr-2 text-neutral-400">
                      {new Date(item.timestamp).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="py-3 pr-2 text-[11px] text-neutral-400">
                      {item.channel || "FCM Service Worker"}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Entregado</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
