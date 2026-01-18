import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import { useUserTier } from "@/hooks/useUserTier";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserBadge, ProBadge, AdminBadge } from "@/components/subscription/UserBadge";
import { Check, X, AlertTriangle, Loader2, Shield, Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PermissionsDiagnostic() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, userRole } = useAdmin();
  const { 
    subscription, 
    isLoading: subscriptionLoading, 
    currentPlan, 
    isPro,
    canUseFeature,
  } = useSubscription();
  const { 
    tier, 
    tierConfig, 
    isLoading: tierLoading,
    canAccess,
    isProFeature,
    isFeatureLocked,
  } = useUserTier();

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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Diagnóstico de Permissões</h1>
          <p className="text-muted-foreground">
            Visualize o estado atual das suas permissões e tier
          </p>
        </div>

        {/* Status Geral */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tier Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  tierConfig.badgeBgColor
                )}>
                  {tier === "admin" && <Shield className={cn("w-6 h-6", tierConfig.badgeColor)} />}
                  {tier === "pro" && <Crown className={cn("w-6 h-6", tierConfig.badgeColor)} />}
                  {tier === "basic" && <User className={cn("w-6 h-6", tierConfig.badgeColor)} />}
                </div>
                <div>
                  <p className="text-2xl font-bold uppercase">{tier}</p>
                  <p className="text-xs text-muted-foreground">{tierConfig.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Role no Banco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isAdmin ? "bg-violet-500/20" : "bg-muted"
                )}>
                  {isAdmin ? (
                    <Shield className="w-6 h-6 text-violet-400" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold uppercase">{userRole || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? "Acesso Admin" : "Usuário comum"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Plano de Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isPro ? "bg-emerald-500/20" : "bg-muted"
                )}>
                  {isPro ? (
                    <Crown className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold uppercase">{currentPlan}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {subscription?.status || "sem assinatura"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview das Badges</CardTitle>
            <CardDescription>Como as badges aparecem para você</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sua Badge:</p>
                <UserBadge size="lg" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">PRO (desbloqueado):</p>
                <ProBadge size="lg" locked={false} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">PRO (bloqueado):</p>
                <ProBadge size="lg" locked={true} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Admin:</p>
                <AdminBadge size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="font-mono text-xs break-all">{user?.id || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user?.email || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Subscription ID</dt>
                <dd className="font-mono text-xs">{subscription?.id || "Nenhuma"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stripe Customer</dt>
                <dd className="font-mono text-xs">{subscription?.stripe_customer_id || "Nenhum"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Teste de Features */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Acesso a Features</CardTitle>
            <CardDescription>
              Verifica se cada feature PRO está acessível para você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
                    <div className="flex items-center gap-3">
                      {hasAccess ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{feature}</span>
                      {isProOnly && <ProBadge size="sm" locked={locked} />}
                    </div>
                    <Badge variant={hasAccess ? "default" : "secondary"}>
                      {hasAccess ? "Desbloqueado" : "Bloqueado"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        {!subscription?.id && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sem Assinatura</AlertTitle>
            <AlertDescription>
              Você não possui uma linha na tabela <code>user_subscriptions</code>. 
              O sistema está usando o plano Basic por padrão.
              {isAdmin && " Como Admin, você ainda tem acesso a todas as features."}
            </AlertDescription>
          </Alert>
        )}

        {isAdmin && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Acesso Admin Detectado</AlertTitle>
            <AlertDescription>
              Como administrador, você tem acesso irrestrito a todas as funcionalidades,
              independente do plano de assinatura.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
