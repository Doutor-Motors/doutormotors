import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Trash2, 
  Download, 
  RefreshCw,
  Globe,
  Gauge,
  Phone,
  Lock,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  HardDrive,
  Sparkles,
  Clock,
  FileText,
  Video,
  Calendar,
  Play,
  FileDown
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  category: string;
  updated_at: string;
}

interface CacheStats {
  totalEntries: number;
  transcribedEntries: number;
  htmlFallbackEntries: number;
  expiredEntries: number;
  estimatedStorageKB: number;
  oldestEntry: string | null;
  newestEntry: string | null;
  recentEntries: Array<{
    id: string;
    video_url: string;
    youtube_video_id: string | null;
    transcription_used: boolean;
    vehicle_context: string | null;
    created_at: string;
    expires_at: string;
  }>;
}

interface ScheduleInfo {
  enabled: boolean;
  schedule: string;
  lastCleanup: { deletedCount: number; timestamp: string } | null;
  lastCleanupDate: string | null;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Cache management state
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loadingCache, setLoadingCache] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo | null>(null);
  const [runningCleanup, setRunningCleanup] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchCacheStats();
    fetchScheduleInfo();
  }, []);

  useEffect(() => {
    // Check if there are changes
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("category");

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach((setting: SystemSetting) => {
        settingsMap[setting.key] = setting.value;
      });

      setSettings(settingsMap);
      setOriginalSettings(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Update each changed setting
      for (const [key, value] of Object.entries(settings)) {
        if (settings[key] !== originalSettings[key]) {
          const { error } = await supabase
            .from("system_settings")
            .update({ value: JSON.stringify(value) })
            .eq("key", key);

          if (error) throw error;
        }
      }

      setOriginalSettings({ ...settings });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: vehicles } = await supabase.from("vehicles").select("*");
      const { data: diagnostics } = await supabase.from("diagnostics").select("*");
      const { data: diagnosticItems } = await supabase.from("diagnostic_items").select("*");
      const { data: tickets } = await supabase.from("support_tickets").select("*");

      const exportData = {
        exportDate: new Date().toISOString(),
        profiles,
        vehicles,
        diagnostics,
        diagnosticItems,
        tickets,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doutor-motors-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();

      toast.success("Backup exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Erro ao exportar dados");
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Cache limpo com sucesso!");
  };

  const handleClearDiagnostics = async () => {
    try {
      await supabase.from("diagnostic_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("diagnostics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      toast.success("Diagnósticos removidos com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover diagnósticos");
    }
  };

  // Cache management functions
  const fetchCacheStats = async () => {
    setLoadingCache(true);
    try {
      const { data, error } = await supabase.functions.invoke("cache-admin", {
        body: { action: "stats" },
      });

      if (error) throw error;
      
      if (data.success) {
        setCacheStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching cache stats:", error);
    } finally {
      setLoadingCache(false);
    }
  };

  const handleClearAllCache = async () => {
    setClearingCache(true);
    try {
      const { data, error } = await supabase.functions.invoke("cache-admin", {
        body: { action: "clear-all" },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success("Cache limpo com sucesso!");
        fetchCacheStats();
      } else {
        toast.error(data.error || "Erro ao limpar cache");
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Erro ao limpar cache");
    } finally {
      setClearingCache(false);
    }
  };

  const handleClearExpiredCache = async () => {
    setClearingCache(true);
    try {
      const { data, error } = await supabase.functions.invoke("cache-admin", {
        body: { action: "clear-expired" },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success(data.message);
        fetchCacheStats();
      } else {
        toast.error(data.error || "Erro ao limpar cache expirado");
      }
    } catch (error) {
      console.error("Error clearing expired cache:", error);
      toast.error("Erro ao limpar cache expirado");
    } finally {
      setClearingCache(false);
    }
  };

  const handleDeleteCacheEntry = async (entryId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("cache-admin", {
        body: { action: "delete-entry", entryId },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success("Entrada removida!");
        fetchCacheStats();
      } else {
        toast.error(data.error || "Erro ao remover entrada");
      }
    } catch (error) {
      console.error("Error deleting cache entry:", error);
      toast.error("Erro ao remover entrada");
    }
  };

  const handleExportCache = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("cache-admin", {
        body: { action: "export" },
      });

      if (error) throw error;
      
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cache-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Cache exportado: ${data.data.totalEntries} entradas`);
      } else {
        toast.error(data.error || "Erro ao exportar cache");
      }
    } catch (error) {
      console.error("Error exporting cache:", error);
      toast.error("Erro ao exportar cache");
    } finally {
      setExporting(false);
    }
  };

  const fetchScheduleInfo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("cache-admin", {
        body: { action: "schedule-info" },
      });

      if (error) throw error;
      
      if (data.success) {
        setScheduleInfo(data.data);
      }
    } catch (error) {
      console.error("Error fetching schedule info:", error);
    }
  };

  const handleRunScheduledCleanup = async () => {
    setRunningCleanup(true);
    try {
      const { data, error } = await supabase.functions.invoke("cache-admin", {
        body: { action: "run-scheduled-cleanup" },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success(data.message);
        fetchCacheStats();
        fetchScheduleInfo();
      } else {
        toast.error(data.error || "Erro ao executar limpeza");
      }
    } catch (error) {
      console.error("Error running cleanup:", error);
      toast.error("Erro ao executar limpeza agendada");
    } finally {
      setRunningCleanup(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVideoTitle = (url: string) => {
    // Extract meaningful part from URL
    const match = url.match(/\/video\/(\d+)_([^/]+)/);
    if (match) {
      return match[2].replace(/_/g, " ");
    }
    return url.slice(-50);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-chakra text-foreground">
              Configurações do Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar configurações globais da aplicação
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-500 border-orange-500">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Alterações não salvas
              </Badge>
            )}
            <Button 
              onClick={saveSettings} 
              disabled={!hasChanges || saving}
              className="font-chakra uppercase"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 gap-1">
            <TabsTrigger value="general" className="font-chakra text-xs">
              <Globe className="w-4 h-4 mr-1" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="security" className="font-chakra text-xs">
              <Shield className="w-4 h-4 mr-1" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-chakra text-xs">
              <Bell className="w-4 h-4 mr-1" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="obd" className="font-chakra text-xs">
              <Gauge className="w-4 h-4 mr-1" />
              OBD
            </TabsTrigger>
            <TabsTrigger value="limits" className="font-chakra text-xs">
              <Lock className="w-4 h-4 mr-1" />
              Limites
            </TabsTrigger>
            <TabsTrigger value="cache" className="font-chakra text-xs">
              <HardDrive className="w-4 h-4 mr-1" />
              Cache
            </TabsTrigger>
            <TabsTrigger value="system" className="font-chakra text-xs">
              <Database className="w-4 h-4 mr-1" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Informações da Aplicação
                  </CardTitle>
                  <CardDescription>
                    Configurações básicas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Aplicação</Label>
                    <Input
                      value={settings.app_name || ""}
                      onChange={(e) => updateSetting("app_name", e.target.value)}
                      placeholder="Nome da aplicação"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Versão do Sistema</Label>
                    <Input
                      value={settings.app_version || ""}
                      onChange={(e) => updateSetting("app_version", e.target.value)}
                      placeholder="1.0.0"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Informações de Contato
                  </CardTitle>
                  <CardDescription>
                    Dados de suporte exibidos para usuários
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email de Suporte</Label>
                    <Input
                      type="email"
                      value={settings.support_email || ""}
                      onChange={(e) => updateSetting("support_email", e.target.value)}
                      placeholder="suporte@exemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefone de Suporte</Label>
                    <Input
                      value={settings.support_phone || ""}
                      onChange={(e) => updateSetting("support_phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-dm-cadet/20">
              <CardHeader>
                <CardTitle className="font-chakra flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Controle de acesso e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      Modo de Manutenção
                      {settings.maintenance_mode && (
                        <Badge variant="destructive" className="text-xs">ATIVO</Badge>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquear acesso de usuários não-admin temporariamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode || false}
                    onCheckedChange={(checked) => updateSetting("maintenance_mode", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Novos Cadastros</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar registro de novos usuários
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_new_registrations !== false}
                    onCheckedChange={(checked) => updateSetting("allow_new_registrations", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exigir Verificação de Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Usuários precisam verificar email antes de acessar
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_email_verification !== false}
                    onCheckedChange={(checked) => updateSetting("require_email_verification", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Timeout de Sessão (minutos)</Label>
                  <p className="text-sm text-muted-foreground">
                    Tempo de inatividade antes de encerrar sessão
                  </p>
                  <Input
                    type="number"
                    value={settings.session_timeout_minutes || 60}
                    onChange={(e) => updateSetting("session_timeout_minutes", parseInt(e.target.value) || 60)}
                    min={5}
                    max={480}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar logs detalhados no console
                    </p>
                  </div>
                  <Switch
                    checked={settings.debug_mode || false}
                    onCheckedChange={(checked) => updateSetting("debug_mode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-dm-cadet/20">
              <CardHeader>
                <CardTitle className="font-chakra flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações do Sistema
                </CardTitle>
                <CardDescription>
                  Configure notificações globais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Sistema global de notificações por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications !== false}
                    onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sobre notificações</p>
                      <p className="text-sm text-muted-foreground">
                        Esta configuração afeta todo o sistema. Usuários individuais 
                        também podem gerenciar suas preferências de notificação.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OBD Settings */}
          <TabsContent value="obd" className="space-y-6">
            <Card className="border-dm-cadet/20">
              <CardHeader>
                <CardTitle className="font-chakra flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Configurações OBD
                </CardTitle>
                <CardDescription>
                  Parâmetros de conexão com dispositivos OBD2
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Timeout de Conexão (segundos)</Label>
                  <p className="text-sm text-muted-foreground">
                    Tempo máximo para estabelecer conexão com adaptador
                  </p>
                  <Input
                    type="number"
                    value={settings.obd_connection_timeout || 30}
                    onChange={(e) => updateSetting("obd_connection_timeout", parseInt(e.target.value) || 30)}
                    min={5}
                    max={120}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Tentativas de Reconexão</Label>
                  <p className="text-sm text-muted-foreground">
                    Número de tentativas em caso de falha
                  </p>
                  <Input
                    type="number"
                    value={settings.obd_retry_attempts || 3}
                    onChange={(e) => updateSetting("obd_retry_attempts", parseInt(e.target.value) || 3)}
                    min={1}
                    max={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Limits Settings */}
          <TabsContent value="limits" className="space-y-6">
            <Card className="border-dm-cadet/20">
              <CardHeader>
                <CardTitle className="font-chakra flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Limites do Sistema
                </CardTitle>
                <CardDescription>
                  Configure limites de uso por usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Máximo de Veículos por Usuário</Label>
                  <p className="text-sm text-muted-foreground">
                    Quantidade máxima de veículos que cada usuário pode cadastrar
                  </p>
                  <Input
                    type="number"
                    value={settings.max_vehicles_per_user || 10}
                    onChange={(e) => updateSetting("max_vehicles_per_user", parseInt(e.target.value) || 10)}
                    min={1}
                    max={100}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Histórico Máximo de Diagnósticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Número máximo de diagnósticos mantidos no histórico
                  </p>
                  <Input
                    type="number"
                    value={settings.max_diagnostics_history || 100}
                    onChange={(e) => updateSetting("max_diagnostics_history", parseInt(e.target.value) || 100)}
                    min={10}
                    max={1000}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cache Settings */}
          <TabsContent value="cache" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-dm-cadet/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Entradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {loadingCache ? <Loader2 className="w-5 h-5 animate-spin" /> : cacheStats?.totalEntries || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dm-cadet/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Transcrições IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {loadingCache ? <Loader2 className="w-5 h-5 animate-spin" /> : cacheStats?.transcribedEntries || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cacheStats?.htmlFallbackEntries || 0} usaram fallback HTML
                  </p>
                </CardContent>
              </Card>

              <Card className="border-dm-cadet/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Armazenamento Estimado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {loadingCache ? <Loader2 className="w-5 h-5 animate-spin" /> : `${cacheStats?.estimatedStorageKB || 0} KB`}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dm-cadet/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Entradas Expiradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-500">
                      {loadingCache ? <Loader2 className="w-5 h-5 animate-spin" /> : cacheStats?.expiredEntries || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cache ratio visualization */}
            {cacheStats && cacheStats.totalEntries > 0 && (
              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Taxa de Sucesso de Transcrição
                  </CardTitle>
                  <CardDescription>
                    Proporção de vídeos processados com transcrição IA vs. fallback HTML
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transcrição IA</span>
                      <span>{Math.round((cacheStats.transcribedEntries / cacheStats.totalEntries) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(cacheStats.transcribedEntries / cacheStats.totalEntries) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{cacheStats.transcribedEntries} com transcrição</span>
                      <span>{cacheStats.htmlFallbackEntries} com fallback HTML</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cache Actions */}
              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Gerenciar Cache
                  </CardTitle>
                  <CardDescription>
                    Limpar cache de transcrições de vídeo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={fetchCacheStats} 
                    className="w-full"
                    disabled={loadingCache}
                  >
                    {loadingCache ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Atualizar Estatísticas
                  </Button>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Limpar Entradas Expiradas</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove apenas entradas com cache expirado
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleClearExpiredCache} 
                      className="w-full"
                      disabled={clearingCache || (cacheStats?.expiredEntries || 0) === 0}
                    >
                      {clearingCache ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 mr-2" />
                      )}
                      Limpar {cacheStats?.expiredEntries || 0} Expiradas
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-destructive">Zona de Perigo</Label>
                    <p className="text-sm text-muted-foreground">
                      Remover todo o cache de transcrições
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          disabled={clearingCache || (cacheStats?.totalEntries || 0) === 0}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar Todo o Cache
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Limpar todo o cache de transcrições?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá remover permanentemente todas as {cacheStats?.totalEntries || 0} entradas de cache.
                            Os próximos usuários terão que aguardar novas transcrições, consumindo créditos de API.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleClearAllCache}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sim, limpar tudo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              {/* Cache Info */}
              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Informações do Cache
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Entrada mais antiga:</span>
                      <span className="text-sm font-medium">
                        {cacheStats?.oldestEntry ? formatDate(cacheStats.oldestEntry) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Entrada mais recente:</span>
                      <span className="text-sm font-medium">
                        {cacheStats?.newestEntry ? formatDate(cacheStats.newestEntry) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duração do cache:</span>
                      <span className="text-sm font-medium">30 dias</span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Sobre o cache</p>
                        <p className="text-sm text-muted-foreground">
                          O cache armazena transcrições de vídeos do CarCareKiosk para evitar 
                          reprocessamento e economizar créditos de API (ElevenLabs + Lovable AI).
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Export Cache */}
                  <div className="space-y-2">
                    <Label>Exportar Cache</Label>
                    <p className="text-sm text-muted-foreground">
                      Exportar todas as transcrições em cache para backup JSON
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportCache} 
                      className="w-full"
                      disabled={exporting || (cacheStats?.totalEntries || 0) === 0}
                    >
                      {exporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4 mr-2" />
                      )}
                      Exportar {cacheStats?.totalEntries || 0} Entradas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule Card */}
            <Card className="border-dm-cadet/20">
              <CardHeader>
                <CardTitle className="font-chakra flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Limpeza Automática Agendada
                </CardTitle>
                <CardDescription>
                  Agendamento semanal para remover cache expirado automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Frequência:</span>
                    <span className="text-sm font-medium">{scheduleInfo?.schedule || "Semanalmente (Domingo às 03:00 UTC)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Última execução:</span>
                    <span className="text-sm font-medium">
                      {scheduleInfo?.lastCleanup ? (
                        <>
                          {formatDate(scheduleInfo.lastCleanup.timestamp)} 
                          <span className="text-muted-foreground ml-1">
                            ({scheduleInfo.lastCleanup.deletedCount} removidas)
                          </span>
                        </>
                      ) : "Nunca executada"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRunScheduledCleanup}
                    disabled={runningCleanup}
                    className="flex-1"
                  >
                    {runningCleanup ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Executar Agora
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={fetchScheduleInfo}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar Info
                  </Button>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sobre a limpeza automática</p>
                      <p className="text-sm text-muted-foreground">
                        A limpeza automática é executada semanalmente aos domingos às 03:00 UTC (00:00 BRT).
                        Remove apenas entradas com cache expirado (mais de 30 dias), preservando transcrições ativas.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Cache Entries */}
            {cacheStats?.recentEntries && cacheStats.recentEntries.length > 0 && (
              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Entradas Recentes
                  </CardTitle>
                  <CardDescription>
                    Últimas {cacheStats.recentEntries.length} entradas no cache
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vídeo</TableHead>
                          <TableHead>Veículo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead>Expira em</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cacheStats.recentEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="max-w-[200px]">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate text-sm" title={entry.video_url}>
                                  {getVideoTitle(entry.video_url)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {entry.vehicle_context || "-"}
                            </TableCell>
                            <TableCell>
                              {entry.transcription_used ? (
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  HTML
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(entry.created_at)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(entry.expires_at) < new Date() ? (
                                <Badge variant="destructive">Expirado</Badge>
                              ) : (
                                formatDate(entry.expires_at)
                              )}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover entrada?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Isso irá remover esta entrada do cache. O próximo acesso a este vídeo
                                      irá gerar uma nova transcrição.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCacheEntry(entry.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Banco de Dados
                  </CardTitle>
                  <CardDescription>
                    Gerenciar dados do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Criar backups automáticos diários
                      </p>
                    </div>
                    <Switch
                      checked={settings.auto_backup !== false}
                      onCheckedChange={(checked) => updateSetting("auto_backup", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Exportar Dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Fazer download de todos os dados do sistema
                    </p>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Backup (JSON)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dm-cadet/20">
                <CardHeader>
                  <CardTitle className="font-chakra flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Ações do Sistema
                  </CardTitle>
                  <CardDescription>
                    Manutenção e limpeza
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Limpar Cache</Label>
                    <p className="text-sm text-muted-foreground">
                      Limpar dados temporários do navegador
                    </p>
                    <Button variant="outline" onClick={handleClearCache} className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Limpar Cache
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-destructive">Zona de Perigo</Label>
                    <p className="text-sm text-muted-foreground">
                      Ações irreversíveis do sistema
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar Todos os Diagnósticos
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso irá remover permanentemente
                            todos os diagnósticos do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleClearDiagnostics}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sim, remover tudo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Info */}
            <Card className="border-dm-cadet/20">
              <CardHeader>
                <CardTitle className="font-chakra flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Versão</p>
                    <p className="font-medium">{settings.app_version || "1.0.0"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ambiente</p>
                    <p className="font-medium">Produção</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Banco de Dados</p>
                    <p className="font-medium">Supabase (PostgreSQL)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última Atualização</p>
                    <p className="font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;