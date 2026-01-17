import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Car, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  ChevronRight,
  Bluetooth,
  Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock data - será substituído por dados reais do Supabase
const mockVehicle = {
  id: "1",
  brand: "Volkswagen",
  model: "Golf",
  year: 2020,
  engine: "1.4 TSI",
  fuelType: "Flex",
};

const mockAlerts = [
  {
    id: "1",
    code: "P0300",
    title: "Falhas múltiplas de ignição",
    priority: "critical",
    description: "Problema detectado no sistema de ignição",
  },
  {
    id: "2",
    code: "P0420",
    title: "Catalisador abaixo da eficiência",
    priority: "attention",
    description: "O catalisador pode precisar de substituição",
  },
];

const mockLastDiagnostic = {
  date: "2024-01-15",
  totalIssues: 3,
  critical: 1,
  attention: 1,
  preventive: 1,
};

const UserDashboard = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectOBD = () => {
    setIsConnecting(true);
    // Simulação de conexão
    setTimeout(() => {
      setIsConnecting(false);
    }, 2000);
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
        return "Crítico";
      case "attention":
        return "Atenção";
      case "preventive":
        return "Preventivo";
      default:
        return "OK";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta! Aqui está o resumo do seu veículo.
            </p>
          </div>
          <Button
            onClick={handleConnectOBD}
            disabled={isConnecting}
            className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <Bluetooth className="w-5 h-5 animate-pulse" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5" />
                <span>Conectar OBD2</span>
              </>
            )}
          </Button>
        </div>

        {/* Vehicle Card */}
        <Card className="bg-gradient-to-br from-dm-space to-dm-blue-2 text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-4 rounded-full">
                  <Car className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-chakra text-xl font-bold uppercase">
                    {mockVehicle.brand} {mockVehicle.model}
                  </h2>
                  <p className="text-dm-cadet">
                    {mockVehicle.year} • {mockVehicle.engine} • {mockVehicle.fuelType}
                  </p>
                </div>
              </div>
              <Link to="/dashboard/vehicles">
                <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-chakra uppercase">
                  <Plus className="w-4 h-4 mr-2" />
                  Gerenciar Veículos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {mockLastDiagnostic.critical}
                </p>
                <p className="text-sm text-muted-foreground">Críticos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {mockLastDiagnostic.attention}
                </p>
                <p className="text-sm text-muted-foreground">Atenção</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {mockLastDiagnostic.preventive}
                </p>
                <p className="text-sm text-muted-foreground">Preventivos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-chakra font-bold text-foreground">
                  {mockLastDiagnostic.totalIssues}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-chakra text-lg uppercase">
              Alertas Ativos
            </CardTitle>
            <Link to="/dashboard/diagnostics">
              <Button variant="ghost" className="text-primary font-chakra uppercase text-sm">
                Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {mockAlerts.length > 0 ? (
              <div className="space-y-4">
                {mockAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(alert.priority)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-chakra font-bold text-foreground">
                          {alert.code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(alert.priority)} text-white`}>
                          {getPriorityLabel(alert.priority)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <Link to={`/dashboard/diagnostics/${alert.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhum alerta ativo. Seu veículo está em boas condições!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/dashboard/diagnostics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-chakra font-bold text-foreground uppercase">
                    Novo Diagnóstico
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Iniciar leitura OBD2
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-chakra font-bold text-foreground uppercase">
                    Histórico
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ver diagnósticos anteriores
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/vehicles">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-chakra font-bold text-foreground uppercase">
                    Meus Veículos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar veículos
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
