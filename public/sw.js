// CarCare Diagnóstico - Service Worker para Push Notifications
const CACHE_NAME = 'carcare-v1';
const SW_VERSION = '1.0.0';

// Assets to cache for offline support
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/favicon.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker version:', SW_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force activation without waiting
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Serve from cache when offline
        return caches.match(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'CarCare Diagnóstico',
    body: 'Você tem uma nova notificação',
    icon: '/favicon.svg',
    badge: '/favicon.ico',
    tag: 'carcare-notification',
    priority: 'normal',
    url: '/',
    actions: []
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      // If not JSON, use as body text
      data.body = event.data.text();
    }
  }
  
  // Configure notification options based on priority
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'carcare-notification',
    data: {
      url: data.url || '/',
      priority: data.priority,
      timestamp: Date.now()
    },
    vibrate: getVibrationPattern(data.priority),
    requireInteraction: data.priority === 'urgent' || data.priority === 'high',
    silent: false,
    actions: data.actions || getDefaultActions(data.priority)
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Get vibration pattern based on priority
function getVibrationPattern(priority) {
  switch (priority) {
    case 'urgent':
      return [200, 100, 200, 100, 200, 100, 400]; // Alarming pattern
    case 'high':
      return [200, 100, 200, 100, 200]; // Attention pattern
    case 'normal':
      return [100, 50, 100]; // Standard pattern
    case 'low':
      return [100]; // Subtle pattern
    default:
      return [100, 50, 100];
  }
}

// Get default actions based on priority
function getDefaultActions(priority) {
  const baseActions = [
    { action: 'view', title: '👁️ Ver', icon: '/favicon.svg' },
    { action: 'dismiss', title: '✕ Dispensar', icon: '/favicon.svg' }
  ];
  
  if (priority === 'urgent' || priority === 'high') {
    return [
      { action: 'view', title: '🚨 Ver Agora', icon: '/favicon.svg' },
      { action: 'dismiss', title: '✕ Depois', icon: '/favicon.svg' }
    ];
  }
  
  return baseActions;
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  const url = notificationData.url || '/';
  
  if (action === 'dismiss') {
    // Just close the notification
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Navigate to the notification URL and focus
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if not found
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Notification close event (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed without action');
  
  // Could send analytics data here
  const notificationData = event.notification.data || {};
  
  // Track that notification was dismissed
  event.waitUntil(
    trackNotificationAction('closed', notificationData)
  );
});

// Track notification actions (stub for analytics)
async function trackNotificationAction(action, data) {
  // Could send to analytics endpoint
  console.log('[SW] Tracking notification action:', action, data);
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break;
      
    case 'SHOW_NOTIFICATION':
      // Allow the app to trigger notifications through SW
      if (payload) {
        const { title, ...options } = payload;
        self.registration.showNotification(title, {
          ...options,
          data: { ...options.data, fromApp: true }
        });
      }
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          event.ports[0]?.postMessage({ success: true });
        })
      );
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-diagnostics') {
    event.waitUntil(syncDiagnostics());
  }
});

// Sync pending diagnostics when back online
async function syncDiagnostics() {
  console.log('[SW] Syncing pending diagnostics...');
  // Implementation would sync any offline-saved diagnostics
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'check-diagnostics') {
    event.waitUntil(checkForNewAlerts());
  }
});

// Check for new diagnostic alerts in background
async function checkForNewAlerts() {
  console.log('[SW] Checking for new diagnostic alerts...');
  // Implementation would check for new alerts
}

console.log('[SW] Service Worker loaded, version:', SW_VERSION);
