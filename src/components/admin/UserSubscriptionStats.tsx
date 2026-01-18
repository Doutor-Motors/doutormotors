import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { CreditCard } from 'lucide-react';

interface SubscriptionStats {
  basic: number;
  pro: number;
  total: number;
}

interface UserSubscriptionStatsProps {
  stats: SubscriptionStats;
}

const COLORS = ['hsl(var(--muted-foreground))', 'hsl(var(--primary))'];

export function UserSubscriptionStats({ stats }: UserSubscriptionStatsProps) {
  const data = [
    { name: 'Basic', value: stats.basic, fill: COLORS[0] },
    { name: 'Pro', value: stats.pro, fill: COLORS[1] },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / stats.total) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} usuários ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Assinaturas
        </CardTitle>
        <CardDescription>Distribuição de planos</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.total === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Nenhuma assinatura registrada
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{stats.basic}</p>
                <p className="text-sm text-muted-foreground">Plano Basic</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.pro}</p>
                <p className="text-sm text-muted-foreground">Plano Pro</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default UserSubscriptionStats;
