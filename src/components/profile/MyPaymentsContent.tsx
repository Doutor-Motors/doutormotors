import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Receipt,
    Calendar,
    Loader2,
    AlertCircle,
    Crown,
    User,
    Download,
    Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generatePaymentReceipt } from "@/services/pdf/paymentReceiptGenerator";
import { toast } from "sonner";

interface PixPayment {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    paid_at: string | null;
    expires_at: string | null;
    customer_name?: string;
    customer_email?: string;
    metadata: {
        planType?: string;
        [key: string]: unknown;
    } | null;
}

type PeriodFilter = "all" | "30" | "60" | "90";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "30", label: "30 dias" },
    { value: "60", label: "60 dias" },
    { value: "90", label: "90 dias" },
];

const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(cents / 100);
};

const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
        case "paid":
            return {
                label: "Pago",
                icon: CheckCircle,
                color: "text-green-500",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-500/30",
            };
        case "pending":
            return {
                label: "Pendente",
                icon: Clock,
                color: "text-yellow-500",
                bgColor: "bg-yellow-500/10",
                borderColor: "border-yellow-500/30",
            };
        case "expired":
            return {
                label: "Expirado",
                icon: XCircle,
                color: "text-red-500",
                bgColor: "bg-red-500/10",
                borderColor: "border-red-500/30",
            };
        default:
            return {
                label: status,
                icon: AlertCircle,
                color: "text-muted-foreground",
                bgColor: "bg-muted/10",
                borderColor: "border-muted/30",
            };
    }
};

const getPlanBadge = (planType: string | undefined) => {
    if (planType === "pro") {
        return {
            label: "Pro",
            icon: Crown,
            color: "text-amber-400",
            bgColor: "bg-amber-500/20",
            borderColor: "border-amber-500/30",
        };
    }
    return {
        label: "Basic",
        icon: User,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
    };
};

export default function MyPaymentsContent() {
    const { user } = useAuth();
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

    const { data: payments, isLoading, error } = useQuery({
        queryKey: ["my-payments", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            // First get pix_payments by email (since there's no user_id column)
            const { data: profile } = await supabase
                .from("profiles")
                .select("email")
                .eq("user_id", user.id)
                .single();

            if (!profile?.email) return [];

            const { data, error } = await supabase
                .from("pix_payments")
                .select("*")
                .eq("customer_email", profile.email)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []) as PixPayment[];
        },
        enabled: !!user?.id,
    });

    // Filter payments by period
    const filteredPayments = useMemo(() => {
        if (!payments) return [];
        if (periodFilter === "all") return payments;

        const daysAgo = parseInt(periodFilter);
        const cutoffDate = subDays(new Date(), daysAgo);

        return payments.filter((p) => isAfter(new Date(p.created_at), cutoffDate));
    }, [payments, periodFilter]);

    const paidPayments = filteredPayments.filter((p) => p.status === "paid");
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    const handleDownloadReceipt = (payment: PixPayment) => {
        try {
            generatePaymentReceipt({
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                created_at: payment.created_at,
                paid_at: payment.paid_at,
                planType: payment.metadata?.planType,
                customerName: payment.customer_name,
                customerEmail: payment.customer_email,
            });
            toast.success("Recibo gerado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar recibo:", error);
            toast.error("Erro ao gerar recibo. Tente novamente.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-chakra text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wide">
                        Meus Pagamentos
                    </h1>
                    <p className="text-muted-foreground font-mulish mt-1">
                        Histórico de pagamentos PIX da sua assinatura
                    </p>
                </div>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <span>Período:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {PERIOD_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={periodFilter === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPeriodFilter(option.value)}
                            className={`font-chakra uppercase text-xs ${periodFilter === option.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-transparent border-border hover:bg-muted"
                                }`}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Summary Card */}
            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Receipt className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
                                <p className="text-xl font-bold text-foreground">{filteredPayments.length}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pagamentos Confirmados</p>
                                <p className="text-xl font-bold text-foreground">{paidPayments.length}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <CreditCard className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Investido</p>
                                <p className="text-xl font-bold text-foreground">{formatCurrency(totalPaid)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments List */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="font-chakra text-lg uppercase tracking-wide flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Histórico de Transações
                    </CardTitle>
                    <CardDescription>
                        {periodFilter === "all"
                            ? "Todas as transações PIX realizadas na sua conta"
                            : `Transações dos últimos ${periodFilter} dias`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                            <p className="text-foreground font-semibold">Erro ao carregar pagamentos</p>
                            <p className="text-muted-foreground text-sm">Tente novamente mais tarde</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-foreground font-semibold">Nenhum pagamento encontrado</p>
                            <p className="text-muted-foreground text-sm">
                                {periodFilter === "all"
                                    ? "Seus pagamentos PIX aparecerão aqui"
                                    : `Nenhum pagamento nos últimos ${periodFilter} dias`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPayments.map((payment, index) => {
                                const statusConfig = getStatusConfig(payment.status);
                                const StatusIcon = statusConfig.icon;
                                const planConfig = getPlanBadge(payment.metadata?.planType);
                                const PlanIcon = planConfig.icon;
                                const isPaid = payment.status === "paid";

                                return (
                                    <div key={payment.id}>
                                        {index > 0 && <Separator className="mb-4" />}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                                                    <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-foreground">
                                                            Assinatura
                                                        </span>
                                                        <Badge className={`${planConfig.bgColor} ${planConfig.color} border ${planConfig.borderColor} gap-1`}>
                                                            <PlanIcon className="w-3 h-3" />
                                                            {planConfig.label}
                                                        </Badge>
                                                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                        </span>
                                                    </div>
                                                    {payment.paid_at && (
                                                        <p className="text-xs text-green-500">
                                                            Confirmado em {format(new Date(payment.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 sm:self-center">
                                                <span className="text-xl font-bold text-foreground">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                                {isPaid && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadReceipt(payment)}
                                                                    className="gap-2 border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    <span className="hidden sm:inline">Recibo</span>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Baixar recibo em PDF</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
