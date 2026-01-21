import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUsageTracking, UsageType, USAGE_LIMITS } from '@/hooks/useUsageTracking';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Activity,
  Code2,
  Database,
  Sparkles,
  Crown,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const USAGE_CONFIG: Record<UsageType, { label: string; icon: typeof Activity }> = {
  diagnostics: { label: 'Diagnósticos', icon: Activity },
  coding_executions: { label: 'Funções de Coding', icon: Code2 },
  data_recordings: { label: 'Gravações de Dados', icon: Database },
  ai_queries: { label: 'Consultas IA', icon: Sparkles },
};

interface UsageDisplayProps {
  compact?: boolean;
  showUpgradeLink?: boolean;
}

export function UsageDisplay({ compact = false, showUpgradeLink = true }: UsageDisplayProps) {
  const { 
    getUsageCount, 
    getLimit, 
    getRemainingUses, 
    getUsagePercentage,
    isLoading,
    currentMonthYear,
  } = useUsageTracking();
  const { currentPlan, isPro } = useSubscription();

  const usageTypes: UsageType[] = ['diagnostics', 'coding_executions', 'data_recordings', 'ai_queries'];

  // Check if any usage is at or near limit
  const hasLowUsage = usageTypes.some(type => {
    const remaining = getRemainingUses(type);
    return remaining !== 'unlimited' && remaining <= 1;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-2 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {usageTypes.map(type => {
          const config = USAGE_CONFIG[type];
          const count = getUsageCount(type);
          const limit = getLimit(type);
          const remaining = getRemainingUses(type);
          const percentage = getUsagePercentage(type);
          const Icon = config.icon;

          const isUnlimited = limit === -1;
          const isLow = !isUnlimited && remaining !== 'unlimited' && (remaining as number) <= 1;

          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {config.label}
                </span>
                <span className={isLow ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {isUnlimited ? (
                    <Badge variant="secondary" className="text-xs">∞</Badge>
                  ) : (
                    `${count}/${limit}`
                  )}
                </span>
              </div>
              {!isUnlimited && (
                <Progress 
                  value={percentage} 
                  className={`h-1.5 ${percentage >= 80 ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Uso Mensal
            </CardTitle>
            <CardDescription>
              Período: {currentMonthYear.split('-').reverse().join('/')}
            </CardDescription>
          </div>
          <Badge variant={isPro ? 'default' : 'secondary'}>
            {isPro && <Crown className="h-3 w-3 mr-1" />}
            Plano {currentPlan === 'pro' ? 'Pro' : 'Basic'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasLowUsage && !isPro && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Limite Próximo</AlertTitle>
            <AlertDescription>
              Você está próximo de atingir o limite de uso mensal.
              {showUpgradeLink && (
                <Link to="/dashboard/upgrade" className="ml-1 underline">
                  Faça upgrade para Pro
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        {usageTypes.map(type => {
          const config = USAGE_CONFIG[type];
          const count = getUsageCount(type);
          const limit = getLimit(type);
          const remaining = getRemainingUses(type);
          const percentage = getUsagePercentage(type);
          const Icon = config.icon;

          const isUnlimited = limit === -1;
          const isLow = !isUnlimited && remaining !== 'unlimited' && (remaining as number) <= 1;

          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {config.label}
                </span>
                <span className={`text-sm ${isLow ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {isUnlimited ? (
                    <span className="flex items-center gap-1">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Ilimitado</Badge>
                    </span>
                  ) : (
                    <>
                      {count} / {limit} usado
                      {remaining !== 'unlimited' && remaining > 0 && (
                        <span className="ml-2 text-muted-foreground">
                          ({remaining} restante{(remaining as number) !== 1 ? 's' : ''})
                        </span>
                      )}
                    </>
                  )}
                </span>
              </div>
              {!isUnlimited && (
                <Progress 
                  value={percentage} 
                  className={`h-2 ${percentage >= 80 ? '[&>div]:bg-destructive' : percentage >= 60 ? '[&>div]:bg-yellow-500' : ''}`}
                />
              )}
            </div>
          );
        })}

        {!isPro && showUpgradeLink && (
          <div className="pt-4 border-t">
            <Link to="/dashboard/upgrade">
              <Button className="w-full gap-2">
                <Crown className="h-4 w-4" />
                Upgrade para Pro - Uso Ilimitado
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UsageDisplay;
