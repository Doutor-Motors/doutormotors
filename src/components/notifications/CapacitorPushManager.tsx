import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Smartphone, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCapacitorPushNotifications } from '@/hooks/useCapacitorPushNotifications';
import { usePlatformDetection } from '@/hooks/usePlatformDetection';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CapacitorPushManagerProps {
  onTokenReceived?: (token: string) => void;
  showCard?: boolean;
}

export const CapacitorPushManager = ({ 
  onTokenReceived,
  showCard = true 
}: CapacitorPushManagerProps) => {
  const [isInitializing, setIsInitializing] = useState(false);
  
  const { platformInfo, platformDescription } = usePlatformDetection();
  
  const {
    isNative,
    isSupported,
    isRegistered,
    permission,
    token,
    requestPermission,
    register,
    unregister,
    createDiagnosticChannels,
    onTokenReceived: setTokenCallback,
    onNotificationReceived,
    onNotificationAction,
  } = useCapacitorPushNotifications();
  
  // Setup callbacks
  useEffect(() => {
    if (onTokenReceived) {
      setTokenCallback(onTokenReceived);
    }
    
    // Handle foreground notifications
    onNotificationReceived((notification) => {
      toast.info(notification.title || 'Nova notificação', {
        description: notification.body,
        action: notification.data?.url ? {
          label: 'Ver',
          onClick: () => {
            window.location.href = notification.data.url as string;
          },
        } : undefined,
      });
    });
    
    // Handle notification actions
    onNotificationAction((action) => {
      if (action.actionId === 'view' && action.notification.data?.url) {
        window.location.href = action.notification.data.url as string;
      }
    });
  }, [onTokenReceived, setTokenCallback, onNotificationReceived, onNotificationAction]);
  
  // Initialize push notifications
  const handleInitialize = async () => {
    setIsInitializing(true);
    
    try {
      // Create Android channels first
      await createDiagnosticChannels();
      
      // Register for push
      const success = await register();
      
      if (success) {
        toast.success('Notificações ativadas!', {
          description: 'Você receberá alertas sobre diagnósticos importantes.',
        });
      } else {
        toast.error('Não foi possível ativar notificações', {
          description: 'Verifique as permissões do app nas configurações.',
        });
      }
    } catch (error) {
      console.error('Failed to initialize push:', error);
      toast.error('Erro ao configurar notificações');
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Disable push notifications
  const handleDisable = async () => {
    await unregister();
    toast.info('Notificações desativadas');
  };
  
  // If not showing card, just handle initialization silently
  if (!showCard) {
    return null;
  }
  
  // Web browser - show prompt to download native app
  if (!isNative) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellOff className="w-5 h-5 text-amber-500" />
            Notificações Push Nativas
          </CardTitle>
          <CardDescription>
            Notificações push nativas requerem o app instalado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Navegador Detectado</AlertTitle>
            <AlertDescription>
              Você está usando: <strong>{platformDescription}</strong>
              <br />
              Para receber notificações push nativas sobre diagnósticos, baixe o app.
            </AlertDescription>
          </Alert>
          
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
            <Link to="/baixar-app">
              <Smartphone className="w-4 h-4 mr-2" />
              Baixar App Nativo
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Native app - show push configuration
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="w-5 h-5 text-primary" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas sobre diagnósticos críticos no seu dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {isRegistered ? (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <XCircle className="w-3 h-3" />
                Inativo
              </Badge>
            )}
          </div>
          
          <Switch
            checked={isRegistered}
            onCheckedChange={(checked) => {
              if (checked) {
                handleInitialize();
              } else {
                handleDisable();
              }
            }}
            disabled={isInitializing}
          />
        </div>
        
        {/* Permission status */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Permissão Negada</AlertTitle>
            <AlertDescription>
              Você precisa permitir notificações nas configurações do dispositivo.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Token info (for debugging) */}
        {isRegistered && token && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
            <span className="font-medium">Token:</span> {token.substring(0, 30)}...
          </div>
        )}
        
        {/* Feature description */}
        <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
          <p className="font-medium text-foreground">Você será notificado sobre:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>🚨 Problemas críticos detectados</li>
            <li>⚠️ Códigos de erro que precisam de atenção</li>
            <li>🔧 Lembretes de manutenção preventiva</li>
            <li>📊 Resultados de diagnósticos concluídos</li>
          </ul>
        </div>
        
        {/* Channels info (Android) */}
        {platformInfo.isAndroid && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>💡 Você pode personalizar os canais de notificação nas configurações do Android.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CapacitorPushManager;
