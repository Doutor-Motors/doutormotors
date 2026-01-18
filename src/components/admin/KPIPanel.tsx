import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  TrendingUp, 
  Activity, 
  Zap,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  unit?: string;
  icon: typeof Target;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

interface KPIPanelProps {
  totalUsers: number;
  proUsers: number;
  monthlyDiagnostics: number;
  monthlyRecordings: number;
  dailyActiveUsers?: number;
}

export function KPIPanel({ 
  totalUsers, 
  proUsers, 
  monthlyDiagnostics, 
  monthlyRecordings,
  dailyActiveUsers = 0 
}: KPIPanelProps) {
  // Metas configuráveis do sistema
  const kpiMetrics: KPIMetric[] = [
    {
      id: 'total-users',
      name: 'Usuários Totais',
      current: totalUsers,
      target: 1000,
      icon: Users,
      color: 'hsl(var(--chart-1))',
      trend: 'up',
      trendValue: 12
    },
    {
      id: 'pro-subscribers',
      name: 'Assinantes Pro',
      current: proUsers,
      target: 100,
      icon: Trophy,
      color: 'hsl(var(--chart-2))',
      trend: 'up',
      trendValue: 8
    },
    {
      id: 'monthly-diagnostics',
      name: 'Diagnósticos/Mês',
      current: monthlyDiagnostics,
      target: 5000,
      icon: Activity,
      color: 'hsl(var(--chart-3))',
      trend: 'stable',
      trendValue: 0
    },
    {
      id: 'monthly-recordings',
      name: 'Gravações/Mês',
      current: monthlyRecordings,
      target: 2000,
      icon: Zap,
      color: 'hsl(var(--chart-4))',
      trend: 'up',
      trendValue: 15
    },
    {
      id: 'daily-active',
      name: 'Usuários Ativos/Dia',
      current: dailyActiveUsers,
      target: 200,
      icon: TrendingUp,
      color: 'hsl(var(--chart-5))',
      trend: 'down',
      trendValue: 5
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return { label: 'Meta Atingida', variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600' };
    } else if (percentage >= 75) {
      return { label: 'Quase Lá', variant: 'secondary' as const, className: 'bg-yellow-500 hover:bg-yellow-600 text-black' };
    } else if (percentage >= 50) {
      return { label: 'Em Progresso', variant: 'outline' as const, className: '' };
    } else {
      return { label: 'Inicial', variant: 'destructive' as const, className: '' };
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const overallProgress = kpiMetrics.reduce((acc, metric) => {
    return acc + getProgressPercentage(metric.current, metric.target);
  }, 0) / kpiMetrics.length;

  return (
    <div className="space-y-6">
      {/* Header com progresso geral */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Metas & KPIs</CardTitle>
                <CardDescription>Progresso geral do sistema</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{overallProgress.toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground">Meta Geral</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Grid de KPIs individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((metric) => {
          const percentage = getProgressPercentage(metric.current, metric.target);
          const status = getStatusBadge(percentage);
          const Icon = metric.icon;

          return (
            <Card key={metric.id} className="relative overflow-hidden">
              {/* Indicador de cor no topo */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: metric.color }}
              />
              
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      <Icon 
                        className="w-4 h-4" 
                        style={{ color: metric.color }}
                      />
                    </div>
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={status.variant}
                    className={cn("text-xs", status.className)}
                  >
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Valores */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold">{metric.current.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm ml-1">
                      / {metric.target.toLocaleString()}
                    </span>
                  </div>
                  {metric.trend && metric.trendValue !== undefined && (
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(metric.trend)}
                      <span className={cn(
                        metric.trend === 'up' && 'text-green-500',
                        metric.trend === 'down' && 'text-red-500',
                        metric.trend === 'stable' && 'text-muted-foreground'
                      )}>
                        {metric.trendValue}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Barra de progresso */}
                <div className="space-y-1">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{
                      '--progress-background': metric.color,
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}% da meta</span>
                    <span>Faltam {Math.max(0, metric.target - metric.current).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold text-green-500">
                {kpiMetrics.filter(m => getProgressPercentage(m.current, m.target) >= 100).length}
              </div>
              <p className="text-sm text-muted-foreground">Metas Atingidas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-500/10">
              <div className="text-2xl font-bold text-yellow-500">
                {kpiMetrics.filter(m => {
                  const p = getProgressPercentage(m.current, m.target);
                  return p >= 75 && p < 100;
                }).length}
              </div>
              <p className="text-sm text-muted-foreground">Quase Lá</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10">
              <div className="text-2xl font-bold text-blue-500">
                {kpiMetrics.filter(m => {
                  const p = getProgressPercentage(m.current, m.target);
                  return p >= 50 && p < 75;
                }).length}
              </div>
              <p className="text-sm text-muted-foreground">Em Progresso</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10">
              <div className="text-2xl font-bold text-red-500">
                {kpiMetrics.filter(m => getProgressPercentage(m.current, m.target) < 50).length}
              </div>
              <p className="text-sm text-muted-foreground">Atenção</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
