import { useState } from 'react';
import { Bluetooth, Wifi, Loader2, WifiOff, AlertCircle, Settings, Smartphone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConnectionStatus, OBDDevice } from './types';
import { ExtendedConnectionType } from './useOBDConnection';
import { ConnectionMethodGuide } from './ConnectionMethodGuide';

interface OBDConnectionSelectorProps {
  connectionStatus: ConnectionStatus;
  connectionType: ExtendedConnectionType | null;
  device: OBDDevice | null;
  isBluetoothSupported: boolean;
  isSimulated: boolean;
  isNativePlatform: boolean;
  wifiConfig: { ip: string; port: number };
  availableDevices?: OBDDevice[];
  isScanning?: boolean;
  onWifiConfigChange: (config: { ip: string; port: number }) => void;
  onConnectBluetooth: () => void;
  onConnectWifi: () => void;
  onConnectCapacitorBluetooth?: () => void;
  onConnectCapacitorWifi?: () => void;
  onScanDevices?: () => void;
  onDisconnect: () => void;
}

export const OBDConnectionSelector = ({
  connectionStatus,
  connectionType,
  device,
  isBluetoothSupported,
  isSimulated,
  isNativePlatform,
  wifiConfig,
  availableDevices = [],
  isScanning = false,
  onWifiConfigChange,
  onConnectBluetooth,
  onConnectWifi,
  onConnectCapacitorBluetooth,
  onConnectCapacitorWifi,
  onScanDevices,
  onDisconnect,
}: OBDConnectionSelectorProps) => {
  const [showWifiSettings, setShowWifiSettings] = useState(false);
  const [tempIp, setTempIp] = useState(wifiConfig.ip);
  const [tempPort, setTempPort] = useState(wifiConfig.port.toString());
  const [activeTab, setActiveTab] = useState<string>('bluetooth');

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
      if (connectionType?.includes('wifi')) {
        return <Wifi className="w-8 h-8 text-green-400" />;
      }
      if (connectionType?.includes('capacitor')) {
        return <Smartphone className="w-8 h-8 text-green-400" />;
      }
      return <Bluetooth className="w-8 h-8 text-green-400" />;
    }
    return <WifiOff className="w-8 h-8 text-red-400" />;
  };

  const getConnectionLabel = () => {
    if (connectionStatus === 'connecting') {
      if (connectionType?.includes('capacitor')) {
        return 'Conectando Nativo...';
      }
      return connectionType?.includes('wifi') ? 'Conectando WiFi...' : 'Conectando Bluetooth...';
    }
    if (connectionStatus === 'connected') {
      if (connectionType?.includes('capacitor')) {
        return `Conectado via App Nativo`;
      }
      return `Conectado via ${connectionType?.includes('wifi') ? 'WiFi' : 'Bluetooth'}`;
    }
    return 'Desconectado';
  };

  const getConnectionTypeBadge = () => {
    if (!connectionType) return null;
    
    const badges: Record<string, { label: string; color: string }> = {
      'bluetooth': { label: 'Web Bluetooth', color: 'bg-blue-500' },
      'wifi': { label: 'Web WiFi', color: 'bg-green-500' },
      'capacitor-bluetooth': { label: 'Nativo Bluetooth', color: 'bg-purple-500' },
      'capacitor-wifi': { label: 'Nativo WiFi', color: 'bg-purple-500' },
    };
    
    const badge = badges[connectionType];
    if (!badge) return null;
    
    return (
      <Badge className={`${badge.color} text-white text-xs`}>
        {badge.label}
      </Badge>
    );
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
        <div className="flex flex-col gap-4">
          {/* Status Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${getStatusColor()}`}>
                {getStatusIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-chakra text-xl font-bold uppercase">
                    {getConnectionLabel()}
                  </h2>
                  {getConnectionTypeBadge()}
                </div>
                <p className="text-dm-cadet">
                  {device ? device.name : 'Selecione um método de conexão'}
                </p>
              {isSimulated && connectionStatus === 'connected' && (
                  <div className="mt-2">
                    <p className="text-amber-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Modo demonstração - Dados simulados
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Help Button */}
            <ConnectionMethodGuide isNativePlatform={isNativePlatform} />
          </div>

          {/* Connection Actions */}
          {connectionStatus === 'connected' ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={onDisconnect}
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-chakra uppercase"
              >
                Desconectar
              </Button>
            </div>
          ) : connectionStatus === 'connecting' ? (
            <Button disabled className="font-chakra uppercase w-fit">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Conectando...
            </Button>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md bg-white/10">
                <TabsTrigger value="bluetooth" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Bluetooth className="w-4 h-4 mr-2" />
                  Bluetooth
                </TabsTrigger>
                <TabsTrigger value="wifi" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  <Wifi className="w-4 h-4 mr-2" />
                  WiFi
                </TabsTrigger>
                <TabsTrigger value="native" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Nativo
                </TabsTrigger>
              </TabsList>

              {/* Bluetooth Tab */}
              <TabsContent value="bluetooth" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-dm-cadet">
                    Conecte via Bluetooth do navegador. Funciona com adaptadores ELM327 Bluetooth pareados.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={onConnectBluetooth}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-chakra uppercase flex items-center gap-2"
                    >
                      <Bluetooth className="w-5 h-5" />
                      Conectar Bluetooth
                    </Button>
                  </div>
                  {!isBluetoothSupported && (
                    <p className="text-yellow-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Bluetooth não disponível neste navegador - modo simulação será usado
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* WiFi Tab */}
              <TabsContent value="wifi" className="mt-4">
                <div className="space-y-3">
                  {/* Browser Limitation Warning */}
                  {!isNativePlatform && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-300">Modo Demonstração no Navegador</h4>
                          <p className="text-sm text-dm-cadet mt-1">
                            Navegadores não conseguem se comunicar diretamente com adaptadores WiFi OBD2 
                            por limitações técnicas (conexões TCP raw não são suportadas).
                          </p>
                          <p className="text-sm text-amber-200/80 mt-2">
                            <strong>Para conexão WiFi real:</strong> baixe o app nativo na Play Store ou App Store.
                          </p>
                          <Button 
                            onClick={() => window.open('/native-app-guide', '_blank')}
                            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white" 
                            size="sm"
                          >
                            <Smartphone className="w-4 h-4 mr-2" />
                            Baixar App Nativo
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-dm-cadet">
                    {isNativePlatform 
                      ? 'Conecte via WiFi. Configure o IP do seu adaptador ELM327 WiFi.'
                      : 'Teste o sistema em modo demonstração com dados simulados.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={onConnectWifi}
                      className="bg-green-600 hover:bg-green-700 text-white font-chakra uppercase flex items-center gap-2"
                    >
                      <Wifi className="w-5 h-5" />
                      {isNativePlatform ? 'Conectar WiFi' : 'Testar Demo WiFi'}
                    </Button>
                    
                    <Dialog open={showWifiSettings} onOpenChange={setShowWifiSettings}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar IP
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-chakra uppercase">
                            Configurações WiFi OBD2
                          </DialogTitle>
                          <DialogDescription>
                            Configure o endereço IP e porta do seu adaptador.
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
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowWifiSettings(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveWifiSettings}>Salvar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-dm-cadet">
                    IP atual: {wifiConfig.ip}:{wifiConfig.port}
                  </p>
                </div>
              </TabsContent>

              {/* Native Tab */}
              <TabsContent value="native" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-dm-cadet">
                    Conexão nativa otimizada para o app móvel. Melhor performance e estabilidade.
                  </p>
                  
                  {isNativePlatform ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={onConnectCapacitorBluetooth}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-chakra uppercase flex items-center gap-2"
                        >
                          <Bluetooth className="w-5 h-5" />
                          Bluetooth Nativo
                        </Button>
                        <Button
                          onClick={onConnectCapacitorWifi}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-chakra uppercase flex items-center gap-2"
                        >
                          <Wifi className="w-5 h-5" />
                          WiFi Nativo
                        </Button>
                      </div>
                      
                      {onScanDevices && (
                        <Button
                          onClick={onScanDevices}
                          variant="outline"
                          disabled={isScanning}
                          className="border-primary-foreground text-primary-foreground"
                        >
                          {isScanning ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4 mr-2" />
                          )}
                          {isScanning ? 'Buscando...' : 'Buscar Dispositivos'}
                        </Button>
                      )}
                      
                      {availableDevices.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-dm-cadet">Dispositivos encontrados:</p>
                          <div className="space-y-1">
                            {availableDevices.map((d) => (
                              <div key={d.id} className="text-xs bg-white/10 px-3 py-2 rounded flex items-center gap-2">
                                <Bluetooth className="w-3 h-3" />
                                {d.name} ({d.address})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-400 text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Modo Web Detectado:</strong> Para conexão nativa real, 
                          baixe o app Doutor Motors na loja de aplicativos. 
                          No navegador, você pode testar com o modo simulação.
                        </span>
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={onConnectCapacitorBluetooth}
                          variant="outline"
                          size="sm"
                          className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
                        >
                          Testar Simulação
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Simulation Warning Banner */}
        {isSimulated && connectionStatus === 'connected' && (
          <div className="mt-4 bg-amber-500/20 border border-amber-500/40 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-amber-200 font-medium">Dados Simulados - Modo Demonstração</span>
                  <p className="text-amber-200/70 text-xs mt-0.5">
                    Os valores exibidos são para demonstração. Para diagnóstico real, use o app nativo.
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-amber-400 text-amber-300 hover:bg-amber-500/20"
                onClick={() => window.open('/native-app-guide', '_blank')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Obter App Real
              </Button>
            </div>
          </div>
        )}

        {/* Connection Info */}
        {connectionStatus === 'connected' && device && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-dm-cadet">Método</p>
                <p className="font-semibold flex items-center gap-1">
                  {connectionType?.includes('capacitor') ? (
                    <><Smartphone className="w-4 h-4" /> Nativo</>
                  ) : connectionType?.includes('wifi') ? (
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
