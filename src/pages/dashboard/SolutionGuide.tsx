import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft,
  Loader2,
  Wrench,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Youtube,
  BookOpen,
  ShoppingCart,
  Activity,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useValidUUID } from "@/hooks/useValidUUID";
import { DiagnosticItem, Vehicle } from "@/store/useAppStore";
import { getSolutionForDTC, getYouTubeSearchUrl } from "@/services/solutions/recommender";
import { fetchSolutionFromCarCareKiosk, FetchedSolution } from "@/services/solutions/api";

interface SolutionData {
  title: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  estimatedCost: string;
  difficulty: number;
  tools: string[];
  parts: string[];
  videoUrl?: string;
  articleUrl?: string;
  shopUrl?: string;
  warnings: string[];
  professionalRecommended: boolean;
  sourceUrl?: string;
}

const SolutionGuide = () => {
  const { diagnosticItemId } = useParams<{ diagnosticItemId: string }>();
  const { user } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();
  
  const { isValid, validId } = useValidUUID({
    id: diagnosticItemId,
    redirectTo: "/dashboard/history",
    errorTitle: "Link inválido",
    errorDescription: "Selecione uma solução a partir do relatório de diagnóstico.",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [item, setItem] = useState<DiagnosticItem | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [usedAI, setUsedAI] = useState(false);

  const fetchAISolution = async (diagnosticItem: DiagnosticItem, vehicleData: Vehicle) => {
    setIsFetchingAI(true);
    notifyInfo("Buscando solução", "Consultando base de dados CarCareKiosk...");

    try {
      const response = await fetchSolutionFromCarCareKiosk({
        dtcCode: diagnosticItem.dtc_code,
        vehicleBrand: vehicleData.brand,
        vehicleModel: vehicleData.model,
        vehicleYear: vehicleData.year,
        problemDescription: diagnosticItem.description_human,
      });

      if (response.success && response.solution) {
        const aiSolution: SolutionData = {
          ...response.solution,
          videoUrl: getYouTubeSearchUrl(vehicleData.brand, vehicleData.model, diagnosticItem.dtc_code),
          articleUrl: response.solution.sourceUrl,
          shopUrl: `https://www.mercadolivre.com.br/jm/search?as_word=${encodeURIComponent(`${vehicleData.brand} ${vehicleData.model}`)}`,
        };
        setSolution(aiSolution);
        setUsedAI(true);
        notifySuccess("Solução encontrada!", "Guia detalhado gerado com sucesso.");
      } else {
        console.error("AI solution error:", response.error);
        notifyError("Erro ao buscar", response.error || "Usando solução padrão");
      }
    } catch (error) {
      console.error("Error fetching AI solution:", error);
      notifyError("Erro de conexão", "Não foi possível buscar a solução online");
    } finally {
      setIsFetchingAI(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !isValid || !validId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Fetch diagnostic item
      const { data: itemData, error: itemError } = await supabase
        .from('diagnostic_items')
        .select('*, diagnostics!inner(vehicle_id, user_id)')
        .eq('id', diagnosticItemId)
        .maybeSingle();

      if (itemError || !itemData) {
        notifyError('Erro ao carregar', 'Item não encontrado');
        setIsLoading(false);
        return;
      }

      // Verify user owns this diagnostic
      if ((itemData as any).diagnostics.user_id !== user.id) {
        notifyError('Acesso negado', 'Você não tem permissão para ver este item');
        setIsLoading(false);
        return;
      }

      setItem(itemData);

      // Fetch vehicle
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', (itemData as any).diagnostics.vehicle_id)
        .maybeSingle();

      setVehicle(vehicleData);

      // First, set fallback solution from local recommender
      const fallbackSolution = getSolutionForDTC(
        itemData.dtc_code,
        vehicleData ? {
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year,
        } : undefined
      );
      setSolution(fallbackSolution);
      setIsLoading(false);

      // Then try to fetch AI-powered solution from CarCareKiosk
      if (vehicleData) {
        fetchAISolution(itemData, vehicleData);
      }
    };

    fetchData();
  }, [validId, user, isValid, notifyError]);

  const handleMarkResolved = async () => {
    if (!item) return;

    const { error } = await supabase
      .from('diagnostic_items')
      .update({ status: 'resolved' })
      .eq('id', item.id);

    if (error) {
      notifyError('Erro ao atualizar', error.message);
    } else {
      setItem({ ...item, status: 'resolved' });
      notifySuccess('Problema Resolvido!', 'O problema foi marcado como resolvido.');
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return "Fácil";
    if (difficulty <= 4) return "Moderado";
    if (difficulty <= 6) return "Intermediário";
    if (difficulty <= 8) return "Difícil";
    return "Muito Difícil";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-500";
    if (difficulty <= 4) return "bg-yellow-500";
    if (difficulty <= 6) return "bg-orange-500";
    return "bg-red-500";
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

  if (!item || !solution) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
            Solução não encontrada
          </h2>
          <p className="text-muted-foreground mb-6">
            Não conseguimos encontrar uma solução para este item.
          </p>
          <Link to="/dashboard/history">
            <Button className="font-chakra uppercase">
              Voltar ao Histórico
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/diagnostics/${item.diagnostic_id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Guia de Solução
            </h1>
            <p className="text-muted-foreground">
              {item.dtc_code} - {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo'}
            </p>
            {isFetchingAI && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando solução detalhada...</span>
              </div>
            )}
            {usedAI && !isFetchingAI && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                ✓ Solução via CarCareKiosk + IA
              </Badge>
            )}
          </div>
        </div>

        {/* Problem Summary */}
        <Card>
          <div className={`h-1 ${getPriorityColor(item.priority)}`} />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getPriorityIcon(item.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-chakra font-bold text-xl text-foreground">
                    {item.dtc_code}
                  </span>
                  {item.status === 'resolved' && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✓ Resolvido
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{item.description_human}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solution Info Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tempo Estimado</p>
              <p className="font-chakra font-bold text-foreground">{solution.estimatedTime}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Custo Estimado</p>
              <p className="font-chakra font-bold text-foreground">{solution.estimatedCost}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Wrench className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Dificuldade</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getDifficultyColor(solution.difficulty)}`} />
                <p className="font-chakra font-bold text-foreground">{getDifficultyLabel(solution.difficulty)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {solution.professionalRecommended ? (
                <>
                  <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Recomendação</p>
                  <p className="font-chakra font-bold text-orange-500">Mecânico</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Recomendação</p>
                  <p className="font-chakra font-bold text-green-600">Faça Você Mesmo</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warnings */}
        {solution.warnings.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="font-chakra uppercase flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" />
                Avisos Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {solution.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-orange-700 dark:text-orange-400">
                    <span className="font-bold">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Solution Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="font-chakra uppercase">{solution.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">{solution.description}</p>

            <Separator />

            <div>
              <h3 className="font-chakra font-bold text-lg mb-4">Passo a Passo</h3>
              <ol className="space-y-4">
                {solution.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-foreground">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tools Needed */}
            {solution.tools.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-chakra font-bold text-lg mb-4">Ferramentas Necessárias</h3>
                  <div className="flex flex-wrap gap-2">
                    {solution.tools.map((tool, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Parts Needed */}
            {solution.parts.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-chakra font-bold text-lg mb-4">Peças Necessárias</h3>
                  <div className="flex flex-wrap gap-2">
                    {solution.parts.map((part, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {part}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* External Resources */}
        <div className="grid md:grid-cols-3 gap-4">
          {solution.videoUrl && (
            <a href={solution.videoUrl} target="_blank" rel="noopener noreferrer">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <Youtube className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-chakra font-bold uppercase text-foreground">Vídeo Tutorial</h3>
                    <p className="text-sm text-muted-foreground">Assista no YouTube</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          )}

          {solution.articleUrl && (
            <a href={solution.articleUrl} target="_blank" rel="noopener noreferrer">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-chakra font-bold uppercase text-foreground">Artigo Técnico</h3>
                    <p className="text-sm text-muted-foreground">CarCareKiosk</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          )}

          {solution.shopUrl && (
            <a href={solution.shopUrl} target="_blank" rel="noopener noreferrer">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-chakra font-bold uppercase text-foreground">Comprar Peças</h3>
                    <p className="text-sm text-muted-foreground">Ver opções</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {vehicle && !isFetchingAI && (
            <Button 
              size="lg" 
              variant="secondary"
              className="font-chakra uppercase"
              onClick={() => fetchAISolution(item, vehicle)}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Atualizar Solução
            </Button>
          )}
          {item.status !== 'resolved' && (
            <Button 
              size="lg" 
              className="font-chakra uppercase"
              onClick={handleMarkResolved}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Marcar como Resolvido
            </Button>
          )}
          <Link to={`/dashboard/diagnostics/${item.diagnostic_id}`}>
            <Button size="lg" variant="outline" className="font-chakra uppercase w-full sm:w-auto">
              Voltar ao Relatório
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SolutionGuide;
