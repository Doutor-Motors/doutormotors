import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";
import { X, AlertTriangle, Info, CheckCircle, XCircle, Bell, BellRing, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read_by: string[];
  created_at: string;
  expires_at: string | null;
}

const SystemAlertsBanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const processedAlertIds = useRef<Set<string>>(new Set());
  
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    showAlertNotification,
    playSound 
  } = useBrowserNotifications();

  // Request notification permission on mount
  useEffect(() => {
    if (isSupported && permission === "default") {
      // Show a toast asking user to enable notifications
      toast({
        title: "Ativar Notificações",
        description: "Clique no sino para receber alertas do sistema mesmo com o navegador em segundo plano.",
        duration: 8000,
      });
    }
  }, [isSupported, permission]);

  useEffect(() => {
    if (!user) return;

    fetchAlerts();

    // Subscribe to new alerts in real-time
    const subscription = supabase
      .channel("user-system-alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_alerts",
        },
        (payload) => {
          const alert = payload.new as SystemAlert;
          console.log("New system alert received:", alert);
          
          // Check if this alert is for the user and not already processed
          if (!alert.read_by?.includes(user.id) && !processedAlertIds.current.has(alert.id)) {
            processedAlertIds.current.add(alert.id);
            setAlerts((prev) => [alert, ...prev]);
            
            // Play sound if enabled
            if (soundEnabled) {
              playSound();
            }
            
            // Show browser notification
            showAlertNotification(alert);
            
            // Show in-app toast
            toast({
              title: `📢 ${alert.title}`,
              description: alert.message.length > 100 
                ? alert.message.substring(0, 100) + "..." 
                : alert.message,
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, soundEnabled, playSound, showAlertNotification, toast]);

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter out alerts already read by this user and expired alerts
      const now = new Date();
      const unreadAlerts = (data as SystemAlert[])?.filter((alert) => {
        const isRead = alert.read_by?.includes(user.id);
        const isExpired = alert.expires_at && new Date(alert.expires_at) < now;
        return !isRead && !isExpired;
      }) || [];

      setAlerts(unreadAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    if (!user) return;

    try {
      // Get current read_by array
      const { data: alertData } = await supabase
        .from("system_alerts")
        .select("read_by")
        .eq("id", alertId)
        .single();

      const currentReadBy = (alertData as { read_by: string[] })?.read_by || [];
      
      // Update with user id added
      await supabase
        .from("system_alerts")
        .update({ read_by: [...currentReadBy, user.id] })
        .eq("id", alertId);

      // Remove from local state
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        };
      case "warning":
        return {
          bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        };
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
          icon: <Info className="w-5 h-5 text-blue-500" />,
          badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent": return "Urgente";
      case "high": return "Alta";
      case "normal": return "Normal";
      case "low": return "Baixa";
      default: return priority;
    }
  };

  if (loading || alerts.length === 0) {
    // Still show notification controls even if no alerts
    if (!loading && isSupported) {
      return (
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2 text-muted-foreground"
            title={soundEnabled ? "Desativar som" : "Ativar som"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
          {permission !== "granted" && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestPermission}
              className="gap-2"
            >
              <BellRing className="w-4 h-4" />
              Ativar notificações
            </Button>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Notification controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Bell className="w-4 h-4" />
          {alerts.length} alerta{alerts.length > 1 ? 's' : ''} não lido{alerts.length > 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-1 text-xs"
            title={soundEnabled ? "Desativar som" : "Ativar som"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3 h-3" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
          </Button>
          {permission !== "granted" && isSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestPermission}
              className="gap-1 text-xs"
            >
              <BellRing className="w-3 h-3" />
              Push
            </Button>
          )}
        </div>
      </div>
      
      {/* Alert cards */}
      {alerts.slice(0, 3).map((alert) => {
        const styles = getTypeStyles(alert.type);
        const isExpanded = expandedId === alert.id;

        return (
          <Card
            key={alert.id}
            className={`border ${styles.bg} overflow-hidden transition-all`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">
                      {alert.title}
                    </h4>
                    <Badge className={`text-xs ${styles.badge}`}>
                      {getPriorityLabel(alert.priority)}
                    </Badge>
                  </div>
                  <p
                    className={`text-sm text-muted-foreground ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                    {alert.message.length > 100 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        {isExpanded ? "Ver menos" : "Ver mais"}
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => markAsRead(alert.id)}
                  className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      {alerts.length > 3 && (
        <p className="text-center text-sm text-muted-foreground">
          +{alerts.length - 3} alerta(s) adicional(is)
        </p>
      )}
    </div>
  );
};

export default SystemAlertsBanner;