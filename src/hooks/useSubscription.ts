import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

export type PlanType = "basic" | "pro";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: "active" | "cancelled" | "expired";
  started_at: string;
  expires_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

// Hook para verificar se usuário é admin (evita dependência circular)
function useIsAdminInternal(userId: string | undefined) {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin-internal", userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _role: "admin",
        _user_id: userId,
      });
      if (error) return false;
      return Boolean(data);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
  return { isAdmin: isAdmin ?? false, isLoading };
}

// Definição das features por plano
export const PLAN_FEATURES = {
  basic: {
    name: "Basic",
    price: "R$ 0",
    priceValue: 0,
    maxVehicles: 1,
    maxDiagnosticsPerMonth: 5,
    maxRealTimeParameters: 4,
    dataRecording: false,
    dataRecordingDuration: 0,
    advancedDiagnostics: false,
    prioritySupport: false,
    exportCSV: false,
    customAlerts: false,
    obdOptimization: false,
    codingFunctions: false,
    offlineMode: false,
    features: [
      "1 veículo cadastrado",
      "5 diagnósticos por mês",
      "4 parâmetros em tempo real",
      "Leitura de códigos DTC básica",
      "Suporte por email",
    ],
    limitations: [
      "Sem gravação de dados",
      "Sem exportação CSV",
      "Sem otimização OBD avançada",
      "Sem funções de codificação",
    ],
  },
  pro: {
    name: "Pro",
    price: "R$ 29,90/mês",
    priceValue: 2990, // Valor em CENTAVOS para API de pagamento
    maxVehicles: 10,
    maxDiagnosticsPerMonth: -1, // ilimitado
    maxRealTimeParameters: -1, // ilimitado
    dataRecording: true,
    dataRecordingDuration: -1, // ilimitado
    advancedDiagnostics: true,
    prioritySupport: true,
    exportCSV: true,
    customAlerts: true,
    obdOptimization: true,
    codingFunctions: true,
    offlineMode: true,
    features: [
      "Até 10 veículos cadastrados",
      "Diagnósticos ilimitados",
      "Parâmetros em tempo real ilimitados",
      "Gravação de dados com gráficos",
      "Exportação CSV/BRC",
      "Otimização de conexão OBD",
      "Configuração ATST avançada",
      "Funções de codificação (marcas selecionadas)",
      "Alertas personalizados",
      "Suporte prioritário",
      "Modo offline",
    ],
    limitations: [],
  },
} as const;

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Verificar se é admin internamente
  const { isAdmin, isLoading: adminLoading } = useIsAdminInternal(user?.id);

  const normalizePlanType = (value: unknown): PlanType => {
    const v = String(value ?? "").trim().toLowerCase();
    if (v === "pro" || v === "premium") return "pro";
    return "basic";
  };

  const normalizeStatus = (value: unknown): Subscription["status"] => {
    const v = String(value ?? "").trim().toLowerCase();
    if (v === "active" || v === "ativo" || v === "trialing") return "active";
    if (v === "cancelled" || v === "canceled" || v === "cancelado") return "cancelled";
    if (v === "expired" || v === "expirado") return "expired";
    // fallback para não quebrar gating em casos não mapeados
    return "active";
  };

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Busca algumas entradas mais recentes e escolhe a primeira ativa.
      // Isso evita bugs quando existem múltiplas linhas (historico de upgrades).
      const { data: rows, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const activeRow = (rows || []).find((r) => normalizeStatus((r as any).status) === "active");

      // Se não tem assinatura ativa, retorna plano básico
      if (!activeRow) {
        return {
          id: "",
          user_id: user.id,
          plan_type: "basic" as PlanType,
          status: "active" as const,
          started_at: new Date().toISOString(),
          expires_at: null,
          stripe_subscription_id: null,
          stripe_customer_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return {
        ...(activeRow as any),
        plan_type: normalizePlanType((activeRow as any).plan_type),
        status: normalizeStatus((activeRow as any).status),
      } as Subscription;
    },
    enabled: !!user?.id,
  });

  const createSubscription = useMutation({
    mutationFn: async (planType: PlanType) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Evita criar múltiplas assinaturas (isso quebra o .maybeSingle e o gating)
      const { data: lastRow, error: lastError } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) throw lastError;

      const payload = {
        user_id: user.id,
        plan_type: planType,
        status: "active" as const,
        started_at: new Date().toISOString(),
        expires_at: null,
      };

      if (lastRow?.id) {
        const { data, error } = await supabase
          .from("user_subscriptions")
          .update(payload)
          .eq("id", lastRow.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
  });

  // IMPORTANTE: Admin sempre tem acesso PRO, independente da assinatura
  const effectivePlan: PlanType = useMemo(() => {
    if (isAdmin) return "pro";
    return subscription?.plan_type || "basic";
  }, [isAdmin, subscription?.plan_type]);

  const planFeatures = PLAN_FEATURES[effectivePlan];
  const isPro = effectivePlan === "pro";

  const canUseFeature = (feature: keyof typeof PLAN_FEATURES.pro): boolean => {
    // Admin sempre pode usar qualquer feature
    if (isAdmin) return true;
    const value = planFeatures[feature as keyof typeof planFeatures];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    return true;
  };

  const getFeatureLimit = (feature: keyof typeof PLAN_FEATURES.pro): number => {
    // Admin tem limites ilimitados
    if (isAdmin) return -1;
    const value = planFeatures[feature as keyof typeof planFeatures];
    if (typeof value === "number") return value;
    return -1;
  };

  return {
    subscription,
    isLoading: isLoading || adminLoading,
    error,
    currentPlan: effectivePlan,
    planFeatures,
    isPro,
    isAdmin,
    canUseFeature,
    getFeatureLimit,
    createSubscription,
    // Helpers específicos - Admin sempre tem acesso
    canRecordData: isAdmin || planFeatures.dataRecording,
    canExportCSV: isAdmin || planFeatures.exportCSV,
    canUseCoding: isAdmin || planFeatures.codingFunctions,
    canOptimizeOBD: isAdmin || planFeatures.obdOptimization,
    maxVehicles: isAdmin ? -1 : planFeatures.maxVehicles,
    maxDiagnostics: isAdmin ? -1 : planFeatures.maxDiagnosticsPerMonth,
    maxParameters: isAdmin ? -1 : planFeatures.maxRealTimeParameters,
  };
}
