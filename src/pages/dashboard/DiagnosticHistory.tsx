import { Link } from "react-router-dom";
import { 
  Calendar, 
  ChevronRight, 
  AlertTriangle,
  Activity,
  CheckCircle,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock data
const mockHistory = [
  {
    id: "1",
    date: "2024-01-15",
    vehicle: "Volkswagen Golf 2020",
    totalIssues: 3,
    critical: 1,
    attention: 1,
    preventive: 1,
    status: "completed",
  },
  {
    id: "2",
    date: "2024-01-10",
    vehicle: "Volkswagen Golf 2020",
    totalIssues: 2,
    critical: 0,
    attention: 1,
    preventive: 1,
    status: "completed",
  },
  {
    id: "3",
    date: "2024-01-05",
    vehicle: "Honda Civic 2019",
    totalIssues: 1,
    critical: 0,
    attention: 0,
    preventive: 1,
    status: "completed",
  },
  {
    id: "4",
    date: "2023-12-20",
    vehicle: "Volkswagen Golf 2020",
    totalIssues: 0,
    critical: 0,
    attention: 0,
    preventive: 0,
    status: "completed",
  },
];

const DiagnosticHistory = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Histórico de Diagnósticos
            </h1>
            <p className="text-muted-foreground">
              Veja todos os diagnósticos realizados nos seus veículos.
            </p>
          </div>
          <Link to="/dashboard/diagnostics">
            <Button className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill">
              Novo Diagnóstico
            </Button>
          </Link>
        </div>

        {/* History List */}
        {mockHistory.length > 0 ? (
          <div className="space-y-4">
            {mockHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Car className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-chakra font-bold text-foreground uppercase">
                          {item.vehicle}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        {item.critical > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-bold text-red-600">{item.critical}</span>
                          </div>
                        )}
                        {item.attention > 0 && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-orange-500">{item.attention}</span>
                          </div>
                        )}
                        {item.preventive > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-yellow-500">{item.preventive}</span>
                          </div>
                        )}
                        {item.totalIssues === 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">Sem problemas</span>
                          </div>
                        )}
                      </div>

                      <Link to={`/dashboard/diagnostics/${item.id}`}>
                        <Button variant="ghost" className="text-primary font-chakra uppercase">
                          Ver Detalhes
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
              Nenhum diagnóstico realizado
            </h3>
            <p className="text-muted-foreground mb-6">
              Faça seu primeiro diagnóstico para começar a acompanhar a saúde do seu veículo.
            </p>
            <Link to="/dashboard/diagnostics">
              <Button className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                Fazer Diagnóstico
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticHistory;
