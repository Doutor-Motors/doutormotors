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
  RefreshCw,
  Play,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useValidUUID } from "@/hooks/useValidUUID";
import { DiagnosticItem, Vehicle } from "@/store/useAppStore";
import { getSolutionForDTC, getYouTubeSearchUrl } from "@/services/solutions/recommender";
import { fetchSolutionFromCarCareKiosk, FetchedSolution } from "@/services/solutions/api";
import IntegratedContentViewer from "@/components/solutions/IntegratedContentViewer";
import SourceSelector from "@/components/solutions/SourceSelector";
import SolutionSteps from "@/components/solutions/SolutionSteps";
import GlossaryPanel from "@/components/solutions/GlossaryPanel";
import DiagnosticDisclaimer from "@/components/legal/DiagnosticDisclaimer";
import SafetyBlocker from "@/components/legal/SafetyBlocker";
import { shouldBlockDIY, LEGAL_PHRASES, isCriticalDTC, mentionsCriticalSystem } from "@/components/legal/LegalDisclaimers";

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

type ContentSource = 'loveble' | 'carcarekiosk';

const SolutionGuide = () => {
  const { diagnosticItemId } = useParams<{ diagnosticItemId: string }>();
  const { user } = useAuth();
  const { notifySuccess, notifyError, notifyInfo, checkAndNotifyCacheStatus } = useNotifications();
  
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
  const [fromCache, setFromCache] = useState(false);
  const [activeSource, setActiveSource] = useState<ContentSource>('loveble');
  const [showIntegratedViewer, setShowIntegratedViewer] = useState(false);

  // Verificar se é um sistema crítico que bloqueia DIY
  const isCriticalSystem = item ? shouldBlockDIY(item.dtc_code, item.description_human) : false;
  
  // Determinar tipo de sistema para o bloqueador de segurança
  const getCriticalSystemType = (): "freio" | "direcao" | "suspensao" | "airbag" | "geral" => {
    if (!item) return "geral";
    const text = (item.dtc_code + " " + item.description_human).toLowerCase();
    if (text.includes('freio') || text.includes('brake') || text.includes('abs')) return "freio";
    if (text.includes('direção') || text.includes('steering')) return "direcao";
    if (text.includes('suspensão') || text.includes('suspension')) return "suspensao";
    if (text.includes('airbag') || item.dtc_code.startsWith('B00')) return "airbag";
    return "geral";
  };

  const fetchAISolution = async (
    diagnosticItem: DiagnosticItem, 
    vehicleData: Vehicle,
    forceRefresh: boolean = false
  ) => {
    setIsFetchingAI(true);
    
    if (forceRefresh) {
      notifyInfo("Atualizando solução", "Buscando nova versão do CarCareKiosk...");
    } else {
      notifyInfo("Buscando solução", "Verificando cache local...");
    }

    try {
      const response = await fetchSolutionFromCarCareKiosk(
        {
          dtcCode: diagnosticItem.dtc_code,
          vehicleBrand: vehicleData.brand,
          vehicleModel: vehicleData.model,
          vehicleYear: vehicleData.year,
          problemDescription: diagnosticItem.description_human,
        },
        { forceRefresh }
      );

      if (response.success && response.solution) {
        const aiSolution: SolutionData = {
          ...response.solution,
          videoUrl: getYouTubeSearchUrl(vehicleData.brand, vehicleData.model, diagnosticItem.dtc_code),
          articleUrl: response.solution.sourceUrl,
          shopUrl: `https://www.mercadolivre.com.br/jm/search?as_word=${encodeURIComponent(`${vehicleData.brand} ${vehicleData.model}`)}`,
        };
        setSolution(aiSolution);
        setUsedAI(true);
        setFromCache(response.fromCache || false);
        
        if (forceRefresh) {
          notifySuccess("Solução atualizada!", "Nova versão carregada e salva no cache.");
        } else if (response.fromCache) {
          notifySuccess("Solução carregada!", "Recuperada do cache local (offline)");
        } else {
          notifySuccess("Solução encontrada!", "Guia detalhado gerado e salvo no cache.");
          // Verifica se o cache está quase cheio após salvar nova solução
          checkAndNotifyCacheStatus();
        }
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

  const handleForceRefresh = () => {
    if (item && vehicle) {
      fetchAISolution(item, vehicle, true);
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

  // Show integrated viewer in fullscreen mode
  if (showIntegratedViewer && solution.articleUrl) {
    return (
      <DashboardLayout>
        <IntegratedContentViewer
          sourceUrl={solution.articleUrl}
          title={solution.title}
          onClose={() => setShowIntegratedViewer(false)}
          breadcrumb={`${vehicle?.brand} ${vehicle?.model} / ${item.dtc_code}`}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
            {isFetchingAI && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Buscando...
              </Badge>
            )}
            {usedAI && !isFetchingAI && (
              <>
                <Badge className={`${fromCache ? 'bg-green-600' : 'bg-gradient-to-r from-primary to-primary/80'} text-primary-foreground`}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {fromCache ? 'Cache Local' : 'CarCareKiosk + IA'}
                </Badge>
                
                {/* Botão de Refresh Forçado */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForceRefresh}
                  disabled={isFetchingAI}
                  className="gap-1"
                  title="Buscar nova versão da solução"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Atualizar</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Source Selector */}
        {usedAI && solution.articleUrl && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <SourceSelector
              activeSource={activeSource}
              onSourceChange={setActiveSource}
              hasExternalContent={!!solution.articleUrl}
              isLoadingExternal={isFetchingAI}
            />
            
            {activeSource === 'carcarekiosk' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowIntegratedViewer(true)}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Abrir Tutorial Completo
              </Button>
            )}
          </div>
        )}

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
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tempo Estimado</p>
              <p className="font-chakra font-bold text-foreground">{solution.estimatedTime}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Custo Estimado</p>
              <p className="font-chakra font-bold text-foreground">{solution.estimatedCost}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Wrench className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Dificuldade</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getDifficultyColor(solution.difficulty)}`} />
                <p className="font-chakra font-bold text-foreground">{getDifficultyLabel(solution.difficulty)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              {solution.professionalRecommended || isCriticalSystem ? (
                <>
                  <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Recomendação</p>
                  <p className="font-chakra font-bold text-red-600">Profissional</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Recomendação</p>
                  <p className="font-chakra font-bold text-green-600">Informativo</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Safety Blocker para sistemas críticos */}
        {isCriticalSystem && item && (
          <SafetyBlocker 
            systemType={getCriticalSystemType()} 
            dtcCode={item.dtc_code} 
          />
        )}

        {/* Disclaimer padrão */}
        {!isCriticalSystem && (
          <DiagnosticDisclaimer variant="full" isCritical={item?.priority === 'critical'} />
        )}

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

        {/* Main Content Tabs - Só mostra se NÃO for sistema crítico */}
        {!isCriticalSystem && (
          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="steps" className="font-chakra uppercase text-xs sm:text-sm">
                Informações
              </TabsTrigger>
              <TabsTrigger value="tools" className="font-chakra uppercase text-xs sm:text-sm">
                Ferramentas
              </TabsTrigger>
              <TabsTrigger value="resources" className="font-chakra uppercase text-xs sm:text-sm">
                Recursos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-chakra uppercase">{solution.title}</CardTitle>
                  <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground italic flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      {LEGAL_PHRASES.NOT_INSTRUCTIVE} - Os passos abaixo são apenas informativos.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <SolutionSteps steps={solution.steps} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Tools Needed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-chakra uppercase flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Ferramentas Necessárias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {solution.tools.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {solution.tools.map((tool, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma ferramenta especial necessária</p>
                    )}
                  </CardContent>
                </Card>

                {/* Parts Needed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-chakra uppercase flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      Peças Necessárias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {solution.parts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {solution.parts.map((part, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm py-1.5 px-3">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">A determinar após diagnóstico</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <div className="grid md:grid-cols-3 gap-4">
                {solution.videoUrl && (
                  <a href={solution.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] h-full">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                          <Youtube className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-chakra font-bold uppercase text-foreground">Vídeo Educativo</h3>
                          <p className="text-sm text-muted-foreground">Assista no YouTube</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </a>
                )}

                {solution.articleUrl && (
                  <Card 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] h-full border-primary/20"
                    onClick={() => setShowIntegratedViewer(true)}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-chakra font-bold uppercase text-foreground">Artigo Informativo</h3>
                        <p className="text-sm text-muted-foreground">CarCareKiosk (Externo)</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Play className="w-3 h-3 mr-1" />
                        Ver
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {solution.shopUrl && (
                  <a href={solution.shopUrl} target="_blank" rel="noopener noreferrer">
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] h-full">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                          <ShoppingCart className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-chakra font-bold uppercase text-foreground">Pesquisar Peças</h3>
                          <p className="text-sm text-muted-foreground">Ver opções (Externo)</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </a>
                )}
              </div>
              
              {/* Aviso sobre links externos */}
              <div className="mt-4 text-xs text-center text-muted-foreground">
                <p>⚠️ {LEGAL_PHRASES.EXTERNAL_CONTENT}</p>
              </div>
              
              {/* Glossário Automático */}
              <div className="mt-6">
                <GlossaryPanel
                  contextText={`${solution.title} ${solution.description} ${solution.steps.join(' ')} ${solution.tools.join(' ')} ${solution.parts.join(' ')} ${solution.warnings.join(' ')}`}
                  contextOnly={true}
                  defaultCollapsed={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {vehicle && !isFetchingAI && !isCriticalSystem && (
            <Button 
              size="lg" 
              variant="secondary"
              className="font-chakra uppercase"
              onClick={() => fetchAISolution(item, vehicle)}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Atualizar Informações
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

        {/* Aviso Legal Final */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {LEGAL_PHRASES.PLATFORM_POSITION}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SolutionGuide;
