import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X, AlertTriangle, Info, CheckCircle, XCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchAlerts();

    // Subscribe to new alerts
    const subscription = supabase
      .channel("user-system-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_alerts",
        },
        (payload) => {
          const alert = payload.new as SystemAlert;
          // Check if this alert is for the user
          if (!alert.read_by?.includes(user.id)) {
            setAlerts((prev) => [alert, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

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
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
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