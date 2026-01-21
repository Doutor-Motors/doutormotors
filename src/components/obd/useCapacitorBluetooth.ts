import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OBDData, OBDDevice, SIMULATED_DTC_CODES } from './types';
import { 
  getOBDConnectionManager, 
  OBDConnectionInfo
} from '@/services/obd/OBDConnectionManager';
import { getPlatformInfo } from '@/utils/platformDetector';

// Types are now defined in platformDetector.ts

interface UseCapacitorBluetoothReturn {
  isNative: boolean;
  isSupported: boolean;
  device: OBDDevice | null;
  connectionInfo: OBDConnectionInfo | null;
  connect: (targetDevice?: OBDDevice) => Promise<boolean>;
  disconnect: () => void;
  readDTCCodes: () => Promise<OBDData>;
  scanDevices: () => Promise<OBDDevice[]>;
  availableDevices: OBDDevice[];
  isScanning: boolean;
  isInitializing: boolean;
  vehicleData: {
    rpm?: number;
    speed?: number;
    coolantTemp?: number;
    engineLoad?: number;
    throttlePosition?: number;
    fuelLevel?: number;
    batteryVoltage?: string;
  } | null;
}

export const useCapacitorBluetooth = (): UseCapacitorBluetoothReturn => {
  const { toast } = useToast();
  const [device, setDevice] = useState<OBDDevice | null>(null);
  const [availableDevices, setAvailableDevices] = useState<OBDDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<OBDConnectionInfo | null>(null);
  const [vehicleData, setVehicleData] = useState<UseCapacitorBluetoothReturn['vehicleData']>(null);

  // Use platform detector for accurate capability detection
  const platformInfo = getPlatformInfo();
  const isNative = platformInfo.isNative;
  const isSupported = platformInfo.supportsBluetoothNative;

  // Get OBD connection manager
  const connectionManager = getOBDConnectionManager((info) => {
    setConnectionInfo(info);
  });

  // Setup Bluetooth Serial transport for native platform
  const setupNativeTransport = useCallback(() => {
    if (!isNative || !window.BluetoothSerial) return;

    const write = async (data: string): Promise<void> => {
      await window.BluetoothSerial!.write(data);
    };

    const read = async (): Promise<string> => {
      return await window.BluetoothSerial!.read();
    };

    connectionManager.setTransport(write, read);
  }, [isNative, connectionManager]);

  // Scan for Bluetooth devices
  const scanDevices = useCallback(async (): Promise<OBDDevice[]> => {
    if (!isNative || !window.BluetoothSerial) {
      // Return simulated devices for demo in browser
      const mockDevices: OBDDevice[] = [
        { id: 'mock-1', name: 'OBDII ELM327 v2.1', type: 'bluetooth', address: '00:1D:A5:68:98:8B' },
        { id: 'mock-2', name: 'V-LINK OBD2 Adapter', type: 'bluetooth', address: '00:1D:A5:68:98:8C' },
        { id: 'mock-3', name: 'VEEPEAK OBDCheck', type: 'bluetooth', address: '00:1D:A5:68:98:8D' },
      ];
      setAvailableDevices(mockDevices);
      return mockDevices;
    }

    setIsScanning(true);
    try {
      // Request Bluetooth enable on Android
      if (window.Capacitor?.getPlatform() === 'android') {
        const isEnabled = await window.BluetoothSerial.isEnabled();
        if (!isEnabled) {
          await window.BluetoothSerial.requestEnable();
        }
      }

      // List paired devices
      const pairedDevices = await window.BluetoothSerial.list();
      
      // Discover new devices
      const discoveredDevices = await new Promise<any[]>((resolve) => {
        const devices: any[] = [];
        const timeout = setTimeout(() => resolve(devices), 10000);
        
        window.BluetoothSerial!.discoverUnpaired(
          (result: any) => {
            // Filter for OBD-related devices
            if (isOBDDevice(result.name)) {
              devices.push(result);
            }
          },
          () => {
            clearTimeout(timeout);
            resolve(devices);
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
      const obdDevices = allDevices.filter(d => isOBDDevice(d.name));

      setAvailableDevices(obdDevices.length > 0 ? obdDevices : allDevices);
      
      toast({
        title: 'Busca concluída',
        description: `${obdDevices.length} dispositivos OBD encontrados`,
      });
      
      return obdDevices;
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: 'Erro ao buscar dispositivos',
        description: error.message || 'Verifique se o Bluetooth está ativado.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsScanning(false);
    }
  }, [isNative, toast]);

  // Check if device name suggests OBD adapter
  const isOBDDevice = (name: string): boolean => {
    if (!name) return false;
    const lowerName = name.toLowerCase();
    return (
      lowerName.includes('obd') ||
      lowerName.includes('elm') ||
      lowerName.includes('v-link') ||
      lowerName.includes('veepeak') ||
      lowerName.includes('carista') ||
      lowerName.includes('torque') ||
      lowerName.includes('vgate') ||
      lowerName.includes('konnwei') ||
      lowerName.includes('foxwell') ||
      lowerName.includes('bluedriver')
    );
  };

  // Connect to device
  const connect = useCallback(async (targetDevice?: OBDDevice): Promise<boolean> => {
    setIsInitializing(true);

    try {
      if (isNative && window.BluetoothSerial) {
        // Scan if no devices available
        if (availableDevices.length === 0 && !targetDevice) {
          await scanDevices();
        }

        const deviceToConnect = targetDevice || availableDevices[0];
        if (!deviceToConnect) {
          toast({
            title: 'Nenhum dispositivo encontrado',
            description: 'Certifique-se que o adaptador OBD2 está ligado e pareado.',
            variant: 'destructive',
          });
          setIsInitializing(false);
          return false;
        }

        // Connect via Bluetooth Serial
        await window.BluetoothSerial.connect(deviceToConnect.address!);
        
        // Setup transport
        setupNativeTransport();

        // Initialize ELM327
        const success = await connectionManager.initialize(
          deviceToConnect.name,
          deviceToConnect.address
        );

        if (success) {
          setDevice(deviceToConnect);
          toast({
            title: 'Conectado!',
            description: `Conectado ao ${deviceToConnect.name}`,
          });
          setIsInitializing(false);
          return true;
        } else {
          await window.BluetoothSerial.disconnect();
          toast({
            title: 'Falha na inicialização',
            description: 'Não foi possível inicializar o adaptador ELM327',
            variant: 'destructive',
          });
          setIsInitializing(false);
          return false;
        }
      } else {
        // Simulate connection in browser
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const simulatedDevice: OBDDevice = {
          id: 'capacitor-simulated',
          name: 'OBD2 ELM327 (Simulado)',
          type: 'bluetooth',
          address: '00:00:00:00:00:00',
        };
        
        setDevice(simulatedDevice);
        
        // Initialize in simulation mode
        await connectionManager.initialize(simulatedDevice.name, simulatedDevice.address);
        
        toast({
          title: 'Modo Demonstração',
          description: 'Conexão simulada. Execute no app móvel para conexão real.',
        });
        
        setIsInitializing(false);
        return true;
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: 'Erro de conexão',
        description: error.message || 'Não foi possível conectar ao adaptador.',
        variant: 'destructive',
      });
      setIsInitializing(false);
      return false;
    }
  }, [isNative, availableDevices, scanDevices, setupNativeTransport, connectionManager, toast]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (isNative && window.BluetoothSerial) {
      window.BluetoothSerial.disconnect().catch(console.error);
    }
    
    connectionManager.disconnect();
    setDevice(null);
    setVehicleData(null);
    
    toast({
      title: 'Desconectado',
      description: 'Conexão Bluetooth encerrada.',
    });
  }, [isNative, connectionManager, toast]);

  // Read DTC codes
  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (!device) {
      throw new Error('Dispositivo não conectado');
    }

    const result = await connectionManager.readDTCCodes();

    if (!result.success) {
      throw new Error(result.error || 'Erro ao ler códigos');
    }

    // Update vehicle data
    setVehicleData(result.vehicleData);

    return {
      dtcCodes: result.dtcCodes,
      rawData: {
        protocol: connectionInfo?.protocol || 'AUTO',
        voltage: result.vehicleData.batteryVoltage || 'N/A',
        connectionMethod: 'Capacitor Bluetooth Native',
        deviceName: device.name,
        deviceAddress: device.address,
        vehicleData: result.vehicleData,
        parsedDTCs: result.parsedDTCs,
        isSimulated: connectionInfo?.isSimulated ?? true,
      },
      timestamp: new Date(),
      connectionType: 'bluetooth',
    };
  }, [device, connectionManager, connectionInfo]);

  return {
    isNative,
    isSupported,
    device,
    connectionInfo,
    connect,
    disconnect,
    readDTCCodes,
    scanDevices,
    availableDevices,
    isScanning,
    isInitializing,
    vehicleData,
  };
};
