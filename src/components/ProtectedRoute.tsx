import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subLoading, isAdmin } = useSubscription();
  const location = useLocation();

  const loading = authLoading || subLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-mulish">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não logado → login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin sempre tem acesso
  if (isAdmin) {
    return <>{children}</>;
  }

  // Verifica se tem assinatura ativa (Basic ou Pro)
  // Não exige subscription.id porque o fallback pode ter id vazio mas plano válido
  const hasValidSubscription = subscription && 
    subscription.status === "active" && 
    (subscription.plan_type === "basic" || subscription.plan_type === "pro");

  // Se não tem assinatura válida, redireciona para página de seleção de plano
  if (!hasValidSubscription) {
    return <Navigate to="/select-plan" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
