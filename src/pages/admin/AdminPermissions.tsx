import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserTier } from "@/hooks/useUserTier";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserBadge, ProBadge, AdminBadge } from "@/components/subscription/UserBadge";
import { Check, X, AlertTriangle, Loader2, Shield, Crown, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function AdminPermissions() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, userRole } = useAdmin();
  const { 
    subscription, 
    isLoading: subscriptionLoading, 
    currentPlan, 
    isPro,
  } = useSubscription();
  const { 
    tier, 
    tierConfig, 
    isLoading: tierLoading,
    canAccess,
    isProFeature,
    isFeatureLocked,
  } = useUserTier();

  // Buscar todos os usuários com roles e subscriptions
  const { data: allUsers, isLoading: usersLoading, refetch } = useQuery({
    queryKey: ["admin-permissions-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name, email")
        .order("created_at", { ascending: false })
        .limit(50);

      if (profilesError) throw profilesError;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("user_id, plan_type, status");

      return (profiles || []).map((profile) => {
        const role = roles?.find((r) => r.user_id === profile.user_id);
        const sub = subscriptions?.find((s) => s.user_id === profile.user_id);
        return {
          ...profile,
          role: role?.role || "user",
          plan_type: sub?.plan_type || null,
          subscription_status: sub?.status || null,
        };
      });
    },
    enabled: isAdmin,
  });

  const isLoading = authLoading || adminLoading || subscriptionLoading || tierLoading;

  // Features para testar
  const FEATURES_TO_TEST = [
    "dataRecording",
    "exportCSV",
    "codingFunctions",
    "obdOptimization",
    "advancedDiagnostics",
    "customAlerts",
    "prioritySupport",
  ] as const;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-chakra uppercase">Diagnóstico de Permissões</h1>
            <p className="text-muted-foreground">
              Visualize o estado atual das permissões e tiers dos usuários
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* Meu Status */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Meu Status (Admin Logado)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tier</p>
                <div className="flex items-center gap-2">
                  <UserBadge size="md" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Role no Banco</p>
                <p className="font-semibold uppercase">{userRole || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Plano</p>
                <p className="font-semibold uppercase">{currentPlan}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status Assinatura</p>
                <p className="font-semibold">{subscription?.status || "Sem assinatura"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Features */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Acesso a Features PRO</CardTitle>
            <CardDescription>
              Verifica se cada feature PRO está acessível para o admin logado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES_TO_TEST.map((feature) => {
                const hasAccess = canAccess(feature);
                const isProOnly = isProFeature(feature);
                const locked = isFeatureLocked(feature);

                return (
                  <div 
                    key={feature}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      hasAccess ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {hasAccess ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                    {isProOnly && <ProBadge size="sm" locked={locked} />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Badges Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview das Badges</CardTitle>
            <CardDescription>Como as badges aparecem no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Basic</p>
                <UserBadge size="lg" overrideTier="basic" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">PRO</p>
                <UserBadge size="lg" overrideTier="pro" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Admin</p>
                <UserBadge size="lg" overrideTier="admin" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">PRO Badge (desbloqueado)</p>
                <ProBadge size="lg" locked={false} />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">PRO Badge (bloqueado)</p>
                <ProBadge size="lg" locked={true} />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Admin Badge</p>
                <AdminBadge size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Usuários</CardTitle>
            <CardDescription>
              Roles e assinaturas de todos os usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Usuário</th>
                      <th className="text-center p-3 font-medium">Role</th>
                      <th className="text-center p-3 font-medium">Plano</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-center p-3 font-medium">Tier Calculado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allUsers?.map((u) => {
                      const calculatedTier = u.role === "admin" ? "admin" : u.plan_type === "pro" ? "pro" : "basic";
                      return (
                        <tr key={u.user_id} className="hover:bg-muted/30">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {u.plan_type ? (
                              <Badge variant={u.plan_type === "pro" ? "default" : "outline"}>
                                {u.plan_type}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {u.subscription_status ? (
                              <Badge 
                                variant={u.subscription_status === "active" ? "default" : "destructive"}
                                className={u.subscription_status === "active" ? "bg-emerald-500" : ""}
                              >
                                {u.subscription_status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <UserBadge size="sm" overrideTier={calculatedTier} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        {isAdmin && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Acesso Admin Ativo</AlertTitle>
            <AlertDescription>
              Como administrador, você tem acesso irrestrito a todas as funcionalidades,
              independente do plano de assinatura. As badges PRO devem aparecer verdes (desbloqueadas).
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AdminLayout>
  );
}
