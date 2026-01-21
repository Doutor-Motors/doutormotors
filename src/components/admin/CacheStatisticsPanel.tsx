import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BarChart3, 
  RefreshCw, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface CacheStatsSummary {
  cache_type: string;
  date: string;
  hits: number;
  misses: number;
  expired: number;
  evicted: number;
  total_operations: number;
  hit_rate_percent: number;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6366f1'];

export function CacheStatisticsPanel() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch cache statistics summary
  const { data: statsSummary, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ["cache-stats-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cache_statistics_summary")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CacheStatsSummary[];
    },
  });

  // Fetch recent operations
  const { data: recentOps, isLoading: loadingRecent } = useQuery({
    queryKey: ["cache-stats-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cache_statistics")
        .select("id, cache_type, operation, key_identifier, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("cleanup-old-data");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cache-stats-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cache-stats-recent"] });
      toast.success("Limpeza executada com sucesso!", {
        description: `Removidos: ${JSON.stringify(data.deleted)}`,
      });
    },
    onError: (error) => {
      toast.error("Erro na limpeza: " + error.message);
    },
  });

  // Aggregate data by cache type
  const aggregatedByType = statsSummary?.reduce((acc, stat) => {
    if (!acc[stat.cache_type]) {
      acc[stat.cache_type] = { hits: 0, misses: 0, expired: 0, total: 0 };
    }
    acc[stat.cache_type].hits += stat.hits || 0;
    acc[stat.cache_type].misses += stat.misses || 0;
    acc[stat.cache_type].expired += stat.expired || 0;
    acc[stat.cache_type].total += stat.total_operations || 0;
    return acc;
  }, {} as Record<string, { hits: number; misses: number; expired: number; total: number }>);

  // Calculate overall hit rate
  const overallStats = Object.values(aggregatedByType || {}).reduce(
    (acc, stats) => ({
      hits: acc.hits + stats.hits,
      misses: acc.misses + stats.misses,
      total: acc.total + stats.total,
    }),
    { hits: 0, misses: 0, total: 0 }
  );
  const overallHitRate = overallStats.total > 0 
    ? ((overallStats.hits / overallStats.total) * 100).toFixed(1) 
    : "0";

  // Prepare chart data
  const chartData = Object.entries(aggregatedByType || {}).map(([type, stats]) => ({
    name: type,
    Hits: stats.hits,
    Misses: stats.misses,
    Expirados: stats.expired,
    hitRate: stats.total > 0 ? ((stats.hits / stats.total) * 100).toFixed(1) : "0",
  }));

  // Pie chart data
  const pieData = [
    { name: 'Hits', value: overallStats.hits, color: '#22c55e' },
    { name: 'Misses', value: overallStats.misses, color: '#ef4444' },
  ];

  // Recent operations by type
  const opsByType = recentOps?.reduce((acc, op) => {
    acc[op.operation] = (acc[op.operation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas de Cache
            </CardTitle>
            <CardDescription>
              Monitoramento de eficiência e taxa de hit/miss
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStats()}
              disabled={loadingStats}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cleanupMutation.mutate()}
              disabled={cleanupMutation.isPending}
            >
              {cleanupMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Limpar Antigos
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="by-type">Por Tipo</TabsTrigger>
            <TabsTrigger value="recent">Recentes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Taxa de Hit Geral</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {overallHitRate}%
                    {Number(overallHitRate) >= 70 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Hits</CardDescription>
                  <CardTitle className="text-2xl text-green-600">
                    {overallStats.hits.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Misses</CardDescription>
                  <CardTitle className="text-2xl text-red-600">
                    {overallStats.misses.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Operações Totais</CardDescription>
                  <CardTitle className="text-2xl">
                    {overallStats.total.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hit/Miss por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Hits" fill="#22c55e" />
                      <Bar dataKey="Misses" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribuição Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="by-type">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(aggregatedByType || {}).map(([type, stats]) => {
                const hitRate = stats.total > 0 
                  ? ((stats.hits / stats.total) * 100).toFixed(1) 
                  : "0";
                return (
                  <Card key={type}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg capitalize flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Taxa de Hit</span>
                          <Badge variant={Number(hitRate) >= 70 ? "default" : "destructive"}>
                            {hitRate}%
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Hits: {stats.hits}</span>
                          <span className="text-red-600">Misses: {stats.misses}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total: {stats.total} operações
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {Object.keys(aggregatedByType || {}).length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  Nenhuma estatística disponível ainda
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {recentOps?.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {op.operation === 'hit' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : op.operation === 'miss' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-yellow-500" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{op.cache_type}</div>
                        {op.key_identifier && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {op.key_identifier}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={op.operation === 'hit' ? 'default' : 'secondary'}>
                        {op.operation}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(op.created_at).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
                {(!recentOps || recentOps.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma operação recente
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CacheStatisticsPanel;
