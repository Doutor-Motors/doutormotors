import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  UserPlus,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TimelineEvent {
  id: string;
  type: "signup" | "pix_created" | "pix_paid" | "pix_expired" | "subscription_active" | "subscription_cancelled" | "role_change";
  timestamp: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  status: "success" | "pending" | "error" | "info";
}

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

interface PixPayment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
  metadata: unknown;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  created_at: string;
  started_at: string;
  expires_at: string | null;
}

interface UserRole {
  id: string;
  role: string;
  created_at: string;
}

export default function UserAuditTimeline() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const fetchUserData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const timelineEvents: TimelineEvent[] = [];

      // 1. Signup event (profile creation)
      timelineEvents.push({
        id: `signup-${profileData.id}`,
        type: "signup",
        timestamp: profileData.created_at,
        title: "Conta Criada",
        description: `Usuário ${profileData.name} se cadastrou com email ${profileData.email}`,
        status: "success",
      });

      // 2. Fetch PIX payments by email
      const { data: pixPayments, error: pixError } = await supabase
        .from("pix_payments")
        .select("*")
        .eq("customer_email", profileData.email)
        .order("created_at", { ascending: true });

      if (!pixError && pixPayments) {
        pixPayments.forEach((pix: PixPayment) => {
          // PIX created
          timelineEvents.push({
            id: `pix-created-${pix.id}`,
            type: "pix_created",
            timestamp: pix.created_at,
            title: "PIX Gerado",
            description: `Valor: R$ ${(pix.amount / 100).toFixed(2)} - Plano: ${(pix.metadata as any)?.planType || "N/A"}`,
            metadata: typeof pix.metadata === "object" && pix.metadata !== null ? pix.metadata as Record<string, unknown> : undefined,
            status: "info",
          });

          // PIX paid or expired
          if (pix.status === "paid" && pix.paid_at) {
            timelineEvents.push({
              id: `pix-paid-${pix.id}`,
              type: "pix_paid",
              timestamp: pix.paid_at,
              title: "PIX Confirmado",
              description: `Pagamento de R$ ${(pix.amount / 100).toFixed(2)} confirmado`,
              status: "success",
            });
          } else if (pix.status === "expired" || (pix.expires_at && new Date(pix.expires_at) < new Date())) {
            timelineEvents.push({
              id: `pix-expired-${pix.id}`,
              type: "pix_expired",
              timestamp: pix.expires_at || pix.created_at,
              title: "PIX Expirado",
              description: `Pagamento de R$ ${(pix.amount / 100).toFixed(2)} expirou`,
              status: "error",
            });
          } else if (pix.status === "pending") {
            timelineEvents.push({
              id: `pix-pending-${pix.id}`,
              type: "pix_created",
              timestamp: pix.created_at,
              title: "PIX Pendente",
              description: `Aguardando pagamento de R$ ${(pix.amount / 100).toFixed(2)}`,
              status: "pending",
            });
          }
        });
      }

      // 3. Fetch subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!subError && subscriptions) {
        subscriptions.forEach((sub: Subscription) => {
          const planLabel = sub.plan_type === "pro" ? "Pro" : "Basic";
          
          if (sub.status === "active") {
            timelineEvents.push({
              id: `sub-active-${sub.id}`,
              type: "subscription_active",
              timestamp: sub.started_at || sub.created_at,
              title: `Assinatura ${planLabel} Ativada`,
              description: sub.expires_at 
                ? `Válida até ${format(new Date(sub.expires_at), "dd/MM/yyyy", { locale: ptBR })}`
                : "Sem data de expiração definida",
              status: "success",
            });
          } else if (sub.status === "cancelled" || sub.status === "canceled") {
            timelineEvents.push({
              id: `sub-cancelled-${sub.id}`,
              type: "subscription_cancelled",
              timestamp: sub.created_at,
              title: `Assinatura ${planLabel} Cancelada`,
              description: "Assinatura foi cancelada",
              status: "error",
            });
          }
        });
      }

      // 4. Fetch user roles
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!roleError && roles) {
        roles.forEach((role: UserRole) => {
          if (role.role === "admin") {
            timelineEvents.push({
              id: `role-${role.id}`,
              type: "role_change",
              timestamp: role.created_at,
              title: "Promovido a Admin",
              description: "Usuário recebeu permissões de administrador",
              status: "info",
            });
          }
        });
      }

      // Sort by timestamp
      timelineEvents.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setEvents(timelineEvents);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      toast.error("Erro ao carregar dados do usuário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "signup":
        return UserPlus;
      case "pix_created":
        return CreditCard;
      case "pix_paid":
        return CheckCircle;
      case "pix_expired":
        return XCircle;
      case "subscription_active":
        return Crown;
      case "subscription_cancelled":
        return XCircle;
      case "role_change":
        return Shield;
      default:
        return Clock;
    }
  };

  const getEventColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "pending":
        return "bg-amber-500";
      case "error":
        return "bg-red-500";
      case "info":
      default:
        return "bg-blue-500";
    }
  };

  const getBadgeVariant = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Usuário não encontrado</p>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Usuários
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {profile.email}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={fetchUserData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cadastro</p>
                <p className="font-medium text-foreground">
                  {format(new Date(profile.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagamentos PIX</p>
                <p className="font-medium text-foreground">
                  {events.filter((e) => e.type === "pix_paid").length} confirmados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
                <p className="font-medium text-foreground">
                  {events.filter((e) => e.type === "subscription_active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum evento encontrado
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {events.map((event, index) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(
                          event.status
                        )} text-white shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{event.title}</h4>
                          <Badge variant={getBadgeVariant(event.status)} className="w-fit">
                            {event.status === "success" && "Sucesso"}
                            {event.status === "pending" && "Pendente"}
                            {event.status === "error" && "Falhou"}
                            {event.status === "info" && "Info"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {format(new Date(event.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
