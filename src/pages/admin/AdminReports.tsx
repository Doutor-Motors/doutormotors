import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, TrendingUp, Users, Car, Activity } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdminReports = () => {
  const [period, setPeriod] = useState("30");
  const [diagnosticsByStatus, setDiagnosticsByStatus] = useState<any[]>([]);
  const [diagnosticsByPriority, setDiagnosticsByPriority] = useState<any[]>([]);
  const [registrationsTrend, setRegistrationsTrend] = useState<any[]>([]);
  const [topBrands, setTopBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Fetch diagnostics by status
      const { data: diagnostics } = await supabase
        .from("diagnostics")
        .select("status, created_at")
        .gte("created_at", startDate.toISOString());

      const statusCounts = {
        pending: 0,
        in_progress: 0,
        completed: 0,
      };

      diagnostics?.forEach((d) => {
        if (d.status in statusCounts) {
          statusCounts[d.status as keyof typeof statusCounts]++;
        }
      });

      setDiagnosticsByStatus([
        { name: "Pendente", value: statusCounts.pending },
        { name: "Em andamento", value: statusCounts.in_progress },
        { name: "Concluído", value: statusCounts.completed },
      ]);

      // Fetch diagnostic items by priority - USANDO PRIORIDADES CORRETAS DO SISTEMA
      const { data: items } = await supabase
        .from("diagnostic_items")
        .select("priority, created_at")
        .gte("created_at", startDate.toISOString());

      // Prioridades corretas: critical, attention, preventive (definidas no enum diagnostic_priority)
      const priorityCounts: Record<string, number> = {
        critical: 0,
        attention: 0,
        preventive: 0,
      };

      items?.forEach((i) => {
        if (i.priority in priorityCounts) {
          priorityCounts[i.priority]++;
        }
      });

      setDiagnosticsByPriority([
        { name: "Crítico", value: priorityCounts.critical },
        { name: "Atenção", value: priorityCounts.attention },
        { name: "Preventivo", value: priorityCounts.preventive },
      ]);

      // Fetch registrations trend
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at");

      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at");

      // Group by day
      const trendData: Record<string, { date: string; users: number; vehicles: number }> = {};
      
      profiles?.forEach((p) => {
        const date = new Date(p.created_at).toLocaleDateString("pt-BR");
        if (!trendData[date]) {
          trendData[date] = { date, users: 0, vehicles: 0 };
        }
        trendData[date].users++;
      });

      vehicles?.forEach((v) => {
        const date = new Date(v.created_at).toLocaleDateString("pt-BR");
        if (!trendData[date]) {
          trendData[date] = { date, users: 0, vehicles: 0 };
        }
        trendData[date].vehicles++;
      });

      setRegistrationsTrend(Object.values(trendData).slice(-10));

      // Fetch top vehicle brands
      const { data: allVehicles } = await supabase
        .from("vehicles")
        .select("brand");

      const brandCounts: Record<string, number> = {};
      allVehicles?.forEach((v) => {
        brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1;
      });

      const sortedBrands = Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      setTopBrands(sortedBrands);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const data = [
      ["Relatório de Diagnósticos - Doutor Motors"],
      [""],
      ["Status", "Quantidade"],
      ...diagnosticsByStatus.map((d) => [d.name, d.value]),
      [""],
      ["Prioridade", "Quantidade"],
      ...diagnosticsByPriority.map((d) => [d.name, d.value]),
      [""],
      ["Marca", "Quantidade"],
      ...topBrands.map((b) => [b.name, b.value]),
    ];

    const csv = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-doutor-motors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-chakra text-foreground">
              Relatórios e Estatísticas
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise de dados do sistema
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diagnostics by Status */}
          <Card className="border-dm-cadet/20">
            <CardHeader>
              <CardTitle className="font-chakra flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Diagnósticos por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={diagnosticsByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {diagnosticsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Diagnostics by Priority */}
          <Card className="border-dm-cadet/20">
            <CardHeader>
              <CardTitle className="font-chakra flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Itens por Prioridade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={diagnosticsByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Registrations Trend */}
          <Card className="border-dm-cadet/20">
            <CardHeader>
              <CardTitle className="font-chakra flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tendência de Cadastros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={registrationsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="Usuários" />
                  <Line type="monotone" dataKey="vehicles" stroke="#82ca9d" name="Veículos" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Brands */}
          <Card className="border-dm-cadet/20">
            <CardHeader>
              <CardTitle className="font-chakra flex items-center gap-2">
                <Car className="w-5 h-5" />
                Marcas Mais Cadastradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBrands} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
