import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useChartPreferences, ChartType } from '@/hooks/useChartPreferences';
import { BarChart3, PieChart, Activity } from 'lucide-react';

const CHART_OPTIONS: { value: ChartType; label: string; description: string; icon: typeof BarChart3 }[] = [
  {
    value: 'radial',
    label: 'Radial',
    description: 'Barras circulares com visual moderno',
    icon: Activity,
  },
  {
    value: 'bar',
    label: 'Barras',
    description: 'Gráfico de barras horizontal tradicional',
    icon: BarChart3,
  },
  {
    value: 'pie',
    label: 'Pizza',
    description: 'Gráfico de pizza com setores',
    icon: PieChart,
  },
];

export function ChartPreferencesSection() {
  const { chartType, setChartType } = useChartPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-chakra uppercase flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Preferências de Gráfico
        </CardTitle>
        <CardDescription>
          Escolha como deseja visualizar os gráficos de uso no dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={chartType}
          onValueChange={(value) => setChartType(value as ChartType)}
          className="space-y-3"
        >
          {CHART_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                  chartType === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setChartType(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${chartType === option.value ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${chartType === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export default ChartPreferencesSection;
