import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OBDData, OBDDevice, DEFAULT_BLUETOOTH_CONFIG } from './types';

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

          // PRODUÇÃO: Não ativar modo demonstração automaticamente
          // Se usuário cancelou ou não há dispositivo, retornar false
          toast({
            title: "Conexão Cancelada",
            description: "Você cancelou a seleção do dispositivo Bluetooth. Tente novamente quando estiver pronto.",
            variant: "default",
          });

          return false;
        }
      }

      // Se Bluetooth não é suportado, informar usuário
      toast({
        title: "Bluetooth Não Disponível",
        description: "Seu navegador não suporta Web Bluetooth. Use o app nativo ou conecte via WiFi.",
        variant: "destructive",
      });

      return false;
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

    // PRODUÇÃO: Leitura real de DTCs do dispositivo OBD2
    // TODO: Implementar comunicação real com ELM327 via Web Bluetooth
    // Comandos: ATZ (reset), ATSP0 (auto protocol), 03 (read DTCs)

    throw new Error('Leitura de DTCs requer implementação de comunicação real com dispositivo OBD2. Use o app nativo para funcionalidade completa.');
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
