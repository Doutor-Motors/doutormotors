import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBluetoothConnection } from './useBluetoothConnection';
import { useWiFiConnection } from './useWiFiConnection';
import { useCapacitorBluetooth } from './useCapacitorBluetooth';
import { useCapacitorTCP } from './useCapacitorTCP';
import { ConnectionType, ConnectionStatus, OBDData, OBDDevice } from './types';
import { useMileageSync } from '@/hooks/useMileageSync';

// Extended connection type to include Capacitor
export type ExtendedConnectionType = ConnectionType | 'capacitor-bluetooth' | 'capacitor-wifi';

interface UseOBDConnectionReturn {
  // Status
  connectionStatus: ConnectionStatus;
  connectionType: ExtendedConnectionType | null;
  device: OBDDevice | null;
  isSimulated: boolean;

  // Capabilities
  isBluetoothSupported: boolean;
  isWifiSupported: boolean;
  isCapacitorSupported: boolean;
  isNativePlatform: boolean;

  // WiFi Config
  wifiConfig: { ip: string; port: number };
  setWifiConfig: (config: { ip: string; port: number }) => void;

  // Capacitor specific
  availableDevices: OBDDevice[];
  isScanning: boolean;
  scanDevices: () => Promise<OBDDevice[]>;

  // Actions
  connectBluetooth: () => Promise<boolean>;
  connectWifi: (ip?: string, port?: number) => Promise<boolean>;
  connectCapacitorBluetooth: () => Promise<boolean>;
  connectCapacitorWifi: (ip?: string, port?: number) => Promise<boolean>;
  disconnect: () => void;
  readDTCCodes: () => Promise<OBDData>;
  readMileage: () => Promise<number | null>;

  // Mileage sync
  lastSyncedMileage: number | null;
  lastSyncedAt: string | null;
  isSyncingMileage: boolean;
}

export const useOBDConnection = (): UseOBDConnectionReturn => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionType, setConnectionType] = useState<ExtendedConnectionType | null>(null);

  // Web-based connections
  const bluetooth = useBluetoothConnection();
  const wifi = useWiFiConnection();

  // Capacitor native connections
  const capacitorBluetooth = useCapacitorBluetooth();
  const capacitorTCP = useCapacitorTCP();

  // Mileage sync hook
  const mileageSync = useMileageSync();

  // Check if running in native platform
  const isNativePlatform = typeof window !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.() === true;

  // Connect via Web Bluetooth
  const connectBluetooth = useCallback(async (): Promise<boolean> => {
    setConnectionStatus('connecting');
    setConnectionType('bluetooth');

    const success = await bluetooth.connect();

    if (success) {
      setConnectionStatus('connected');
      return true;
    } else {
      setConnectionStatus('disconnected');
      setConnectionType(null);
      return false;
    }
  }, [bluetooth]);

  // Connect via Web WiFi (simulation)
  const connectWifi = useCallback(async (ip?: string, port?: number): Promise<boolean> => {
    setConnectionStatus('connecting');
    setConnectionType('wifi');

    const success = await wifi.connect(ip, port);

    if (success) {
      setConnectionStatus('connected');
      return true;
    } else {
      setConnectionStatus('disconnected');
      setConnectionType(null);
      return false;
    }
  }, [wifi]);

  // Connect via Capacitor Bluetooth (native)
  const connectCapacitorBluetooth = useCallback(async (): Promise<boolean> => {
    setConnectionStatus('connecting');
    setConnectionType('capacitor-bluetooth');

    const success = await capacitorBluetooth.connect();

    if (success) {
      setConnectionStatus('connected');
      return true;
    } else {
      setConnectionStatus('disconnected');
      setConnectionType(null);
      return false;
    }
  }, [capacitorBluetooth]);

  // Connect via Capacitor TCP (native WiFi)
  const connectCapacitorWifi = useCallback(async (ip?: string, port?: number): Promise<boolean> => {
    setConnectionStatus('connecting');
    setConnectionType('capacitor-wifi');

    const success = await capacitorTCP.connect(ip, port);

    if (success) {
      setConnectionStatus('connected');
      return true;
    } else {
      setConnectionStatus('disconnected');
      setConnectionType(null);
      return false;
    }
  }, [capacitorTCP]);

  // Disconnect from current connection
  const disconnect = useCallback(() => {
    switch (connectionType) {
      case 'bluetooth':
        bluetooth.disconnect();
        break;
      case 'wifi':
        wifi.disconnect();
        break;
      case 'capacitor-bluetooth':
        capacitorBluetooth.disconnect();
        break;
      case 'capacitor-wifi':
        capacitorTCP.disconnect();
        break;
    }

    setConnectionStatus('disconnected');
    setConnectionType(null);
  }, [connectionType, bluetooth, wifi, capacitorBluetooth, capacitorTCP]);

  // Read DTC codes from current connection
  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (connectionStatus !== 'connected') {
      throw new Error('OBD2 não conectado');
    }

    switch (connectionType) {
      case 'bluetooth':
        return bluetooth.readDTCCodes();
      case 'wifi':
        return wifi.readDTCCodes();
      case 'capacitor-bluetooth':
        return capacitorBluetooth.readDTCCodes();
      case 'capacitor-wifi':
        return capacitorTCP.readDTCCodes();
      default:
        throw new Error('Tipo de conexão inválido');
    }
  }, [connectionStatus, connectionType, bluetooth, wifi, capacitorBluetooth, capacitorTCP]);

  // Read mileage/odometer from OBD (PID 01 A6 - Odometer)
  const readMileage = useCallback(async (): Promise<number | null> => {
    if (connectionStatus !== 'connected') {
      return null;
    }

    try {
      // PRODUÇÃO: Simulação de dados removida.
      // Se não houver implementação real de leitura (AT command), retorna null.
      return null;
    } catch (err) {
      console.error('[OBD] Error reading mileage:', err);
      return null;
    }
  }, [connectionStatus, mileageSync]);

  // Auto-sync mileage when connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      // Read mileage on connection
      readMileage();
    }
  }, [connectionStatus]);

  // Determine current device based on connection type
  const getDevice = (): OBDDevice | null => {
    switch (connectionType) {
      case 'bluetooth':
        return bluetooth.device;
      case 'wifi':
        return wifi.device;
      case 'capacitor-bluetooth':
        return capacitorBluetooth.device;
      case 'capacitor-wifi':
        return capacitorTCP.device;
      default:
        return null;
    }
  };

  // Determine if current connection is simulated
  const getIsSimulated = (): boolean => {
    switch (connectionType) {
      case 'bluetooth':
        return bluetooth.isSimulated;
      case 'wifi':
        return wifi.isSimulated;
      case 'capacitor-bluetooth':
        return !capacitorBluetooth.isNative;
      case 'capacitor-wifi':
        return !capacitorTCP.isNative;
      default:
        return false;
    }
  };

  return {
    connectionStatus,
    connectionType,
    device: getDevice(),
    isSimulated: getIsSimulated(),
    isBluetoothSupported: bluetooth.isSupported,
    isWifiSupported: wifi.isSupported,
    isCapacitorSupported: capacitorBluetooth.isSupported || capacitorTCP.isSupported,
    isNativePlatform,
    wifiConfig: wifi.connectionConfig,
    setWifiConfig: wifi.setConnectionConfig,
    availableDevices: capacitorBluetooth.availableDevices,
    isScanning: capacitorBluetooth.isScanning,
    scanDevices: capacitorBluetooth.scanDevices,
    connectBluetooth,
    connectWifi,
    connectCapacitorBluetooth,
    connectCapacitorWifi,
    disconnect,
    readDTCCodes,
    readMileage,
    lastSyncedMileage: mileageSync.lastSyncedMileage,
    lastSyncedAt: mileageSync.lastSyncedAt,
    isSyncingMileage: mileageSync.isSyncing,
  };
};
