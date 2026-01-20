import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Clock, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  Crown, 
  ArrowLeft,
  Shield,
  Zap,
  Star,
  CreditCard,
  BadgeCheck,
  Sparkles,
  Users,
  TrendingUp,
  Timer,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import logo from "@/assets/images/logo-new-car.png";
import heroBg from "@/assets/images/hero-bg.jpg";

type CheckoutStep = "form" | "payment" | "success" | "expired";

interface PixPaymentData {
  id: string;
  pix_id: string;
  amount: number;
  status: string;
  br_code: string;
  qr_code_url: string;
  expires_at: string;
}

interface FormData {
  customerName: string;
  customerEmail: string;
  customerCellphone: string;
  customerTaxId: string;
}

interface RecentSubscriber {
  id: string;
  name: string;
  city: string;
  timeAgo: string;
}

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
};

// Utility to format cents to BRL currency
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

// PIX timeout in seconds (10 minutes)
const PIX_TIMEOUT_SECONDS = 10 * 60;

// Simulated recent subscribers for social proof
const CITIES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Brasília", "Salvador", "Fortaleza", "Recife", "Campinas"];
const FIRST_NAMES = ["João", "Maria", "Pedro", "Ana", "Carlos", "Fernanda", "Lucas", "Juliana", "Rafael", "Patrícia", "Bruno", "Camila", "Diego", "Larissa", "Marcos"];

const generateRandomSubscriber = (): RecentSubscriber => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const minutesAgo = Math.floor(Math.random() * 15) + 1;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${firstName} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
    city,
    timeAgo: minutesAgo === 1 ? "agora mesmo" : `há ${minutesAgo} min`,
  };
};

const PRO_BENEFITS = [
  { icon: Zap, text: "Diagnósticos ilimitados" },
  { icon: Star, text: "Gravação de dados avançada" },
  { icon: CreditCard, text: "Funções de Coding completas" },
  { icon: Sparkles, text: "Consultas IA ilimitadas" },
  { icon: BadgeCheck, text: "Suporte prioritário" },
  { icon: Shield, text: "Sem anúncios" },
];

export default function SubscriptionCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subLoading, isPro, isAdmin } = useSubscription();
  
  const [step, setStep] = useState<CheckoutStep>("form");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(PIX_TIMEOUT_SECONDS);
  const [timerStarted, setTimerStarted] = useState(false);
  
  // Social proof state
  const [recentSubscribers, setRecentSubscribers] = useState<RecentSubscriber[]>([]);
  const [currentSubscriberIndex, setCurrentSubscriberIndex] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  
  // Get the plan price in cents from config
  const planPriceInCents = PLAN_FEATURES.pro.priceValue;
  const formattedPrice = formatCurrency(planPriceInCents);
  
  // Pre-fill with data from signup
  const signupData = location.state as { fromSignup?: boolean; email?: string; name?: string } | null;
  
  const [formData, setFormData] = useState<FormData>({
    customerName: signupData?.name || "",
    customerEmail: signupData?.email || "",
    customerCellphone: "",
    customerTaxId: "",
  });

  // Initialize social proof data
  useEffect(() => {
    // Generate initial subscribers
    const initialSubscribers = Array.from({ length: 5 }, () => generateRandomSubscriber());
    setRecentSubscribers(initialSubscribers);
    
    // Random subscriber count for today (between 12-47)
    setSubscriberCount(Math.floor(Math.random() * 35) + 12);
  }, []);

  // Rotate social proof every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubscriberIndex(prev => {
        const next = (prev + 1) % recentSubscribers.length;
        // Occasionally add a new subscriber
        if (Math.random() > 0.7) {
          setRecentSubscribers(prev => {
            const newList = [...prev];
            newList[next] = generateRandomSubscriber();
            return newList;
          });
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [recentSubscribers.length]);

  // Timer countdown
  useEffect(() => {
    if (!timerStarted || step !== "payment") return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep("expired");
          toast.error("O tempo para pagamento expirou. Gere um novo QR Code.");
          return 0;
        }
        
        // Warning at 2 minutes
        if (prev === 120) {
          toast.warning("Restam apenas 2 minutos para concluir o pagamento!");
        }
        
        // Warning at 1 minute
        if (prev === 60) {
          toast.warning("Último minuto! Finalize o pagamento agora.", {
            duration: 5000,
          });
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, step]);

  // Format time remaining as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Timer progress percentage
  const timerProgress = (timeRemaining / PIX_TIMEOUT_SECONDS) * 100;
  const isTimerCritical = timeRemaining <= 120; // 2 minutes or less

  // Redirect if user already has active subscription
  useEffect(() => {
    if (!authLoading && !subLoading) {
      if (isPro || isAdmin) {
        toast.success("Você já possui uma assinatura ativa!");
        navigate("/dashboard");
      }
    }
  }, [authLoading, subLoading, isPro, isAdmin, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signup");
    }
  }, [authLoading, user, navigate]);

  // Listen for payment updates
  useEffect(() => {
    if (!pixData?.id) return;

    const channel = supabase
      .channel(`subscription-payment-${pixData.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pix_payments",
          filter: `id=eq.${pixData.id}`,
        },
        async (payload) => {
          console.log("Payment updated:", payload);
          const newData = payload.new as PixPaymentData;
          setPixData(prev => prev ? { ...prev, ...newData } : null);

          if (newData.status === "paid") {
            // Activate subscription
            await activateSubscription();
            setStep("success");
            toast.success("Pagamento confirmado! Sua assinatura Pro está ativa.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pixData?.id]);

  const activateSubscription = async () => {
    if (!user) return;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: "pro",
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_method: "pix",
        }, {
          onConflict: "user_id"
        });

      if (error) {
        console.error("Error activating subscription:", error);
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;

    if (field === "customerTaxId") {
      formattedValue = formatCPF(value);
    } else if (field === "customerCellphone") {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate CPF
      const cpfNumbers = formData.customerTaxId.replace(/\D/g, "");
      if (cpfNumbers.length !== 11) {
        toast.error("CPF inválido. Digite um CPF com 11 dígitos.");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.customerName || !formData.customerEmail) {
        toast.error("Preencha todos os campos obrigatórios.");
        setLoading(false);
        return;
      }

      console.log("Enviando para API - Valor em centavos:", planPriceInCents);
      console.log("Valor formatado para exibição:", formattedPrice);

      const response = await supabase.functions.invoke("create-pix-qrcode", {
        body: {
          amount: planPriceInCents,
          description: "Assinatura Pro - Doutor Motors",
          customer: {
            name: formData.customerName,
            email: formData.customerEmail,
            cellphone: formData.customerCellphone.replace(/\D/g, ""),
            taxId: cpfNumbers,
          },
          metadata: {
            userId: user?.id,
            planType: "pro",
            source: "subscription_checkout",
          },
        },
      });

      if (response.error) {
        console.error("Error:", response.error);
        toast.error("Erro ao criar pagamento PIX. Tente novamente.");
        setLoading(false);
        return;
      }

      const data = response.data;
      if (!data.success) {
        toast.error(data.error || "Erro ao criar pagamento");
        setLoading(false);
        return;
      }

      setPixData(data.data);
      setStep("payment");
      setTimeRemaining(PIX_TIMEOUT_SECONDS);
      setTimerStarted(true);
      toast.success("QR Code gerado com sucesso!");
    } catch (error) {
      console.error("Error creating PIX:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pixData?.br_code) return;

    try {
      await navigator.clipboard.writeText(pixData.br_code);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Erro ao copiar código");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleBack = () => {
    if (step === "payment" || step === "expired") {
      setStep("form");
      setPixData(null);
      setTimerStarted(false);
      setTimeRemaining(PIX_TIMEOUT_SECONDS);
    } else {
      navigate(-1);
    }
  };

  const handleRetry = () => {
    setStep("form");
    setPixData(null);
    setTimerStarted(false);
    setTimeRemaining(PIX_TIMEOUT_SECONDS);
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const currentSubscriber = recentSubscribers[currentSubscriberIndex];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(var(--secondary) / 0.95), hsl(var(--secondary) / 0.98)), url(${heroBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Back Button */}
      {step !== "success" && (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 gap-2 font-chakra uppercase text-sm text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
      )}

      {/* Social Proof Banner - Fixed at top */}
      <AnimatePresence mode="wait">
        {currentSubscriber && step !== "success" && (
          <motion.div
            key={currentSubscriber.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 hidden sm:block"
          >
            <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{currentSubscriber.name}</p>
                <p className="text-xs opacity-90">
                  {currentSubscriber.city} • Assinou {currentSubscriber.timeAgo}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center mb-6 cursor-default"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={logo} alt="Doutor Motors" className="h-[80px] w-auto object-contain" />
          <span className="font-chakra text-white text-lg font-bold tracking-wider -mt-[24px]">
            DOUTOR MOTORS
          </span>
        </motion.div>

        {/* Social Proof Stats - Mobile */}
        {step === "form" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="font-semibold text-green-400">{subscriberCount}</span>
                <span className="text-white/70">assinantes hoje</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <motion.div 
          className="flex items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {["Dados", "Pagamento", "Ativação"].map((label, index) => {
            const stepIndex = index + 1;
            const currentStepIndex = step === "form" ? 1 : step === "payment" || step === "expired" ? 2 : 3;
            const isActive = stepIndex === currentStepIndex;
            const isCompleted = stepIndex < currentStepIndex;
            
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted ? "bg-green-500 text-white" :
                    isActive ? "bg-primary text-white ring-4 ring-primary/30" : 
                    "bg-white/10 text-white/50"
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : stepIndex}
                  </div>
                  <span className={`text-xs font-medium ${isActive || isCompleted ? "text-white" : "text-white/50"}`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-12 h-0.5 rounded mb-5 transition-all duration-300 ${
                    isCompleted ? "bg-green-500" : "bg-white/20"
                  }`} />
                )}
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl overflow-hidden">
            {/* Header with gradient */}
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Badge className="w-fit mx-auto mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Plano Pro
                </Badge>
              </motion.div>
              <CardTitle className="font-chakra text-2xl text-foreground">
                {step === "form" && "Finalize sua Assinatura"}
                {step === "payment" && "Realize o Pagamento"}
                {step === "success" && "Assinatura Ativada!"}
                {step === "expired" && "Tempo Expirado"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {step === "form" && "Preencha seus dados para gerar o PIX"}
                {step === "payment" && "Escaneie o QR Code ou copie o código"}
                {step === "success" && "Você agora tem acesso completo ao sistema"}
                {step === "expired" && "O QR Code expirou. Gere um novo para continuar."}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {/* Step: Form */}
                {step === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Value Preview Card - Transparência no valor */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5 border border-primary/20">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Plano Pro Mensal</p>
                            <p className="text-3xl font-bold text-foreground font-chakra">
                              {formattedPrice}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {planPriceInCents} centavos • Renovação mensal
                            </p>
                          </div>
                          <div className="bg-primary/20 p-3 rounded-full">
                            <Crown className="w-8 h-8 text-primary" />
                          </div>
                        </div>
                        
                        <Separator className="my-4 bg-border/50" />
                        
                        <div className="grid grid-cols-2 gap-3">
                          {PRO_BENEFITS.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <benefit.icon className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-muted-foreground">{benefit.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Social Proof inline */}
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-400">
                        <strong>{subscriberCount} pessoas</strong> assinaram nas últimas 24 horas
                      </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="customerName" className="text-foreground">Nome Completo *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => handleInputChange("customerName", e.target.value)}
                          placeholder="Seu nome completo"
                          className="mt-1.5 bg-background/50 border-border/50 focus:border-primary"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customerEmail" className="text-foreground">E-mail *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                          placeholder="seu@email.com"
                          className="mt-1.5 bg-background/50 border-border/50 focus:border-primary"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerTaxId" className="text-foreground">CPF *</Label>
                          <Input
                            id="customerTaxId"
                            value={formData.customerTaxId}
                            onChange={(e) => handleInputChange("customerTaxId", e.target.value)}
                            placeholder="000.000.000-00"
                            className="mt-1.5 bg-background/50 border-border/50 focus:border-primary"
                            required
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerCellphone" className="text-foreground">Celular</Label>
                          <Input
                            id="customerCellphone"
                            value={formData.customerCellphone}
                            onChange={(e) => handleInputChange("customerCellphone", e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="mt-1.5 bg-background/50 border-border/50 focus:border-primary"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Summary before submit */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total a pagar:</span>
                          <span className="text-xl font-bold text-primary font-chakra">{formattedPrice}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Pagamento via PIX • Ativação instantânea
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase h-12 text-base"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Gerando PIX...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Gerar PIX • {formattedPrice}
                          </>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>Pagamento Seguro</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>Ativação Imediata</span>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step: Payment */}
                {step === "payment" && pixData && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-center space-y-5"
                  >
                    {/* Timer Bar */}
                    <div className={`rounded-lg p-3 ${isTimerCritical ? "bg-red-500/20 border border-red-500/30" : "bg-muted/30 border border-border/30"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Timer className={`w-4 h-4 ${isTimerCritical ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${isTimerCritical ? "text-red-500" : "text-muted-foreground"}`}>
                            Tempo restante
                          </span>
                        </div>
                        <span className={`font-mono text-lg font-bold ${isTimerCritical ? "text-red-500" : "text-foreground"}`}>
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                      <Progress 
                        value={timerProgress} 
                        className={`h-2 ${isTimerCritical ? "[&>div]:bg-red-500" : ""}`}
                      />
                      {isTimerCritical && (
                        <p className="text-xs text-red-400 mt-2 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Finalize o pagamento antes que o código expire!
                        </p>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                        <Clock className="w-5 h-5 text-primary relative" />
                      </div>
                      <span className="font-chakra font-semibold text-foreground">Aguardando pagamento...</span>
                    </div>

                    {/* Payment card */}
                    <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-5 border border-border/30">
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
                        <p className="text-3xl font-bold text-primary font-chakra">
                          {formattedPrice}
                        </p>
                      </div>

                      {/* QR Code */}
                      <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-lg">
                        {pixData.qr_code_url ? (
                          <img
                            src={`data:image/png;base64,${pixData.qr_code_url}`}
                            alt="QR Code PIX"
                            className="w-44 h-44 mx-auto"
                          />
                        ) : (
                          <div className="w-44 h-44 bg-muted/30 rounded-lg flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Copy button */}
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="w-full gap-2 h-11 text-base border-primary/30 hover:bg-primary/10"
                        disabled={!pixData.br_code}
                      >
                        {copied ? (
                          <>
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-green-500">Código copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copiar código PIX
                          </>
                        )}
                      </Button>

                      {/* PIX code preview */}
                      {pixData.br_code && (
                        <div className="mt-3 p-2.5 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground font-mono break-all line-clamp-2">
                            {pixData.br_code}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Social proof during payment */}
                    <AnimatePresence mode="wait">
                      {currentSubscriber && (
                        <motion.div
                          key={`payment-${currentSubscriber.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-400">
                            <strong>{currentSubscriber.name}</strong> de {currentSubscriber.city} assinou {currentSubscriber.timeAgo}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span>O pagamento será confirmado automaticamente</span>
                    </div>
                  </motion.div>
                )}

                {/* Step: Expired */}
                {step === "expired" && (
                  <motion.div
                    key="expired"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-6 py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30"
                    >
                      <AlertTriangle className="w-14 h-14 text-white" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold font-chakra text-foreground mb-2">
                        QR Code Expirado
                      </h3>
                      <p className="text-muted-foreground">
                        O tempo limite de 10 minutos foi atingido.
                        <br />
                        Gere um novo QR Code para continuar.
                      </p>
                    </div>

                    <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                      <p className="text-sm text-amber-400">
                        Por segurança, os códigos PIX expiram após 10 minutos.
                        Não se preocupe, você pode gerar um novo código gratuitamente.
                      </p>
                    </div>

                    <Button
                      onClick={handleRetry}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase h-12 text-base"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Gerar Novo QR Code
                    </Button>
                  </motion.div>
                )}

                {/* Step: Success */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-6 py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle className="w-14 h-14 text-white" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold font-chakra text-foreground mb-2">
                        Pagamento Confirmado!
                      </h3>
                      <p className="text-muted-foreground">
                        Sua assinatura Pro está ativa e pronta para uso.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-xl border border-primary/20">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Crown className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Benefícios desbloqueados</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {PRO_BENEFITS.slice(0, 4).map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-muted-foreground">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>{benefit.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleGoToDashboard}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase h-12 text-base"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Acessar Dashboard
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer info */}
        <motion.p 
          className="text-center text-xs text-white/50 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Pagamento processado de forma segura via PIX
        </motion.p>
      </div>
    </div>
  );
}
