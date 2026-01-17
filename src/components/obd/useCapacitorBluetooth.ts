import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OBDData, OBDDevice, DEFAULT_BLUETOOTH_CONFIG, SIMULATED_DTC_CODES } from './types';

// Capacitor plugin interfaces (will be available when running in native app)
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  }
}

interface UseCapacitorBluetoothReturn {
  isNative: boolean;
  isSupported: boolean;
  device: OBDDevice | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  readDTCCodes: () => Promise<OBDData>;
  scanDevices: () => Promise<OBDDevice[]>;
  availableDevices: OBDDevice[];
  isScanning: boolean;
}

// ELM327 OBD2 Commands
const ELM327_COMMANDS = {
  RESET: 'ATZ',           // Reset adapter
  ECHO_OFF: 'ATE0',       // Echo off
  LINEFEED_OFF: 'ATL0',   // Linefeed off
  HEADERS_OFF: 'ATH0',    // Headers off
  AUTO_PROTOCOL: 'ATSP0', // Auto protocol
  READ_DTC: '03',         // Read stored DTCs
  CLEAR_DTC: '04',        // Clear DTCs
  READ_VOLTAGE: 'ATRV',   // Read voltage
  READ_PROTOCOL: 'ATDP',  // Display protocol
};

export const useCapacitorBluetooth = (): UseCapacitorBluetoothReturn => {
  const { toast } = useToast();
  const [device, setDevice] = useState<OBDDevice | null>(null);
  const [availableDevices, setAvailableDevices] = useState<OBDDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothSerial, setBluetoothSerial] = useState<any>(null);

  // Check if running in Capacitor native environment
  const isNative = typeof window !== 'undefined' && 
    window.Capacitor?.isNativePlatform?.() === true;

  const isSupported = isNative;

  // Initialize Bluetooth Serial plugin
  const initPlugin = useCallback(async () => {
    if (!isNative) return null;
    
    try {
      // Dynamic import for Capacitor Bluetooth Serial plugin
      // This will only work in native environment
      const plugin = (window as any).BluetoothSerial;
      if (plugin) {
        setBluetoothSerial(plugin);
        return plugin;
      }
    } catch (error) {
      console.log('Bluetooth Serial plugin not available:', error);
    }
    return null;
  }, [isNative]);

  // Scan for Bluetooth devices
  const scanDevices = useCallback(async (): Promise<OBDDevice[]> => {
    if (!isNative) {
      // Return simulated devices for demo in browser
      const mockDevices: OBDDevice[] = [
        { id: 'mock-1', name: 'OBDII ELM327', type: 'bluetooth', address: '00:1D:A5:68:98:8B' },
        { id: 'mock-2', name: 'V-LINK OBD2', type: 'bluetooth', address: '00:1D:A5:68:98:8C' },
      ];
      setAvailableDevices(mockDevices);
      return mockDevices;
    }

    setIsScanning(true);
    try {
      const plugin = await initPlugin();
      if (!plugin) {
        throw new Error('Bluetooth plugin not available');
      }

      // Request permissions on Android
      if (window.Capacitor?.getPlatform() === 'android') {
        await plugin.requestEnable();
      }

      // List paired devices
      const pairedDevices = await plugin.list();
      
      // Discover new devices
      const discoveredDevices = await new Promise<any[]>((resolve, reject) => {
        const devices: any[] = [];
        const timeout = setTimeout(() => resolve(devices), 10000);
        
        plugin.discoverUnpaired(
          (result: any) => {
            if (result.name?.toLowerCase().includes('obd') || 
                result.name?.toLowerCase().includes('elm') ||
                result.name?.toLowerCase().includes('v-link')) {
              devices.push(result);
            }
          },
          (error: any) => {
            clearTimeout(timeout);
            reject(error);
          }
        );
      });

      const allDevices: OBDDevice[] = [
        ...pairedDevices.map((d: any) => ({
          id: d.id || d.address,
          name: d.name || 'Unknown Device',
          type: 'bluetooth' as const,
          address: d.address,
        })),
        ...discoveredDevices.map((d: any) => ({
          id: d.id || d.address,
          name: d.name || 'Unknown Device',
          type: 'bluetooth' as const,
          address: d.address,
        })),
      ];

      // Filter for likely OBD devices
      const obdDevices = allDevices.filter(d => 
        d.name.toLowerCase().includes('obd') ||
        d.name.toLowerCase().includes('elm') ||
        d.name.toLowerCase().includes('v-link') ||
        d.name.toLowerCase().includes('veepeak') ||
        d.name.toLowerCase().includes('carista')
      );

      setAvailableDevices(obdDevices);
      return obdDevices;
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: 'Erro ao buscar dispositivos',
        description: 'Verifique se o Bluetooth está ativado.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsScanning(false);
    }
  }, [isNative, initPlugin, toast]);

  // Connect to device
  const connect = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      // Simulate connection in browser
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDevice({
        id: 'capacitor-simulated',
        name: 'OBD2 Capacitor (Simulado)',
        type: 'bluetooth',
        address: '00:00:00:00:00:00',
      });
      toast({
        title: 'Modo Demonstração',
        description: 'Conexão nativa simulada (execute no app móvel para conexão real)',
      });
      return true;
    }

    try {
      const plugin = await initPlugin();
      if (!plugin) {
        throw new Error('Plugin não disponível');
      }

      // If no devices scanned yet, scan first
      if (availableDevices.length === 0) {
        await scanDevices();
      }

      // Connect to first available OBD device
      const targetDevice = availableDevices[0];
      if (!targetDevice) {
        toast({
          title: 'Nenhum dispositivo encontrado',
          description: 'Certifique-se que o adaptador OBD2 está ligado e pareado.',
          variant: 'destructive',
        });
        return false;
      }

      // Connect via Bluetooth Serial
      await plugin.connect(targetDevice.address);

      // Initialize ELM327
      await sendCommand(plugin, ELM327_COMMANDS.RESET);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendCommand(plugin, ELM327_COMMANDS.ECHO_OFF);
      await sendCommand(plugin, ELM327_COMMANDS.LINEFEED_OFF);
      await sendCommand(plugin, ELM327_COMMANDS.HEADERS_OFF);
      await sendCommand(plugin, ELM327_COMMANDS.AUTO_PROTOCOL);

      setDevice(targetDevice);
      
      toast({
        title: 'Conectado via Capacitor!',
        description: `Conectado ao ${targetDevice.name}`,
      });

      return true;
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: 'Erro de conexão',
        description: error.message || 'Não foi possível conectar ao adaptador.',
        variant: 'destructive',
      });
      return false;
    }
  }, [isNative, initPlugin, availableDevices, scanDevices, toast]);

  // Send command to ELM327
  const sendCommand = async (plugin: any, command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      plugin.write(command + '\r');
      
      setTimeout(() => {
        plugin.read((data: string) => {
          resolve(data.trim());
        }, reject);
      }, 200);
    });
  };

  // Disconnect
  const disconnect = useCallback(() => {
    if (isNative && bluetoothSerial) {
      bluetoothSerial.disconnect();
    }
    setDevice(null);
    toast({
      title: 'Desconectado',
      description: 'Conexão Bluetooth nativa encerrada.',
    });
  }, [isNative, bluetoothSerial, toast]);

  // Read DTC codes
  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (!device) {
      throw new Error('Dispositivo não conectado');
    }

    if (!isNative || !bluetoothSerial) {
      // Return simulated data in browser
      await new Promise(resolve => setTimeout(resolve, 1500));
      const randomIndex = Math.floor(Math.random() * SIMULATED_DTC_CODES.length);
      return {
        dtcCodes: SIMULATED_DTC_CODES[randomIndex],
        rawData: {
          protocol: 'Capacitor Native (Simulated)',
          voltage: '12.5V',
          connectionMethod: 'Capacitor Bluetooth',
        },
        timestamp: new Date(),
        connectionType: 'bluetooth',
      };
    }

    try {
      // Read voltage
      const voltage = await sendCommand(bluetoothSerial, ELM327_COMMANDS.READ_VOLTAGE);
      
      // Read protocol
      const protocol = await sendCommand(bluetoothSerial, ELM327_COMMANDS.READ_PROTOCOL);
      
      // Read DTCs
      const dtcResponse = await sendCommand(bluetoothSerial, ELM327_COMMANDS.READ_DTC);
      
      // Parse DTC response
      const dtcCodes = parseDTCResponse(dtcResponse);

      return {
        dtcCodes,
        rawData: {
          protocol: protocol || 'AUTO',
          voltage: voltage || 'N/A',
          rawResponse: dtcResponse,
          connectionMethod: 'Capacitor Bluetooth Native',
          deviceName: device.name,
          deviceAddress: device.address,
        },
        timestamp: new Date(),
        connectionType: 'bluetooth',
      };
    } catch (error: any) {
      console.error('Read DTC error:', error);
      throw new Error('Erro ao ler códigos de falha: ' + error.message);
    }
  }, [device, isNative, bluetoothSerial]);

  return {
    isNative,
    isSupported,
    device,
    connect,
    disconnect,
    readDTCCodes,
    scanDevices,
    availableDevices,
    isScanning,
  };
};

// Parse ELM327 DTC response into standard DTC codes
function parseDTCResponse(response: string): string[] {
  const dtcCodes: string[] = [];
  
  // Remove whitespace and "43" prefix (response header)
  const cleanResponse = response.replace(/\s/g, '').replace(/^43/, '');
  
  if (cleanResponse === 'NODATA' || cleanResponse === '') {
    return [];
  }

  // Each DTC is 4 hex characters
  for (let i = 0; i < cleanResponse.length; i += 4) {
    const dtcHex = cleanResponse.substr(i, 4);
    if (dtcHex.length === 4 && dtcHex !== '0000') {
      const dtc = decodeDTC(dtcHex);
      if (dtc) {
        dtcCodes.push(dtc);
      }
    }
  }

  return dtcCodes;
}

// Decode hex DTC to standard format (P0XXX, B0XXX, C0XXX, U0XXX)
function decodeDTC(hex: string): string | null {
  const firstChar = parseInt(hex[0], 16);
  const typeChar = ['P', 'C', 'B', 'U'][Math.floor(firstChar / 4)];
  const secondDigit = (firstChar % 4).toString();
  const restDigits = hex.substring(1);
  
  return `${typeChar}${secondDigit}${restDigits.toUpperCase()}`;
}
