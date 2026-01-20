import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import logo from "@/assets/images/logo-new-car.png";
import heroBg from "@/assets/images/hero-bg.jpg";

type CheckoutStep = "form" | "payment" | "success";

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
    if (step === "payment") {
      setStep("form");
      setPixData(null);
    } else {
      navigate(-1);
    }
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

      <div className="w-full max-w-lg">
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center mb-8 cursor-default"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={logo} alt="Doutor Motors" className="h-[80px] w-auto object-contain" />
          <span className="font-chakra text-white text-lg font-bold tracking-wider -mt-[24px]">
            DOUTOR MOTORS
          </span>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {["Dados", "Pagamento", "Ativação"].map((label, index) => {
            const stepIndex = index + 1;
            const currentStepIndex = step === "form" ? 1 : step === "payment" ? 2 : 3;
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
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {step === "form" && "Preencha seus dados para gerar o PIX"}
                {step === "payment" && "Escaneie o QR Code ou copie o código"}
                {step === "success" && "Você agora tem acesso completo ao sistema"}
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
                    className="text-center space-y-6"
                  >
                    {/* Status indicator */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                        <Clock className="w-5 h-5 text-primary relative" />
                      </div>
                      <span className="font-chakra font-semibold text-foreground">Aguardando pagamento...</span>
                    </div>

                    {/* Payment card */}
                    <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-6 border border-border/30">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
                        <p className="text-3xl font-bold text-primary font-chakra">
                          {formattedPrice}
                        </p>
                      </div>

                      {/* QR Code */}
                      <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-lg">
                        {pixData.qr_code_url ? (
                          <img
                            src={`data:image/png;base64,${pixData.qr_code_url}`}
                            alt="QR Code PIX"
                            className="w-48 h-48 mx-auto"
                          />
                        ) : (
                          <div className="w-48 h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Copy button */}
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="w-full gap-2 h-12 text-base border-primary/30 hover:bg-primary/10"
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
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground font-mono break-all line-clamp-2">
                            {pixData.br_code}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span>O pagamento será confirmado automaticamente</span>
                    </div>
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
