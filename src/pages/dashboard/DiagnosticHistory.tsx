import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  ChevronRight, 
  AlertTriangle,
  Activity,
  CheckCircle,
  Car,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Vehicle = Tables<"vehicles">;
type DiagnosticItem = Tables<"diagnostic_items">;

interface DiagnosticWithDetails {
  id: string;
  created_at: string;
  status: string;
  vehicle: Vehicle | null;
  items: DiagnosticItem[];
  stats: {
    critical: number;
    attention: number;
    preventive: number;
    total: number;
  };
}

const DiagnosticHistory = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDiagnostics();
    }
  }, [user]);

  const fetchDiagnostics = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select(`
          id,
          created_at,
          status,
          vehicle_id,
          vehicles (*),
          diagnostic_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedDiagnostics: DiagnosticWithDetails[] = data.map((diag: any) => {
          const items: DiagnosticItem[] = diag.diagnostic_items || [];
          let critical = 0, attention = 0, preventive = 0;

          items.forEach((item: DiagnosticItem) => {
            if (item.priority === 'critical') critical++;
            else if (item.priority === 'attention') attention++;
            else if (item.priority === 'preventive') preventive++;
          });

          return {
            id: diag.id,
            created_at: diag.created_at,
            status: diag.status,
            vehicle: diag.vehicles,
            items,
            stats: {
              critical,
              attention,
              preventive,
              total: items.length,
            },
          };
        });

        setDiagnostics(formattedDiagnostics);
      }
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Histórico de Diagnósticos
            </h1>
            <p className="text-muted-foreground">
              Veja todos os diagnósticos realizados nos seus veículos.
            </p>
          </div>
          <Link to="/dashboard/diagnostics">
            <Button className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill">
              Novo Diagnóstico
            </Button>
          </Link>
        </div>

        {/* History List */}
        {diagnostics.length > 0 ? (
          <div className="space-y-4">
            {diagnostics.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Car className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-chakra font-bold text-foreground uppercase">
                          {item.vehicle 
                            ? `${item.vehicle.brand} ${item.vehicle.model} ${item.vehicle.year}`
                            : 'Veículo removido'
                          }
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        {item.stats.critical > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-bold text-red-600">{item.stats.critical}</span>
                          </div>
                        )}
                        {item.stats.attention > 0 && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-orange-500">{item.stats.attention}</span>
                          </div>
                        )}
                        {item.stats.preventive > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-yellow-500">{item.stats.preventive}</span>
                          </div>
                        )}
                        {item.stats.total === 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">Sem problemas</span>
                          </div>
                        )}
                      </div>

                      <Link to={`/dashboard/diagnostics/${item.id}`}>
                        <Button variant="ghost" className="text-primary font-chakra uppercase hover:bg-muted hover:text-primary">
                          Ver Detalhes
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
              Nenhum diagnóstico realizado
            </h3>
            <p className="text-muted-foreground mb-6">
              Faça seu primeiro diagnóstico para começar a acompanhar a saúde do seu veículo.
            </p>
            <Link to="/dashboard/diagnostics">
              <Button className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                Fazer Diagnóstico
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticHistory;
