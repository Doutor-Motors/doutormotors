import { useState, useEffect } from "react";
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  HardDrive,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  getCacheStats, 
  clearAllCache, 
  cleanExpiredCache 
} from "@/services/solutions/cache";
import { useNotifications } from "@/hooks/useNotifications";

interface CacheStats {
  totalEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
  totalSize: string;
}

const CacheStatsPanel = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { notifySuccess, notifyInfo } = useNotifications();

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearCache = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja limpar todo o cache de soluções? As soluções serão buscadas novamente quando necessário."
    );

    if (!confirmed) return;

    setIsClearing(true);
    try {
      await clearAllCache();
      notifySuccess("Cache limpo!", "Todas as soluções em cache foram removidas.");
      await loadStats();
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCleanExpired = async () => {
    setIsCleaning(true);
    try {
      const deletedCount = await cleanExpiredCache();
      notifyInfo(
        "Limpeza concluída", 
        deletedCount > 0 
          ? `${deletedCount} entradas expiradas removidas.`
          : "Nenhuma entrada expirada encontrada."
      );
      await loadStats();
    } catch (error) {
      console.error("Erro ao limpar expirados:", error);
    } finally {
      setIsCleaning(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Estimativa de uso (máx 100 entradas como referência)
  const usagePercentage = stats ? Math.min((stats.totalEntries / 100) * 100, 100) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-chakra uppercase flex items-center gap-2">
          <Database className="w-5 h-5" />
          Cache de Soluções
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {stats?.totalEntries || 0}
            </p>
            <p className="text-xs text-muted-foreground">Soluções Salvas</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <HardDrive className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {stats?.totalSize || "0 KB"}
            </p>
            <p className="text-xs text-muted-foreground">Espaço Usado</p>
          </div>
        </div>

        {/* Usage Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uso do Cache</span>
            <span className="font-medium">{Math.round(usagePercentage)}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Soluções são mantidas por 30 dias
          </p>
        </div>

        {/* Date Info */}
        {stats && stats.totalEntries > 0 && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mais antiga
              </span>
              <Badge variant="secondary">
                {formatDate(stats.oldestEntry)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mais recente
              </span>
              <Badge variant="secondary">
                {formatDate(stats.newestEntry)}
              </Badge>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats && stats.totalEntries === 0 && (
          <div className="text-center py-4">
            <Database className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Nenhuma solução em cache ainda.
            </p>
            <p className="text-xs text-muted-foreground">
              As soluções são salvas automaticamente quando visualizadas.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanExpired}
            disabled={isCleaning || !stats?.totalEntries}
            className="flex-1 gap-2"
          >
            {isCleaning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Limpar Expirados
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
            disabled={isClearing || !stats?.totalEntries}
            className="flex-1 gap-2"
          >
            {isClearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Limpar Tudo
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          O cache local permite acesso offline às soluções já visualizadas.
        </p>
      </CardContent>
    </Card>
  );
};

export default CacheStatsPanel;
