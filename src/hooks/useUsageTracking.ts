import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { useRef, useCallback } from 'react';

export type UsageType = 'diagnostics' | 'coding_executions' | 'data_recordings' | 'ai_queries';

interface UsageTracking {
  id: string;
  user_id: string;
  month_year: string;
  diagnostics_count: number;
  coding_executions_count: number;
  data_recordings_count: number;
  ai_queries_count: number;
  alerts_sent: string[];
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

const ALERT_THRESHOLD = 80; // Send alert when usage reaches 80%

function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Helper function to get limit (can be used outside hook context)
function getLimitForPlan(type: UsageType, plan: string): number {
  const planLimits = USAGE_LIMITS[plan as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.basic;
  
  const limitMap: Record<UsageType, keyof typeof planLimits> = {
    diagnostics: 'diagnostics',
    coding_executions: 'coding_executions',
    data_recordings: 'data_recordings',
    ai_queries: 'ai_queries',
  };

  return planLimits[limitMap[type]];
}

export function useUsageTracking() {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const queryClient = useQueryClient();
  const currentMonthYear = getCurrentMonthYear();
  const alertsSentRef = useRef<Set<string>>(new Set());

  // Get limit for a type based on current plan
  const getLimit = useCallback((type: UsageType): number => {
    return getLimitForPlan(type, currentPlan || 'basic');
  }, [currentPlan]);

  // Fetch current usage
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage-tracking', user?.id, currentMonthYear],
    queryFn: async () => {
      if (!user?.id) return null;

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

      // Update local tracking of sent alerts
      if (data && (data as any).alerts_sent) {
        alertsSentRef.current = new Set((data as any).alerts_sent);
      }

      return data as unknown as UsageTracking | null;
    },
    enabled: !!user?.id,
  });

  // Send usage alert email
  const sendUsageAlert = useCallback(async (type: UsageType, count: number, limit: number, percentage: number) => {
    if (!user?.id) return;
    
    // Don't send for Pro users (unlimited)
    if (currentPlan === 'pro') return;
    
    // Only send once per type per month
    const alertKey = `${type}_${ALERT_THRESHOLD}`;
    if (alertsSentRef.current.has(alertKey)) return;
    
    // Only send when reaching threshold
    if (percentage < ALERT_THRESHOLD) return;

    try {
      console.log('Sending usage alert for', type, 'at', percentage, '%');
      
      const { error } = await supabase.functions.invoke('send-usage-alert', {
        body: {
          userId: user.id,
          usageType: type,
          currentCount: count,
          limit,
          percentage: Math.round(percentage),
        },
      });

      if (!error) {
        // Mark alert as sent locally
        alertsSentRef.current.add(alertKey);
        
        // Update database to track sent alerts
        const alertsSent = Array.from(alertsSentRef.current);
        await supabase
          .from('usage_tracking' as any)
          .update({ alerts_sent: alertsSent })
          .eq('user_id', user.id)
          .eq('month_year', currentMonthYear);
      }
    } catch (err) {
      console.error('Failed to send usage alert:', err);
    }
  }, [user?.id, currentPlan, currentMonthYear]);

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

      let newCount: number;

      if (existing) {
        // Update existing record
        const currentValue = (existing as any)[column] || 0;
        newCount = currentValue + 1;
        const { error } = await supabase
          .from('usage_tracking' as any)
          .update({ [column]: newCount })
          .eq('id', (existing as any).id);

        if (error) throw error;
      } else {
        // Insert new record
        newCount = 1;
        const { error } = await supabase
          .from('usage_tracking' as any)
          .insert({
            user_id: user.id,
            month_year: currentMonthYear,
            [column]: 1,
            alerts_sent: [],
          });

        if (error) throw error;
      }

      // Check if we need to send an alert
      const plan = currentPlan || 'basic';
      const limit = getLimitForPlan(type, plan);
      if (limit !== -1) {
        const percentage = (newCount / limit) * 100;
        if (percentage >= ALERT_THRESHOLD) {
          // Send alert in background
          sendUsageAlert(type, newCount, limit, percentage);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-tracking', user?.id] });
    },
  });

  // Get current usage count for a type
  const getUsageCount = useCallback((type: UsageType): number => {
    if (!usage) return 0;
    
    const columnMap: Record<UsageType, keyof UsageTracking> = {
      diagnostics: 'diagnostics_count',
      coding_executions: 'coding_executions_count',
      data_recordings: 'data_recordings_count',
      ai_queries: 'ai_queries_count',
    };

    return (usage[columnMap[type]] as number) || 0;
  }, [usage]);

  // Check if user can use a feature (hasn't hit limit)
  const canUse = useCallback((type: UsageType): boolean => {
    const limit = getLimit(type);
    if (limit === -1) return true; // Unlimited
    
    const currentCount = getUsageCount(type);
    return currentCount < limit;
  }, [getLimit, getUsageCount]);

  // Get remaining uses
  const getRemainingUses = useCallback((type: UsageType): number | 'unlimited' => {
    const limit = getLimit(type);
    if (limit === -1) return 'unlimited';
    
    const currentCount = getUsageCount(type);
    return Math.max(0, limit - currentCount);
  }, [getLimit, getUsageCount]);

  // Get usage percentage
  const getUsagePercentage = useCallback((type: UsageType): number => {
    const limit = getLimit(type);
    if (limit === -1) return 0; // Show 0% for unlimited
    
    const currentCount = getUsageCount(type);
    return Math.min(100, (currentCount / limit) * 100);
  }, [getLimit, getUsageCount]);

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
