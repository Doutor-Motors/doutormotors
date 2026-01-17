import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  Bluetooth, 
  Wifi, 
  WifiOff,
  Play,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Activity,
  ChevronRight,
  RefreshCw,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore, Vehicle, Diagnostic, DiagnosticItem } from "@/store/useAppStore";
import { analyzeDTCCodes, saveDiagnostic, runDemoDiagnostic } from "@/services/diagnostics/engine";
import { generateMockDTCCodes } from "@/services/diagnostics/dtcDatabase";

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type DiagnosticStatus = "idle" | "running" | "completed";

const DiagnosticCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    vehicles, 
    setVehicles,
    activeVehicleId, 
    setActiveVehicleId,
    addDiagnostic,
    setCurrentDiagnosticId
  } = useAppStore();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [diagnosticStatus, setDiagnosticStatus] = useState<DiagnosticStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [currentDiagnostic, setCurrentDiagnostic] = useState<Diagnostic | null>(null);
  const [diagnosticItems, setDiagnosticItems] = useState<DiagnosticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch vehicles if not loaded
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVehicles(data);
        
        // Set vehicle from URL param or first vehicle
        const vehicleIdFromUrl = searchParams.get('vehicle');
        if (vehicleIdFromUrl && data.find(v => v.id === vehicleIdFromUrl)) {
          setActiveVehicleId(vehicleIdFromUrl);
        } else if (!activeVehicleId && data.length > 0) {
          setActiveVehicleId(data[0].id);
        }
      }
      setIsLoading(false);
    };

    fetchVehicles();
  }, [user]);

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  const handleConnect = () => {
    if (!activeVehicle) {
      toast({
        title: "Selecione um veículo",
        description: "Escolha um veículo antes de conectar.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus("connecting");
    
    // Simular conexão OBD2
    setTimeout(() => {
      setConnectionStatus("connected");
      toast({
        title: "Conectado!",
        description: "Adaptador OBD2 conectado com sucesso.",
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnectionStatus("disconnected");
    setDiagnosticStatus("idle");
    setProgress(0);
    setCurrentDiagnostic(null);
    setDiagnosticItems([]);
  };

  const handleStartDiagnostic = async () => {
    if (!user || !activeVehicle) {
      toast({
        title: "Erro",
        description: "Selecione um veículo primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (connectionStatus !== "connected") {
      toast({
        title: "Erro",
        description: "Conecte o adaptador OBD2 primeiro.",
        variant: "destructive",
      });
      return;
    }

    setDiagnosticStatus("running");
    setProgress(0);
    setDiagnosticItems([]);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Run demo diagnostic (simulates OBD2 reading + AI analysis)
      const result = await runDemoDiagnostic(
        activeVehicle.id,
        user.id,
        {
          brand: activeVehicle.brand,
          model: activeVehicle.model,
          year: activeVehicle.year,
        }
      );

      clearInterval(interval);
      setProgress(100);

      if (result.success && result.diagnosticId) {
        // Fetch the complete diagnostic with items
        const { data: diagnostic, error } = await supabase
          .from('diagnostics')
          .select('*')
          .eq('id', result.diagnosticId)
          .single();

        const { data: items } = await supabase
          .from('diagnostic_items')
          .select('*')
          .eq('diagnostic_id', result.diagnosticId)
          .order('severity', { ascending: false });

        if (diagnostic) {
          const fullDiagnostic: Diagnostic = {
            ...diagnostic,
            items: items || [],
            vehicle: activeVehicle,
          };
          
          setCurrentDiagnostic(fullDiagnostic);
          setDiagnosticItems(items || []);
          setCurrentDiagnosticId(result.diagnosticId);
          addDiagnostic(fullDiagnostic);
        }

        setDiagnosticStatus("completed");
        toast({
          title: "Diagnóstico concluído!",
          description: `${result.items.length} item(s) encontrado(s).`,
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      clearInterval(interval);
      setProgress(0);
      setDiagnosticStatus("idle");
      toast({
        title: "Erro no diagnóstico",
        description: error instanceof Error ? error.message : "Erro ao executar diagnóstico",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-600";
      case "attention":
        return "bg-orange-500";
      case "preventive":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical":
        return "🔴 Crítico";
      case "attention":
        return "🟠 Atenção";
      case "preventive":
        return "🟡 Preventivo";
      default:
        return "🟢 OK";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "attention":
        return <Activity className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (vehicles.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Centro de Diagnóstico
            </h1>
            <p className="text-muted-foreground">
              Conecte seu OBD2 e execute uma leitura completa do veículo.
            </p>
          </div>
          <Card className="p-12 text-center">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
              Nenhum veículo cadastrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Cadastre um veículo para iniciar o diagnóstico.
            </p>
            <Link to="/dashboard/vehicles">
              <Button className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                Cadastrar Veículo
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Centro de Diagnóstico
            </h1>
            <p className="text-muted-foreground">
              Conecte seu OBD2 e execute uma leitura completa do veículo.
            </p>
          </div>
          
          {/* Vehicle Selector */}
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-muted-foreground" />
            <Select
              value={activeVehicleId || ""}
              onValueChange={(value) => setActiveVehicleId(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Connection Card */}
        <Card className="bg-gradient-to-br from-dm-space to-dm-blue-2 text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${
                  connectionStatus === "connected" 
                    ? "bg-green-500/20" 
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500/20"
                    : "bg-red-500/20"
                }`}>
                  {connectionStatus === "connected" ? (
                    <Wifi className="w-8 h-8 text-green-400" />
                  ) : connectionStatus === "connecting" ? (
                    <Bluetooth className="w-8 h-8 text-yellow-400 animate-pulse" />
                  ) : (
                    <WifiOff className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <div>
                  <h2 className="font-chakra text-xl font-bold uppercase">
                    {connectionStatus === "connected" 
                      ? "Conectado" 
                      : connectionStatus === "connecting"
                      ? "Conectando..."
                      : "Desconectado"
                    }
                  </h2>
                  <p className="text-dm-cadet">
                    {activeVehicle 
                      ? `${activeVehicle.brand} ${activeVehicle.model} (${activeVehicle.year})`
                      : "Selecione um veículo"
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {connectionStatus === "connected" ? (
                  <>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-chakra uppercase"
                    >
                      Desconectar
                    </Button>
                    <Button
                      onClick={handleStartDiagnostic}
                      disabled={diagnosticStatus === "running"}
                      className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase flex items-center gap-2"
                    >
                      {diagnosticStatus === "running" ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Analisando...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Iniciar Diagnóstico</span>
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleConnect}
                    disabled={connectionStatus === "connecting" || !activeVehicle}
                    className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase flex items-center gap-2"
                  >
                    {connectionStatus === "connecting" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <Bluetooth className="w-5 h-5" />
                        <span>Conectar OBD2</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {diagnosticStatus === "running" && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso do diagnóstico</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {diagnosticStatus === "completed" && diagnosticItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-chakra text-xl font-bold uppercase text-foreground">
                Resultados do Diagnóstico
              </h2>
              <div className="flex gap-2">
                {currentDiagnostic && (
                  <Link to={`/dashboard/diagnostics/${currentDiagnostic.id}`}>
                    <Button variant="outline" className="font-chakra uppercase flex items-center gap-2">
                      Ver Relatório Completo
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={handleStartDiagnostic}
                  variant="outline"
                  className="font-chakra uppercase flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nova Leitura
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-chakra text-2xl font-bold text-red-600">
                    {diagnosticItems.filter(r => r.priority === "critical").length}
                  </p>
                  <p className="text-sm text-red-600">Críticos</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-chakra text-2xl font-bold text-orange-500">
                    {diagnosticItems.filter(r => r.priority === "attention").length}
                  </p>
                  <p className="text-sm text-orange-500">Atenção</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-chakra text-2xl font-bold text-yellow-600">
                    {diagnosticItems.filter(r => r.priority === "preventive").length}
                  </p>
                  <p className="text-sm text-yellow-600">Preventivos</p>
                </CardContent>
              </Card>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
              {diagnosticItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className={`h-1 ${getPriorityColor(item.priority)}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(item.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-chakra font-bold text-lg text-foreground">
                            {item.dtc_code}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)} text-white`}>
                            {getPriorityLabel(item.priority)}
                          </span>
                          {item.can_diy && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              ✓ Pode fazer sozinho
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                          {item.description_human}
                        </p>
                        {item.probable_causes && item.probable_causes.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-foreground mb-1">Causas prováveis:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {item.probable_causes.slice(0, 3).map((cause, idx) => (
                                <li key={idx}>{cause}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Link to={`/dashboard/solutions/${item.id}`}>
                          <Button variant="outline" className="font-chakra uppercase text-sm flex items-center gap-2">
                            Ver Solução
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {diagnosticStatus === "idle" && connectionStatus !== "connected" && (
          <Card className="p-12 text-center">
            <Bluetooth className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
              Conecte seu OBD2
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Plugue o adaptador OBD2 na porta de diagnóstico do seu veículo 
              e conecte via Bluetooth ou Wi-Fi para iniciar.
            </p>
            <Button
              onClick={handleConnect}
              disabled={!activeVehicle}
              className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase"
            >
              <Bluetooth className="w-5 h-5 mr-2" />
              Conectar Agora
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticCenter;
