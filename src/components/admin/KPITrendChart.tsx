import { useMemo } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip,
  XAxis,
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KPITrendChartProps {
  data: { date: string; value: number }[];
  color: string;
  height?: number;
}

export function KPITrendChart({ data, color, height = 60 }: KPITrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-xs text-muted-foreground"
        style={{ height }}
      >
        Sem dados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          hide 
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelFormatter={(label) => {
            try {
              return format(new Date(label), "dd MMM", { locale: ptBR });
            } catch {
              return label;
            }
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Valor']}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Hook to generate mock historical data for demo purposes
// In production, this would fetch from database
export function useKPIHistoricalData(kpiId: string, currentValue: number, days: number = 14) {
  return useMemo(() => {
    const data: { date: string; value: number }[] = [];
    
    // Generate realistic historical data based on current value
    let baseValue = currentValue * 0.7; // Start at 70% of current
    const dailyGrowth = (currentValue - baseValue) / days;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      // Add some random variation
      const variation = (Math.random() - 0.5) * (currentValue * 0.1);
      const value = Math.max(0, Math.round(baseValue + variation));
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        value,
      });
      
      baseValue += dailyGrowth;
    }
    
    // Ensure last value matches current
    if (data.length > 0) {
      data[data.length - 1].value = currentValue;
    }
    
    return data;
  }, [kpiId, currentValue, days]);
}
