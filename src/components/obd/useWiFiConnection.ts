import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OBDData, OBDDevice, DEFAULT_WIFI_CONFIG } from './types';

interface UseWiFiConnectionReturn {
  isSupported: boolean;
  device: OBDDevice | null;
  connect: (ip?: string, port?: number) => Promise<boolean>;
  disconnect: () => void;
  readDTCCodes: () => Promise<OBDData>;
  isSimulated: boolean;
  connectionConfig: { ip: string; port: number };
  setConnectionConfig: (config: { ip: string; port: number }) => void;
}

export const useWiFiConnection = (): UseWiFiConnectionReturn => {
  const { toast } = useToast();
  const [device, setDevice] = useState<OBDDevice | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState({
    ip: DEFAULT_WIFI_CONFIG.defaultIP,
    port: DEFAULT_WIFI_CONFIG.defaultPort,
  });
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  // WiFi OBD2 is always "supported" in the sense we can try to connect
  // Real support depends on network conditions
  const isSupported = true;

  const connect = useCallback(async (
    ip: string = connectionConfig.ip,
    port: number = connectionConfig.port
  ): Promise<boolean> => {
    try {
      // Try to establish WebSocket connection to OBD2 WiFi adapter
      // Most ELM327 WiFi adapters use raw TCP, but we'll simulate here
      // In a real native app, you'd use a TCP socket library

      return new Promise((resolve) => {
        // PRODUÇÃO: Em ambiente web, não podemos conectar via Socket TCP raw
        // Retornamos false imediatamente para forçar uso do App Nativo
        toast({
          title: "Conexão WiFi Indisponível",
          description: "O navegador não suporta conexão OBD2 via WiFi. Use o App Nativo.",
          variant: "destructive",
        });
        resolve(false);
      });
    } catch (error) {
      console.error('WiFi connection error:', error);
      toast({
        title: "Erro de conexão WiFi",
        description: "Não foi possível conectar via WiFi.",
        variant: "destructive",
      });
      return false;
    }
  }, [connectionConfig, toast]);

  const disconnect = useCallback(() => {
    if (webSocket) {
      webSocket.close();
      setWebSocket(null);
    }
    setDevice(null);
    setIsSimulated(false);

    toast({
      title: "WiFi Desconectado",
      description: "Adaptador OBD2 WiFi desconectado.",
    });
  }, [webSocket, toast]);

  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (!device) {
      throw new Error('WiFi não conectado');
    }

    // PRODUÇÃO: WiFi OBD2 requer app nativo (TCP raw)
    // Navegadores não suportam conexão TCP direta
    throw new Error('Leitura de DTCs via WiFi requer o app nativo. Navegadores não suportam TCP raw.');
  }, [device]);

  return {
    isSupported,
    device,
    connect,
    disconnect,
    readDTCCodes,
    isSimulated,
    connectionConfig,
    setConnectionConfig,
  };
};
