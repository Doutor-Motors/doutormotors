import { useState, useCallback } from 'react';
import { 
  Bluetooth, 
  Wifi, 
  WifiOff,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from '@/store/useAppStore';

interface OBDConnectorProps {
  onDataReceived?: (data: OBDData) => void;
  onConnectionChange?: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export interface OBDData {
  dtcCodes: string[];
  rawData: Record<string, unknown>;
  timestamp: Date;
}

// Simulated DTC codes for demo (will be replaced with real Web Bluetooth implementation)
const simulatedDTCCodes = [
  ['P0300', 'P0420'],
  ['P0171', 'P0128', 'P0442'],
  ['P0101', 'P0130'],
  ['P0300', 'P0171', 'P0420', 'P0128'],
  ['P0700', 'P0715'],
];

const OBDConnector = ({ onDataReceived, onConnectionChange }: OBDConnectorProps) => {
  const { toast } = useToast();
  const { 
    obdConnectionStatus,
    setObdConnectionStatus 
  } = useAppStore();
  
  const [isBluetoothSupported] = useState(() => 
    typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any)
  );

  const handleConnect = useCallback(async () => {
    setObdConnectionStatus('connecting');
    onConnectionChange?.('connecting');

    try {
      // Check if Web Bluetooth is available
      if (isBluetoothSupported) {
        try {
          // Try real Bluetooth connection
          const nav = navigator as any;
          const device = await nav.bluetooth.requestDevice({
            filters: [
              { namePrefix: 'OBD' },
              { namePrefix: 'ELM' },
              { namePrefix: 'OBDII' },
              { services: ['0000fff0-0000-1000-8000-00805f9b34fb'] }, // Common OBD2 service
            ],
            optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb'],
          });

          if (device) {
            // Connected to real device
            const server = await device.gatt?.connect();
            
            if (server) {
              setObdConnectionStatus('connected');
              onConnectionChange?.('connected');
              
              toast({
                title: "Conectado!",
                description: `Conectado ao dispositivo ${device.name}`,
              });
              
              return;
            }
          }
        } catch (btError) {
          console.log('Bluetooth not available or user cancelled, using simulation mode');
        }
      }

      // Fallback to simulation mode
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setObdConnectionStatus('connected');
      onConnectionChange?.('connected');
      
      toast({
        title: "Modo Demonstração",
        description: "Conectado em modo de simulação para demonstração.",
      });

    } catch (error) {
      console.error('Connection error:', error);
      setObdConnectionStatus('disconnected');
      onConnectionChange?.('disconnected');
      
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao adaptador OBD2.",
        variant: "destructive",
      });
    }
  }, [isBluetoothSupported, onConnectionChange, setObdConnectionStatus, toast]);

  const handleDisconnect = useCallback(() => {
    setObdConnectionStatus('disconnected');
    onConnectionChange?.('disconnected');
    
    toast({
      title: "Desconectado",
      description: "Adaptador OBD2 desconectado.",
    });
  }, [onConnectionChange, setObdConnectionStatus, toast]);

  const readDTCCodes = useCallback(async (): Promise<OBDData> => {
    if (obdConnectionStatus !== 'connected') {
      throw new Error('OBD2 não conectado');
    }

    // Simulate reading time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return simulated data (in real implementation, this would read from Bluetooth)
    const randomIndex = Math.floor(Math.random() * simulatedDTCCodes.length);
    const dtcCodes = simulatedDTCCodes[randomIndex];

    const data: OBDData = {
      dtcCodes,
      rawData: {
        protocol: 'ISO 15765-4 (CAN)',
        voltage: '12.4V',
        readTime: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    onDataReceived?.(data);
    return data;
  }, [obdConnectionStatus, onDataReceived]);

  const getStatusColor = () => {
    switch (obdConnectionStatus) {
      case 'connected': return 'bg-green-500/20';
      case 'connecting': return 'bg-yellow-500/20';
      default: return 'bg-red-500/20';
    }
  };

  const getStatusIcon = () => {
    switch (obdConnectionStatus) {
      case 'connected': 
        return <Wifi className="w-6 h-6 text-green-400" />;
      case 'connecting': 
        return <Bluetooth className="w-6 h-6 text-yellow-400 animate-pulse" />;
      default: 
        return <WifiOff className="w-6 h-6 text-red-400" />;
    }
  };

  return {
    // Component UI
    StatusIndicator: () => (
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-full ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div>
          <h2 className="font-chakra text-xl font-bold uppercase text-primary-foreground">
            {obdConnectionStatus === 'connected' 
              ? "Conectado" 
              : obdConnectionStatus === 'connecting'
              ? "Conectando..."
              : "Desconectado"
            }
          </h2>
          <p className="text-dm-cadet">
            {obdConnectionStatus === 'connected'
              ? "Adaptador OBD2 pronto para diagnóstico"
              : obdConnectionStatus === 'connecting'
              ? "Buscando adaptador OBD2..."
              : "Conecte seu adaptador OBD2"
            }
          </p>
          {!isBluetoothSupported && obdConnectionStatus === 'disconnected' && (
            <p className="text-yellow-400 text-sm flex items-center gap-1 mt-1">
              <AlertCircle className="w-4 h-4" />
              Bluetooth não disponível - Modo simulação
            </p>
          )}
        </div>
      </div>
    ),

    ConnectButton: () => (
      obdConnectionStatus === 'connected' ? (
        <div className="flex gap-3">
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-chakra uppercase"
          >
            Desconectar
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={obdConnectionStatus === 'connecting'}
          className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase flex items-center gap-2"
        >
          {obdConnectionStatus === 'connecting' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <Bluetooth className="w-5 h-5" />
              <span>Conectar OBD2</span>
            </>
          )}
        </Button>
      )
    ),

    // Methods
    connect: handleConnect,
    disconnect: handleDisconnect,
    readDTCCodes,
    
    // State
    connectionStatus: obdConnectionStatus,
    isBluetoothSupported,
  };
};

export default OBDConnector;
