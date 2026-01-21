import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, Clock, AlertCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import confetti from "canvas-confetti";
import logo from "@/assets/images/logo-new-car.png";
import heroBg from "@/assets/images/hero-bg.jpg";

interface AwaitingActivationProps {
  pixPaymentId: string;
  planType: "basic" | "pro";
  onActivated?: () => void;
  onExpired?: () => void;
  /** Quando true, renderiza apenas o conteúdo interno (sem wrapper de página/card) */
  inline?: boolean;
}

type ActivationStatus = "waiting" | "processing" | "activated" | "expired" | "error";

/**
 * Tela de "Aguardando Ativação" com polling + realtime
 * Monitora pix_payments e user_subscriptions para detectar ativação
 */
export function AwaitingActivation({
  pixPaymentId,
  planType,
  onActivated,
  onExpired,
  inline = false,
}: AwaitingActivationProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Inicia como "processing" quando inline (já sabe que o PIX foi pago)
  const [status, setStatus] = useState<ActivationStatus>(inline ? "processing" : "waiting");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const MAX_WAIT_SECONDS = 120; // 2 minutos máximo

  // Confetti celebration
  const triggerConfetti = useCallback(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        ...defaults,
        particleCount: 30 * (timeLeft / duration),
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ["#C91A1A", "#22C55E", "#F59E0B"],
      });
    }, 250);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#C91A1A", "#22C55E", "#F59E0B"],
      zIndex: 9999,
    });
  }, []);

  // Polling manual a cada 3 segundos
  useEffect(() => {
    if (status !== "waiting" && status !== "processing") return;

    const checkActivation = async () => {
      try {
        // Verifica status do pagamento PIX
        const { data: pixData, error: pixError } = await supabase
          .from("pix_payments")
          .select("status")
          .eq("id", pixPaymentId)
          .single();

        if (pixError) {
          console.error("Erro ao verificar PIX:", pixError);
          return;
        }

        if (pixData?.status === "paid") {
          setStatus("processing");

          // Verifica se assinatura foi ativada
          if (user?.id) {
            const { data: subData, error: subError } = await supabase
              .from("user_subscriptions")
              .select("id, status, plan_type")
              .eq("user_id", user.id)
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!subError && subData?.id) {
              setStatus("activated");
              triggerConfetti();
              queryClient.invalidateQueries({ queryKey: ["subscription"] });
              toast.success("Sua assinatura foi ativada com sucesso!");
              onActivated?.();
            }
          }
        }
      } catch (err) {
        console.error("Erro no polling:", err);
      }
    };

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 3;
        setProgress((next / MAX_WAIT_SECONDS) * 100);

        if (next >= MAX_WAIT_SECONDS) {
          setStatus("expired");
          onExpired?.();
          return prev;
        }
        return next;
      });

      checkActivation();
    }, 3000);

    // Verificação inicial
    checkActivation();

    return () => clearInterval(interval);
  }, [status, pixPaymentId, user?.id, queryClient, onActivated, onExpired, triggerConfetti]);

  // Realtime subscription para pix_payments
  useEffect(() => {
    if (status !== "waiting" && status !== "processing") return;

    const channel = supabase
      .channel(`awaiting-activation-${pixPaymentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pix_payments",
          filter: `id=eq.${pixPaymentId}`,
        },
        async (payload) => {
          console.log("PIX update:", payload);
          const newData = payload.new as { status: string };

          if (newData.status === "paid") {
            setStatus("processing");
            // Aguarda um pouco para o webhook processar a assinatura
            setTimeout(async () => {
              if (user?.id) {
                const { data: subData } = await supabase
                  .from("user_subscriptions")
                  .select("id, status")
                  .eq("user_id", user.id)
                  .eq("status", "active")
                  .limit(1)
                  .maybeSingle();

                if (subData?.id) {
                  setStatus("activated");
                  triggerConfetti();
                  queryClient.invalidateQueries({ queryKey: ["subscription"] });
                  toast.success("Sua assinatura foi ativada com sucesso!");
                  onActivated?.();
                }
              }
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, pixPaymentId, user?.id, queryClient, onActivated, triggerConfetti]);

  // Realtime subscription para user_subscriptions
  useEffect(() => {
    if (!user?.id || (status !== "waiting" && status !== "processing")) return;

    const channel = supabase
      .channel(`awaiting-subscription-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Subscription update:", payload);
          const newData = payload.new as { id?: string; status?: string };

          if (newData.id && newData.status === "active") {
            setStatus("activated");
            triggerConfetti();
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            toast.success("Sua assinatura foi ativada com sucesso!");
            onActivated?.();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, user?.id, queryClient, onActivated, triggerConfetti]);

  const handleGoToDashboard = async () => {
    await queryClient.invalidateQueries({ queryKey: ["subscription"] });
    navigate("/dashboard");
  };

  const handleRetry = () => {
    navigate("/subscription-checkout");
  };

  const planLabel = planType === "pro" ? "Pro" : "Basic";

  // Conteúdo interno dos status (reutilizável em ambos os modos)
  const statusContent = (
    <>
      {/* Status: Waiting */}
      {status === "waiting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-chakra text-foreground">
              Processando Ativação
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Aguarde enquanto ativamos sua assinatura...
            </p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Verificando a cada 3 segundos ({Math.floor(elapsedSeconds)}s)
          </p>
        </motion.div>
      )}

      {/* Status: Processing */}
      {status === "processing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-chakra text-foreground">
              Pagamento Confirmado!
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Ativando sua assinatura {planLabel}...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processando webhook...
          </div>
        </motion.div>
      )}

      {/* Status: Activated - chama onActivated, não mostra botão (o parent controla) */}
      {status === "activated" && !inline && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-chakra text-foreground">
              Assinatura Ativada!
            </h3>
            <p className="text-muted-foreground mt-1">
              Seu plano {planLabel} está pronto para uso.
            </p>
          </div>
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase h-12"
          >
            <Zap className="w-5 h-5 mr-2" />
            Acessar Dashboard
          </Button>
        </motion.div>
      )}

      {/* Status: Expired */}
      {status === "expired" && !inline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-chakra text-foreground">
              Tempo Esgotado
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Não detectamos a ativação a tempo. Verifique se o pagamento foi
              realizado ou entre em contato com o suporte.
            </p>
          </div>
          <Button
            onClick={handleRetry}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase h-12"
          >
            Tentar Novamente
          </Button>
        </motion.div>
      )}

      {/* Status: Error */}
      {status === "error" && !inline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-chakra text-foreground">
              Erro na Verificação
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Ocorreu um erro ao verificar seu pagamento. Entre em contato
              com o suporte.
            </p>
          </div>
          <Button
            onClick={handleRetry}
            variant="outline"
            className="w-full h-12"
          >
            Tentar Novamente
          </Button>
        </motion.div>
      )}
    </>
  );

  // Modo inline: retorna apenas o conteúdo (para uso dentro de outro Card)
  if (inline) {
    return <div className="space-y-6">{statusContent}</div>;
  }

  // Modo standalone: página completa com background e card
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(var(--secondary) / 0.95), hsl(var(--secondary) / 0.98)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Doutor Motors" className="h-16" />
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-border shadow-2xl">
          <CardContent className="pt-8 pb-6 space-y-6">
            {statusContent}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default AwaitingActivation;
