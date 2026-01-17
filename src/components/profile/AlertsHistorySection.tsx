import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  Inbox
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read_by: string[] | null;
  created_at: string;
  expires_at: string | null;
}

interface AlertsHistorySectionProps {
  userId: string;
}

const AlertsHistorySection = ({ userId }: AlertsHistorySectionProps) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRead, setShowRead] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('user-alerts-history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      // Buscar alertas direcionados ao usuário ou todos os usuários
      const { data, error } = await supabase
        .from('system_alerts')
        .select('id, title, message, type, priority, read_by, created_at, expires_at, target_type, target_user_ids, target_role')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrar alertas que são para este usuário específico ou para todos
      const userAlerts = (data || []).filter(alert => {
        // Alertas para todos os usuários
        if (alert.target_type === 'all') return true;
        
        // Alertas para usuários específicos
        if (alert.target_type === 'specific' && alert.target_user_ids) {
          return alert.target_user_ids.includes(userId);
        }
        
        // Alertas para role específico (verificar se é user)
        if (alert.target_type === 'role' && alert.target_role === 'user') {
          return true;
        }
        
        return false;
      });

      setAlerts(userAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlertRead = async (alertId: string, isCurrentlyRead: boolean) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      let newReadBy: string[];
      if (isCurrentlyRead) {
        // Remove from read_by
        newReadBy = (alert.read_by || []).filter(id => id !== userId);
      } else {
        // Add to read_by
        newReadBy = [...(alert.read_by || []), userId];
      }

      const { error } = await supabase
        .from('system_alerts')
        .update({ read_by: newReadBy })
        .eq('id', alertId);

      if (error) throw error;

      // Update local state
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, read_by: newReadBy } : a
      ));
    } catch (error) {
      console.error('Error toggling alert read status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Sucesso</Badge>;
      default:
        return <Badge variant="secondary">Informação</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Baixa</Badge>;
      default:
        return null;
    }
  };

  const isRead = (alert: SystemAlert) => {
    return (alert.read_by || []).includes(userId);
  };

  const isExpired = (alert: SystemAlert) => {
    if (!alert.expires_at) return false;
    return new Date(alert.expires_at) < new Date();
  };

  const filteredAlerts = showRead 
    ? alerts 
    : alerts.filter(a => !isRead(a));

  const unreadCount = alerts.filter(a => !isRead(a)).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle className="font-chakra uppercase">
              Histórico de Alertas
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount} não lido{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRead(!showRead)}
            className="gap-2"
          >
            {showRead ? (
              <>
                <EyeOff className="w-4 h-4" />
                Ocultar lidos
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Mostrar todos
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Visualize todos os alertas e notificações do sistema enviados para você.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {showRead ? "Nenhum alerta recebido" : "Nenhum alerta não lido"}
            </p>
            <p className="text-sm">
              {showRead 
                ? "Você não recebeu nenhum alerta do sistema ainda." 
                : "Todos os alertas foram marcados como lidos."}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => {
                const alertIsRead = isRead(alert);
                const alertIsExpired = isExpired(alert);

                return (
                  <div key={alert.id}>
                    <div 
                      className={`
                        p-4 rounded-lg border transition-all
                        ${alertIsRead 
                          ? 'bg-muted/30 border-border/50' 
                          : 'bg-card border-primary/30 shadow-sm'
                        }
                        ${alertIsExpired ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5">
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className={`font-semibold truncate ${alertIsRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {alert.title}
                              </h4>
                              {getTypeBadge(alert.type)}
                              {getPriorityBadge(alert.priority)}
                              {alertIsExpired && (
                                <Badge variant="outline" className="text-xs opacity-70">Expirado</Badge>
                              )}
                            </div>
                            <p className={`text-sm ${alertIsRead ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/60">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(alert.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                              </span>
                              {alert.expires_at && (
                                <span>
                                  Expira: {format(new Date(alert.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleAlertRead(alert.id, alertIsRead)}
                          className="shrink-0"
                          title={alertIsRead ? "Marcar como não lido" : "Marcar como lido"}
                        >
                          {alertIsRead ? (
                            <BellOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Bell className="w-4 h-4 text-primary" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {index < filteredAlerts.length - 1 && (
                      <Separator className="my-2 opacity-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsHistorySection;
