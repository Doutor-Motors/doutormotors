import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export type UsageType = 'diagnostics' | 'coding_executions' | 'data_recordings' | 'ai_queries';

interface UsageTracking {
  id: string;
  user_id: string;
  month_year: string;
  diagnostics_count: number;
  coding_executions_count: number;
  data_recordings_count: number;
  ai_queries_count: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}

// Limits by plan type
export const USAGE_LIMITS = {
  basic: {
    diagnostics: 5,
    coding_executions: 3,
    data_recordings: 2,
    ai_queries: 10,
  },
  pro: {
    diagnostics: -1, // -1 = unlimited
    coding_executions: -1,
    data_recordings: -1,
    ai_queries: -1,
  },
} as const;

function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useUsageTracking() {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const queryClient = useQueryClient();
  const currentMonthYear = getCurrentMonthYear();

  // Fetch current usage
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage-tracking', user?.id, currentMonthYear],
    queryFn: async () => {
      if (!user?.id) return null;

      // Use raw query since table is new and not in types yet
      const { data, error } = await supabase
        .from('usage_tracking' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error);
        throw error;
      }

      return data as unknown as UsageTracking | null;
    },
    enabled: !!user?.id,
  });

  // Increment usage mutation
  const incrementUsageMutation = useMutation({
    mutationFn: async (type: UsageType) => {
      if (!user?.id) throw new Error('User not authenticated');

      const columnMap: Record<UsageType, string> = {
        diagnostics: 'diagnostics_count',
        coding_executions: 'coding_executions_count',
        data_recordings: 'data_recordings_count',
        ai_queries: 'ai_queries_count',
      };

      const column = columnMap[type];

      // Check if record exists for this month
      const { data: existing } = await supabase
        .from('usage_tracking' as any)
        .select('id, ' + column)
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const currentValue = (existing as any)[column] || 0;
        const { error } = await supabase
          .from('usage_tracking' as any)
          .update({ [column]: currentValue + 1 })
          .eq('id', (existing as any).id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('usage_tracking' as any)
          .insert({
            user_id: user.id,
            month_year: currentMonthYear,
            [column]: 1,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-tracking', user?.id] });
    },
  });

  // Get current usage count for a type
  const getUsageCount = (type: UsageType): number => {
    if (!usage) return 0;
    
    const columnMap: Record<UsageType, keyof UsageTracking> = {
      diagnostics: 'diagnostics_count',
      coding_executions: 'coding_executions_count',
      data_recordings: 'data_recordings_count',
      ai_queries: 'ai_queries_count',
    };

    return (usage[columnMap[type]] as number) || 0;
  };

  // Get limit for a type based on current plan
  const getLimit = (type: UsageType): number => {
    const plan = currentPlan || 'basic';
    const planLimits = USAGE_LIMITS[plan as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.basic;
    
    const limitMap: Record<UsageType, keyof typeof planLimits> = {
      diagnostics: 'diagnostics',
      coding_executions: 'coding_executions',
      data_recordings: 'data_recordings',
      ai_queries: 'ai_queries',
    };

    return planLimits[limitMap[type]];
  };

  // Check if user can use a feature (hasn't hit limit)
  const canUse = (type: UsageType): boolean => {
    const limit = getLimit(type);
    if (limit === -1) return true; // Unlimited
    
    const currentCount = getUsageCount(type);
    return currentCount < limit;
  };

  // Get remaining uses
  const getRemainingUses = (type: UsageType): number | 'unlimited' => {
    const limit = getLimit(type);
    if (limit === -1) return 'unlimited';
    
    const currentCount = getUsageCount(type);
    return Math.max(0, limit - currentCount);
  };

  // Get usage percentage
  const getUsagePercentage = (type: UsageType): number => {
    const limit = getLimit(type);
    if (limit === -1) return 0; // Show 0% for unlimited
    
    const currentCount = getUsageCount(type);
    return Math.min(100, (currentCount / limit) * 100);
  };

  return {
    usage,
    isLoading,
    incrementUsage: incrementUsageMutation.mutateAsync,
    isIncrementing: incrementUsageMutation.isPending,
    getUsageCount,
    getLimit,
    canUse,
    getRemainingUses,
    getUsagePercentage,
    currentMonthYear,
  };
}
