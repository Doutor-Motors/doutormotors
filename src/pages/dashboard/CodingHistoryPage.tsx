import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  History,
  Check,
  X,
  RotateCcw,
  Target,
  Settings2,
  Zap,
  Camera,
  TrendingUp,
  Clock,
  Activity,
  FlaskConical,
} from 'lucide-react';
import { useCodingHistory, CodingExecution } from '@/hooks/useCodingHistory';
import { RISK_LEVEL_CONFIG, CodingRiskLevel } from '@/services/obd/codingFunctions';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS: Record<string, typeof RotateCcw> = {
  adaptation_reset: RotateCcw,
  calibration: Target,
  module_config: Settings2,
  output_test: Zap,
  freeze_frame: Camera,
};

const CATEGORY_LABELS: Record<string, string> = {
  adaptation_reset: 'Reset de Adaptações',
  calibration: 'Calibração',
  module_config: 'Configuração',
  output_test: 'Teste de Atuadores',
  freeze_frame: 'Freeze Frame',
};

export default function CodingHistoryPage() {
  const { history, isLoading, getStats } = useCodingHistory();
  const stats = getStats();

  const getRiskBadge = (riskLevel: string) => {
    const config = RISK_LEVEL_CONFIG[riskLevel as CodingRiskLevel];
    if (!config) return <Badge variant="outline">{riskLevel}</Badge>;
    
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category] || Settings2;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Histórico de Coding
            </h1>
            <p className="text-muted-foreground">
              Registro de todas as funções de coding executadas
            </p>
          </div>
          <Link to="/dashboard/coding">
            <Button>
              <Settings2 className="h-4 w-4 mr-2" />
              Funções de Coding
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.totalExecutions}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sucesso</p>
                  <p className="text-2xl font-bold text-green-500">{stats.successfulExecutions}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                  <p className="text-2xl font-bold text-red-500">{stats.failedExecutions}</p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
                  <p className="text-2xl font-bold text-primary">{stats.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Most Used & Category Breakdown */}
        {stats.mostUsedFunction && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Função Mais Usada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{stats.mostUsedFunction.name}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.mostUsedFunction.count} execuções
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                    <Badge key={category} variant="secondary" className="gap-1">
                      {getCategoryIcon(category)}
                      {CATEGORY_LABELS[category] || category}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Execuções Recentes</CardTitle>
            <CardDescription>Últimas 50 funções executadas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma execução registrada ainda</p>
                <Link to="/dashboard/coding">
                  <Button variant="outline" className="mt-4">
                    Executar Funções de Coding
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Função</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((execution: CodingExecution) => (
                      <TableRow key={execution.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{execution.function_name}</p>
                            {execution.is_simulated && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Simulado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(execution.category)}
                            <span className="text-sm">
                              {CATEGORY_LABELS[execution.category] || execution.category}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(execution.risk_level)}
                        </TableCell>
                        <TableCell>
                          {execution.success ? (
                            <Badge className="bg-green-500/20 text-green-500 border-0">
                              <Check className="h-3 w-3 mr-1" />
                              Sucesso
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <X className="h-3 w-3 mr-1" />
                              Falha
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {execution.duration_ms ? `${execution.duration_ms}ms` : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(execution.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
