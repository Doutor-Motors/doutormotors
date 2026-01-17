import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Info
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

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-1">
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