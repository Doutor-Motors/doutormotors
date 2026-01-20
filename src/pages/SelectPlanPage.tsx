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
  LogOut,
  User,
  Infinity,
  Car,
  Database,
  FileText,
  Headphones,
  BanIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import { ProgressStepper } from "@/components/subscription/ProgressStepper";
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
  { icon: Car, text: "1 veículo cadastrado" },
  { icon: Zap, text: "5 diagnósticos/mês" },
  { icon: Database, text: "4 parâmetros tempo real" },
  { icon: FileText, text: "Leitura DTC básica" },
  { icon: Headphones, text: "Suporte por email" },
];

const BASIC_LIMITATIONS = [
  "Sem gravação de dados",
  "Sem exportação CSV",
  "Sem funções de codificação",
  "Sem suporte prioritário",
];

const PRO_FEATURES = [
  { icon: Car, text: "10 veículos cadastrados" },
  { icon: Infinity, text: "Diagnósticos ilimitados" },
  { icon: Database, text: "Parâmetros ilimitados" },
  { icon: FileText, text: "Gravação de dados avançada" },
  { icon: Zap, text: "Funções de Coding completas" },
  { icon: Sparkles, text: "Consultas IA ilimitadas" },
  { icon: FileText, text: "Exportação CSV/PDF" },
  { icon: Headphones, text: "Suporte prioritário" },
  { icon: BanIcon, text: "Sem anúncios" },
];

export default function SelectPlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subLoading, isPro, isAdmin } = useSubscription();
  const [isExiting, setIsExiting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  const signupData = location.state as SignupState | null;

  // Get user display info
  const userName = signupData?.name || user?.user_metadata?.name || "";
  const userEmail = signupData?.email || user?.email || "";

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

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleExitConfirm = async () => {
    setShowExitDialog(false);
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
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-white/70">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(var(--secondary) / 0.95), hsl(var(--secondary) / 0.98)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Tem certeza que deseja sair?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Você será desconectado e precisará fazer login novamente para continuar o processo de assinatura.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
              Continuar escolhendo
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExitConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Doutor Motors" className="h-10 sm:h-12" />
          </div>

          {/* User Info + Exit Button */}
          <div className="flex items-center gap-3">
            {/* User Badge */}
            {(userName || userEmail) && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <User className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  {userName && (
                    <span className="text-xs font-medium text-white truncate max-w-[120px]">
                      {userName}
                    </span>
                  )}
                  <span className="text-[10px] text-white/60 truncate max-w-[120px]">
                    {userEmail}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitClick}
              disabled={isExiting}
              className="gap-2 text-white/70 hover:text-red-400 hover:bg-red-500/10"
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
          {/* Progress Stepper */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ProgressStepper currentStep={2} />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold font-chakra text-white mb-3">
              Escolha o plano ideal para você
            </h1>
            <p className="text-base text-white/60 max-w-xl mx-auto">
              Comece agora com o plano que melhor atende suas necessidades
            </p>
          </motion.div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                      Econômico
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-chakra text-white">Basic</CardTitle>
                  <CardDescription className="text-white/60">
                    Perfeito para começar a explorar
                  </CardDescription>
                  <div className="pt-3">
                    <span className="text-4xl font-bold font-chakra text-white">R$ 19,90</span>
                    <span className="text-white/50 text-sm">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Features */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                      Inclui:
                    </p>
                    {BASIC_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <feature.icon className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-white/80">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                      Limitações:
                    </p>
                    {BASIC_LIMITATIONS.map((limitation, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-white/40">
                        <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5 text-red-400/60" />
                        </div>
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button 
                    onClick={() => handleSelectPlan("basic")}
                    variant="outline"
                    className="w-full h-12 text-base gap-2 mt-4 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  >
                    Assinar Basic
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-xl opacity-75 blur-sm animate-pulse" />
              
              <Card className="relative h-full border-primary/50 bg-gradient-to-b from-primary/20 via-primary/10 to-white/5 backdrop-blur-sm overflow-hidden group hover:border-primary/70 transition-all duration-300 pulse-glow">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    MAIS POPULAR
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-primary/30 text-primary border-primary/40 gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      Recomendado
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-chakra flex items-center gap-2 text-white">
                    Pro
                    <Sparkles className="w-5 h-5 text-primary" />
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Potência máxima para profissionais
                  </CardDescription>
                  <div className="pt-3">
                    <span className="text-4xl font-bold font-chakra text-primary">R$ 34,90</span>
                    <span className="text-white/50 text-sm">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 relative">
                  {/* Features */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">
                      Tudo do Basic, mais:
                    </p>
                    {PRO_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <feature.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-white/90">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button 
                    onClick={() => handleSelectPlan("pro")}
                    className="w-full h-12 text-base gap-2 mt-4 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                  >
                    <Crown className="w-4 h-4" />
                    Assinar Pro
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* Payment info */}
                  <div className="flex items-center justify-center gap-2 text-xs text-white/50 pt-2">
                    <Shield className="w-3.5 h-3.5" />
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
            className="text-center text-sm text-white/40 mt-8"
          >
            Você pode fazer upgrade para o Pro a qualquer momento nas configurações da sua conta.
          </motion.p>
        </div>
      </main>
    </div>
  );
}
