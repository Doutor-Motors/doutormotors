import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, 
  Zap, 
  Check, 
  X, 
  Sparkles,
  Shield,
  Star,
  ArrowRight,
  Loader2,
  BadgeCheck,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import logo from "@/assets/images/logo-new-car.png";
import heroBg from "@/assets/images/hero-bg.jpg";

interface SignupState {
  fromSignup?: boolean;
  email?: string;
  name?: string;
}

interface CheckoutState extends SignupState {
  selectedPlan: "basic" | "pro";
}

const BASIC_FEATURES = [
  "1 veículo cadastrado",
  "5 diagnósticos por mês",
  "4 parâmetros em tempo real",
  "Leitura de códigos DTC básica",
  "Suporte por email",
];

const BASIC_LIMITATIONS = [
  "Sem gravação de dados",
  "Sem exportação CSV",
  "Sem funções de codificação",
  "Sem suporte prioritário",
];

const PRO_FEATURES = [
  "10 veículos cadastrados",
  "Diagnósticos ilimitados",
  "Parâmetros ilimitados em tempo real",
  "Gravação de dados avançada",
  "Funções de Coding completas",
  "Consultas IA ilimitadas",
  "Exportação CSV/PDF",
  "Suporte prioritário",
  "Sem anúncios",
];

export default function SelectPlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subLoading, isPro, isAdmin } = useSubscription();
  const [isExiting, setIsExiting] = useState(false);
  
  const signupData = location.state as SignupState | null;

  // Redirect if user already has active subscription
  useEffect(() => {
    // Aguarda o carregamento terminar antes de qualquer redirecionamento
    if (authLoading || subLoading) return;
    
    if (isPro || isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    // Se já tem assinatura basic ativa, vai pro dashboard
    // IMPORTANTE: o hook pode retornar um "Basic ativo" de fallback com id vazio.
    // Só consideramos assinatura válida quando existe um id.
    if (
      subscription &&
      subscription.status === "active" &&
      subscription.plan_type === "basic" &&
      subscription.id &&
      subscription.id !== ""
    ) {
      navigate("/dashboard", { replace: true });
      return;
    }
    // Se não está autenticado, vai para signup
    if (!user) {
      navigate("/signup", { replace: true });
    }
  }, [authLoading, subLoading, isPro, isAdmin, subscription, user, navigate]);

  const handleSelectPlan = (plan: "basic" | "pro") => {
    const checkoutState: CheckoutState = {
      ...signupData,
      selectedPlan: plan,
    };
    navigate("/subscription-checkout", { state: checkoutState });
  };

  const handleExit = async () => {
    setIsExiting(true);
    try {
      await supabase.auth.signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast.error("Erro ao encerrar sessão");
    } finally {
      setIsExiting(false);
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-background relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src={logo} alt="Doutor Motors" className="h-10 sm:h-12" />
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <BadgeCheck className="w-4 h-4" />
              Escolha seu plano
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              disabled={isExiting}
              className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold font-chakra text-white mb-3">
              Escolha o plano ideal para você
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece gratuitamente ou desbloqueie todo o potencial com o plano Pro
            </p>
          </motion.div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm hover:border-border transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-sm">
                      Econômico
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-chakra">Basic</CardTitle>
                  <CardDescription>
                    Perfeito para começar a explorar
                  </CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold font-chakra text-foreground">R$ 19,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Inclui:
                    </p>
                    {BASIC_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Limitações:
                    </p>
                    {BASIC_LIMITATIONS.map((limitation, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button 
                    onClick={() => handleSelectPlan("basic")}
                    variant="outline"
                    className="w-full h-12 text-base gap-2"
                  >
                    Assinar Basic
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-primary/50 bg-gradient-to-b from-primary/10 to-card/80 backdrop-blur-sm relative overflow-hidden">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    POPULAR
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                      <Crown className="w-3 h-3" />
                      Recomendado
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-chakra flex items-center gap-2">
                    Pro
                    <Sparkles className="w-5 h-5 text-primary" />
                  </CardTitle>
                  <CardDescription>
                    Potência máxima para profissionais
                  </CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold font-chakra text-primary">R$ 34,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                      Tudo do Basic, mais:
                    </p>
                    {PRO_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button 
                    onClick={() => handleSelectPlan("pro")}
                    className="w-full h-12 text-base gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Crown className="w-4 h-4" />
                    Assinar Pro
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* Payment info */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Pagamento seguro via PIX</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Você pode fazer upgrade para o Pro a qualquer momento nas configurações da sua conta.
          </motion.p>
        </div>
      </main>
    </div>
  );
}
