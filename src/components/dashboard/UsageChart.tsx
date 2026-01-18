import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsageTracking, UsageType, USAGE_LIMITS } from '@/hooks/useUsageTracking';
import { useSubscription } from '@/hooks/useSubscription';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Code2,
  Database,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

const USAGE_CONFIG: Record<UsageType, { label: string; color: string; icon: typeof Activity }> = {
  diagnostics: { label: 'Diagnósticos', color: 'hsl(var(--primary))', icon: Activity },
  coding_executions: { label: 'Coding', color: 'hsl(217, 91%, 60%)', icon: Code2 },
  data_recordings: { label: 'Gravações', color: 'hsl(142, 76%, 36%)', icon: Database },
  ai_queries: { label: 'IA', color: 'hsl(280, 87%, 55%)', icon: Sparkles },
};

const COLORS = ['hsl(var(--primary))', 'hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(280, 87%, 55%)'];

interface UsageChartProps {
  variant?: 'bar' | 'radial' | 'pie';
  showLegend?: boolean;
  height?: number;
}

export function UsageChart({ variant = 'radial', showLegend = true, height = 300 }: UsageChartProps) {
  const { 
    getUsageCount, 
    getLimit, 
    getUsagePercentage,
    currentMonthYear,
  } = useUsageTracking();
  const { currentPlan, isPro } = useSubscription();

  const usageTypes: UsageType[] = ['diagnostics', 'coding_executions', 'data_recordings', 'ai_queries'];

  // Prepare data for charts
  const barData = useMemo(() => {
    return usageTypes.map(type => {
      const config = USAGE_CONFIG[type];
      const count = getUsageCount(type);
      const limit = getLimit(type);
      const isUnlimited = limit === -1;
      
      return {
        name: config.label,
        usado: count,
        limite: isUnlimited ? count : limit,
        restante: isUnlimited ? 0 : Math.max(0, limit - count),
        percentual: getUsagePercentage(type),
        fill: config.color,
      };
    });
  }, [usageTypes, getUsageCount, getLimit, getUsagePercentage]);

  const radialData = useMemo(() => {
    return usageTypes.map((type, index) => {
      const config = USAGE_CONFIG[type];
      const percentage = getUsagePercentage(type);
      const limit = getLimit(type);
      const isUnlimited = limit === -1;
      
      return {
        name: config.label,
        value: isUnlimited ? 0 : percentage,
        fill: COLORS[index],
        isUnlimited,
      };
    }).reverse();
  }, [usageTypes, getUsagePercentage, getLimit]);

  const pieData = useMemo(() => {
    return usageTypes.map((type, index) => {
      const config = USAGE_CONFIG[type];
      const count = getUsageCount(type);
      
      return {
        name: config.label,
        value: count || 0,
        fill: COLORS[index],
      };
    }).filter(d => d.value > 0);
  }, [usageTypes, getUsageCount]);

  // Calculate alerts (usage > 80%)
  const alerts = useMemo(() => {
    return usageTypes.filter(type => {
      const percentage = getUsagePercentage(type);
      const limit = getLimit(type);
      return limit !== -1 && percentage >= 80;
    }).map(type => USAGE_CONFIG[type].label);
  }, [usageTypes, getUsagePercentage, getLimit]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          {data.isUnlimited ? (
            <p className="text-sm text-primary">Ilimitado</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Usado: <span className="font-medium text-foreground">{data.usado || data.value}</span>
              </p>
              {data.limite && (
                <p className="text-sm text-muted-foreground">
                  Limite: <span className="font-medium text-foreground">{data.limite}</span>
                </p>
              )}
              {data.percentual !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {data.percentual.toFixed(0)}% utilizado
                </p>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (variant) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="usado" stackId="a" fill="hsl(var(--primary))" name="Usado" radius={[0, 4, 4, 0]} />
              <Bar dataKey="restante" stackId="a" fill="hsl(var(--muted))" name="Restante" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        if (pieData.length === 0) {
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Nenhum uso registrado ainda</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radial':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="90%" 
              barSize={20}
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                cornerRadius={10}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend 
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />}
            </RadialBarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Consumo Mensal
            </CardTitle>
            <CardDescription>
              {currentMonthYear.split('-').reverse().join('/')} • Plano {isPro ? 'Pro' : 'Basic'}
            </CardDescription>
          </div>
          {alerts.length > 0 && !isPro && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {alerts.length} alerta{alerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        {/* Legend with icons for radial chart */}
        {variant === 'radial' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            {usageTypes.map((type, index) => {
              const config = USAGE_CONFIG[type];
              const count = getUsageCount(type);
              const limit = getLimit(type);
              const percentage = getUsagePercentage(type);
              const isUnlimited = limit === -1;
              const Icon = config.icon;
              
              return (
                <div key={type} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: COLORS[index] }} 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium truncate">{config.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isUnlimited ? '∞' : `${count}/${limit}`}
                      {!isUnlimited && percentage >= 80 && (
                        <span className="text-destructive ml-1">!</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UsageChart;
