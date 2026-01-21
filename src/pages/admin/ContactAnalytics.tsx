import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";
import { 
  Mail, Shield, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, Filter, RefreshCw, Download, Globe, Ban, Unlock, Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const EVENT_COLORS: Record<string, string> = {
  submission: "#22c55e",
  honeypot_blocked: "#ef4444",
  captcha_failed: "#f97316",
  rate_limited: "#eab308",
  validation_error: "#3b82f6",
  ip_blocked: "#7c3aed",
};

const EVENT_LABELS: Record<string, string> = {
  submission: "Enviados",
  honeypot_blocked: "Honeypot",
  captcha_failed: "CAPTCHA Falhou",
  rate_limited: "Rate Limited",
  validation_error: "Validação",
  ip_blocked: "IP Bloqueado",
};

const ContactAnalytics = () => {
  const [dateRange, setDateRange] = useState("7");
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [newBlockIP, setNewBlockIP] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [newBlockExpires, setNewBlockExpires] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const startDate = startOfDay(subDays(new Date(), parseInt(dateRange)));
  const endDate = endOfDay(new Date());

  // Fetch analytics summary
  const { data: summaryData, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ["contact-analytics-summary", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_form_analytics")
        .select("event_type, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      // Group by event type
      const byType: Record<string, number> = {};
      const byDay: Record<string, Record<string, number>> = {};

      for (const row of data || []) {
        const type = row.event_type;
        const day = format(new Date(row.created_at), "yyyy-MM-dd");

        byType[type] = (byType[type] || 0) + 1;

        if (!byDay[day]) byDay[day] = {};
        byDay[day][type] = (byDay[day][type] || 0) + 1;
      }

      return { byType, byDay, total: data?.length || 0 };
    },
  });

  // Fetch recent events
  const { data: recentEvents, isLoading: loadingRecent } = useQuery({
    queryKey: ["contact-analytics-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_form_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Fetch top IPs
  const { data: topIPs } = useQuery({
    queryKey: ["contact-analytics-ips", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_form_analytics")
        .select("ip_address, event_type")
        .gte("created_at", startDate.toISOString())
        .not("event_type", "eq", "submission");

      if (error) throw error;

      const ipCounts: Record<string, { total: number; types: Record<string, number> }> = {};
      for (const row of data || []) {
        if (!row.ip_address) continue;
        if (!ipCounts[row.ip_address]) {
          ipCounts[row.ip_address] = { total: 0, types: {} };
        }
        ipCounts[row.ip_address].total++;
        ipCounts[row.ip_address].types[row.event_type] = 
          (ipCounts[row.ip_address].types[row.event_type] || 0) + 1;
      }

      return Object.entries(ipCounts)
        .map(([ip, data]) => ({ ip, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    },
  });

  // Fetch blocked IPs
  const { data: blockedIPs, refetch: refetchBlockedIPs } = useQuery({
    queryKey: ["blocked-ips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .eq("is_active", true)
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Block IP mutation
  const blockIPMutation = useMutation({
    mutationFn: async ({ ip, reason, expiresAt }: { ip: string; reason: string; expiresAt?: string }) => {
      const { error } = await supabase.from("blocked_ips").insert({
        ip_address: ip,
        reason: reason || null,
        blocked_by: user?.id,
        expires_at: expiresAt || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("IP bloqueado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      setBlockDialogOpen(false);
      setNewBlockIP("");
      setNewBlockReason("");
      setNewBlockExpires("");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("Este IP já está bloqueado");
      } else {
        toast.error("Erro ao bloquear IP");
      }
    },
  });

  // Unblock IP mutation
  const unblockIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blocked_ips")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("IP desbloqueado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
    },
    onError: () => {
      toast.error("Erro ao desbloquear IP");
    },
  });

  // Quick block from suspicious list
  const quickBlockIP = (ip: string) => {
    setNewBlockIP(ip);
    setNewBlockReason("Atividade suspeita detectada automaticamente");
    setBlockDialogOpen(true);
  };

  // Handle block form submit
  const handleBlockSubmit = () => {
    if (!newBlockIP) {
      toast.error("IP é obrigatório");
      return;
    }
    blockIPMutation.mutate({
      ip: newBlockIP,
      reason: newBlockReason,
      expiresAt: newBlockExpires || undefined,
    });
  };

  // Prepare chart data
  const pieData = summaryData?.byType
    ? Object.entries(summaryData.byType).map(([name, value]) => ({
        name: EVENT_LABELS[name] || name,
        value,
        color: EVENT_COLORS[name] || "#6b7280",
      }))
    : [];

  const lineData = summaryData?.byDay
    ? Object.entries(summaryData.byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, types]) => ({
          date: format(new Date(date), "dd/MM", { locale: ptBR }),
          ...Object.fromEntries(
            Object.entries(types).map(([type, count]) => [EVENT_LABELS[type] || type, count])
          ),
        }))
    : [];

  const submissions = summaryData?.byType?.submission || 0;
  const blocked = (summaryData?.total || 0) - submissions;
  const blockRate = summaryData?.total ? ((blocked / summaryData.total) * 100).toFixed(1) : "0";

  const handleRefresh = () => {
    refetchSummary();
    refetchBlockedIPs();
  };

  const handleExport = () => {
    if (!recentEvents) return;
    
    const csv = [
      ["Data", "Tipo", "IP", "Email", "Assunto", "Motivo Bloqueio"].join(","),
      ...recentEvents.map(e => [
        format(new Date(e.created_at), "dd/MM/yyyy HH:mm"),
        e.event_type,
        e.ip_address || "",
        e.email || "",
        e.subject || "",
        e.blocked_reason || "",
      ].map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics de Contato</h1>
            <p className="text-muted-foreground">
              Monitore spam, tentativas bloqueadas e métricas do formulário
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Últimas 24h</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{summaryData?.total || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enviados com Sucesso</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-green-600">{submissions}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
              <Shield className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-red-600">{blocked}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Bloqueio</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{blockRate}%</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Event Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
              <CardDescription>Proporção de eventos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-[300px] w-full" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Chart - Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Temporal</CardTitle>
              <CardDescription>Eventos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-[300px] w-full" />
              ) : lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.values(EVENT_LABELS).map((label, i) => (
                      <Line
                        key={label}
                        type="monotone"
                        dataKey={label}
                        stroke={Object.values(EVENT_COLORS)[i]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suspicious IPs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                IPs Suspeitos
              </CardTitle>
              <CardDescription>IPs com mais tentativas bloqueadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP</TableHead>
                    <TableHead>Tentativas</TableHead>
                    <TableHead>Tipos</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topIPs?.map((ip) => {
                    const isBlocked = blockedIPs?.some(b => b.ip_address === ip.ip);
                    return (
                      <TableRow key={ip.ip}>
                        <TableCell className="font-mono text-sm">{ip.ip}</TableCell>
                        <TableCell>
                          <Badge variant={ip.total >= 10 ? "destructive" : "secondary"}>
                            {ip.total}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(ip.types).map(([type, count]) => (
                              <Badge 
                                key={type} 
                                variant="outline"
                                style={{ borderColor: EVENT_COLORS[type] }}
                              >
                                {EVENT_LABELS[type]}: {count}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isBlocked ? (
                            <Badge variant="destructive" className="text-xs">
                              <Ban className="w-3 h-3 mr-1" />
                              Bloqueado
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={() => quickBlockIP(ip.ip)}
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Bloquear
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!topIPs || topIPs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum IP suspeito detectado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Eventos Recentes
              </CardTitle>
              <CardDescription>Últimas 50 atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingRecent ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        </TableRow>
                      ))
                    ) : recentEvents?.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-sm">
                          {format(new Date(event.created_at), "dd/MM HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            style={{ 
                              backgroundColor: EVENT_COLORS[event.event_type] + "20",
                              color: EVENT_COLORS[event.event_type],
                              border: `1px solid ${EVENT_COLORS[event.event_type]}`,
                            }}
                          >
                            {EVENT_LABELS[event.event_type] || event.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {event.blocked_reason || event.email || event.ip_address || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blocked IPs Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-destructive" />
                IPs Bloqueados Manualmente
              </CardTitle>
              <CardDescription>Gerenciar IPs bloqueados permanentemente ou temporariamente</CardDescription>
            </div>
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Bloquear IP
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bloquear IP</DialogTitle>
                  <DialogDescription>
                    Adicione um IP à lista de bloqueios. Submissões desse IP serão rejeitadas silenciosamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip">Endereço IP *</Label>
                    <Input
                      id="ip"
                      placeholder="192.168.1.1"
                      value={newBlockIP}
                      onChange={(e) => setNewBlockIP(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo</Label>
                    <Input
                      id="reason"
                      placeholder="Spam repetitivo"
                      value={newBlockReason}
                      onChange={(e) => setNewBlockReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires">Expira em (opcional)</Label>
                    <Input
                      id="expires"
                      type="datetime-local"
                      value={newBlockExpires}
                      onChange={(e) => setNewBlockExpires(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Deixe vazio para bloqueio permanente</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleBlockSubmit}
                    disabled={blockIPMutation.isPending}
                  >
                    {blockIPMutation.isPending ? "Bloqueando..." : "Bloquear IP"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Bloqueado em</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedIPs?.map((blocked) => (
                  <TableRow key={blocked.id}>
                    <TableCell className="font-mono text-sm">{blocked.ip_address}</TableCell>
                    <TableCell className="text-sm">{blocked.reason || "-"}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(blocked.blocked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {blocked.expires_at 
                        ? format(new Date(blocked.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : <Badge variant="secondary">Permanente</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-green-600 hover:text-green-700"
                        onClick={() => unblockIPMutation.mutate(blocked.id)}
                        disabled={unblockIPMutation.isPending}
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        Desbloquear
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!blockedIPs || blockedIPs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum IP bloqueado manualmente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ContactAnalytics;
