import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CodingFunctionResult, CodingFunction } from '@/services/obd/codingFunctions';

export interface CodingExecution {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  function_id: string;
  function_name: string;
  category: string;
  risk_level: string;
  success: boolean;
  message: string | null;
  details: string | null;
  raw_responses: string[];
  duration_ms: number | null;
  is_simulated: boolean;
  created_at: string;
}

export function useCodingHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch execution history
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['coding-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('coding_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching coding history:', error);
        throw error;
      }

      return (data as CodingExecution[]) || [];
    },
    enabled: !!user?.id,
  });

  // Save execution mutation
  const saveExecutionMutation = useMutation({
    mutationFn: async ({
      func,
      result,
      vehicleId,
      isSimulated,
    }: {
      func: CodingFunction;
      result: CodingFunctionResult;
      vehicleId?: string;
      isSimulated: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('coding_executions')
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId || null,
          function_id: func.id,
          function_name: func.name,
          category: func.category,
          risk_level: func.riskLevel,
          success: result.success,
          message: result.message,
          details: result.details || null,
          raw_responses: result.rawResponses,
          duration_ms: result.duration,
          is_simulated: isSimulated,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-history', user?.id] });
    },
  });

  // Get statistics
  const getStats = () => {
    if (!history || history.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        successRate: 0,
        mostUsedFunction: null,
        categoryBreakdown: {} as Record<string, number>,
      };
    }

    const successfulExecutions = history.filter(h => h.success).length;
    const failedExecutions = history.length - successfulExecutions;

    // Count by function
    const functionCounts: Record<string, number> = {};
    history.forEach(h => {
      functionCounts[h.function_name] = (functionCounts[h.function_name] || 0) + 1;
    });

    const mostUsedFunction = Object.entries(functionCounts)
      .sort((a, b) => b[1] - a[1])[0];

    // Count by category
    const categoryBreakdown: Record<string, number> = {};
    history.forEach(h => {
      categoryBreakdown[h.category] = (categoryBreakdown[h.category] || 0) + 1;
    });

    return {
      totalExecutions: history.length,
      successfulExecutions,
      failedExecutions,
      successRate: Math.round((successfulExecutions / history.length) * 100),
      mostUsedFunction: mostUsedFunction ? {
        name: mostUsedFunction[0],
        count: mostUsedFunction[1],
      } : null,
      categoryBreakdown,
    };
  };

  return {
    history: history || [],
    isLoading,
    error,
    saveExecution: saveExecutionMutation.mutateAsync,
    isSaving: saveExecutionMutation.isPending,
    getStats,
  };
}
