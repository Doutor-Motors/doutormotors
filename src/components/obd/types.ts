// OBD2 Connection Types

export type ConnectionType = 'bluetooth' | 'wifi';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface OBDData {
  dtcCodes: string[];
  rawData: Record<string, unknown>;
  timestamp: Date;
  connectionType: ConnectionType;
}

export interface OBDDevice {
  id: string;
  name: string;
  type: ConnectionType;
  address?: string; // IP for WiFi, MAC for Bluetooth
  port?: number; // For WiFi connections
  signalStrength?: number;
}

export interface OBDConnectionConfig {
  bluetooth?: {
    serviceUUID: string;
    characteristicUUID: string;
  };
  wifi?: {
    defaultIP: string;
    defaultPort: number;
    timeout: number;
  };
}

// Default OBD2 WiFi adapter settings (ELM327 WiFi)
export const DEFAULT_WIFI_CONFIG = {
  defaultIP: '192.168.0.10',
  defaultPort: 35000,
  timeout: 5000,
};

// Default OBD2 Bluetooth adapter settings
export const DEFAULT_BLUETOOTH_CONFIG = {
  serviceUUID: '0000fff0-0000-1000-8000-00805f9b34fb',
  characteristicUUID: '0000fff1-0000-1000-8000-00805f9b34fb',
};
