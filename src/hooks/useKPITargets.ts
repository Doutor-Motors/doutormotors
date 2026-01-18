import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KPITarget } from "@/components/admin/KPITargetEditor";
import { Json } from "@/integrations/supabase/types";

const DEFAULT_TARGETS: KPITarget[] = [
  { id: 'total-users', name: 'Usuários Totais', target: 1000, alertEnabled: true, alertThreshold: 50 },
  { id: 'pro-subscribers', name: 'Assinantes Pro', target: 100, alertEnabled: true, alertThreshold: 50 },
  { id: 'monthly-diagnostics', name: 'Diagnósticos/Mês', target: 5000, alertEnabled: true, alertThreshold: 50 },
  { id: 'monthly-recordings', name: 'Gravações/Mês', target: 2000, alertEnabled: false, alertThreshold: 50 },
  { id: 'daily-active', name: 'Usuários Ativos/Dia', target: 200, alertEnabled: true, alertThreshold: 30 },
];

const SETTINGS_KEY = 'kpi_targets';

export function useKPITargets() {
  const [targets, setTargets] = useState<KPITarget[]>(DEFAULT_TARGETS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTargets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();

      if (error) {
        console.error('Error fetching KPI targets:', error);
        return;
      }

      if (data?.value && Array.isArray(data.value)) {
        // Merge with defaults to ensure all fields exist
        const savedTargets = data.value as unknown as KPITarget[];
        const mergedTargets = DEFAULT_TARGETS.map(defaultTarget => {
          const saved = savedTargets.find(t => t.id === defaultTarget.id);
          return saved ? { ...defaultTarget, ...saved } : defaultTarget;
        });
        setTargets(mergedTargets);
      }
    } catch (error) {
      console.error('Error fetching KPI targets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const saveTargets = async (newTargets: KPITarget[]) => {
    // Check if setting exists
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    const jsonValue = newTargets as unknown as Json;

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: jsonValue,
          updated_at: new Date().toISOString()
        })
        .eq('key', SETTINGS_KEY);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('system_settings')
        .insert([{
          key: SETTINGS_KEY,
          value: jsonValue,
          category: 'kpi',
          description: 'KPI targets and alert settings'
        }]);

      if (error) throw error;
    }

    setTargets(newTargets);
  };

  const getTarget = (id: string): number => {
    return targets.find(t => t.id === id)?.target || 0;
  };

  const getAlertSettings = (id: string): { enabled: boolean; threshold: number } => {
    const target = targets.find(t => t.id === id);
    return {
      enabled: target?.alertEnabled || false,
      threshold: target?.alertThreshold || 50,
    };
  };

  return {
    targets,
    isLoading,
    saveTargets,
    getTarget,
    getAlertSettings,
    refetch: fetchTargets,
  };
}
