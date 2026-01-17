import { useState } from 'react';
import { Bluetooth, Wifi, Loader2, WifiOff, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConnectionType, ConnectionStatus, OBDDevice } from './types';

interface OBDConnectionSelectorProps {
  connectionStatus: ConnectionStatus;
  connectionType: ConnectionType | null;
  device: OBDDevice | null;
  isBluetoothSupported: boolean;
  isSimulated: boolean;
  wifiConfig: { ip: string; port: number };
  onWifiConfigChange: (config: { ip: string; port: number }) => void;
  onConnectBluetooth: () => void;
  onConnectWifi: () => void;
  onDisconnect: () => void;
}

export const OBDConnectionSelector = ({
  connectionStatus,
  connectionType,
  device,
  isBluetoothSupported,
  isSimulated,
  wifiConfig,
  onWifiConfigChange,
  onConnectBluetooth,
  onConnectWifi,
  onDisconnect,
}: OBDConnectionSelectorProps) => {
  const [showWifiSettings, setShowWifiSettings] = useState(false);
  const [tempIp, setTempIp] = useState(wifiConfig.ip);
  const [tempPort, setTempPort] = useState(wifiConfig.port.toString());

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500/20';
      case 'connecting':
        return 'bg-yellow-500/20';
      default:
        return 'bg-red-500/20';
    }
  };

  const getStatusIcon = () => {
    if (connectionStatus === 'connecting') {
      return <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />;
    }
    if (connectionStatus === 'connected') {
      if (connectionType === 'wifi') {
        return <Wifi className="w-8 h-8 text-green-400" />;
      }
      return <Bluetooth className="w-8 h-8 text-green-400" />;
    }
    return <WifiOff className="w-8 h-8 text-red-400" />;
  };

  const getConnectionLabel = () => {
    if (connectionStatus === 'connecting') {
      return connectionType === 'wifi' ? 'Conectando WiFi...' : 'Conectando Bluetooth...';
    }
    if (connectionStatus === 'connected') {
      return `Conectado via ${connectionType === 'wifi' ? 'WiFi' : 'Bluetooth'}`;
    }
    return 'Desconectado';
  };

  const handleSaveWifiSettings = () => {
    onWifiConfigChange({
      ip: tempIp,
      port: parseInt(tempPort) || 35000,
    });
    setShowWifiSettings(false);
  };

  return (
    <Card className="bg-gradient-to-br from-dm-space to-dm-blue-2 text-primary-foreground border-0">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h2 className="font-chakra text-xl font-bold uppercase">
                {getConnectionLabel()}
              </h2>
              <p className="text-dm-cadet">
                {device ? device.name : 'Selecione um método de conexão'}
              </p>
              {isSimulated && connectionStatus === 'connected' && (
                <p className="text-yellow-400 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  Modo demonstração ativo
                </p>
              )}
              {!isBluetoothSupported && connectionStatus === 'disconnected' && (
                <p className="text-yellow-400 text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Bluetooth não disponível neste navegador
                </p>
              )}
            </div>
          </div>

          {/* Connection Buttons */}
          <div className="flex flex-wrap gap-3">
            {connectionStatus === 'connected' ? (
              <Button
                onClick={onDisconnect}
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-chakra uppercase"
              >
                Desconectar
              </Button>
            ) : connectionStatus === 'connecting' ? (
              <Button disabled className="font-chakra uppercase">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Conectando...
              </Button>
            ) : (
              <>
                {/* Bluetooth Button */}
                <Button
                  onClick={onConnectBluetooth}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-chakra uppercase flex items-center gap-2"
                >
                  <Bluetooth className="w-5 h-5" />
                  <span>Bluetooth</span>
                </Button>

                {/* WiFi Button with Settings */}
                <div className="flex items-center gap-1">
                  <Button
                    onClick={onConnectWifi}
                    className="bg-green-600 hover:bg-green-700 text-white font-chakra uppercase flex items-center gap-2 rounded-r-none"
                  >
                    <Wifi className="w-5 h-5" />
                    <span>WiFi</span>
                  </Button>
                  
                  <Dialog open={showWifiSettings} onOpenChange={setShowWifiSettings}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-l-none border-l-0 bg-green-700 hover:bg-green-800 border-green-600 text-white"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-chakra uppercase">
                          Configurações WiFi OBD2
                        </DialogTitle>
                        <DialogDescription>
                          Configure o endereço IP e porta do seu adaptador OBD2 WiFi (ELM327).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="wifi-ip">Endereço IP</Label>
                          <Input
                            id="wifi-ip"
                            value={tempIp}
                            onChange={(e) => setTempIp(e.target.value)}
                            placeholder="192.168.0.10"
                          />
                          <p className="text-xs text-muted-foreground">
                            Padrão para ELM327 WiFi: 192.168.0.10
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wifi-port">Porta</Label>
                          <Input
                            id="wifi-port"
                            type="number"
                            value={tempPort}
                            onChange={(e) => setTempPort(e.target.value)}
                            placeholder="35000"
                          />
                          <p className="text-xs text-muted-foreground">
                            Padrão para ELM327 WiFi: 35000
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowWifiSettings(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveWifiSettings}>
                          Salvar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Connection Info */}
        {connectionStatus === 'connected' && device && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-dm-cadet">Tipo</p>
                <p className="font-semibold flex items-center gap-1">
                  {connectionType === 'wifi' ? (
                    <><Wifi className="w-4 h-4" /> WiFi</>
                  ) : (
                    <><Bluetooth className="w-4 h-4" /> Bluetooth</>
                  )}
                </p>
              </div>
              <div>
                <p className="text-dm-cadet">Dispositivo</p>
                <p className="font-semibold">{device.name}</p>
              </div>
              {device.address && (
                <div>
                  <p className="text-dm-cadet">Endereço</p>
                  <p className="font-semibold font-mono text-xs">
                    {device.address}{device.port ? `:${device.port}` : ''}
                  </p>
                </div>
              )}
              {device.signalStrength !== undefined && (
                <div>
                  <p className="text-dm-cadet">Sinal</p>
                  <p className="font-semibold">{device.signalStrength}%</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
