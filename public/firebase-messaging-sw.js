// Firebase Cloud Messaging Service Worker for background push notifications
// Smart Commerce - Martín Sistema

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the Service Worker using official credentials
firebase.initializeApp({
  projectId: "impactful-extension-pnzsc",
  appId: "1:1054399043656:web:22f71b2787bf9ebe06607d",
  apiKey: "AIzaSyADpCk5fJrHgQzdHUjTvVHVxo57vujDHlE",
  authDomain: "impactful-extension-pnzsc.firebaseapp.com",
  storageBucket: "impactful-extension-pnzsc.firebasestorage.app",
  messagingSenderId: "1054399043656"
});

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Firebase Messaging not supported in this SW context:', err);
}

// Background handler for Firebase Cloud Messaging
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || payload.data?.title || '🚨 Smart Commerce - Alerta Crítica';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Nueva alerta de gestión para Noemí Carvallo.',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23064e3b"/><text y=".85em" x="10" font-size="70">📦</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23064e3b"/><text y=".85em" x="10" font-size="70">📦</text></svg>',
      tag: payload.data?.tag || 'smart-commerce-push',
      data: payload.data || {},
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'open', title: '🔍 Ver en Dashboard' },
        { action: 'dismiss', title: '✕ Descartar' }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Web Push native event handler for broad browser and background execution
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let title = '🚨 Alerta Smart Commerce';
  let body = 'Nueva notificación del sistema';
  let tag = 'smart-commerce-alert';
  let customData = {};

  try {
    const data = event.data.json();
    title = data.title || data.notification?.title || title;
    body = data.body || data.notification?.body || body;
    tag = data.tag || data.data?.tag || tag;
    customData = data.data || data;
  } catch (e) {
    body = event.data.text() || body;
  }

  const options = {
    body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23064e3b"/><text y=".85em" x="10" font-size="70">📦</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23064e3b"/><text y=".85em" x="10" font-size="70">📦</text></svg>',
    tag,
    data: customData,
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: '🔍 Ver en Dashboard' },
      { action: 'dismiss', title: '✕ Descartar' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click notification handler: focuses the open dashboard or opens a new tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetTab = (event.notification.data && event.notification.data.tab) || 'alertas';
  const targetUrl = `/?tab=${targetTab}`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          // Send message to active tab to switch to the target tab
          client.postMessage({
            type: 'PUSH_NOTIFICATION_CLICKED',
            tab: targetTab,
            data: event.notification.data
          });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
