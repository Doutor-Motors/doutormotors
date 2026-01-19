import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, isWithinInterval, startOfDay, endOfDay, subDays, subMonths } from 'date-fns';
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
  Search,
  Filter,
  CalendarDays,
  RefreshCw,
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

const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'today', label: 'Hoje' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: '3months', label: 'Últimos 3 meses' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'success', label: 'Sucesso' },
  { value: 'failure', label: 'Falha' },
];

export default function CodingHistoryPage() {
  const { history, isLoading, getStats } = useCodingHistory();
  const stats = getStats();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Get available categories from history
  const availableCategories = useMemo(() => {
    const categories = new Set(history.map(h => h.category));
    return Array.from(categories);
  }, [history]);

  // Filter logic
  const filteredHistory = useMemo(() => {
    return history.filter((execution) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          execution.function_name.toLowerCase().includes(query) ||
          execution.function_id.toLowerCase().includes(query) ||
          (execution.message && execution.message.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && execution.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'success' && !execution.success) return false;
        if (statusFilter === 'failure' && execution.success) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const executionDate = new Date(execution.created_at);
        const now = new Date();
        
        let startDate: Date;
        switch (dateFilter) {
          case 'today':
            startDate = startOfDay(now);
            break;
          case '7days':
            startDate = subDays(now, 7);
            break;
          case '30days':
            startDate = subDays(now, 30);
            break;
          case '3months':
            startDate = subMonths(now, 3);
            break;
          default:
            startDate = new Date(0);
        }

        if (!isWithinInterval(executionDate, { start: startDate, end: endOfDay(now) })) {
          return false;
        }
      }

      return true;
    });
  }, [history, searchQuery, categoryFilter, statusFilter, dateFilter]);

  // Filtered stats
  const filteredStats = useMemo(() => {
    const total = filteredHistory.length;
    const success = filteredHistory.filter(h => h.success).length;
    const failure = total - success;
    return {
      total,
      success,
      failure,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
    };
  }, [filteredHistory]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Filters Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 hover:bg-muted hover:text-foreground">
                  <RefreshCw className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar função..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(cat)}
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mostrando {filteredHistory.length} de {history.length} resultados</span>
                {filteredStats.total > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {filteredStats.successRate}% sucesso
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Execuções {hasActiveFilters ? 'Filtradas' : 'Recentes'}</CardTitle>
            <CardDescription>
              {hasActiveFilters 
                ? `${filteredHistory.length} resultado${filteredHistory.length !== 1 ? 's' : ''} encontrado${filteredHistory.length !== 1 ? 's' : ''}`
                : 'Últimas 50 funções executadas'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {hasActiveFilters ? (
                  <>
                    <p>Nenhum resultado encontrado com os filtros aplicados</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  </>
                ) : (
                  <>
                    <p>Nenhuma execução registrada ainda</p>
                    <Link to="/dashboard/coding">
                      <Button variant="outline" className="mt-4">
                        Executar Funções de Coding
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
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
                    {filteredHistory.map((execution: CodingExecution) => (
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
                            <span className="text-sm hidden sm:inline">
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
