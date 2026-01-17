import { useCallback, useEffect, useState } from 'react';

export type AlertPriority = 'urgent' | 'high' | 'normal' | 'low';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  priority?: AlertPriority;
  url?: string;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  data?: Record<string, unknown>;
}

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

interface UsePushNotificationsReturn {
  // Service Worker state
  swState: ServiceWorkerState;
  
  // Push subscription state
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  
  // Permission state
  permission: NotificationPermission;
  
  // Actions
  registerServiceWorker: () => Promise<ServiceWorkerRegistration | null>;
  unregisterServiceWorker: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  subscribeToPush: (vapidPublicKey?: string) => Promise<PushSubscription | null>;
  unsubscribeFromPush: () => Promise<boolean>;
  showLocalNotification: (payload: PushNotificationPayload) => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  clearCache: () => Promise<boolean>;
  
  // Utilities
  getSwVersion: () => Promise<string | null>;
}

// Default VAPID public key placeholder (should be replaced with real key from env)
const DEFAULT_VAPID_KEY = '';

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    registration: null,
    updateAvailable: false,
  });
  
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  // Check if service workers and push are supported
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  
  // Initialize on mount
  useEffect(() => {
    if (!isSupported) {
      console.warn('[Push] Service Workers not supported');
      return;
    }
    
    setSwState(prev => ({ ...prev, isSupported: true }));
    
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // Check for existing registration
    navigator.serviceWorker.getRegistration()
      .then(async (registration) => {
        if (registration) {
          console.log('[Push] Existing SW registration found');
          setSwState(prev => ({
            ...prev,
            isRegistered: true,
            registration,
          }));
          
          // Check for existing subscription
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            console.log('[Push] Existing push subscription found');
            setSubscription(existingSubscription);
          }
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('[Push] Service Worker update found');
            setSwState(prev => ({ ...prev, updateAvailable: true }));
          });
        }
      })
      .catch((error) => {
        console.error('[Push] Error checking SW registration:', error);
      });
    
    // Listen for SW controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[Push] Service Worker controller changed');
    });
  }, [isSupported]);
  
  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!isSupported) {
      console.warn('[Push] Service Workers not supported');
      return null;
    }
    
    try {
      console.log('[Push] Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      
      console.log('[Push] Service Worker registered:', registration.scope);
      
      // Wait for SW to be ready
      await navigator.serviceWorker.ready;
      
      setSwState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }));
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('[Push] Service Worker update found');
        setSwState(prev => ({ ...prev, updateAvailable: true }));
      });
      
      return registration;
    } catch (error) {
      console.error('[Push] SW registration failed:', error);
      return null;
    }
  }, [isSupported]);
  
  // Unregister service worker
  const unregisterServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!swState.registration) {
      return false;
    }
    
    try {
      await swState.registration.unregister();
      setSwState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
        updateAvailable: false,
      }));
      setSubscription(null);
      console.log('[Push] Service Worker unregistered');
      return true;
    } catch (error) {
      console.error('[Push] Failed to unregister SW:', error);
      return false;
    }
  }, [swState.registration]);
  
  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('[Push] Notifications not supported');
      return false;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('[Push] Permission result:', result);
      return result === 'granted';
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }, []);
  
  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (
    vapidPublicKey: string = DEFAULT_VAPID_KEY
  ): Promise<PushSubscription | null> => {
    if (!swState.registration) {
      console.warn('[Push] No SW registration, registering first...');
      const reg = await registerServiceWorker();
      if (!reg) return null;
    }
    
    const registration = swState.registration || await navigator.serviceWorker.ready;
    
    // Check permission
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        console.warn('[Push] Permission denied');
        return null;
      }
    }
    
    try {
      // Check for existing subscription
      let pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        console.log('[Push] Using existing subscription');
        setSubscription(pushSubscription);
        return pushSubscription;
      }
      
      // Create new subscription
      // Note: For production, you need a real VAPID key
      if (!vapidPublicKey) {
        console.log('[Push] No VAPID key provided, using local notifications only');
        return null;
      }
      
      const subscribeOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      };
      
      pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log('[Push] New subscription created');
      setSubscription(pushSubscription);
      
      // Here you would typically send the subscription to your server
      // await sendSubscriptionToServer(pushSubscription);
      
      return pushSubscription;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }, [swState.registration, permission, requestPermission, registerServiceWorker]);
  
  // Unsubscribe from push
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return true;
    }
    
    try {
      await subscription.unsubscribe();
      setSubscription(null);
      console.log('[Push] Unsubscribed successfully');
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }, [subscription]);
  
  // Show local notification through SW
  const showLocalNotification = useCallback(async (
    payload: PushNotificationPayload
  ): Promise<boolean> => {
    // Ensure SW is registered
    let registration = swState.registration;
    if (!registration) {
      registration = await registerServiceWorker();
      if (!registration) {
        console.warn('[Push] Cannot show notification without SW');
        return false;
      }
    }
    
    // Check permission
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        console.warn('[Push] Notification permission denied');
        return false;
      }
    }
    
    try {
      // Send message to SW to show notification
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/favicon.svg',
            badge: payload.badge || '/favicon.ico',
            tag: payload.tag || `carcare-${Date.now()}`,
            data: {
              url: payload.url || '/',
              priority: payload.priority || 'normal',
              ...payload.data,
            },
            vibrate: getVibrationPattern(payload.priority || 'normal'),
            requireInteraction: payload.priority === 'urgent' || payload.priority === 'high',
            actions: payload.actions || getDefaultActions(payload.priority || 'normal'),
          },
        });
        return true;
      }
      
      // Fallback: show directly through registration
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.svg',
        badge: payload.badge || '/favicon.ico',
        tag: payload.tag || `carcare-${Date.now()}`,
        data: {
          url: payload.url || '/',
          priority: payload.priority || 'normal',
          ...payload.data,
        },
        requireInteraction: payload.priority === 'urgent' || payload.priority === 'high',
      });
      
      return true;
    } catch (error) {
      console.error('[Push] Failed to show notification:', error);
      return false;
    }
  }, [swState.registration, permission, requestPermission, registerServiceWorker]);
  
  // Update service worker
  const updateServiceWorker = useCallback(async (): Promise<void> => {
    if (!swState.registration) return;
    
    try {
      await swState.registration.update();
      
      // Send skip waiting message to new SW
      if (swState.registration.waiting) {
        swState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      setSwState(prev => ({ ...prev, updateAvailable: false }));
      console.log('[Push] Service Worker updated');
    } catch (error) {
      console.error('[Push] Update failed:', error);
    }
  }, [swState.registration]);
  
  // Clear SW cache
  const clearCache = useCallback(async (): Promise<boolean> => {
    if (!navigator.serviceWorker.controller) {
      return false;
    }
    
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data?.success || false);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
      
      // Timeout after 5s
      setTimeout(() => resolve(false), 5000);
    });
  }, []);
  
  // Get SW version
  const getSwVersion = useCallback(async (): Promise<string | null> => {
    if (!navigator.serviceWorker.controller) {
      return null;
    }
    
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data?.version || null);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [channel.port2]
      );
      
      // Timeout after 5s
      setTimeout(() => resolve(null), 5000);
    });
  }, []);
  
  return {
    swState,
    isSubscribed: !!subscription,
    subscription,
    permission,
    registerServiceWorker,
    unregisterServiceWorker,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showLocalNotification,
    updateServiceWorker,
    clearCache,
    getSwVersion,
  };
};

// Helper: Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Helper: Get vibration pattern
function getVibrationPattern(priority: AlertPriority): number[] {
  switch (priority) {
    case 'urgent':
      return [200, 100, 200, 100, 200, 100, 400];
    case 'high':
      return [200, 100, 200, 100, 200];
    case 'normal':
      return [100, 50, 100];
    case 'low':
      return [100];
    default:
      return [100, 50, 100];
  }
}

// Helper: Get default actions
function getDefaultActions(priority: AlertPriority): Array<{ action: string; title: string }> {
  if (priority === 'urgent' || priority === 'high') {
    return [
      { action: 'view', title: '🚨 Ver Agora' },
      { action: 'dismiss', title: '✕ Depois' },
    ];
  }
  
  return [
    { action: 'view', title: '👁️ Ver' },
    { action: 'dismiss', title: '✕ Dispensar' },
  ];
}

export default usePushNotifications;
