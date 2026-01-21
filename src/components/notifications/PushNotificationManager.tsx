import React, { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Check, RefreshCw, Smartphone, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications, AlertPriority } from '@/hooks/usePushNotifications';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { toast } from 'sonner';

interface PushNotificationManagerProps {
  compact?: boolean;
  showTestButtons?: boolean;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  compact = false,
  showTestButtons = true,
}) => {
  const {
    swState,
    isSubscribed,
    permission,
    registerServiceWorker,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showLocalNotification,
    updateServiceWorker,
    getSwVersion,
  } = usePushNotifications();
  
  const { testSound } = useBrowserNotifications();
  
  const [swVersion, setSwVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState({
    diagnosticCritical: true,
    diagnosticComplete: true,
    ticketUpdates: true,
    systemAlerts: true,
  });
  
  // Get SW version on mount
  useEffect(() => {
    if (swState.isRegistered) {
      getSwVersion().then(setSwVersion);
    }
  }, [swState.isRegistered, getSwVersion]);
  
  // Handle enable notifications
  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      // First register SW
      const registration = await registerServiceWorker();
      if (!registration) {
        toast.error('Erro ao registrar Service Worker');
        return;
      }
      
      // Request permission
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Permissão de notificações negada');
        return;
      }
      
      // Subscribe to push (for now local only, as we don't have VAPID)
      await subscribeToPush();
      
      toast.success('Notificações ativadas com sucesso!');
      
      // Show welcome notification
      await showLocalNotification({
        title: '🎉 Notificações Ativadas!',
        body: 'Você receberá alertas sobre diagnósticos críticos e atualizações importantes.',
        priority: 'normal',
        url: '/painel',
      });
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Erro ao ativar notificações');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle disable notifications
  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      toast.success('Notificações desativadas');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test notification by priority
  const handleTestNotification = async (priority: AlertPriority) => {
    const messages: Record<AlertPriority, { title: string; body: string }> = {
      urgent: {
        title: '🚨 ALERTA CRÍTICO!',
        body: 'Teste de notificação urgente - Problema grave detectado no veículo!',
      },
      high: {
        title: '⚠️ Atenção Necessária',
        body: 'Teste de notificação alta - Verifique seu diagnóstico.',
      },
      normal: {
        title: '📢 Atualização',
        body: 'Teste de notificação normal - Seu diagnóstico foi processado.',
      },
      low: {
        title: 'ℹ️ Informação',
        body: 'Teste de notificação baixa - Dica de manutenção preventiva.',
      },
    };
    
    // Play sound
    testSound(priority);
    
    // Show push notification
    const success = await showLocalNotification({
      ...messages[priority],
      priority,
      url: '/painel/diagnostico',
    });
    
    if (success) {
      toast.success(`Notificação ${priority} enviada!`);
    } else {
      toast.error('Erro ao enviar notificação');
    }
  };
  
  // Render permission status badge
  const renderPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500">Permitido</Badge>;
      case 'denied':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">Não solicitado</Badge>;
    }
  };
  
  // Compact view for settings
  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            {permission === 'granted' ? (
              <BellRing className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' 
                ? 'Ativo - Receba alertas em tempo real' 
                : 'Desativado'}
            </p>
          </div>
        </div>
        <Switch
          checked={permission === 'granted' && swState.isRegistered}
          onCheckedChange={(checked) => 
            checked ? handleEnableNotifications() : handleDisableNotifications()
          }
          disabled={isLoading || permission === 'denied'}
        />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          {renderPermissionBadge()}
        </div>
        <CardDescription>
          Receba alertas em tempo real sobre diagnósticos críticos e atualizações importantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Support Check */}
        {!swState.isSupported && (
          <Alert variant="destructive">
            <AlertDescription>
              Seu navegador não suporta notificações push. 
              Tente usar Chrome, Firefox, Safari ou Edge.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Permission Denied Warning */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertDescription>
              Você bloqueou as notificações. Para reativar, acesse as configurações 
              do navegador e permita notificações para este site.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Service Worker: {swState.isRegistered ? (
                <span className="text-green-600 font-medium">Ativo</span>
              ) : (
                <span className="text-muted-foreground">Inativo</span>
              )}
            </span>
          </div>
          {swVersion && (
            <div className="text-sm text-muted-foreground">
              Versão: {swVersion}
            </div>
          )}
        </div>
        
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-base font-medium">Ativar Notificações</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Receba alertas mesmo quando o app estiver em segundo plano
            </p>
          </div>
          <Switch
            checked={permission === 'granted' && swState.isRegistered}
            onCheckedChange={(checked) => 
              checked ? handleEnableNotifications() : handleDisableNotifications()
            }
            disabled={isLoading || !swState.isSupported || permission === 'denied'}
          />
        </div>
        
        {/* Notification Types */}
        {permission === 'granted' && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Tipos de Notificação</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Diagnósticos Críticos</Label>
                  <p className="text-xs text-muted-foreground">
                    Alertas de problemas graves no veículo
                  </p>
                </div>
                <Switch
                  checked={notificationTypes.diagnosticCritical}
                  onCheckedChange={(checked) => 
                    setNotificationTypes(prev => ({ ...prev, diagnosticCritical: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Diagnósticos Concluídos</Label>
                  <p className="text-xs text-muted-foreground">
                    Quando uma análise é finalizada
                  </p>
                </div>
                <Switch
                  checked={notificationTypes.diagnosticComplete}
                  onCheckedChange={(checked) => 
                    setNotificationTypes(prev => ({ ...prev, diagnosticComplete: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Atualizações de Tickets</Label>
                  <p className="text-xs text-muted-foreground">
                    Respostas em tickets de suporte
                  </p>
                </div>
                <Switch
                  checked={notificationTypes.ticketUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationTypes(prev => ({ ...prev, ticketUpdates: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas do Sistema</Label>
                  <p className="text-xs text-muted-foreground">
                    Avisos importantes da plataforma
                  </p>
                </div>
                <Switch
                  checked={notificationTypes.systemAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationTypes(prev => ({ ...prev, systemAlerts: checked }))
                  }
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Test Buttons */}
        {showTestButtons && permission === 'granted' && swState.isRegistered && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-medium">Testar Notificações</Label>
            <p className="text-sm text-muted-foreground">
              Clique para testar o som e a notificação de cada prioridade.
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleTestNotification('urgent')}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                🚨 Urgente
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification('high')}
                className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <Volume2 className="h-4 w-4" />
                ⚠️ Alta
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification('normal')}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                📢 Normal
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTestNotification('low')}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                ℹ️ Baixa
              </Button>
            </div>
          </div>
        )}
        
        {/* Update Button */}
        {swState.updateAvailable && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Nova versão disponível
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={updateServiceWorker}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationManager;
