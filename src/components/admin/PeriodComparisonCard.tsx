import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Activity, Database, Users } from 'lucide-react';

interface PeriodData {
  diagnostics: number;
  recordings: number;
  newUsers: number;
}

interface PeriodComparisonCardProps {
  currentMonth: PeriodData;
  previousMonth: PeriodData;
  currentMonthLabel?: string;
  previousMonthLabel?: string;
}

interface MetricRowProps {
  label: string;
  current: number;
  previous: number;
  icon: typeof Activity;
}

function MetricRow({ label, current, previous, icon: Icon }: MetricRowProps) {
  const variation = previous === 0 
    ? (current > 0 ? 100 : 0)
    : ((current - previous) / previous) * 100;
  
  const isPositive = variation > 0;
  const isNeutral = variation === 0;

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">
            {previous} → {current}
          </p>
        </div>
      </div>
      <Badge 
        variant={isNeutral ? 'secondary' : isPositive ? 'default' : 'destructive'}
        className="gap-1"
      >
        {isNeutral ? (
          <Minus className="h-3 w-3" />
        ) : isPositive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {isNeutral ? '0%' : `${isPositive ? '+' : ''}${variation.toFixed(1)}%`}
      </Badge>
    </div>
  );
}

export function PeriodComparisonCard({ 
  currentMonth, 
  previousMonth,
  currentMonthLabel = 'Mês Atual',
  previousMonthLabel = 'Mês Anterior',
}: PeriodComparisonCardProps) {
  const totalCurrent = currentMonth.diagnostics + currentMonth.recordings + currentMonth.newUsers;
  const totalPrevious = previousMonth.diagnostics + previousMonth.recordings + previousMonth.newUsers;
  const overallVariation = totalPrevious === 0 
    ? (totalCurrent > 0 ? 100 : 0)
    : ((totalCurrent - totalPrevious) / totalPrevious) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Comparativo de Períodos
            </CardTitle>
            <CardDescription>
              {previousMonthLabel} vs {currentMonthLabel}
            </CardDescription>
          </div>
          <Badge variant={overallVariation >= 0 ? 'default' : 'destructive'} className="gap-1">
            {overallVariation >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {overallVariation >= 0 ? '+' : ''}{overallVariation.toFixed(1)}% geral
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <MetricRow 
          label="Diagnósticos"
          current={currentMonth.diagnostics}
          previous={previousMonth.diagnostics}
          icon={Activity}
        />
        <MetricRow 
          label="Gravações de Dados"
          current={currentMonth.recordings}
          previous={previousMonth.recordings}
          icon={Database}
        />
        <MetricRow 
          label="Novos Usuários"
          current={currentMonth.newUsers}
          previous={previousMonth.newUsers}
          icon={Users}
        />
      </CardContent>
    </Card>
  );
}

export default PeriodComparisonCard;
