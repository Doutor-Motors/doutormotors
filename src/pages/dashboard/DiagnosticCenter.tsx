import { useState } from "react";
import { Link } from "react-router-dom";
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
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type DiagnosticStatus = "idle" | "running" | "completed";

// Mock diagnostic results
const mockDiagnosticResults = [
  {
    id: "1",
    code: "P0300",
    title: "Falhas múltiplas de ignição detectadas",
    description: "O sistema detectou falhas de ignição em múltiplos cilindros. Isso pode causar perda de potência, aumento no consumo e danos ao catalisador.",
    priority: "critical",
    canDIY: false,
    solutionUrl: "https://example.com/p0300",
  },
  {
    id: "2",
    code: "P0420",
    title: "Eficiência do catalisador abaixo do limite",
    description: "O catalisador não está convertendo os gases de escape de forma eficiente. Pode precisar de substituição.",
    priority: "attention",
    canDIY: false,
    solutionUrl: "https://example.com/p0420",
  },
  {
    id: "3",
    code: "P0128",
    title: "Temperatura do líquido de arrefecimento abaixo do ideal",
    description: "O motor está demorando muito para atingir a temperatura operacional. Provavelmente a válvula termostática está presa aberta.",
    priority: "preventive",
    canDIY: true,
    solutionUrl: "https://example.com/p0128",
  },
];

const DiagnosticCenter = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [diagnosticStatus, setDiagnosticStatus] = useState<DiagnosticStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<typeof mockDiagnosticResults>([]);
  const { toast } = useToast();

  const handleConnect = () => {
    setConnectionStatus("connecting");
    
    // Simular conexão
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
    setResults([]);
  };

  const handleStartDiagnostic = () => {
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
    setResults([]);

    // Simular progresso do diagnóstico
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDiagnosticStatus("completed");
          setResults(mockDiagnosticResults);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
            Centro de Diagnóstico
          </h1>
          <p className="text-muted-foreground">
            Conecte seu OBD2 e execute uma leitura completa do veículo.
          </p>
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
                    {connectionStatus === "connected"
                      ? "Adaptador OBD2 pronto para diagnóstico"
                      : connectionStatus === "connecting"
                      ? "Buscando adaptador OBD2..."
                      : "Conecte seu adaptador OBD2 via Bluetooth ou Wi-Fi"
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
                    disabled={connectionStatus === "connecting"}
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
        {diagnosticStatus === "completed" && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-chakra text-xl font-bold uppercase text-foreground">
                Resultados do Diagnóstico
              </h2>
              <Button
                onClick={handleStartDiagnostic}
                variant="outline"
                className="font-chakra uppercase flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Nova Leitura
              </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-chakra text-2xl font-bold text-red-600">
                    {results.filter(r => r.priority === "critical").length}
                  </p>
                  <p className="text-sm text-red-600">Críticos</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-chakra text-2xl font-bold text-orange-500">
                    {results.filter(r => r.priority === "attention").length}
                  </p>
                  <p className="text-sm text-orange-500">Atenção</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-chakra text-2xl font-bold text-yellow-600">
                    {results.filter(r => r.priority === "preventive").length}
                  </p>
                  <p className="text-sm text-yellow-600">Preventivos</p>
                </CardContent>
              </Card>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="overflow-hidden">
                  <div className={`h-1 ${getPriorityColor(result.priority)}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(result.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-chakra font-bold text-lg text-foreground">
                            {result.code}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(result.priority)} text-white`}>
                            {getPriorityLabel(result.priority)}
                          </span>
                          {result.canDIY && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              ✓ Pode fazer sozinho
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {result.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {result.description}
                        </p>
                        <Link to={`/dashboard/solutions/${result.id}`}>
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
