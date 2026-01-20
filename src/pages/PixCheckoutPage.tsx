import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, CreditCard, Copy, Check, Loader2, AlertCircle, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
  amount: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerCellphone: string;
  customerTaxId: string;
}

const PixCheckoutPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    description: "",
    customerName: "",
    customerEmail: "",
    customerCellphone: "",
    customerTaxId: "",
  });

  // Subscribe to realtime updates
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
          console.log("Payment updated:", payload);
          const newData = payload.new as PixPaymentData;
          setPixData(prev => prev ? { ...prev, ...newData } : null);
          
          if (newData.status === "paid") {
            setActiveTab("success");
            toast.success("Pagamento confirmado!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pixData?.id]);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseInt(numbers || "0") / 100;
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === "customerTaxId") {
      formattedValue = formatCPF(value);
    } else if (field === "customerCellphone") {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleAmountChange = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, amount: numbers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountInCents = parseInt(formData.amount || "0");
      
      if (amountInCents < 100) {
        toast.error("Valor mínimo é R$ 1,00");
        setLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("create-pix-qrcode", {
        body: {
          amount: amountInCents,
          description: formData.description || "Pagamento PIX",
          customer: {
            name: formData.customerName,
            email: formData.customerEmail,
            cellphone: formData.customerCellphone,
            taxId: formData.customerTaxId,
          },
          metadata: {
            externalId: `checkout-${Date.now()}`,
          },
        },
      });

      if (response.error) {
        console.error("Error:", response.error);
        toast.error("Erro ao criar pagamento PIX");
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
      setActiveTab("waiting");
      toast.success("QR Code gerado com sucesso!");
    } catch (error) {
      console.error("Error creating PIX:", error);
      toast.error("Erro ao processar pagamento");
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

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      customerName: "",
      customerEmail: "",
      customerCellphone: "",
      customerTaxId: "",
    });
    setPixData(null);
    setActiveTab("create");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="font-chakra text-3xl md:text-4xl font-bold text-foreground mb-2">
                Checkout PIX
              </h1>
              <p className="text-muted-foreground">
                Pagamento instantâneo via PIX com AbacatePay
              </p>
            </div>

            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="border-b border-border pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full bg-muted/50">
                    <TabsTrigger 
                      value="create" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-chakra"
                      disabled={activeTab === "waiting" || activeTab === "success"}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Criar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="waiting" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-chakra"
                      disabled={!pixData || activeTab === "success"}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Aguardando
                    </TabsTrigger>
                    <TabsTrigger 
                      value="success" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-chakra"
                      disabled={pixData?.status !== "paid"}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmado
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  {/* Tab: Criar Cobrança */}
                  {activeTab === "create" && (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="amount" className="font-chakra text-foreground">
                              Valor *
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="amount"
                                type="text"
                                value={formatCurrency(formData.amount)}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                placeholder="R$ 0,00"
                                className="text-lg font-semibold"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="description" className="font-chakra text-foreground">
                              Descrição
                            </Label>
                            <Input
                              id="description"
                              value={formData.description}
                              onChange={(e) => handleInputChange("description", e.target.value)}
                              placeholder="Ex: Assinatura Pro Mensal"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="border-t border-border pt-6">
                          <h3 className="font-chakra font-semibold text-foreground mb-4">
                            Dados do Cliente
                          </h3>
                          
                          <div className="grid gap-4">
                            <div>
                              <Label htmlFor="customerName" className="font-chakra text-foreground">
                                Nome Completo *
                              </Label>
                              <Input
                                id="customerName"
                                value={formData.customerName}
                                onChange={(e) => handleInputChange("customerName", e.target.value)}
                                placeholder="Daniel Lima"
                                className="mt-1"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="customerEmail" className="font-chakra text-foreground">
                                  E-mail *
                                </Label>
                                <Input
                                  id="customerEmail"
                                  type="email"
                                  value={formData.customerEmail}
                                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                                  placeholder="daniel@email.com"
                                  className="mt-1"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="customerCellphone" className="font-chakra text-foreground">
                                  Celular
                                </Label>
                                <Input
                                  id="customerCellphone"
                                  value={formData.customerCellphone}
                                  onChange={(e) => handleInputChange("customerCellphone", e.target.value)}
                                  placeholder="(11) 99999-9999"
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="customerTaxId" className="font-chakra text-foreground">
                                CPF *
                              </Label>
                              <Input
                                id="customerTaxId"
                                value={formData.customerTaxId}
                                onChange={(e) => handleInputChange("customerTaxId", e.target.value)}
                                placeholder="000.000.000-00"
                                className="mt-1"
                                required
                              />
                            </div>
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
                              Gerando QR Code...
                            </>
                          ) : (
                            <>
                              <QrCode className="w-5 h-5 mr-2" />
                              Gerar QR Code PIX
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {/* Tab: Aguardando Pagamento */}
                  {activeTab === "waiting" && pixData && (
                    <motion.div
                      key="waiting"
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
                          {(pixData.amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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

                        {/* Código PIX Copia e Cola */}
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

                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="font-chakra"
                      >
                        Criar novo pagamento
                      </Button>
                    </motion.div>
                  )}

                  {/* Tab: Pagamento Confirmado */}
                  {activeTab === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center space-y-6 py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </motion.div>

                      <div>
                        <h2 className="font-chakra text-2xl font-bold text-foreground mb-2">
                          Pagamento Confirmado!
                        </h2>
                        <p className="text-muted-foreground">
                          Seu pagamento foi processado com sucesso.
                        </p>
                      </div>

                      {pixData && (
                        <Card className="bg-muted/30 border-green-200 dark:border-green-800">
                          <CardContent className="pt-6">
                            <div className="space-y-2 text-left">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Valor:</span>
                                <span className="font-semibold text-foreground">
                                  {(pixData.amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-semibold text-green-600">Pago</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">ID:</span>
                                <span className="font-mono text-sm text-foreground">{pixData.pix_id}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Button
                        onClick={resetForm}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase"
                        size="lg"
                      >
                        Criar Novo Pagamento
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PixCheckoutPage;
