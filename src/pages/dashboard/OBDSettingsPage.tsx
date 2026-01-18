import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings2,
  Zap,
  Clock,
  Wifi,
  RotateCcw,
  Info,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useOBDSettings, ATST_PRESETS, OBD_PROTOCOLS, OBDSettings } from "@/hooks/useOBDSettings";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";

export default function OBDSettingsPage() {
  const navigate = useNavigate();
  const { canOptimizeOBD, isPro } = useSubscription();
  const {
    settings,
    isLoading,
    saveSettings,
    resetToDefaults,
    getATSTCommand,
    supportsOptimization,
  } = useOBDSettings();

  const [localSettings, setLocalSettings] = useState<Partial<OBDSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local settings with fetched settings
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSetting = <K extends keyof OBDSettings>(key: K, value: OBDSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings.mutate(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    resetToDefaults.mutate();
    setHasChanges(false);
  };

  // If user doesn't have access
  if (!canOptimizeOBD) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Configurações OBD Avançadas</h1>
          </div>

          <UpgradePrompt
            feature="Configurações OBD Avançadas"
            description="Com o plano Pro, você pode otimizar a conexão OBD, ajustar timeout ATST, habilitar otimização de requests CAN e personalizar comandos ELM327."
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-muted rounded w-64" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Configurações OBD Avançadas</h1>
              <p className="text-muted-foreground">
                Otimize a conexão com seu adaptador ELM327
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={resetToDefaults.isPending}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Padrão
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saveSettings.isPending}>
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Warning Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Alterações nestas configurações afetam a comunicação com o veículo.
            Configurações incorretas podem impedir a conexão. Em caso de problemas,
            use "Restaurar Padrão".
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ATST Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Configuração ATST (Timeout)
              </CardTitle>
              <CardDescription>
                Define o tempo de espera por resposta da ECU. Valores menores = mais rápido,
                valores maiores = mais estável.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Configuração</Label>
                  <p className="text-sm text-muted-foreground">
                    {localSettings.atst_mode === "auto"
                      ? "Ajuste automático baseado no protocolo"
                      : "Valor definido manualmente"}
                  </p>
                </div>
                <Select
                  value={localSettings.atst_mode}
                  onValueChange={(v) => updateSetting("atst_mode", v as "auto" | "manual")}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {localSettings.atst_mode === "manual" && (
                <>
                  {/* Presets */}
                  <div className="space-y-2">
                    <Label>Presets Recomendados</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ATST_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={localSettings.atst_value === preset.value ? "default" : "outline"}
                          size="sm"
                          className="justify-start h-auto py-2"
                          onClick={() => updateSetting("atst_value", preset.value)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{preset.label}</div>
                            <div className="text-xs opacity-70">{preset.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Value */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Valor Personalizado</Label>
                      <Badge variant="outline" className="font-mono">
                        {getATSTCommand(localSettings.atst_value || 32)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[localSettings.atst_value || 32]}
                        min={0}
                        max={255}
                        step={1}
                        onValueChange={([v]) => updateSetting("atst_value", v)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={255}
                        value={localSettings.atst_value || 32}
                        onChange={(e) => updateSetting("atst_value", parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dica: Comece com valores mais altos e reduza gradualmente até encontrar
                      o equilíbrio ideal. Após alterar, reconecte ao veículo.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Request Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Otimização de Requests
              </CardTitle>
              <CardDescription>
                Habilita leitura simultânea de múltiplos parâmetros para protocolos CAN.
                Pode acelerar a leitura em até 6x.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Otimizar Requests CAN</Label>
                  <p className="text-sm text-muted-foreground">
                    Funciona com CAN 11bit e CAN 29bit
                  </p>
                </div>
                <Switch
                  checked={localSettings.optimize_requests}
                  onCheckedChange={(v) => updateSetting("optimize_requests", v)}
                />
              </div>

              <Separator />

              {/* Protocol Selection */}
              <div className="space-y-2">
                <Label>Protocolo Preferido</Label>
                <Select
                  value={localSettings.preferred_protocol || "auto"}
                  onValueChange={(v) => updateSetting("preferred_protocol", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OBD_PROTOCOLS.map((protocol) => (
                      <SelectItem key={protocol.value} value={protocol.value}>
                        <div className="flex items-center gap-2">
                          <span>{protocol.label}</span>
                          {supportsOptimization(protocol.value) && (
                            <Badge variant="secondary" className="text-xs">CAN</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {OBD_PROTOCOLS.find((p) => p.value === localSettings.preferred_protocol)?.description}
                </p>
              </div>

              {/* Last Successful Protocol */}
              {settings?.last_successful_protocol && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Último protocolo utilizado com sucesso:
                  </p>
                  <p className="font-medium">
                    {OBD_PROTOCOLS.find((p) => p.value === settings.last_successful_protocol)?.label ||
                      settings.last_successful_protocol}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Configurações de Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reconexão Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Reconectar automaticamente em caso de perda
                  </p>
                </div>
                <Switch
                  checked={localSettings.auto_reconnect}
                  onCheckedChange={(v) => updateSetting("auto_reconnect", v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Timeout de Conexão (segundos)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[localSettings.connection_timeout_seconds || 30]}
                    min={10}
                    max={120}
                    step={5}
                    onValueChange={([v]) => updateSetting("connection_timeout_seconds", v)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-mono">
                    {localSettings.connection_timeout_seconds}s
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Intervalo de Polling (ms)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[localSettings.polling_interval_ms || 100]}
                    min={50}
                    max={500}
                    step={10}
                    onValueChange={([v]) => updateSetting("polling_interval_ms", v)}
                    className="flex-1"
                  />
                  <span className="w-16 text-center font-mono">
                    {localSettings.polling_interval_ms}ms
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Configurações Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Parâmetros Simultâneos Máximos</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Mais parâmetros simultâneos = leitura mais lenta de cada um.
                      Com 4 parâmetros, a leitura de cada um leva ~400ms.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[localSettings.max_simultaneous_parameters || 4]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={([v]) => updateSetting("max_simultaneous_parameters", v)}
                    className="flex-1"
                  />
                  <span className="w-8 text-center font-mono">
                    {localSettings.max_simultaneous_parameters}
                  </span>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="custom-commands">
                  <AccordionTrigger>Comandos de Inicialização Personalizados</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Comandos ELM327 enviados na inicialização (um por linha)
                      </p>
                      <textarea
                        className="w-full h-24 p-2 text-sm font-mono border rounded-md resize-none"
                        placeholder="ATZ&#10;ATE0&#10;ATL0"
                        value={(localSettings.custom_init_commands || []).join("\n")}
                        onChange={(e) =>
                          updateSetting(
                            "custom_init_commands",
                            e.target.value.split("\n").filter((cmd) => cmd.trim())
                          )
                        }
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
