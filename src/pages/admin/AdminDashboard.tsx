import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalUsers: number;
  totalVehicles: number;
  totalDiagnostics: number;
  pendingDiagnostics: number;
  completedDiagnostics: number;
  criticalIssues: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVehicles: 0,
    totalDiagnostics: 0,
    pendingDiagnostics: 0,
    completedDiagnostics: 0,
    criticalIssues: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch vehicles count
      const { count: vehiclesCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true });

      // Fetch diagnostics stats
      const { count: diagnosticsCount } = await supabase
        .from("diagnostics")
        .select("*", { count: "exact", head: true });

      const { count: pendingCount } = await supabase
        .from("diagnostics")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: completedCount } = await supabase
        .from("diagnostics")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      // Fetch critical issues
      const { count: criticalCount } = await supabase
        .from("diagnostic_items")
        .select("*", { count: "exact", head: true })
        .eq("priority", "critical");

      setStats({
        totalUsers: usersCount || 0,
        totalVehicles: vehiclesCount || 0,
        totalDiagnostics: diagnosticsCount || 0,
        pendingDiagnostics: pendingCount || 0,
        completedDiagnostics: completedCount || 0,
        criticalIssues: criticalCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: recentDiagnostics } = await supabase
        .from("diagnostics")
        .select(`
          id,
          created_at,
          status,
          vehicles (brand, model, year)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(recentDiagnostics || []);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const statCards = [
    {
      title: "Total Usuários",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Veículos Cadastrados",
      value: stats.totalVehicles,
      icon: Car,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Diagnósticos",
      value: stats.totalDiagnostics,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Pendentes",
      value: stats.pendingDiagnostics,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Concluídos",
      value: stats.completedDiagnostics,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Problemas Críticos",
      value: stats.criticalIssues,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-chakra text-foreground">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema Doutor Motors
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-dm-cadet/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="border-dm-cadet/20">
          <CardHeader>
            <CardTitle className="font-chakra">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma atividade recente
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {activity.vehicles?.brand} {activity.vehicles?.model} ({activity.vehicles?.year})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.status === "completed"
                          ? "bg-green-500/20 text-green-500"
                          : activity.status === "in_progress"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-gray-500/20 text-gray-500"
                      }`}
                    >
                      {activity.status === "completed"
                        ? "Concluído"
                        : activity.status === "in_progress"
                        ? "Em andamento"
                        : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
