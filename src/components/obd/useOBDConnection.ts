import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBluetoothConnection } from './useBluetoothConnection';
import { useWiFiConnection } from './useWiFiConnection';
import { ConnectionType, ConnectionStatus, OBDData, OBDDevice } from './types';

interface UseOBDConnectionReturn {
  // Status
  connectionStatus: ConnectionStatus;
  connectionType: ConnectionType | null;
  device: OBDDevice | null;
  isSimulated: boolean;
  
  // Capabilities
  isBluetoothSupported: boolean;
  isWifiSupported: boolean;
  
  // WiFi Config
  wifiConfig: { ip: string; port: number };
  setWifiConfig: (config: { ip: string; port: number }) => void;
  
  // Actions
  connectBluetooth: () => Promise<boolean>;
  connectWifi: (ip?: string, port?: number) => Promise<boolean>;
  disconnect: () => void;
  readDTCCodes: () => Promise<OBDData>;
}

export const useOBDConnection = (): UseOBDConnectionReturn => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);

  const bluetooth = useBluetoothConnection();
  const wifi = useWiFiConnection();

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

  const disconnect = useCallback(() => {
    if (connectionType === 'bluetooth') {
      bluetooth.disconnect();
    } else if (connectionType === 'wifi') {
      wifi.disconnect();
    }
    
    setConnectionStatus('disconnected');
    setConnectionType(null);
  }, [connectionType, bluetooth, wifi]);

  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (connectionStatus !== 'connected') {
      throw new Error('OBD2 não conectado');
    }

    if (connectionType === 'bluetooth') {
      return bluetooth.readDTCCodes();
    } else if (connectionType === 'wifi') {
      return wifi.readDTCCodes();
    }

    throw new Error('Tipo de conexão inválido');
  }, [connectionStatus, connectionType, bluetooth, wifi]);

  // Determine current device based on connection type
  const device = connectionType === 'bluetooth' ? bluetooth.device : 
                 connectionType === 'wifi' ? wifi.device : null;

  // Determine if current connection is simulated
  const isSimulated = connectionType === 'bluetooth' ? bluetooth.isSimulated :
                      connectionType === 'wifi' ? wifi.isSimulated : false;

  return {
    connectionStatus,
    connectionType,
    device,
    isSimulated,
    isBluetoothSupported: bluetooth.isSupported,
    isWifiSupported: wifi.isSupported,
    wifiConfig: wifi.connectionConfig,
    setWifiConfig: wifi.setConnectionConfig,
    connectBluetooth,
    connectWifi,
    disconnect,
    readDTCCodes,
  };
};
