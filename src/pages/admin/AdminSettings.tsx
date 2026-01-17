import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { Settings, Bell, Shield, Database, Trash2, Download, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Configuração atualizada!");
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Export all data
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: vehicles } = await supabase.from("vehicles").select("*");
      const { data: diagnostics } = await supabase.from("diagnostics").select("*");
      const { data: diagnosticItems } = await supabase.from("diagnostic_items").select("*");

      const exportData = {
        exportDate: new Date().toISOString(),
        profiles,
        vehicles,
        diagnostics,
        diagnosticItems,
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
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Cache limpo com sucesso!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-chakra text-foreground">
            Configurações do Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerenciar configurações gerais do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card className="border-dm-cadet/20">
            <CardHeader>
              <CardTitle className="font-chakra flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure as notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas importantes por email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleSettingChange("emailNotifications")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-dm-cadet/20">
            <CardHeader>
              <CardTitle className="font-chakra flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configurações de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Bloquear acesso de usuários temporariamente
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={() => handleSettingChange("maintenanceMode")}
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
                  checked={settings.debugMode}
                  onCheckedChange={() => handleSettingChange("debugMode")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Database */}
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
                  checked={settings.autoBackup}
                  onCheckedChange={() => handleSettingChange("autoBackup")}
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
                  disabled={loading}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Backup (JSON)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System */}
          <Card className="border-dm-cadet/20">
            <CardHeader>
              <CardTitle className="font-chakra flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Sistema
              </CardTitle>
              <CardDescription>
                Ações do sistema
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
                        onClick={async () => {
                          try {
                            await supabase.from("diagnostic_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                            await supabase.from("diagnostics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                            toast.success("Diagnósticos removidos com sucesso!");
                          } catch (error) {
                            toast.error("Erro ao remover diagnósticos");
                          }
                        }}
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
            <CardTitle className="font-chakra">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Versão</p>
                <p className="font-medium">1.0.0</p>
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
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
