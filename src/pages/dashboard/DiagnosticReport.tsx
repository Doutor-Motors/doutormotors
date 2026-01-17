import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  ChevronRight,
  Car,
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  FileText,
  Wrench,
  ShieldAlert,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useValidUUID } from "@/hooks/useValidUUID";
import { Diagnostic, DiagnosticItem, Vehicle } from "@/store/useAppStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DiagnosticDisclaimer from "@/components/legal/DiagnosticDisclaimer";
import { shouldBlockDIY, getContextualWarning } from "@/components/legal/LegalDisclaimers";
import { generateDiagnosticPDF, downloadPDF } from "@/services/pdf/diagnosticReportGenerator";

const DiagnosticReport = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { isValid, validId } = useValidUUID({
    id,
    redirectTo: "/dashboard/history",
    errorTitle: "Erro ao carregar diagnóstico",
    errorDescription: "Link de diagnóstico inválido. Selecione um diagnóstico no histórico.",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [items, setItems] = useState<DiagnosticItem[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchDiagnostic = async () => {
      if (!user || !isValid || !validId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Fetch diagnostic
      const { data: diagData, error: diagError } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (diagError || !diagData) {
        toast({
          title: "Erro ao carregar diagnóstico",
          description: diagError?.message || "Diagnóstico não encontrado",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setDiagnostic(diagData);

      // Fetch diagnostic items
      const { data: itemsData } = await supabase
        .from('diagnostic_items')
        .select('*')
        .eq('diagnostic_id', id)
        .order('severity', { ascending: false });

      setItems(itemsData || []);

      // Fetch vehicle
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', diagData.vehicle_id)
        .maybeSingle();

      setVehicle(vehicleData);
      setIsLoading(false);
    };

    fetchDiagnostic();
  }, [validId, user, isValid, toast]);

  const handleMarkResolved = async (itemId: string) => {
    const { error } = await supabase
      .from('diagnostic_items')
      .update({ status: 'resolved' })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(items.map(item => 
        item.id === itemId ? { ...item, status: 'resolved' } : item
      ));
      toast({
        title: "Item marcado como resolvido",
        description: "O problema foi marcado como resolvido.",
      });
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (!diagnostic || !vehicle) {
      toast({
        title: "Erro ao exportar",
        description: "Dados do diagnóstico incompletos.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const pdfBlob = await generateDiagnosticPDF({
        diagnostic: {
          id: diagnostic.id,
          created_at: diagnostic.created_at,
          status: diagnostic.status,
          notes: diagnostic.notes,
        },
        items: items.map(item => ({
          dtc_code: item.dtc_code,
          description_human: item.description_human,
          priority: item.priority as 'critical' | 'attention' | 'preventive',
          severity: item.severity,
          can_diy: item.can_diy,
          diy_difficulty: item.diy_difficulty,
          probable_causes: item.probable_causes,
          status: item.status,
        })),
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          license_plate: vehicle.license_plate,
          engine: vehicle.engine,
          fuel_type: vehicle.fuel_type,
        },
        userName: user?.email,
        includeDisclaimer: true,
      });

      downloadPDF(pdfBlob, vehicle, diagnostic);

      toast({
        title: "PDF exportado com sucesso!",
        description: "O relatório foi baixado para seu dispositivo.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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
        return "Crítico";
      case "attention":
        return "Atenção";
      case "preventive":
        return "Preventivo";
      default:
        return "OK";
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

  const getSeverityText = (severity: number) => {
    if (severity >= 8) return "Muito Alta";
    if (severity >= 6) return "Alta";
    if (severity >= 4) return "Média";
    if (severity >= 2) return "Baixa";
    return "Muito Baixa";
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

  if (!diagnostic) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
            Diagnóstico não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            O diagnóstico solicitado não existe ou você não tem permissão para visualizá-lo.
          </p>
          <Link to="/dashboard/history">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-chakra uppercase">
              Ver Histórico
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const criticalCount = items.filter(i => i.priority === 'critical').length;
  const attentionCount = items.filter(i => i.priority === 'attention').length;
  const preventiveCount = items.filter(i => i.priority === 'preventive').length;
  const resolvedCount = items.filter(i => i.status === 'resolved').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/history">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
                Relatório de Diagnóstico
              </h1>
              <p className="text-muted-foreground">
                Detalhes completos do diagnóstico realizado
              </p>
            </div>
          </div>
          
          {/* Export PDF Button */}
          <Button
            onClick={handleExportPDF}
            disabled={isExporting || !vehicle}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-chakra uppercase gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>

        {/* Disclaimer Legal */}
        <DiagnosticDisclaimer variant="full" />

        {/* Vehicle & Date Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-chakra text-lg font-bold uppercase">
                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo'}
                  </h2>
                  <p className="text-muted-foreground">
                    {vehicle?.year} {vehicle?.license_plate && `• ${vehicle.license_plate}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(diagnostic.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(diagnostic.created_at), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-chakra text-2xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-sm text-red-600">Críticos</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900">
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="font-chakra text-2xl font-bold text-orange-500">{attentionCount}</p>
              <p className="text-sm text-orange-500">Atenção</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-chakra text-2xl font-bold text-yellow-600">{preventiveCount}</p>
              <p className="text-sm text-yellow-600">Preventivos</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
            <CardContent className="p-4 text-center">
              <Wrench className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-chakra text-2xl font-bold text-green-600">{resolvedCount}</p>
              <p className="text-sm text-green-600">Resolvidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <h2 className="font-chakra text-xl font-bold uppercase text-foreground">
            Itens do Diagnóstico ({items.length})
          </h2>

          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-chakra text-lg font-bold uppercase text-foreground mb-2">
                Nenhum problema encontrado
              </h3>
              <p className="text-muted-foreground">
                Seu veículo está em ótimas condições!
              </p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${item.status === 'resolved' ? 'opacity-60' : ''}`}>
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
                        <Badge variant="secondary" className={`${getPriorityColor(item.priority)} text-white`}>
                          {getPriorityLabel(item.priority)}
                        </Badge>
                        <Badge variant="outline">
                          Severidade: {item.severity}/10 ({getSeverityText(item.severity)})
                        </Badge>
                        {item.can_diy && !shouldBlockDIY(item.dtc_code, item.description_human) && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            ✓ Informativo DIY
                            {item.diy_difficulty && ` (Nível ${item.diy_difficulty})`}
                          </Badge>
                        )}
                        {shouldBlockDIY(item.dtc_code, item.description_human) && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Requer Profissional
                          </Badge>
                        )}
                        {item.status === 'resolved' && (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            ✓ Resolvido
                          </Badge>
                        )}
                      </div>

                      <p className="text-foreground mb-2">
                        {item.description_human}
                      </p>

                      {/* Aviso contextual para itens críticos */}
                      {getContextualWarning(item.dtc_code, item.description_human, item.priority) && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 mb-4 bg-orange-50 dark:bg-orange-950/30 rounded px-2 py-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{getContextualWarning(item.dtc_code, item.description_human, item.priority)}</span>
                        </div>
                      )}

                      {item.probable_causes && item.probable_causes.length > 0 && (
                        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-2">Causas Prováveis:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {item.probable_causes.map((cause, idx) => (
                              <li key={idx}>{cause}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        <Link to={`/dashboard/solutions/${item.id}`}>
                          <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 font-chakra uppercase text-sm flex items-center gap-2">
                            Ver Informações
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                        {item.status !== 'resolved' && (
                          <Button 
                            variant="outline" 
                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground font-chakra uppercase text-sm"
                            onClick={() => handleMarkResolved(item.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Resolvido
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Notes */}
        {diagnostic.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="font-chakra uppercase">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{diagnostic.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticReport;
