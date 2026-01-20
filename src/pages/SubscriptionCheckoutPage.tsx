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
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

const PRO_BENEFITS = [
  "Diagnósticos ilimitados",
  "Gravação de dados avançada",
  "Funções de Coding completas",
  "Consultas IA ilimitadas",
  "Suporte prioritário",
  "Sem anúncios"
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

      const amountInCents = PLAN_FEATURES.pro.priceValue; // 2990 cents = R$ 29,90

      const response = await supabase.functions.invoke("create-pix-qrcode", {
        body: {
          amount: amountInCents,
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
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Back Button */}
      {step !== "success" && (
        <Button
          variant="ghost-light"
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 gap-2 font-chakra uppercase text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
      )}

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 cursor-default">
          <img src={logo} alt="Doutor Motors" className="h-[80px] w-auto object-contain" />
          <span className="font-chakra text-primary-foreground text-lg font-bold tracking-wider -mt-[24px]">
            DOUTOR MOTORS
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === "form" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
          }`}>
            1
          </div>
          <div className={`w-12 h-1 rounded ${step !== "form" ? "bg-primary" : "bg-primary/20"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === "payment" ? "bg-primary text-primary-foreground" : 
            step === "success" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary/50"
          }`}>
            2
          </div>
          <div className={`w-12 h-1 rounded ${step === "success" ? "bg-primary" : "bg-primary/20"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === "success" ? "bg-green-500 text-white" : "bg-primary/20 text-primary/50"
          }`}>
            {step === "success" ? <Check className="w-4 h-4" /> : "3"}
          </div>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-border shadow-2xl">
          <CardHeader className="text-center border-b border-border pb-4">
            <Badge className="w-fit mx-auto mb-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Plano Pro
            </Badge>
            <CardTitle className="font-chakra text-2xl">
              {step === "form" && "Finalize sua Assinatura"}
              {step === "payment" && "Realize o Pagamento"}
              {step === "success" && "Assinatura Ativada!"}
            </CardTitle>
            <CardDescription>
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
                >
                  {/* Plan Summary */}
                  <div className="bg-primary/10 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Plano Pro Mensal</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ 29,90
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRO_BENEFITS.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3 h-3 text-green-500 shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="customerName">Nome Completo *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange("customerName", e.target.value)}
                        placeholder="Seu nome completo"
                        className="mt-1"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="customerEmail">E-mail *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                        placeholder="seu@email.com"
                        className="mt-1"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerTaxId">CPF *</Label>
                        <Input
                          id="customerTaxId"
                          value={formData.customerTaxId}
                          onChange={(e) => handleInputChange("customerTaxId", e.target.value)}
                          placeholder="000.000.000-00"
                          className="mt-1"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerCellphone">Celular</Label>
                        <Input
                          id="customerCellphone"
                          value={formData.customerCellphone}
                          onChange={(e) => handleInputChange("customerCellphone", e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="mt-1"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando PIX...
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5 mr-2" />
                          Gerar PIX - R$ 29,90
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Pagamento Seguro</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
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
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="font-chakra font-semibold">Aguardando pagamento...</span>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-6">
                    <p className="text-2xl font-bold text-foreground mb-4">
                      R$ 29,90
                    </p>

                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      {pixData.qr_code_url ? (
                        <img
                          src={`data:image/png;base64,${pixData.qr_code_url}`}
                          alt="QR Code PIX"
                          className="w-48 h-48 mx-auto"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                          <AlertCircle className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* PIX Code */}
                    <div className="space-y-3">
                      <Label className="font-chakra text-foreground text-sm">
                        PIX Copia e Cola
                      </Label>
                      <div className="relative">
                        <Input
                          value={pixData.br_code || ""}
                          readOnly
                          className="pr-12 text-xs font-mono bg-background"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={copyToClipboard}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Escaneie o QR Code ou copie o código para pagar
                  </p>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      ⚠️ Não feche esta página até o pagamento ser confirmado
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step: Success */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-4"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Pagamento Confirmado!
                    </h3>
                    <p className="text-muted-foreground">
                      Sua assinatura Pro está ativa. Aproveite todos os recursos!
                    </p>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-foreground">Plano Pro Ativo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Válido por 30 dias a partir de hoje
                    </p>
                  </div>

                  <Button
                    onClick={handleGoToDashboard}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Acessar o Sistema
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-primary-foreground/70 text-sm">
          <Shield className="w-4 h-4" />
          <span>Pagamento processado com segurança via AbacatePay</span>
        </div>
      </div>
    </div>
  );
}
