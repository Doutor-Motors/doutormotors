import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAdminNotification } from "@/contexts/AdminNotificationContext";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Receipt,
  Download,
  FileText,
  Undo2,
  Loader2,
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PixPayment {
  id: string;
  amount: number;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_tax_id: string;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
  pix_id: string | null;
  description: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
  paid: { label: "Pago", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  expired: { label: "Expirado", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
  refunded: { label: "Reembolsado", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <RefreshCw className="w-3 h-3" /> },
};

const AdminPayments = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<string>("30");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PixPayment | null>(null);
  
  const queryClient = useQueryClient();
  const { addNotification } = useAdminNotification();

  // Fetch PIX payments
  const { data: pixPayments, isLoading: pixLoading, refetch: refetchPix } = useQuery({
    queryKey: ["admin-pix-payments", dateRange],
    queryFn: async () => {
      const fromDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("pix_payments")
        .select("*")
        .gte("created_at", fromDate.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PixPayment[];
    },
  });

  // Real-time subscription for new paid payments
  useEffect(() => {
    const channel = supabase
      .channel('admin-pix-payments-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pix_payments',
          filter: 'status=eq.paid',
        },
        (payload) => {
          const payment = payload.new as PixPayment;
          const oldPayment = payload.old as PixPayment;
          
          // Only notify if status changed to paid
          if (oldPayment.status !== 'paid' && payment.status === 'paid') {
            addNotification({
              type: 'system_alert',
              title: '💰 Pagamento Confirmado!',
              subtitle: 'PIX',
              message: `${payment.customer_name} pagou`,
              highlight: `R$ ${(payment.amount / 100).toFixed(2)}`,
              secondaryMessage: payment.customer_email,
              duration: 10000,
            });
            
            // Refetch to update the list
            refetchPix();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification, refetchPix]);

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("pix_payments")
        .update({ 
          status: "refunded",
          updated_at: new Date().toISOString()
        })
        .eq("id", paymentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pagamento marcado como reembolsado");
      queryClient.invalidateQueries({ queryKey: ["admin-pix-payments"] });
      setRefundDialogOpen(false);
      setSelectedPayment(null);
    },
    onError: (error) => {
      toast.error("Erro ao processar reembolso: " + error.message);
    },
  });

  // Calculate metrics
  const metrics = {
    totalRevenue: (pixPayments?.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0) || 0) / 100,
    totalPayments: pixPayments?.length || 0,
    paidPayments: pixPayments?.filter(p => p.status === "paid").length || 0,
    pendingPayments: pixPayments?.filter(p => p.status === "pending").length || 0,
    expiredPayments: pixPayments?.filter(p => p.status === "expired").length || 0,
    refundedPayments: pixPayments?.filter(p => p.status === "refunded").length || 0,
    conversionRate: pixPayments?.length 
      ? ((pixPayments.filter(p => p.status === "paid").length / pixPayments.length) * 100).toFixed(1)
      : "0",
    avgTicket: pixPayments?.filter(p => p.status === "paid").length
      ? (pixPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0) / pixPayments.filter(p => p.status === "paid").length / 100).toFixed(2)
      : "0",
  };

  // Chart data - Status distribution
  const statusData = [
    { name: "Pagos", value: metrics.paidPayments, color: "#22c55e" },
    { name: "Pendentes", value: metrics.pendingPayments, color: "#eab308" },
    { name: "Expirados", value: metrics.expiredPayments, color: "#ef4444" },
    { name: "Reembolsados", value: metrics.refundedPayments, color: "#a855f7" },
  ].filter(d => d.value > 0);

  // Chart data - Daily revenue (last 7 days)
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayPayments = pixPayments?.filter(p => 
      p.status === "paid" && 
      p.paid_at && 
      format(parseISO(p.paid_at), "yyyy-MM-dd") === dateStr
    ) || [];
    
    return {
      date: format(date, "dd/MM"),
      revenue: dayPayments.reduce((sum, p) => sum + p.amount, 0) / 100,
      count: dayPayments.length,
    };
  });

  // Filter payments
  const filteredPayments = pixPayments?.filter(payment => {
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesSearch = searchTerm === "" || 
      payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_tax_id.includes(searchTerm);
    return matchesStatus && matchesSearch;
  }) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Cliente", "Email", "CPF/CNPJ", "Valor", "Status", "Criado em", "Pago em"];
    const rows = filteredPayments.map(p => [
      p.customer_name,
      p.customer_email,
      p.customer_tax_id,
      (p.amount / 100).toFixed(2),
      statusConfig[p.status]?.label || p.status,
      format(parseISO(p.created_at), "dd/MM/yyyy HH:mm"),
      p.paid_at ? format(parseISO(p.paid_at), "dd/MM/yyyy HH:mm") : "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pagamentos-pix-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    
    toast.success("Relatório CSV exportado com sucesso!");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Relatório de Pagamentos PIX", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);
    doc.text(`Período: Últimos ${dateRange} dias`, 14, 36);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("Resumo", 14, 48);
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Receita Total: ${formatCurrency(metrics.totalRevenue)}`, 14, 56);
    doc.text(`Total de Pagamentos: ${metrics.totalPayments}`, 14, 62);
    doc.text(`Pagos: ${metrics.paidPayments}`, 14, 68);
    doc.text(`Pendentes: ${metrics.pendingPayments}`, 80, 68);
    doc.text(`Expirados: ${metrics.expiredPayments}`, 130, 68);
    doc.text(`Taxa de Conversão: ${metrics.conversionRate}%`, 14, 74);
    doc.text(`Ticket Médio: ${formatCurrency(parseFloat(metrics.avgTicket))}`, 80, 74);

    // Table
    autoTable(doc, {
      startY: 85,
      head: [["Cliente", "CPF/CNPJ", "Valor", "Status", "Data Criação", "Data Pagamento"]],
      body: filteredPayments.map(p => [
        p.customer_name,
        p.customer_tax_id.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
        formatCurrency(p.amount / 100),
        statusConfig[p.status]?.label || p.status,
        format(parseISO(p.created_at), "dd/MM/yyyy HH:mm"),
        p.paid_at ? format(parseISO(p.paid_at), "dd/MM/yyyy HH:mm") : "-"
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`pagamentos-pix-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Relatório PDF exportado com sucesso!");
  };

  const handleRefundClick = (payment: PixPayment) => {
    setSelectedPayment(payment);
    setRefundDialogOpen(true);
  };

  const confirmRefund = () => {
    if (selectedPayment) {
      refundMutation.mutate(selectedPayment.id);
    }
  };

  const isLoading = pixLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-chakra uppercase tracking-wide">
              Pagamentos PIX
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie e acompanhe todos os pagamentos via PIX
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetchPix()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportToPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-500" />
                Total Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-blue-500">
                  {metrics.totalPayments}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-500" />
                Taxa Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald-500">
                    {metrics.conversionRate}%
                  </span>
                  {parseFloat(metrics.conversionRate) > 50 ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-purple-500">
                  {formatCurrency(parseFloat(metrics.avgTicket))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Daily Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-chakra">Receita Diária (7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <ChartContainer
                  config={{
                    revenue: { label: "Receita", color: "hsl(var(--primary))" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `R$${value}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-chakra">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : statusData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ChartContainer
                    config={{
                      value: { label: "Quantidade" },
                    }}
                    className="h-[200px] w-1/2"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="flex flex-col gap-2">
                    {statusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: <span className="font-medium text-foreground">{item.value}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-lg font-chakra">Histórico de Pagamentos</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou CPF..."
                    className="pl-9 w-full md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="expired">Expirados</SelectItem>
                    <SelectItem value="refunded">Reembolsados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nenhum pagamento encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Pago em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const status = statusConfig[payment.status] || statusConfig.pending;
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.customer_name}</div>
                              <div className="text-xs text-muted-foreground">{payment.customer_email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.customer_tax_id.replace(
                              /(\d{3})(\d{3})(\d{3})(\d{2})/,
                              "$1.$2.$3-$4"
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount / 100)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(parseISO(payment.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {payment.paid_at ? (
                              <span className="text-green-500">
                                {format(parseISO(payment.paid_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {payment.status === "paid" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefundClick(payment)}
                                className="text-purple-500 hover:text-purple-600 hover:bg-purple-500/10"
                              >
                                <Undo2 className="w-4 h-4 mr-1" />
                                Reembolsar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagos</p>
                <p className="text-xl font-bold">{metrics.paidPayments}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold">{metrics.pendingPayments}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-xl font-bold">{metrics.expiredPayments}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <RefreshCw className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reembolsados</p>
                <p className="text-xl font-bold">{metrics.refundedPayments}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Hoje</p>
                <p className="text-xl font-bold">
                  {formatCurrency(dailyData[dailyData.length - 1]?.revenue || 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Reembolso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar este pagamento como reembolsado?
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Cliente:</strong> {selectedPayment?.customer_name}</p>
                <p><strong>Email:</strong> {selectedPayment?.customer_email}</p>
                <p><strong>Valor:</strong> {selectedPayment && formatCurrency(selectedPayment.amount / 100)}</p>
              </div>
              <p className="mt-4 text-sm text-yellow-600">
                ⚠️ Esta ação apenas marca o pagamento como reembolsado no sistema. 
                O reembolso real deve ser processado manualmente via seu banco ou gateway de pagamento.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRefund}
              disabled={refundMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {refundMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Undo2 className="w-4 h-4 mr-2" />
                  Confirmar Reembolso
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPayments;
