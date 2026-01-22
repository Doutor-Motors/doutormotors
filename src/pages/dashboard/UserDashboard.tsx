import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ChevronRight,
  Loader2,
  Bluetooth,
  Wifi,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { UsageDisplay } from "@/components/dashboard/UsageDisplay";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { MaintenanceRemindersPanel } from "@/components/dashboard/MaintenanceRemindersPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { useNotifications } from "@/hooks/useNotifications";
import { useLegalConsent } from "@/hooks/useLegalConsent";
import { useOBDConnection } from "@/components/obd/useOBDConnection";
import { useUserTier } from "@/hooks/useUserTier";
import TermsAcceptanceModal from "@/components/legal/TermsAcceptanceModal";
import SystemAlertsBanner from "@/components/notifications/SystemAlertsBanner";
import { UserBadge } from "@/components/subscription/UserBadge";
import type { Tables } from "@/integrations/supabase/types";

type Vehicle = Tables<"vehicles">;
type DiagnosticItem = Tables<"diagnostic_items">;

interface DiagnosticWithItems {
  id: string;
  created_at: string;
  vehicle_id: string;
  items: DiagnosticItem[];
}

const UserDashboard = () => {
  const { user } = useAuth();
  const { activeVehicleId, setActiveVehicleId } = useAppStore();
  const { notifyInfo, notifyWarning, notifyCriticalAlert } = useNotifications();
  const { hasAcceptedTerms, isLoading: isLoadingConsent, refetch: refetchConsent } = useLegalConsent(user?.id);
  const { tier, isLoading: tierLoading, tierConfig } = useUserTier();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<DiagnosticItem[]>([]);
  const [stats, setStats] = useState({ critical: 0, attention: 0, preventive: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasNotifiedAlerts, setHasNotifiedAlerts] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const obd = useOBDConnection();

  // Verificar se precisa mostrar modal de termos
  useEffect(() => {
    if (!isLoadingConsent && !hasAcceptedTerms && user) {
      setShowTermsModal(true);
    }
  }, [hasAcceptedTerms, isLoadingConsent, user]);

  const handleTermsAccepted = () => {
    setShowTermsModal(false);
    refetchConsent();
  };

  useEffect(() => {
    if (!user) return;

    fetchData();

    // Real-time subscription for vehicles
    const vehiclesChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Vehicle change detected:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vehiclesChannel);
    };
  }, [user, activeVehicleId]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch vehicles
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (vehiclesData) {
        setVehicles(vehiclesData);

        // Set active vehicle
        const active = activeVehicleId
          ? vehiclesData.find(v => v.id === activeVehicleId)
          : vehiclesData[0];

        if (active) {
          setActiveVehicle(active);
          if (!activeVehicleId) {
            setActiveVehicleId(active.id);
          }
        } else if (vehiclesData.length > 0) {
          // If active ID is not found but we have vehicles, default to first one
          const first = vehiclesData[0];
          setActiveVehicle(first);
          setActiveVehicleId(first.id);
        } else {
          // No vehicles
          setActiveVehicle(null);
          // Don't necessarily clear ID here to avoid flashing if it's just a sync issue, 
          // but for correctness if we are sure there are no vehicles:
          setActiveVehicleId(null);
        }
      }

      // Fetch recent diagnostics with items
      const { data: diagnosticsData } = await supabase
        .from('diagnostics')
        .select(`
          id,
          created_at,
          vehicle_id,
          diagnostic_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (diagnosticsData && diagnosticsData.length > 0) {
        // Collect all items from recent diagnostics
        const allItems: DiagnosticItem[] = [];
        let critical = 0, attention = 0, preventive = 0;

        diagnosticsData.forEach((diag: any) => {
          if (diag.diagnostic_items) {
            diag.diagnostic_items.forEach((item: DiagnosticItem) => {
              if (item.status !== 'resolved') {
                allItems.push(item);
                if (item.priority === 'critical') critical++;
                else if (item.priority === 'attention') attention++;
                else if (item.priority === 'preventive') preventive++;
              }
            });
          }
        });

        setRecentAlerts(allItems.slice(0, 5));
        setStats({ critical, attention, preventive, total: allItems.length });

        // Show notification for alerts when user enters dashboard
        if (!hasNotifiedAlerts && allItems.length > 0) {
          setHasNotifiedAlerts(true);
          if (critical > 0) {
            notifyCriticalAlert('ALERTA', `Você tem ${critical} problema${critical > 1 ? 's' : ''} crítico${critical > 1 ? 's' : ''} que requer atenção imediata!`);
          } else if (attention > 0) {
            notifyWarning('Atenção', `Você tem ${attention} item${attention > 1 ? 'ns' : ''} que precisa${attention > 1 ? 'm' : ''} de atenção.`);
          } else if (preventive > 0) {
            notifyInfo('Manutenção Preventiva', `Você tem ${preventive} item${preventive > 1 ? 'ns' : ''} preventivo${preventive > 1 ? 's' : ''}.`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-600";
      case "attention": return "bg-orange-500";
      case "preventive": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical": return "Crítico";
      case "attention": return "Atenção";
      case "preventive": return "Preventivo";
      default: return "OK";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Modal de Termos de Uso */}
      {user && (
        <TermsAcceptanceModal
          isOpen={showTermsModal}
          onAccepted={handleTermsAccepted}
          userId={user.id}
        />
      )}

      <div className="space-y-6">
        {/* System Alerts Banner */}
        <SystemAlertsBanner />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
                Dashboard
              </h1>
              <UserBadge size="md" />
            </div>
            <p className="text-muted-foreground">
              Bem-vindo de volta! Aqui está o resumo do seu veículo.
            </p>
          </div>
          <div className="flex gap-2">
            {obd.connectionStatus === 'connected' ? (
              <Button
                onClick={obd.disconnect}
                variant="outline"
                className="font-chakra uppercase"
              >
                Desconectar
              </Button>
            ) : obd.connectionStatus === 'connecting' ? (
              <Button disabled className="font-chakra uppercase">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </Button>
            ) : (
              <>
                <Button
                  onClick={obd.connectBluetooth}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-chakra uppercase"
                  size="sm"
                >
                  <Bluetooth className="w-4 h-4 mr-1" />
                  BT
                </Button>
                <Button
                  onClick={() => obd.connectWifi()}
                  className="bg-green-600 hover:bg-green-700 text-white font-chakra uppercase"
                  size="sm"
                >
                  <Wifi className="w-4 h-4 mr-1" />
                  WiFi
                </Button>

              </>
            )}
          </div>
        </div>

        {/* Vehicle Card */}
        {activeVehicle ? (
          <Card className="bg-gradient-to-br from-dm-space to-dm-blue-2 text-primary-foreground border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-4 rounded-full">
                    <Car className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-chakra text-xl font-bold uppercase">
                      {activeVehicle.brand} {activeVehicle.model}
                    </h2>
                    <p className="text-dm-cadet">
                      {activeVehicle.year}
                      {activeVehicle.engine && ` • ${activeVehicle.engine}`}
                      {activeVehicle.fuel_type && ` • ${activeVehicle.fuel_type}`}
                    </p>
                  </div>
                </div>
                <Link to="/dashboard/vehicles">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-chakra uppercase">
                    <Plus className="w-4 h-4 mr-2" />
                    Gerenciar Veículos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-dm-space to-dm-blue-2 text-primary-foreground border-0">
            <CardContent className="p-6 text-center">
              <Car className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="font-chakra text-xl font-bold uppercase mb-2">
                Nenhum veículo cadastrado
              </h2>
              <p className="text-dm-cadet mb-4">
                Cadastre seu primeiro veículo para começar
              </p>
              <Link to="/dashboard/vehicles">
                <Button className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {stats.critical}
                </p>
                <p className="text-sm text-muted-foreground">Críticos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {stats.attention}
                </p>
                <p className="text-sm text-muted-foreground">Atenção</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {stats.preventive}
                </p>
                <p className="text-sm text-muted-foreground">Preventivos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {stats.total}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-chakra text-lg uppercase">
              Alertas Ativos
            </CardTitle>
            <Link to="/dashboard/history">
              <Button variant="ghost" className="text-primary font-chakra uppercase text-sm">
                Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(alert.priority)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-chakra font-bold text-foreground">
                          {alert.dtc_code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(alert.priority)} text-white`}>
                          {getPriorityLabel(alert.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {alert.description_human}
                      </p>
                    </div>
                    <Link to={`/dashboard/solutions/${alert.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhum alerta ativo. Seu veículo está em boas condições!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Reminders */}
        <MaintenanceRemindersPanel />

        {/* Usage Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart height={280} showTypeSelector />
          <UsageDisplay />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/dashboard/diagnostics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-chakra font-bold text-foreground uppercase">
                    Novo Diagnóstico
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Iniciar leitura OBD2
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-chakra font-bold text-foreground uppercase">
                    Histórico
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ver diagnósticos anteriores
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/vehicles">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-chakra font-bold text-foreground uppercase">
                    Meus Veículos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar veículos
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
