import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Check, QrCode, Crown, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

interface PixCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  amount: number;
  onSuccess?: () => void;
}

interface PixPaymentData {
  id: string;
  pix_id: string;
  amount: number;
  status: string;
  br_code: string;
  qr_code_url: string;
  expires_at: string;
}

type CheckoutStep = "form" | "payment" | "success";

export function PixCheckoutModal({ 
  open, 
  onOpenChange, 
  planName, 
  amount,
  onSuccess 
}: PixCheckoutModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<CheckoutStep>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    cpf: "",
    phone: "",
  });

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("form");
        setPixData(null);
        setCopied(false);
      }, 300);
    }
  }, [open]);

  // Realtime subscription for payment status
  useEffect(() => {
    if (!pixData?.id) return;

    const channel = supabase
      .channel(`pix-payment-${pixData.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pix_payments",
          filter: `id=eq.${pixData.id}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).status;
          if (newStatus === "paid") {
            setStep("success");
            toast.success("Pagamento confirmado! 🎉");
            onSuccess?.();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pixData?.id, onSuccess]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "cpf") {
      setFormData((prev) => ({ ...prev, cpf: formatCPF(value) }));
    } else if (field === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.cpf) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const cpfNumbers = formData.cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      toast.error("CPF inválido");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-pix-qrcode", {
        body: {
          amount,
          customerName: formData.name,
          customerEmail: formData.email,
          customerTaxId: cpfNumbers,
          customerCellphone: formData.phone.replace(/\D/g, "") || undefined,
          description: `Assinatura ${planName}`,
          expiresIn: 3600, // 1 hora
        },
      });

      if (error) throw error;

      setPixData(data);
      setStep("payment");
      toast.success("QR Code gerado! Escaneie para pagar.");
    } catch (error: any) {
      console.error("Erro ao gerar PIX:", error);
      toast.error(error.message || "Erro ao gerar QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pixData?.br_code) return;
    
    try {
      await navigator.clipboard.writeText(pixData.br_code);
      setCopied(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            {step === "success" ? "Pagamento Confirmado" : `Assinar ${planName}`}
          </DialogTitle>
          <DialogDescription>
            {step === "form" && "Preencha seus dados para gerar o QR Code PIX"}
            {step === "payment" && "Escaneie o QR Code ou copie o código para pagar"}
            {step === "success" && "Sua assinatura foi ativada com sucesso!"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <Card className="bg-muted/50">
                <CardContent className="py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Valor</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    Gerar QR Code PIX
                  </>
                )}
              </Button>
            </motion.form>
          )}

          {step === "payment" && pixData && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <Card className="bg-muted/50">
                <CardContent className="py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(pixData.amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                {pixData.qr_code_url ? (
                  <div className="bg-white p-4 rounded-xl">
                    <img
                      src={pixData.qr_code_url}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                <Badge variant="outline" className="gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Aguardando pagamento...
                </Badge>
              </div>

              {/* Copia e Cola */}
              <div className="space-y-2">
                <Label>Pix Copia e Cola</Label>
                <div className="flex gap-2">
                  <Input
                    value={pixData.br_code}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                O pagamento será confirmado automaticamente após a transferência.
              </p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Bem-vindo ao Pro! 🎉</h3>
                <p className="text-muted-foreground">
                  Sua assinatura foi ativada. Aproveite todos os recursos!
                </p>
              </div>

              <Button onClick={() => onOpenChange(false)} className="w-full">
                Começar a usar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
