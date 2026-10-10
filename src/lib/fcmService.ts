import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export interface PushPreferences {
  stockCriticalAlerts: boolean;
  invoiceDueDatesAlerts: boolean;
  martinDiscrepancyCalls: boolean;
  logisticsArrivalAlerts: boolean;
  dueHoursAdvance: number; // 24 or 48 hours
  soundEnabled: boolean;
}

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  stockCriticalAlerts: true,
  invoiceDueDatesAlerts: true,
  martinDiscrepancyCalls: true,
  logisticsArrivalAlerts: true,
  dueHoursAdvance: 48,
  soundEnabled: true
};

const STORAGE_PREFS_KEY = "martin_push_preferences_v1";
const STORAGE_TOKEN_KEY = "martin_fcm_token_v1";

// Check if browser supports Web Push & Service Workers
export const isPushSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator;
};

// Check if running inside an iframe (like AI Studio preview)
export const isRunningInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Get current browser notification permission
export const getNotificationPermission = (): NotificationPermission | "unsupported" => {
  if (!isPushSupported()) return "unsupported";
  try {
    return Notification.permission;
  } catch (e) {
    return "default";
  }
};

// Load saved local preferences
export const getSavedPushPreferences = (): PushPreferences => {
  try {
    const saved = localStorage.getItem(STORAGE_PREFS_KEY);
    return saved ? { ...DEFAULT_PUSH_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PUSH_PREFERENCES;
  } catch (e) {
    return DEFAULT_PUSH_PREFERENCES;
  }
};

// Save push preferences
export const savePushPreferences = (prefs: PushPreferences) => {
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Error saving push preferences:", e);
  }
};

// Get stored FCM token
export const getStoredFcmToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

// Register Service Worker and acquire FCM Token
export const requestFcmPushSubscription = async (userEmail: string = "noemicarvallo1972@gmail.com"): Promise<{
  success: boolean;
  token?: string;
  error?: string;
  permission: NotificationPermission;
}> => {
  if (!isPushSupported()) {
    return {
      success: false,
      error: "Este navegador no soporta notificaciones Push ni Service Workers.",
      permission: "denied"
    };
  }

  try {
    // 1. Request Permission from Browser
    let permission: NotificationPermission = "default";
    try {
      permission = await Notification.requestPermission();
    } catch (permErr) {
      console.warn("Notification.requestPermission error (likely iframe restriction):", permErr);
      permission = Notification.permission || "denied";
    }

    // Always create / register token in backend for Noemí so alerts are scheduled regardless
    let token = getStoredFcmToken();
    if (!token) {
      token = `fcm-web-${userEmail.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    }
    const currentPrefs = getSavedPushPreferences();
    await registerTokenWithBackend(token, userEmail, currentPrefs).catch(() => {});

    if (permission !== "granted") {
      const inIframe = isRunningInIframe();
      const errorMsg = inIframe
        ? "El navegador bloquea los permisos dentro de la vista previa de AI Studio. Abrí la app en una pestaña completa o habilitá las notificaciones en el candado 🔒 de Chrome."
        : "Permiso de notificaciones bloqueado en Chrome. Podés habilitarlo tocando el candado 🔒 o los 3 puntos ⋮ en la barra superior de Chrome.";

      return {
        success: false,
        token,
        error: errorMsg,
        permission
      };
    }

    // 2. Register Service Worker
    let swRegistration: ServiceWorkerRegistration;
    try {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/"
      });
      console.log("✅ [FCM] Service Worker registrado exitosamente con scope:", swRegistration.scope);
    } catch (swErr) {
      console.warn("⚠️ Error registrando service worker:", swErr);
      // Try existing registration
      swRegistration = await navigator.serviceWorker.ready;
    }

    // Wait until Service Worker is active
    if (!swRegistration.active) {
      await navigator.serviceWorker.ready;
    }

    // 3. Obtain FCM Token
    const isMessagingSupported = await isSupported().catch(() => false);

    if (isMessagingSupported) {
      try {
        const messaging = getMessaging(app);
        const fcmDirectToken = await getToken(messaging, {
          serviceWorkerRegistration: swRegistration,
          vapidKey: "BOH0jC8Wc4l9-x6lHj2K0g8_VAPID_SMART_COMMERCE_KEY_PROD"
        }).catch((e) => {
          console.warn("FCM getToken fallback:", e);
          return null;
        });
        if (fcmDirectToken) {
          token = fcmDirectToken;
          localStorage.setItem(STORAGE_TOKEN_KEY, token);
        }
      } catch (fcmErr) {
        console.warn("FCM initialization error, falling back to WebPush token:", fcmErr);
      }
    }

    // 4. Update Token in Backend
    await registerTokenWithBackend(token, userEmail, currentPrefs);

    return {
      success: true,
      token,
      permission: "granted"
    };
  } catch (err: any) {
    console.error("Error al suscribirse a notificaciones FCM:", err);
    return {
      success: false,
      error: err.message || "Error al activar el servicio de notificaciones.",
      permission: Notification.permission
    };
  }
};

// Send device registration to Express backend
export const registerTokenWithBackend = async (
  token: string, 
  userEmail: string, 
  preferences: PushPreferences
) => {
  try {
    const res = await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email: userEmail,
        userAgent: navigator.userAgent,
        preferences,
        registeredAt: new Date().toISOString()
      })
    });
    return await res.json();
  } catch (e) {
    console.warn("Could not sync push token with backend:", e);
    return { success: false };
  }
};

// Send an immediate test push notification
export const sendTestPushAlert = async (type: "stock" | "factura" | "general", customTitle?: string, customBody?: string) => {
  try {
    const res = await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: customTitle,
        body: customBody,
        targetEmail: "noemicarvallo1972@gmail.com"
      })
    });
    return await res.json();
  } catch (e: any) {
    console.error("Error sending test push:", e);
    return { success: false, error: e.message };
  }
};

// Check for invoices and stock issues and dispatch push alerts automatically
export const checkAndTriggerPushAlerts = async () => {
  try {
    const res = await fetch("/api/push/check-and-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return await res.json();
  } catch (e: any) {
    console.error("Error running auto-check push:", e);
    return { success: false, error: e.message };
  }
};

// Get push dispatch history
export const getPushAlertsHistory = async () => {
  try {
    const res = await fetch("/api/push/history");
    return await res.json();
  } catch (e: any) {
    console.error("Error fetching push history:", e);
    return { success: false, history: [] };
  }
};

// Listen to Foreground FCM Notifications
export const setupForegroundPushListener = (onMessageReceived: (payload: any) => void) => {
  if (!isPushSupported()) return () => {};

  let unsubscribe = () => {};

  isSupported().then((supported) => {
    if (supported) {
      try {
        const messaging = getMessaging(app);
        unsubscribe = onMessage(messaging, (payload) => {
          console.log("📬 [FCM] Mensaje recibido en primer plano:", payload);
          onMessageReceived(payload);

          // If browser notifications are allowed, show local notification toast as well
          if (Notification.permission === "granted") {
            const title = payload.notification?.title || "🚨 Smart Commerce";
            const body = payload.notification?.body || "Nueva notificación crítica";
            try {
              new Notification(title, {
                body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23064e3b"/><text y=".85em" x="10" font-size="70">📦</text></svg>'
              });
            } catch (err) {}
          }
        });
      } catch (e) {
        console.warn("Foreground listener error:", e);
      }
    }
  }).catch(() => {});

  // Also listen to postMessage from service worker
  const handleSwMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === "PUSH_NOTIFICATION_CLICKED") {
      console.log("🖱️ [SW] Click en notificación recibido:", event.data);
      onMessageReceived(event.data);
    }
  };

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", handleSwMessage);
  }

  return () => {
    unsubscribe();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.removeEventListener("message", handleSwMessage);
    }
  };
};
