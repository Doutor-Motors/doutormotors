/**
 * Platform Detection Utilities for Capacitor Native Apps
 * Detects if running in native Capacitor context vs web browser
 */

export interface PlatformInfo {
  isNative: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
  platform: 'android' | 'ios' | 'web';
  supportsBluetoothNative: boolean;
  supportsBluetoothWeb: boolean;
  supportsTCPNative: boolean;
  supportsTCPWeb: boolean;
  recommendedConnectionMethod: 'bluetooth' | 'wifi' | 'none';
}

// Check if Capacitor is available
const getCapacitor = () => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    return window.Capacitor;
  }
  return null;
};

// Check if BluetoothSerial plugin is available
const hasBluetoothSerialPlugin = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).BluetoothSerial !== 'undefined';
};

// Check if TCP Socket plugin is available
const hasTCPSocketPlugin = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).TcpSockets !== 'undefined';
};

// Check if Web Bluetooth API is available
const hasWebBluetooth = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as any;
  return typeof nav.bluetooth !== 'undefined' &&
         typeof nav.bluetooth.requestDevice === 'function';
};

// Get platform info
export const getPlatformInfo = (): PlatformInfo => {
  const capacitor = getCapacitor();
  
  const isNative = capacitor?.isNativePlatform?.() === true;
  const platformName = capacitor?.getPlatform?.() || 'web';
  
  const isAndroid = platformName === 'android';
  const isIOS = platformName === 'ios';
  const isWeb = !isNative;
  
  // Native capabilities
  const supportsBluetoothNative = isNative && hasBluetoothSerialPlugin();
  const supportsTCPNative = isNative && hasTCPSocketPlugin();
  
  // Web capabilities
  const supportsBluetoothWeb = isWeb && hasWebBluetooth();
  const supportsTCPWeb = false; // Browsers don't support raw TCP
  
  // Determine recommended connection method
  let recommendedConnectionMethod: 'bluetooth' | 'wifi' | 'none' = 'none';
  
  if (isNative) {
    // Native app: prefer Bluetooth, fallback to WiFi
    if (supportsBluetoothNative) {
      recommendedConnectionMethod = 'bluetooth';
    } else if (supportsTCPNative) {
      recommendedConnectionMethod = 'wifi';
    }
  } else {
    // Web: only Web Bluetooth on supported browsers
    if (supportsBluetoothWeb) {
      recommendedConnectionMethod = 'bluetooth';
    }
  }
  
  return {
    isNative,
    isAndroid,
    isIOS,
    isWeb,
    platform: isAndroid ? 'android' : isIOS ? 'ios' : 'web',
    supportsBluetoothNative,
    supportsBluetoothWeb,
    supportsTCPNative,
    supportsTCPWeb,
    recommendedConnectionMethod,
  };
};

// Get user-friendly platform description
export const getPlatformDescription = (): string => {
  const info = getPlatformInfo();
  
  if (info.isNative) {
    return info.isAndroid ? 'App Android Nativo' : 'App iOS Nativo';
  }
  
  // Detect browser
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('chrome') && !ua.includes('edge')) {
    if (ua.includes('android')) return 'Chrome Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'Chrome iOS';
    return 'Chrome Desktop';
  }
  if (ua.includes('safari') && !ua.includes('chrome')) {
    if (ua.includes('iphone') || ua.includes('ipad')) return 'Safari iOS';
    return 'Safari macOS';
  }
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('edge')) return 'Microsoft Edge';
  
  return 'Navegador Web';
};

// Get connection capability message
export const getConnectionCapabilityMessage = (): {
  bluetooth: { supported: boolean; message: string };
  wifi: { supported: boolean; message: string };
} => {
  const info = getPlatformInfo();
  
  const bluetooth = {
    supported: info.supportsBluetoothNative || info.supportsBluetoothWeb,
    message: '',
  };
  
  const wifi = {
    supported: info.supportsTCPNative,
    message: '',
  };
  
  if (info.isNative) {
    bluetooth.message = info.supportsBluetoothNative 
      ? '✅ Bluetooth disponível (plugin nativo)'
      : '❌ Plugin Bluetooth não instalado';
    wifi.message = info.supportsTCPNative
      ? '✅ WiFi/TCP disponível (plugin nativo)'
      : '❌ Plugin TCP não instalado';
  } else {
    bluetooth.message = info.supportsBluetoothWeb
      ? '✅ Web Bluetooth disponível'
      : '❌ Web Bluetooth não suportado neste navegador';
    wifi.message = '❌ Conexão TCP não suportada em navegadores (use o app nativo)';
  }
  
  return { bluetooth, wifi };
};

// Check if current environment supports OBD connections
export const canConnectToOBD = (): boolean => {
  const info = getPlatformInfo();
  return info.supportsBluetoothNative || 
         info.supportsBluetoothWeb || 
         info.supportsTCPNative;
};

// Get recommended action for user
export const getRecommendedAction = (): string => {
  const info = getPlatformInfo();
  
  if (canConnectToOBD()) {
    if (info.recommendedConnectionMethod === 'bluetooth') {
      return 'Conecte seu adaptador OBD2 Bluetooth e clique em "Conectar"';
    }
    if (info.recommendedConnectionMethod === 'wifi') {
      return 'Conecte-se à rede WiFi do adaptador OBD2 e clique em "Conectar"';
    }
  }
  
  // No support
  const platform = getPlatformDescription();
  
  if (platform.includes('Safari') || platform.includes('iOS')) {
    return '⚠️ Safari/iOS não suporta conexões OBD via navegador. Baixe nosso app nativo para usar todas as funcionalidades.';
  }
  
  if (platform.includes('Firefox')) {
    return '⚠️ Firefox não suporta Web Bluetooth. Use o Chrome ou baixe nosso app nativo.';
  }
  
  return '⚠️ Seu navegador não suporta conexões OBD. Use o Chrome no Android/Desktop ou baixe nosso app nativo.';
};

// Global type declarations for Capacitor plugins
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
    BluetoothSerial?: {
      isEnabled: () => Promise<boolean>;
      requestEnable: () => Promise<void>;
      enable: () => Promise<void>;
      list: () => Promise<Array<{ id: string; name: string; address: string; class?: number }>>;
      discoverUnpaired: (
        success: (device: { id: string; name: string; address: string }) => void,
        error: (error: any) => void
      ) => void;
      cancelDiscovery: () => Promise<void>;
      connect: (address: string) => Promise<void>;
      connectInsecure: (address: string) => Promise<void>;
      disconnect: () => Promise<void>;
      isConnected: () => Promise<boolean>;
      write: (data: string) => Promise<void>;
      read: () => Promise<string>;
      readUntil: (delimiter: string) => Promise<string>;
      subscribe: (
        delimiter: string,
        success: (data: string) => void,
        error: (error: any) => void
      ) => void;
      unsubscribe: () => Promise<void>;
      clear: () => Promise<void>;
    };
    TcpSockets?: {
      create: () => Promise<TcpSocket>;
    };
  }
  
  interface TcpSocket {
    connect: (options: { host: string; port: number; timeout?: number }) => Promise<void>;
    write: (data: string) => void;
    on: (event: 'data' | 'error' | 'close', callback: (data: any) => void) => void;
    close: () => void;
  }
}

export {};
