import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OBDData, OBDDevice, DEFAULT_BLUETOOTH_CONFIG, SIMULATED_DTC_CODES } from './types';

interface UseBluetoothConnectionReturn {
  isSupported: boolean;
  device: OBDDevice | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  readDTCCodes: () => Promise<OBDData>;
  isSimulated: boolean;
}

export const useBluetoothConnection = (): UseBluetoothConnectionReturn => {
  const { toast } = useToast();
  const [device, setDevice] = useState<OBDDevice | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);

  const isSupported = typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any);

  const connect = useCallback(async (): Promise<boolean> => {
    try {
      if (isSupported) {
        try {
          const nav = navigator as any;
          const btDevice = await nav.bluetooth.requestDevice({
            filters: [
              { namePrefix: 'OBD' },
              { namePrefix: 'ELM' },
              { namePrefix: 'OBDII' },
              { namePrefix: 'V-LINK' },
              { namePrefix: 'VEEPEAK' },
              { services: [DEFAULT_BLUETOOTH_CONFIG.serviceUUID] },
            ],
            optionalServices: [DEFAULT_BLUETOOTH_CONFIG.serviceUUID],
          });

          if (btDevice) {
            const server = await btDevice.gatt?.connect();
            
            if (server) {
              setBluetoothDevice(btDevice);
              setDevice({
                id: btDevice.id || 'bt-device',
                name: btDevice.name || 'OBD2 Bluetooth',
                type: 'bluetooth',
                address: btDevice.id,
              });
              setIsSimulated(false);
              
              toast({
                title: "Bluetooth Conectado!",
                description: `Conectado ao dispositivo ${btDevice.name}`,
              });
              
              return true;
            }
          }
        } catch (btError: any) {
          console.log('Bluetooth connection failed or cancelled:', btError.message);
          // User cancelled or no device found - fall through to simulation
        }
      }

      // Fallback to simulation mode
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDevice({
        id: 'simulated-bt',
        name: 'OBD2 Simulado (Bluetooth)',
        type: 'bluetooth',
      });
      setIsSimulated(true);
      
      toast({
        title: "Modo Demonstração",
        description: "Conectado em modo de simulação Bluetooth.",
      });
      
      return true;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      toast({
        title: "Erro de conexão Bluetooth",
        description: "Não foi possível conectar via Bluetooth.",
        variant: "destructive",
      });
      return false;
    }
  }, [isSupported, toast]);

  const disconnect = useCallback(() => {
    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    setBluetoothDevice(null);
    setDevice(null);
    setIsSimulated(false);
    
    toast({
      title: "Bluetooth Desconectado",
      description: "Adaptador OBD2 Bluetooth desconectado.",
    });
  }, [bluetoothDevice, toast]);

  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (!device) {
      throw new Error('Bluetooth não conectado');
    }

    // Simulate reading time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In real implementation, this would communicate with the device
    // For now, return simulated data
    const randomIndex = Math.floor(Math.random() * SIMULATED_DTC_CODES.length);
    const dtcCodes = SIMULATED_DTC_CODES[randomIndex];

    return {
      dtcCodes,
      rawData: {
        protocol: 'ISO 15765-4 (CAN)',
        voltage: '12.4V',
        readTime: new Date().toISOString(),
        connectionMethod: 'Bluetooth',
        deviceName: device.name,
      },
      timestamp: new Date(),
      connectionType: 'bluetooth',
    };
  }, [device]);

  return {
    isSupported,
    device,
    connect,
    disconnect,
    readDTCCodes,
    isSimulated,
  };
};
