import { useState } from "react";
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
import PaymentGuard from "@/components/subscription/PaymentGuard";
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
  const [isExiting, setIsExiting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  const signupData = location.state as SignupState | null;

  // Get user display info from state (PaymentGuard already handles redirects)
  const userName = signupData?.name || "";
  const userEmail = signupData?.email || "";

  const handleSelectPlan = (plan: "basic" | "pro") => {
    const checkoutState: CheckoutState = {
      ...signupData,
      selectedPlan: plan,
    };
    // Também adiciona na URL para sobreviver a refresh/voltar
    navigate(`/subscription-checkout?plan=${plan}`, { state: checkoutState });
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

  return (
    <PaymentGuard>
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
              transition={{ delay: 0.15 }}
            >
              <Card className="h-full border border-white/20 bg-secondary/80 backdrop-blur-md hover:border-white/30 transition-all duration-300 overflow-hidden shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs border-white/30 text-white/80 bg-white/5">
                      Econômico
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-chakra text-white">Basic</CardTitle>
                  <CardDescription className="text-white/70">
                    Perfeito para começar a explorar
                  </CardDescription>
                  <div className="pt-3">
                    <span className="text-4xl font-bold font-chakra text-white">R$ 19,90</span>
                    <span className="text-white/60 text-sm">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                      Inclui:
                    </p>
                    {BASIC_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <feature.icon className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-white font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                      Limitações:
                    </p>
                    {BASIC_LIMITATIONS.map((limitation, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="text-white/60">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button 
                    onClick={() => handleSelectPlan("basic")}
                    variant="outline"
                    className="w-full h-12 text-base gap-2 mt-4 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:border-white/50 font-medium"
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
              transition={{ delay: 0.25 }}
              className="relative"
            >
              {/* Subtle border glow */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary to-orange-500 rounded-xl opacity-60" />
              
              <Card className="relative h-full border-0 bg-secondary/95 backdrop-blur-md overflow-hidden shadow-2xl shadow-primary/10">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    MAIS POPULAR
                  </div>
                </div>

                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-primary/20 text-primary border border-primary/30 gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      Recomendado
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-chakra flex items-center gap-2 text-white">
                    Pro
                    <Sparkles className="w-5 h-5 text-primary" />
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Potência máxima para profissionais
                  </CardDescription>
                  <div className="pt-3">
                    <span className="text-4xl font-bold font-chakra text-primary">R$ 34,90</span>
                    <span className="text-white/60 text-sm">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 relative">
                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Tudo do Basic, mais:
                    </p>
                    {PRO_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <feature.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-white font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button 
                    onClick={() => handleSelectPlan("pro")}
                    className="w-full h-12 text-base gap-2 mt-4 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-semibold"
                  >
                    <Crown className="w-4 h-4" />
                    Assinar Pro
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* Payment info */}
                  <div className="flex items-center justify-center gap-2 text-xs text-white/60 pt-2">
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
    </PaymentGuard>
  );
}
