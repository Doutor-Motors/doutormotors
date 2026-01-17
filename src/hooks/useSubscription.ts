import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

// Definição das features por plano
export const PLAN_FEATURES = {
  basic: {
    name: "Basic",
    price: "Grátis",
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
    priceValue: 29.90,
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

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Se não tem assinatura, retorna plano básico
      if (!data) {
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

      return data as Subscription;
    },
    enabled: !!user?.id,
  });

  const createSubscription = useMutation({
    mutationFn: async (planType: PlanType) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
  });

  // Helpers para verificar features
  const currentPlan = subscription?.plan_type || "basic";
  const planFeatures = PLAN_FEATURES[currentPlan];
  const isPro = currentPlan === "pro";

  const canUseFeature = (feature: keyof typeof PLAN_FEATURES.pro): boolean => {
    const value = planFeatures[feature as keyof typeof planFeatures];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    return true;
  };

  const getFeatureLimit = (feature: keyof typeof PLAN_FEATURES.pro): number => {
    const value = planFeatures[feature as keyof typeof planFeatures];
    if (typeof value === "number") return value;
    return -1;
  };

  return {
    subscription,
    isLoading,
    error,
    currentPlan,
    planFeatures,
    isPro,
    canUseFeature,
    getFeatureLimit,
    createSubscription,
    // Helpers específicos
    canRecordData: planFeatures.dataRecording,
    canExportCSV: planFeatures.exportCSV,
    canUseCoding: planFeatures.codingFunctions,
    canOptimizeOBD: planFeatures.obdOptimization,
    maxVehicles: planFeatures.maxVehicles,
    maxDiagnostics: planFeatures.maxDiagnosticsPerMonth,
    maxParameters: planFeatures.maxRealTimeParameters,
  };
}
