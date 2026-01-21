import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2,
  CreditCard,
  TrendingUp,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AbacatePayStats {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  lastPaymentAt: string | null;
  isConfigured: boolean;
}

export const AbacatePayStatusBadge = () => {
  const [stats, setStats] = useState<AbacatePayStats>({
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    lastPaymentAt: null,
    isConfigured: false,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      // Fetch pix_payments stats
      const { data: payments, error } = await supabase
        .from("pix_payments")
        .select("status, amount, paid_at, created_at");

      if (error) throw error;

      const totalPayments = payments?.length || 0;
      const paidPayments = payments?.filter(p => p.status === "paid").length || 0;
      const pendingPayments = payments?.filter(p => p.status === "pending").length || 0;
      const totalRevenue = payments
        ?.filter(p => p.status === "paid")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const lastPaid = payments
        ?.filter(p => p.status === "paid" && p.paid_at)
        .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())[0];

      setStats({
        totalPayments,
        paidPayments,
        pendingPayments,
        totalRevenue,
        lastPaymentAt: lastPaid?.paid_at || null,
        isConfigured: true, // Se conseguiu consultar a tabela, está configurado
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching AbacatePay stats:", error);
      setStats(prev => ({ ...prev, isConfigured: false }));
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useRealtimeSubscription({
    tables: [{ table: "pix_payments", event: "*" }],
    onDataChange: () => {
      fetchStats();
    },
    enabled: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusInfo = () => {
    if (loading) {
      return {
        status: "loading" as const,
        color: "bg-muted",
        textColor: "text-muted-foreground",
        icon: Loader2,
        label: "Carregando...",
        description: "Verificando status da integração",
      };
    }

    if (!stats.isConfigured) {
      return {
        status: "error" as const,
        color: "bg-red-500/10",
        textColor: "text-red-500",
        icon: AlertCircle,
        label: "Erro",
        description: "Não foi possível conectar ao banco de dados",
      };
    }

    if (stats.paidPayments > 0) {
      return {
        status: "active" as const,
        color: "bg-green-500/10",
        textColor: "text-green-500",
        borderColor: "border-green-500/30",
        icon: CheckCircle2,
        label: "Ativo",
        description: `${stats.paidPayments} pagamento(s) confirmado(s)`,
      };
    }

    if (stats.pendingPayments > 0) {
      return {
        status: "pending" as const,
        color: "bg-yellow-500/10",
        textColor: "text-yellow-500",
        borderColor: "border-yellow-500/30",
        icon: Clock,
        label: "Pendente",
        description: `${stats.pendingPayments} pagamento(s) aguardando`,
      };
    }

    return {
      status: "configured" as const,
      color: "bg-blue-500/10",
      textColor: "text-blue-500",
      borderColor: "border-blue-500/30",
      icon: Zap,
      label: "Configurado",
      description: "Aguardando primeiro pagamento",
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <TooltipProvider>
      <Card className={`border ${statusInfo.status === "active" ? "border-green-500/30" : statusInfo.status === "pending" ? "border-yellow-500/30" : "border-border"} ${statusInfo.color}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Status Icon and Info */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${statusInfo.color}`}>
                <StatusIcon className={`w-5 h-5 ${statusInfo.textColor} ${loading ? "animate-spin" : ""}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">AbacatePay PIX</span>
                  <Badge 
                    variant={statusInfo.status === "active" ? "default" : "secondary"}
                    className={statusInfo.status === "active" ? "bg-green-500" : statusInfo.status === "pending" ? "bg-yellow-500 text-black" : ""}
                  >
                    {statusInfo.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Tempo Real
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
              </div>
            </div>

            {/* Right: Stats */}
            {!loading && stats.isConfigured && (
              <div className="flex items-center gap-6">
                {/* Revenue */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">{formatCurrency(stats.totalRevenue)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Receita Total</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total arrecadado via PIX</p>
                  </TooltipContent>
                </Tooltip>

                {/* Payments Count */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="font-bold">{stats.paidPayments}</span>
                        <span className="text-muted-foreground">/ {stats.totalPayments}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pagamentos</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stats.paidPayments} confirmados de {stats.totalPayments} total</p>
                    {stats.pendingPayments > 0 && <p>{stats.pendingPayments} pendente(s)</p>}
                  </TooltipContent>
                </Tooltip>

                {/* Last Payment */}
                {stats.lastPaymentAt && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center cursor-help">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(stats.lastPaymentAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Último Pagamento</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{format(new Date(stats.lastPaymentAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Refresh Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchStats}
                      className="h-8 w-8"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Atualizar dados</p>
                    <p className="text-xs text-muted-foreground">
                      Última: {format(lastUpdated, "HH:mm:ss")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default AbacatePayStatusBadge;
