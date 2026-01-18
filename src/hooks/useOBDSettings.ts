import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface OBDSettings {
  id: string;
  user_id: string;
  atst_value: number;
  atst_mode: "auto" | "manual";
  optimize_requests: boolean;
  preferred_protocol: string;
  auto_reconnect: boolean;
  connection_timeout_seconds: number;
  max_simultaneous_parameters: number;
  polling_interval_ms: number;
  custom_init_commands: string[];
  last_successful_protocol: string | null;
  last_connection_at: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_OBD_SETTINGS: Omit<OBDSettings, "id" | "user_id" | "created_at" | "updated_at"> = {
  atst_value: 32,
  atst_mode: "auto",
  optimize_requests: false,
  preferred_protocol: "auto",
  auto_reconnect: true,
  connection_timeout_seconds: 30,
  max_simultaneous_parameters: 4,
  polling_interval_ms: 100,
  custom_init_commands: [],
  last_successful_protocol: null,
  last_connection_at: null,
};

// ATST value presets based on documentation
export const ATST_PRESETS = [
  { value: 8, label: "Muito Rápido (8)", description: "Máxima velocidade, pode causar instabilidade" },
  { value: 16, label: "Rápido (16)", description: "Alta velocidade, algumas perdas de pacotes possíveis" },
  { value: 32, label: "Balanceado (32)", description: "Equilíbrio entre velocidade e estabilidade" },
  { value: 64, label: "Estável (64)", description: "Conexão estável, velocidade moderada" },
  { value: 96, label: "Muito Estável (96)", description: "Para VW, Audi, Skoda antigos" },
  { value: 255, label: "Máxima Estabilidade (FF)", description: "Máxima estabilidade, velocidade reduzida" },
] as const;

// OBD Protocols
export const OBD_PROTOCOLS = [
  { value: "auto", label: "Automático", description: "Detecta automaticamente o protocolo" },
  { value: "0", label: "Auto", description: "Protocolo automático ELM327" },
  { value: "1", label: "SAE J1850 PWM", description: "Ford" },
  { value: "2", label: "SAE J1850 VPW", description: "GM" },
  { value: "3", label: "ISO 9141-2", description: "Europeus/Asiáticos antigos" },
  { value: "4", label: "ISO 14230-4 KWP (5 baud)", description: "Europeus/Asiáticos" },
  { value: "5", label: "ISO 14230-4 KWP (fast)", description: "Europeus/Asiáticos" },
  { value: "6", label: "ISO 15765-4 CAN 11bit 500k", description: "CAN padrão" },
  { value: "7", label: "ISO 15765-4 CAN 29bit 500k", description: "CAN estendido" },
  { value: "8", label: "ISO 15765-4 CAN 11bit 250k", description: "CAN lento" },
  { value: "9", label: "ISO 15765-4 CAN 29bit 250k", description: "CAN estendido lento" },
] as const;

export function useOBDSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["obd-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("obd_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // Return defaults if no settings exist
      if (!data) {
        return {
          ...DEFAULT_OBD_SETTINGS,
          id: "",
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as OBDSettings;
      }

      return data as OBDSettings;
    },
    enabled: !!user?.id,
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: Partial<OBDSettings>) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("obd_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("obd_settings")
          .update(newSettings)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("obd_settings")
          .insert({
            user_id: user.id,
            ...DEFAULT_OBD_SETTINGS,
            ...newSettings,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obd-settings", user?.id] });
      toast.success("Configurações salvas");
    },
    onError: (error) => {
      toast.error("Erro ao salvar configurações: " + error.message);
    },
  });

  const resetToDefaults = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("obd_settings")
        .update(DEFAULT_OBD_SETTINGS)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obd-settings", user?.id] });
      toast.success("Configurações restauradas para o padrão");
    },
  });

  // Generate ELM327 ATST command
  const getATSTCommand = (value: number): string => {
    const hex = value.toString(16).toUpperCase().padStart(2, "0");
    return `ATST${hex}`;
  };

  // Check if protocol supports optimization
  const supportsOptimization = (protocol: string): boolean => {
    // CAN protocols (6, 7, 8, 9) support request optimization
    return ["6", "7", "8", "9"].includes(protocol);
  };

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    resetToDefaults,
    getATSTCommand,
    supportsOptimization,
    ATST_PRESETS,
    OBD_PROTOCOLS,
  };
}
