import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OBDData, OBDDevice, DEFAULT_WIFI_CONFIG, SIMULATED_DTC_CODES } from './types';
import { getPlatformInfo } from '@/utils/platformDetector';

// Types are now defined in platformDetector.ts

interface UseCapacitorTCPReturn {
  isNative: boolean;
  isSupported: boolean;
  device: OBDDevice | null;
  connect: (ip?: string, port?: number) => Promise<boolean>;
  disconnect: () => void;
  readDTCCodes: () => Promise<OBDData>;
  connectionConfig: { ip: string; port: number };
  setConnectionConfig: (config: { ip: string; port: number }) => void;
  isSimulated: boolean;
}

// ELM327 Commands
const ELM327_COMMANDS = {
  RESET: 'ATZ',
  ECHO_OFF: 'ATE0',
  LINEFEED_OFF: 'ATL0',
  HEADERS_OFF: 'ATH0',
  AUTO_PROTOCOL: 'ATSP0',
  READ_DTC: '03',
  READ_VOLTAGE: 'ATRV',
  READ_PROTOCOL: 'ATDP',
};

export const useCapacitorTCP = (): UseCapacitorTCPReturn => {
  const { toast } = useToast();
  const [device, setDevice] = useState<OBDDevice | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [connectionConfig, setConnectionConfig] = useState({
    ip: DEFAULT_WIFI_CONFIG.defaultIP,
    port: DEFAULT_WIFI_CONFIG.defaultPort,
  });

  // Use platform detector for accurate capability detection
  const platformInfo = getPlatformInfo();
  const isNative = platformInfo.isNative;
  const isSupported = platformInfo.supportsTCPNative;
  const isSimulated = !isSupported;

  // Connect via TCP socket
  const connect = useCallback(async (
    ip: string = connectionConfig.ip,
    port: number = connectionConfig.port
  ): Promise<boolean> => {
    if (!isNative) {
      // Simulate connection in browser
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDevice({
        id: `capacitor-tcp-${ip}`,
        name: `OBD2 TCP (${ip}:${port})`,
        type: 'wifi',
        address: ip,
        port: port,
        signalStrength: 95,
      });
      toast({
        title: 'Modo Demonstração TCP',
        description: `Conexão TCP simulada (execute no app móvel para conexão real)`,
      });
      return true;
    }

    try {
      // In a real Capacitor app, you would use a TCP socket plugin
      // Example with capacitor-tcp-socket or similar:
      const TcpSocket = (window as any).TcpSockets;
      
      if (!TcpSocket) {
        throw new Error('TCP Socket plugin not available');
      }

      const newSocket = await TcpSocket.create();
      
      await newSocket.connect({
        host: ip,
        port: port,
        timeout: 5000,
      });

      setSocket(newSocket);

      // Initialize ELM327
      await sendCommand(newSocket, ELM327_COMMANDS.RESET);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendCommand(newSocket, ELM327_COMMANDS.ECHO_OFF);
      await sendCommand(newSocket, ELM327_COMMANDS.LINEFEED_OFF);
      await sendCommand(newSocket, ELM327_COMMANDS.HEADERS_OFF);
      await sendCommand(newSocket, ELM327_COMMANDS.AUTO_PROTOCOL);

      setDevice({
        id: `tcp-${ip}-${port}`,
        name: `OBD2 WiFi (${ip})`,
        type: 'wifi',
        address: ip,
        port: port,
        signalStrength: 90,
      });

      toast({
        title: 'Conectado via TCP Nativo!',
        description: `Conectado ao adaptador em ${ip}:${port}`,
      });

      return true;
    } catch (error: any) {
      console.error('TCP connection error:', error);
      toast({
        title: 'Erro de conexão TCP',
        description: error.message || 'Não foi possível conectar ao adaptador WiFi.',
        variant: 'destructive',
      });
      return false;
    }
  }, [isNative, connectionConfig, toast]);

  // Send command via TCP
  const sendCommand = async (tcpSocket: any, command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
      
      tcpSocket.write(command + '\r');
      
      tcpSocket.on('data', (data: any) => {
        clearTimeout(timeout);
        resolve(data.toString().trim());
      });
      
      tcpSocket.on('error', (error: any) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  };

  // Disconnect
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
    setDevice(null);
    toast({
      title: 'Desconectado',
      description: 'Conexão TCP encerrada.',
    });
  }, [socket, toast]);

  // Read DTC codes
  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (!device) {
      throw new Error('Dispositivo não conectado');
    }

    if (!isNative || !socket) {
      // Return simulated data
      await new Promise(resolve => setTimeout(resolve, 1500));
      const randomIndex = Math.floor(Math.random() * SIMULATED_DTC_CODES.length);
      return {
        dtcCodes: SIMULATED_DTC_CODES[randomIndex],
        rawData: {
          protocol: 'Capacitor TCP (Simulated)',
          voltage: '12.6V',
          connectionMethod: 'Capacitor TCP Native',
          deviceIP: device.address,
        },
        timestamp: new Date(),
        connectionType: 'wifi',
      };
    }

    try {
      const voltage = await sendCommand(socket, ELM327_COMMANDS.READ_VOLTAGE);
      const protocol = await sendCommand(socket, ELM327_COMMANDS.READ_PROTOCOL);
      const dtcResponse = await sendCommand(socket, ELM327_COMMANDS.READ_DTC);
      
      const dtcCodes = parseDTCResponse(dtcResponse);

      return {
        dtcCodes,
        rawData: {
          protocol: protocol || 'AUTO',
          voltage: voltage || 'N/A',
          rawResponse: dtcResponse,
          connectionMethod: 'Capacitor TCP Native',
          deviceIP: device.address,
          devicePort: device.port,
        },
        timestamp: new Date(),
        connectionType: 'wifi',
      };
    } catch (error: any) {
      throw new Error('Erro ao ler códigos: ' + error.message);
    }
  }, [device, isNative, socket]);

  return {
    isNative,
    isSupported,
    device,
    connect,
    disconnect,
    readDTCCodes,
    connectionConfig,
    setConnectionConfig,
    isSimulated,
  };
};

// Parse DTC response
function parseDTCResponse(response: string): string[] {
  const dtcCodes: string[] = [];
  const cleanResponse = response.replace(/\s/g, '').replace(/^43/, '');
  
  if (cleanResponse === 'NODATA' || cleanResponse === '') {
    return [];
  }

  for (let i = 0; i < cleanResponse.length; i += 4) {
    const dtcHex = cleanResponse.substr(i, 4);
    if (dtcHex.length === 4 && dtcHex !== '0000') {
      const dtc = decodeDTC(dtcHex);
      if (dtc) dtcCodes.push(dtc);
    }
  }

  return dtcCodes;
}

function decodeDTC(hex: string): string | null {
  const firstChar = parseInt(hex[0], 16);
  const typeChar = ['P', 'C', 'B', 'U'][Math.floor(firstChar / 4)];
  const secondDigit = (firstChar % 4).toString();
  return `${typeChar}${secondDigit}${hex.substring(1).toUpperCase()}`;
}
