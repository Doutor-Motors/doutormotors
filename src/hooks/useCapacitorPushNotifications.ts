import { useCallback, useEffect, useState } from 'react';
import { getPlatformInfo } from '@/utils/platformDetector';

/**
 * Capacitor Push Notifications Types
 * Based on @capacitor/push-notifications plugin
 */
interface PushNotificationToken {
  value: string;
}

interface PushNotificationActionPerformed {
  actionId: string;
  inputValue?: string;
  notification: PushNotificationSchema;
}

interface PushNotificationSchema {
  title?: string;
  subtitle?: string;
  body?: string;
  id: string;
  tag?: string;
  badge?: number;
  data: Record<string, unknown>;
  click_action?: string;
  link?: string;
  group?: string;
  groupSummary?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  importance?: 1 | 2 | 3 | 4 | 5;
  visibility?: -1 | 0 | 1;
  lights?: boolean;
  lightColor?: string;
  vibration?: boolean;
  sound?: string;
}

// Capacitor Push Notifications plugin interface
interface CapacitorPushNotifications {
  checkPermissions(): Promise<{ receive: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied' }>;
  requestPermissions(): Promise<{ receive: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied' }>;
  register(): Promise<void>;
  unregister(): Promise<void>;
  getDeliveredNotifications(): Promise<{ notifications: PushNotificationSchema[] }>;
  removeDeliveredNotifications(options: { notifications: PushNotificationSchema[] }): Promise<void>;
  removeAllDeliveredNotifications(): Promise<void>;
  createChannel(channel: Channel): Promise<void>;
  deleteChannel(args: { id: string }): Promise<void>;
  listChannels(): Promise<{ channels: Channel[] }>;
  addListener(eventName: 'registration', listenerFunc: (token: PushNotificationToken) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'registrationError', listenerFunc: (error: { error: string }) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'pushNotificationReceived', listenerFunc: (notification: PushNotificationSchema) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'pushNotificationActionPerformed', listenerFunc: (action: PushNotificationActionPerformed) => void): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}

// Check for Capacitor plugins
const getCapacitorPushPlugin = (): CapacitorPushNotifications | null => {
  if (typeof window !== 'undefined') {
    const capacitor = (window as any).Capacitor;
    if (capacitor?.Plugins?.PushNotifications) {
      return capacitor.Plugins.PushNotifications;
    }
  }
  return null;
};

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

interface UseCapacitorPushNotificationsReturn {
  // State
  isNative: boolean;
  isSupported: boolean;
  isRegistered: boolean;
  permission: 'prompt' | 'granted' | 'denied' | 'unknown';
  token: string | null;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  register: () => Promise<boolean>;
  unregister: () => Promise<void>;
  
  // Channels (Android only)
  createDiagnosticChannels: () => Promise<void>;
  
  // Notifications
  getDeliveredNotifications: () => Promise<PushNotificationSchema[]>;
  clearAllNotifications: () => Promise<void>;
  
  // Event handlers
  onTokenReceived: (callback: (token: string) => void) => void;
  onNotificationReceived: (callback: (notification: PushNotificationSchema) => void) => void;
  onNotificationAction: (callback: (action: PushNotificationActionPerformed) => void) => void;
}

// Diagnostic notification channels for Android
const DIAGNOSTIC_CHANNELS: Channel[] = [
  {
    id: 'diagnostic-critical',
    name: 'Diagnósticos Críticos',
    description: 'Alertas de problemas críticos que requerem ação imediata',
    importance: 5,
    visibility: 1,
    lights: true,
    lightColor: '#FF0000',
    vibration: true,
    sound: 'default',
  },
  {
    id: 'diagnostic-attention',
    name: 'Atenção Necessária',
    description: 'Problemas que precisam de atenção em breve',
    importance: 4,
    visibility: 0,
    lights: true,
    lightColor: '#FFA500',
    vibration: true,
  },
  {
    id: 'diagnostic-preventive',
    name: 'Manutenção Preventiva',
    description: 'Lembretes de manutenção preventiva',
    importance: 3,
    visibility: 0,
    lights: false,
    vibration: false,
  },
  {
    id: 'system-updates',
    name: 'Atualizações do Sistema',
    description: 'Novidades e atualizações do app',
    importance: 2,
    visibility: 0,
    lights: false,
    vibration: false,
  },
];

export const useCapacitorPushNotifications = (): UseCapacitorPushNotificationsReturn => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [token, setToken] = useState<string | null>(null);
  
  // Callbacks
  const [onTokenCallback, setOnTokenCallback] = useState<((token: string) => void) | null>(null);
  const [onNotificationCallback, setOnNotificationCallback] = useState<((notification: PushNotificationSchema) => void) | null>(null);
  const [onActionCallback, setOnActionCallback] = useState<((action: PushNotificationActionPerformed) => void) | null>(null);
  
  // Platform info
  const platformInfo = getPlatformInfo();
  const isNative = platformInfo.isNative;
  
  // Get plugin instance
  const getPlugin = useCallback((): CapacitorPushNotifications | null => {
    return getCapacitorPushPlugin();
  }, []);
  
  const isSupported = isNative && getPlugin() !== null;
  
  // Initialize and set up listeners
  useEffect(() => {
    if (!isSupported) return;
    
    const plugin = getPlugin();
    if (!plugin) return;
    
    const setupListeners = async () => {
      // Registration success
      const tokenListener = await plugin.addListener('registration', (tokenData) => {
        console.log('[CapacitorPush] Token received:', tokenData.value.substring(0, 20) + '...');
        setToken(tokenData.value);
        setIsRegistered(true);
        onTokenCallback?.(tokenData.value);
      });
      
      // Registration error
      const errorListener = await plugin.addListener('registrationError', (error) => {
        console.error('[CapacitorPush] Registration error:', error.error);
        setIsRegistered(false);
      });
      
      // Notification received (foreground)
      const notificationListener = await plugin.addListener('pushNotificationReceived', (notification) => {
        console.log('[CapacitorPush] Notification received:', notification);
        onNotificationCallback?.(notification);
      });
      
      // Notification action performed (user tapped)
      const actionListener = await plugin.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[CapacitorPush] Action performed:', action);
        onActionCallback?.(action);
      });
      
      // Check initial permission state
      const permissionStatus = await plugin.checkPermissions();
      setPermission(permissionStatus.receive === 'granted' ? 'granted' : 
                   permissionStatus.receive === 'denied' ? 'denied' : 'prompt');
      
      return () => {
        tokenListener.remove();
        errorListener.remove();
        notificationListener.remove();
        actionListener.remove();
      };
    };
    
    setupListeners();
  }, [isSupported, getPlugin, onTokenCallback, onNotificationCallback, onActionCallback]);
  
  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const plugin = getPlugin();
    if (!plugin) {
      console.warn('[CapacitorPush] Plugin not available');
      return false;
    }
    
    try {
      const result = await plugin.requestPermissions();
      const granted = result.receive === 'granted';
      setPermission(granted ? 'granted' : 'denied');
      console.log('[CapacitorPush] Permission:', result.receive);
      return granted;
    } catch (error) {
      console.error('[CapacitorPush] Permission request failed:', error);
      return false;
    }
  }, [getPlugin]);
  
  // Register for push notifications
  const register = useCallback(async (): Promise<boolean> => {
    const plugin = getPlugin();
    if (!plugin) {
      console.warn('[CapacitorPush] Plugin not available');
      return false;
    }
    
    // Request permission first
    const hasPermission = permission === 'granted' || await requestPermission();
    if (!hasPermission) {
      console.warn('[CapacitorPush] Permission denied');
      return false;
    }
    
    try {
      await plugin.register();
      console.log('[CapacitorPush] Registered for push notifications');
      return true;
    } catch (error) {
      console.error('[CapacitorPush] Registration failed:', error);
      return false;
    }
  }, [getPlugin, permission, requestPermission]);
  
  // Unregister
  const unregister = useCallback(async (): Promise<void> => {
    const plugin = getPlugin();
    if (!plugin) return;
    
    try {
      await plugin.unregister();
      setIsRegistered(false);
      setToken(null);
      console.log('[CapacitorPush] Unregistered');
    } catch (error) {
      console.error('[CapacitorPush] Unregister failed:', error);
    }
  }, [getPlugin]);
  
  // Create diagnostic notification channels (Android only)
  const createDiagnosticChannels = useCallback(async (): Promise<void> => {
    const plugin = getPlugin();
    if (!plugin || !platformInfo.isAndroid) return;
    
    try {
      for (const channel of DIAGNOSTIC_CHANNELS) {
        await plugin.createChannel(channel);
        console.log('[CapacitorPush] Channel created:', channel.id);
      }
    } catch (error) {
      console.error('[CapacitorPush] Failed to create channels:', error);
    }
  }, [getPlugin, platformInfo.isAndroid]);
  
  // Get delivered notifications
  const getDeliveredNotifications = useCallback(async (): Promise<PushNotificationSchema[]> => {
    const plugin = getPlugin();
    if (!plugin) return [];
    
    try {
      const result = await plugin.getDeliveredNotifications();
      return result.notifications;
    } catch (error) {
      console.error('[CapacitorPush] Failed to get delivered notifications:', error);
      return [];
    }
  }, [getPlugin]);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(async (): Promise<void> => {
    const plugin = getPlugin();
    if (!plugin) return;
    
    try {
      await plugin.removeAllDeliveredNotifications();
      console.log('[CapacitorPush] All notifications cleared');
    } catch (error) {
      console.error('[CapacitorPush] Failed to clear notifications:', error);
    }
  }, [getPlugin]);
  
  // Callback setters
  const onTokenReceived = useCallback((callback: (token: string) => void) => {
    setOnTokenCallback(() => callback);
  }, []);
  
  const onNotificationReceived = useCallback((callback: (notification: PushNotificationSchema) => void) => {
    setOnNotificationCallback(() => callback);
  }, []);
  
  const onNotificationAction = useCallback((callback: (action: PushNotificationActionPerformed) => void) => {
    setOnActionCallback(() => callback);
  }, []);
  
  return {
    isNative,
    isSupported,
    isRegistered,
    permission,
    token,
    requestPermission,
    register,
    unregister,
    createDiagnosticChannels,
    getDeliveredNotifications,
    clearAllNotifications,
    onTokenReceived,
    onNotificationReceived,
    onNotificationAction,
  };
};

/**
 * Helper: Get channel ID based on diagnostic priority
 */
export const getChannelForPriority = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'diagnostic-critical';
    case 'high':
      return 'diagnostic-attention';
    case 'normal':
      return 'diagnostic-preventive';
    case 'low':
      return 'system-updates';
    default:
      return 'diagnostic-preventive';
  }
};

export default useCapacitorPushNotifications;
