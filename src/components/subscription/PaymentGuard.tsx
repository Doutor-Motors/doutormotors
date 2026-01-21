import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

interface PaymentGuardProps {
  children: React.ReactNode;
  /** Comportamento quando usuário já tem assinatura ativa */
  redirectIfActive?: string;
  /** Comportamento quando usuário não está autenticado */
  redirectIfNotAuth?: string;
}

/**
 * PaymentGuard: protege as páginas de seleção/checkout de plano
 * - Se já tem assinatura ativa real → redireciona para dashboard
 * - Se não está autenticado → redireciona para signup
 * - Se está autenticado mas sem assinatura → permite acesso (fluxo de pagamento)
 */
export function PaymentGuard({
  children,
  redirectIfActive = "/dashboard",
  redirectIfNotAuth = "/signup",
}: PaymentGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subLoading, isAdmin } = useSubscription();

  const isLoading = authLoading || subLoading;

  useEffect(() => {
    if (isLoading) return;

    // Não autenticado → signup
    if (!user) {
      navigate(redirectIfNotAuth, { replace: true });
      return;
    }

    // Admin sempre tem acesso ao dashboard
    if (isAdmin) {
      navigate(redirectIfActive, { replace: true });
      return;
    }

    // Tem assinatura ativa real (com id) → dashboard
    const hasActiveSubscription = Boolean(
      subscription &&
        subscription.id &&
        subscription.status === "active" &&
        (subscription.plan_type === "basic" || subscription.plan_type === "pro")
    );

    if (hasActiveSubscription) {
      navigate(redirectIfActive, { replace: true });
      return;
    }

    // Sem assinatura ativa → permite continuar no fluxo de pagamento
  }, [isLoading, user, subscription, isAdmin, navigate, redirectIfActive, redirectIfNotAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-white/70 font-mulish">Verificando status...</p>
        </div>
      </div>
    );
  }

  // Não mostra conteúdo se vai redirecionar
  if (!user) return null;
  
  const hasActiveSubscription = Boolean(
    subscription &&
      subscription.id &&
      subscription.status === "active" &&
      (subscription.plan_type === "basic" || subscription.plan_type === "pro")
  );
  
  if (isAdmin || hasActiveSubscription) return null;

  return <>{children}</>;
}

export default PaymentGuard;
