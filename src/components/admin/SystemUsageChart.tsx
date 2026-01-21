import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface DailyUsage {
  date: string;
  diagnostics: number;
  coding: number;
  recordings: number;
  ai: number;
  total: number;
}

interface SystemUsageChartProps {
  data: DailyUsage[];
  variant?: 'area' | 'bar';
  height?: number;
}

export function SystemUsageChart({ data, variant = 'area', height = 350 }: SystemUsageChartProps) {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      dateLabel: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Uso do Sistema
          </CardTitle>
          <CardDescription>Tendências de uso nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Nenhum dado disponível ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Uso do Sistema
        </CardTitle>
        <CardDescription>Tendências de uso nos últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {variant === 'area' ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDiagnostics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRecordings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280, 87%, 55%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(280, 87%, 55%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="dateLabel" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickMargin={8}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="diagnostics" 
                name="Diagnósticos"
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorDiagnostics)" 
              />
              <Area 
                type="monotone" 
                dataKey="coding" 
                name="Coding"
                stroke="hsl(217, 91%, 60%)" 
                fillOpacity={1} 
                fill="url(#colorCoding)" 
              />
              <Area 
                type="monotone" 
                dataKey="recordings" 
                name="Gravações"
                stroke="hsl(142, 76%, 36%)" 
                fillOpacity={1} 
                fill="url(#colorRecordings)" 
              />
              <Area 
                type="monotone" 
                dataKey="ai" 
                name="IA"
                stroke="hsl(280, 87%, 55%)" 
                fillOpacity={1} 
                fill="url(#colorAI)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="dateLabel" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickMargin={8}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="diagnostics" name="Diagnósticos" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="coding" name="Coding" fill="hsl(217, 91%, 60%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="recordings" name="Gravações" fill="hsl(142, 76%, 36%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="ai" name="IA" fill="hsl(280, 87%, 55%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default SystemUsageChart;
