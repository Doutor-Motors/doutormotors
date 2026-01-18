import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Car, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  CreditCard,
  Database,
  Server,
  Clock,
  BarChart3,
  Sparkles,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import SystemUsageChart from "@/components/admin/SystemUsageChart";
import UserSubscriptionStats from "@/components/admin/UserSubscriptionStats";
import TopUsersTable from "@/components/admin/TopUsersTable";
import PeriodComparisonCard from "@/components/admin/PeriodComparisonCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { generateAdminReport } from "@/services/pdf/adminReportGenerator";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface Stats {
  totalUsers: number;
  totalVehicles: number;
  totalDiagnostics: number;
  pendingDiagnostics: number;
  completedDiagnostics: number;
  criticalIssues: number;
  activeToday: number;
  newUsersThisWeek: number;
}

interface SubscriptionStats {
  basic: number;
  pro: number;
  total: number;
}

interface DailyUsage {
  date: string;
  diagnostics: number;
  coding: number;
  recordings: number;
  ai: number;
  total: number;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  plan: 'basic' | 'pro';
  diagnosticsCount: number;
  vehiclesCount: number;
  lastActive: string;
}

interface PeriodComparison {
  currentMonth: {
    diagnostics: number;
    recordings: number;
    newUsers: number;
  };
  previousMonth: {
    diagnostics: number;
    recordings: number;
    newUsers: number;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVehicles: 0,
    totalDiagnostics: 0,
    pendingDiagnostics: 0,
    completedDiagnostics: 0,
    criticalIssues: 0,
    activeToday: 0,
    newUsersThisWeek: 0,
  });
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    basic: 0,
    pro: 0,
    total: 0,
  });
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [periodComparison, setPeriodComparison] = useState<PeriodComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    fetchSubscriptionStats();
    fetchDailyUsage();
    fetchTopUsers();
    fetchPeriodComparison();
  }, []);

  const fetchStats = async () => {
    try {
      const weekAgo = subDays(new Date(), 7).toISOString();
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();

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

      // Fetch new users this week
      const { count: newUsersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo);

      // Fetch active users today (users with diagnostics today)
      const { count: activeCount } = await supabase
        .from("diagnostics")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", todayStart)
        .lte("created_at", todayEnd);

      setStats({
        totalUsers: usersCount || 0,
        totalVehicles: vehiclesCount || 0,
        totalDiagnostics: diagnosticsCount || 0,
        pendingDiagnostics: pendingCount || 0,
        completedDiagnostics: completedCount || 0,
        criticalIssues: criticalCount || 0,
        newUsersThisWeek: newUsersCount || 0,
        activeToday: activeCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("plan_type, status")
        .eq("status", "active");

      if (subscriptions) {
        const basic = subscriptions.filter(s => s.plan_type === 'basic').length;
        const pro = subscriptions.filter(s => s.plan_type === 'pro').length;
        setSubscriptionStats({
          basic,
          pro,
          total: basic + pro,
        });
      }
    } catch (error) {
      console.error("Error fetching subscription stats:", error);
    }
  };

  const fetchDailyUsage = async () => {
    setUsageLoading(true);
    try {
      const days = 30;
      const dailyData: DailyUsage[] = [];

      // Generate last 30 days
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();

        // Fetch diagnostics for this day
        const { count: diagnosticsCount } = await supabase
          .from("diagnostics")
          .select("*", { count: "exact", head: true })
          .gte("created_at", dayStart)
          .lte("created_at", dayEnd);

        // Fetch data recordings for this day
        const { count: recordingsCount } = await supabase
          .from("data_recordings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", dayStart)
          .lte("created_at", dayEnd);

        dailyData.push({
          date: format(date, 'yyyy-MM-dd'),
          diagnostics: diagnosticsCount || 0,
          coding: 0, // Would need usage_tracking table
          recordings: recordingsCount || 0,
          ai: 0, // Would need usage_tracking table
          total: (diagnosticsCount || 0) + (recordingsCount || 0),
        });
      }

      setDailyUsage(dailyData);
    } catch (error) {
      console.error("Error fetching daily usage:", error);
    } finally {
      setUsageLoading(false);
    }
  };

  const fetchTopUsers = async () => {
    try {
      // Get users with their diagnostic counts
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, email, updated_at")
        .limit(100);

      if (!profiles) return;

      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          // Get diagnostics count
          const { count: diagnosticsCount } = await supabase
            .from("diagnostics")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.user_id);

          // Get vehicles count
          const { count: vehiclesCount } = await supabase
            .from("vehicles")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.user_id);

          // Get subscription
          const { data: subscription } = await supabase
            .from("user_subscriptions")
            .select("plan_type")
            .eq("user_id", profile.user_id)
            .eq("status", "active")
            .maybeSingle();

          return {
            id: profile.user_id,
            name: profile.name,
            email: profile.email,
            plan: (subscription?.plan_type as 'basic' | 'pro') || 'basic',
            diagnosticsCount: diagnosticsCount || 0,
            vehiclesCount: vehiclesCount || 0,
            lastActive: profile.updated_at,
          };
        })
      );

      // Sort by diagnostics count and take top 10
      const sorted = usersWithStats
        .sort((a, b) => b.diagnosticsCount - a.diagnosticsCount)
        .slice(0, 10);

      setTopUsers(sorted);
    } catch (error) {
      console.error("Error fetching top users:", error);
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

  const fetchPeriodComparison = async () => {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now).toISOString();
      const currentMonthEnd = endOfMonth(now).toISOString();
      const previousMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
      const previousMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

      // Current month diagnostics
      const { count: currentDiagnostics } = await supabase
        .from("diagnostics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", currentMonthStart)
        .lte("created_at", currentMonthEnd);

      // Previous month diagnostics
      const { count: previousDiagnostics } = await supabase
        .from("diagnostics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", previousMonthStart)
        .lte("created_at", previousMonthEnd);

      // Current month recordings
      const { count: currentRecordings } = await supabase
        .from("data_recordings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", currentMonthStart)
        .lte("created_at", currentMonthEnd);

      // Previous month recordings
      const { count: previousRecordings } = await supabase
        .from("data_recordings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", previousMonthStart)
        .lte("created_at", previousMonthEnd);

      // Current month new users
      const { count: currentNewUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", currentMonthStart)
        .lte("created_at", currentMonthEnd);

      // Previous month new users
      const { count: previousNewUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", previousMonthStart)
        .lte("created_at", previousMonthEnd);

      setPeriodComparison({
        currentMonth: {
          diagnostics: currentDiagnostics || 0,
          recordings: currentRecordings || 0,
          newUsers: currentNewUsers || 0,
        },
        previousMonth: {
          diagnostics: previousDiagnostics || 0,
          recordings: previousRecordings || 0,
          newUsers: previousNewUsers || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching period comparison:", error);
    }
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      generateAdminReport({
        stats,
        subscriptionStats,
        topUsers: topUsers.map(u => ({
          name: u.name,
          email: u.email,
          plan: u.plan,
          diagnosticsCount: u.diagnosticsCount,
          vehiclesCount: u.vehiclesCount,
        })),
        dailyUsage: dailyUsage.map(d => ({
          date: d.date,
          diagnostics: d.diagnostics,
          recordings: d.recordings,
          total: d.total,
        })),
        periodComparison: periodComparison || undefined,
        generatedBy: user?.email || 'Admin',
      });
      toast({
        title: "PDF Exportado!",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const statCards = [
    {
      title: "Total Usuários",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      subtitle: `+${stats.newUsersThisWeek} esta semana`,
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
      icon: Clock,
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

  // Calculate summary metrics
  const avgDiagnosticsPerUser = stats.totalUsers > 0 
    ? (stats.totalDiagnostics / stats.totalUsers).toFixed(1) 
    : '0';
  
  const completionRate = stats.totalDiagnostics > 0
    ? ((stats.completedDiagnostics / stats.totalDiagnostics) * 100).toFixed(0)
    : '0';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-chakra text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do sistema Doutor Motors
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exportingPdf || loading}
              className="gap-2"
            >
              {exportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Exportar PDF
            </Button>
            <Badge variant="outline" className="gap-1">
              <Server className="w-3 h-3" />
              Sistema Operacional
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {stats.activeToday} ativos hoje
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Uso do Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                        {stat.subtitle && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {stat.subtitle}
                          </p>
                        )}
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Média por Usuário</p>
                      <p className="text-2xl font-bold">{avgDiagnosticsPerUser}</p>
                      <p className="text-xs text-muted-foreground">diagnósticos/usuário</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-500/10">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                      <p className="text-2xl font-bold">{completionRate}%</p>
                      <p className="text-xs text-muted-foreground">dos diagnósticos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-500/10">
                      <CreditCard className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Usuários Pro</p>
                      <p className="text-2xl font-bold">{subscriptionStats.pro}</p>
                      <p className="text-xs text-muted-foreground">
                        {subscriptionStats.total > 0 
                          ? `${((subscriptionStats.pro / subscriptionStats.total) * 100).toFixed(0)}% do total`
                          : 'Nenhuma assinatura'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopUsersTable users={topUsers} isLoading={loading} />
              </div>
              <div>
                <UserSubscriptionStats stats={subscriptionStats} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            {/* Period Comparison */}
            {periodComparison && (
              <PeriodComparisonCard
                currentMonth={periodComparison.currentMonth}
                previousMonth={periodComparison.previousMonth}
              />
            )}

            <SystemUsageChart data={dailyUsage} variant="area" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SystemUsageChart data={dailyUsage.slice(-7)} variant="bar" height={250} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Estatísticas do Sistema
                  </CardTitle>
                  <CardDescription>Resumo de dados armazenados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Total de Registros</span>
                    <span className="font-bold">{stats.totalDiagnostics + stats.totalVehicles}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Usuários Registrados</span>
                    <span className="font-bold">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Veículos por Usuário</span>
                    <span className="font-bold">
                      {stats.totalUsers > 0 
                        ? (stats.totalVehicles / stats.totalUsers).toFixed(1) 
                        : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Issues Críticas Abertas</span>
                    <Badge variant={stats.criticalIssues > 0 ? "destructive" : "secondary"}>
                      {stats.criticalIssues}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
