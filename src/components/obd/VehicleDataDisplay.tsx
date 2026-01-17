import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gauge, 
  Thermometer, 
  Fuel, 
  Activity, 
  Zap, 
  Car,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
} from 'lucide-react';
import { OBDConnectionInfo } from '@/services/obd/OBDConnectionManager';

interface VehicleDataDisplayProps {
  vehicleData: {
    rpm?: number;
    speed?: number;
    coolantTemp?: number;
    engineLoad?: number;
    throttlePosition?: number;
    fuelLevel?: number;
    batteryVoltage?: string;
  } | null;
  connectionInfo: OBDConnectionInfo | null;
  connectionType?: 'bluetooth' | 'wifi';
}

export const VehicleDataDisplay: React.FC<VehicleDataDisplayProps> = ({
  vehicleData,
  connectionInfo,
  connectionType = 'bluetooth',
}) => {
  if (!vehicleData && !connectionInfo) {
    return null;
  }

  const getConnectionIcon = () => {
    if (connectionType === 'wifi') {
      return connectionInfo?.state === 'connected' ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-muted-foreground" />
      );
    }
    return connectionInfo?.state === 'connected' ? (
      <Bluetooth className="w-4 h-4 text-blue-500" />
    ) : (
      <BluetoothOff className="w-4 h-4 text-muted-foreground" />
    );
  };

  const getStateColor = () => {
    switch (connectionInfo?.state) {
      case 'connected':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'connecting':
      case 'initializing':
      case 'reading':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStateText = () => {
    switch (connectionInfo?.state) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'initializing':
        return 'Inicializando...';
      case 'reading':
        return 'Lendo dados...';
      case 'error':
        return 'Erro';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className="border-dm-cadet/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getConnectionIcon()}
              Status da Conexão
            </CardTitle>
            <Badge className={getStateColor()}>{getStateText()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {connectionInfo?.deviceName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dispositivo:</span>
              <span className="font-medium">{connectionInfo.deviceName}</span>
            </div>
          )}
          {connectionInfo?.protocol && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protocolo:</span>
              <span className="font-mono text-xs">{connectionInfo.protocol}</span>
            </div>
          )}
          {connectionInfo?.voltage && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bateria:</span>
              <span className="font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                {connectionInfo.voltage}
              </span>
            </div>
          )}
          {connectionInfo?.isSimulated && (
            <Badge variant="outline" className="w-full justify-center mt-2 text-xs">
              Modo Simulado - Execute no app nativo para dados reais
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Live Vehicle Data */}
      {vehicleData && (
        <Card className="border-dm-cadet/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="w-4 h-4" />
              Dados do Veículo
            </CardTitle>
            <CardDescription>Dados em tempo real do ECU</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* RPM */}
              {vehicleData.rpm !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge className="w-4 h-4" />
                    RPM
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(vehicleData.rpm).toLocaleString()}
                  </div>
                  <Progress 
                    value={(vehicleData.rpm / 7000) * 100} 
                    className="h-1"
                  />
                </div>
              )}

              {/* Speed */}
              {vehicleData.speed !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    Velocidade
                  </div>
                  <div className="text-2xl font-bold">
                    {vehicleData.speed} <span className="text-sm font-normal">km/h</span>
                  </div>
                  <Progress 
                    value={(vehicleData.speed / 200) * 100} 
                    className="h-1"
                  />
                </div>
              )}

              {/* Coolant Temperature */}
              {vehicleData.coolantTemp !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Thermometer className="w-4 h-4" />
                    Temperatura
                  </div>
                  <div className="text-2xl font-bold">
                    {vehicleData.coolantTemp}°C
                  </div>
                  <Progress 
                    value={(vehicleData.coolantTemp / 120) * 100} 
                    className={`h-1 ${vehicleData.coolantTemp > 100 ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>
              )}

              {/* Fuel Level */}
              {vehicleData.fuelLevel !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Fuel className="w-4 h-4" />
                    Combustível
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(vehicleData.fuelLevel)}%
                  </div>
                  <Progress 
                    value={vehicleData.fuelLevel} 
                    className={`h-1 ${vehicleData.fuelLevel < 15 ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>
              )}

              {/* Engine Load */}
              {vehicleData.engineLoad !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    Carga Motor
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(vehicleData.engineLoad)}%
                  </div>
                  <Progress 
                    value={vehicleData.engineLoad} 
                    className="h-1"
                  />
                </div>
              )}

              {/* Throttle Position */}
              {vehicleData.throttlePosition !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge className="w-4 h-4" />
                    Acelerador
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(vehicleData.throttlePosition)}%
                  </div>
                  <Progress 
                    value={vehicleData.throttlePosition} 
                    className="h-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
