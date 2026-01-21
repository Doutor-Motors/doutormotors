import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformDetection } from '@/hooks/usePlatformDetection';
import { 
  Smartphone, 
  Monitor, 
  Wifi, 
  Bluetooth, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Loader2 
} from 'lucide-react';

interface PlatformCapabilityBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export const PlatformCapabilityBadge = ({ 
  showDetails = false, 
  className = '' 
}: PlatformCapabilityBadgeProps) => {
  const { 
    platformInfo, 
    platformDescription, 
    connectionCapabilities, 
    canConnect, 
    recommendedAction,
    isLoading 
  } = usePlatformDetection();

  if (isLoading) {
    return (
      <Badge variant="secondary" className={className}>
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Detectando...
      </Badge>
    );
  }

  const PlatformIcon = platformInfo.isNative 
    ? Smartphone 
    : Monitor;

  const StatusIcon = canConnect ? CheckCircle : XCircle;
  const statusColor = canConnect ? 'text-green-500' : 'text-red-500';

  if (!showDetails) {
    return (
      <Badge 
        variant={canConnect ? 'default' : 'destructive'} 
        className={className}
      >
        <PlatformIcon className="h-3 w-3 mr-1" />
        {platformDescription}
        {canConnect && <CheckCircle className="h-3 w-3 ml-1" />}
      </Badge>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlatformIcon className="h-5 w-5" />
            <CardTitle className="text-lg">{platformDescription}</CardTitle>
          </div>
          <Badge variant={platformInfo.isNative ? 'default' : 'secondary'}>
            {platformInfo.isNative ? 'App Nativo' : 'Web'}
          </Badge>
        </div>
        <CardDescription>
          Plataforma: {platformInfo.platform.toUpperCase()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bluetooth Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Bluetooth className="h-4 w-4" />
            <span className="font-medium">Bluetooth</span>
          </div>
          <div className="flex items-center gap-2">
            {connectionCapabilities.bluetooth.supported ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {connectionCapabilities.bluetooth.supported ? 'Disponível' : 'Não disponível'}
            </span>
          </div>
        </div>

        {/* WiFi Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="font-medium">WiFi/TCP</span>
          </div>
          <div className="flex items-center gap-2">
            {connectionCapabilities.wifi.supported ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {connectionCapabilities.wifi.supported ? 'Disponível' : 'Não disponível'}
            </span>
          </div>
        </div>

        {/* Recommended Action */}
        <div className={`p-3 rounded-lg ${canConnect ? 'bg-green-50 dark:bg-green-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
          <div className="flex items-start gap-2">
            {canConnect ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            )}
            <p className={`text-sm ${canConnect ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {recommendedAction}
            </p>
          </div>
        </div>

        {/* Native Plugin Status (only show in native mode) */}
        {platformInfo.isNative && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Status dos Plugins:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className={platformInfo.supportsBluetoothNative ? 'text-green-500' : 'text-gray-400'}>
                  {platformInfo.supportsBluetoothNative ? '✓' : '○'}
                </span>
                BluetoothSerial
              </div>
              <div className="flex items-center gap-1">
                <span className={platformInfo.supportsTCPNative ? 'text-green-500' : 'text-gray-400'}>
                  {platformInfo.supportsTCPNative ? '✓' : '○'}
                </span>
                TcpSockets
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformCapabilityBadge;
