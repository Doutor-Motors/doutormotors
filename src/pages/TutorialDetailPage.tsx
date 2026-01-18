import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause,
  Clock, 
  Star, 
  Heart, 
  Eye,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
  ListOrdered,
  Shield,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { useTutorialFavorites } from '@/hooks/useTutorialFavorites';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { tutorialApi } from '@/services/tutorials/tutorialApi';
import { DIFFICULTY_CONFIG, formatDuration, getYouTubeThumbnail } from '@/constants/tutorials';
import type { Tutorial, TutorialStep } from '@/types/tutorials';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const TutorialDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useTutorialFavorites();

  // Estados
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // UI states
  const [showAllTools, setShowAllTools] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<string[]>(['step-0']);

  // Hook de progresso persistente
  const {
    completedSteps,
    lastStep,
    progressPercent,
    isCompleted: isTutorialCompleted,
    toggleStepComplete,
    updateLastStep,
    markTutorialComplete,
    resetProgress,
  } = useTutorialProgress(tutorial?.id, tutorial?.steps?.length || 0);

  // Carregar tutorial
  useEffect(() => {
    const loadTutorial = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Tentar buscar do cache primeiro via URL
        const sourceUrl = searchParams.get('url');
        
        if (sourceUrl) {
          const data = await tutorialApi.fetch(sourceUrl);
          setTutorial(data);
        } else {
          // Buscar pelo slug
          const data = await tutorialApi.getBySlug(slug);
          if (data) {
            setTutorial(data);
          } else {
            throw new Error('Tutorial não encontrado');
          }
        }
      } catch (err) {
        console.error('Error loading tutorial:', err);
        setError('Não foi possível carregar o tutorial');
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar',
          description: 'O tutorial não pôde ser carregado. Tente novamente.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTutorial();
  }, [slug, searchParams, toast]);

  // Handlers
  const handleStepComplete = useCallback(async (stepIndex: number) => {
    await toggleStepComplete(stepIndex);
    await updateLastStep(stepIndex);
  }, [toggleStepComplete, updateLastStep]);

  const handleNextStep = useCallback(() => {
    if (tutorial?.steps && currentStep < tutorial.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setExpandedSteps([`step-${nextStep}`]);
      updateLastStep(nextStep);
    }
  }, [currentStep, tutorial?.steps, updateLastStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setExpandedSteps([`step-${prevStep}`]);
    }
  }, [currentStep]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: tutorial?.title_pt || 'Tutorial',
        text: tutorial?.description_pt || '',
        url: window.location.href,
      });
    } catch {
      // Fallback: copiar URL
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copiado!',
        description: 'O link do tutorial foi copiado para a área de transferência',
      });
    }
  }, [tutorial, toast]);

  const difficultyConfig = tutorial?.difficulty 
    ? DIFFICULTY_CONFIG[tutorial.difficulty as keyof typeof DIFFICULTY_CONFIG] 
    : null;

  const thumbnailUrl = tutorial?.thumbnail_url || 
    (tutorial?.youtube_video_id ? getYouTubeThumbnail(tutorial.youtube_video_id, 'max') : null) ||
    '/placeholder.svg';

  const youtubeEmbedUrl = tutorial?.youtube_video_id 
    ? `https://www.youtube.com/embed/${tutorial.youtube_video_id}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&rel=0`
    : null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !tutorial) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Tutorial não encontrado</h1>
          <p className="text-muted-foreground mb-6">{error || 'O tutorial solicitado não existe ou foi removido.'}</p>
          <Button onClick={() => navigate('/estude-seu-carro')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Tutoriais
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header com navegação */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/estude-seu-carro')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compartilhar</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isFavorite(tutorial.id) ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => toggleFavorite(tutorial.id)}
                    className={isFavorite(tutorial.id) ? 'bg-red-500 hover:bg-red-600' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(tutorial.id) ? 'fill-current' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite(tutorial.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>

          {/* Layout Principal */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coluna Principal - Vídeo e Detalhes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Player de Vídeo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-0 shadow-2xl">
                  <div className="relative aspect-video bg-black">
                    {youtubeEmbedUrl ? (
                      <iframe
                        src={youtubeEmbedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={tutorial.title_pt || 'Tutorial'}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <img 
                          src={thumbnailUrl} 
                          alt={tutorial.title_pt || 'Tutorial'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center text-white">
                            <Play className="w-16 h-16 mx-auto mb-2" />
                            <p>Vídeo não disponível</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controles do Player */}
                  <div className="p-4 bg-card border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevStep}
                          disabled={currentStep === 0}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>

                        <span className="text-sm text-muted-foreground">
                          Passo {currentStep + 1} de {tutorial.steps?.length || 1}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextStep}
                          disabled={!tutorial.steps || currentStep >= tutorial.steps.length - 1}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress value={progressPercent} className="w-32 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(progressPercent)}% completo
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Título e Metadados */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {tutorial.category_pt && (
                    <Badge variant="secondary" className="text-primary">
                      {tutorial.category_pt}
                    </Badge>
                  )}
                  {difficultyConfig && (
                    <Badge className={`${difficultyConfig.bgColor} ${difficultyConfig.color} border-0`}>
                      {difficultyConfig.label}
                    </Badge>
                  )}
                  {tutorial.duration_minutes && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(tutorial.duration_minutes)}
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {tutorial.title_pt || 'Tutorial'}
                </h1>

                <p className="text-muted-foreground leading-relaxed">
                  {tutorial.description_pt}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                  {tutorial.views_count !== undefined && tutorial.views_count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {tutorial.views_count.toLocaleString()} visualizações
                    </span>
                  )}
                  {tutorial.rating !== undefined && tutorial.rating > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {tutorial.rating.toFixed(1)}/5
                    </span>
                  )}
                  {tutorial.steps && (
                    <span className="flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4" />
                      {tutorial.steps.length} passos
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Lista de Passos */}
              {tutorial.steps && tutorial.steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <ListOrdered className="w-5 h-5 text-primary" />
                        Passo a Passo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Accordion
                        type="single"
                        collapsible
                        value={expandedSteps[0]}
                        onValueChange={(value) => setExpandedSteps(value ? [value] : [])}
                        className="divide-y divide-border"
                      >
                        {tutorial.steps.map((step, index) => (
                          <AccordionItem key={index} value={`step-${index}`} className="border-0">
                            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                              <div className="flex items-center gap-3 text-left flex-1">
                                <Button
                                  variant={completedSteps.has(index) ? 'default' : 'outline'}
                                  size="icon"
                                  className={`w-8 h-8 shrink-0 ${
                                    completedSteps.has(index) 
                                      ? 'bg-green-500 hover:bg-green-600' 
                                      : currentStep === index 
                                        ? 'border-primary text-primary'
                                        : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStepComplete(index);
                                  }}
                                >
                                  {completedSteps.has(index) ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                  )}
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium truncate ${
                                    completedSteps.has(index) ? 'line-through text-muted-foreground' : ''
                                  }`}>
                                    {step.title}
                                  </p>
                                  {step.duration_seconds && (
                                    <p className="text-xs text-muted-foreground">
                                      ~{Math.ceil(step.duration_seconds / 60)} min
                                    </p>
                                  )}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="ml-11 space-y-3">
                                <p className="text-muted-foreground">
                                  {step.description}
                                </p>

                                {step.warning && (
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                      {step.warning}
                                    </p>
                                  </div>
                                )}

                                {step.tips && (
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      {step.tips}
                                    </p>
                                  </div>
                                )}

                                {step.tools && step.tools.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {step.tools.map((tool, i) => (
                                      <Badge key={i} variant="outline" className="gap-1">
                                        <Wrench className="w-3 h-3" />
                                        {tool}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {step.image_url && (
                                  <img 
                                    src={step.image_url} 
                                    alt={step.title}
                                    className="rounded-lg max-w-full"
                                  />
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ferramentas Necessárias */}
              {tutorial.tools && tutorial.tools.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wrench className="w-5 h-5 text-primary" />
                        Ferramentas Necessárias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(showAllTools ? tutorial.tools : tutorial.tools.slice(0, 5)).map((tool, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <span>{tool}</span>
                          </li>
                        ))}
                      </ul>
                      {tutorial.tools.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => setShowAllTools(!showAllTools)}
                        >
                          {showAllTools ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Ver mais ({tutorial.tools.length - 5})
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Dicas de Segurança */}
              {tutorial.safety_tips && tutorial.safety_tips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-yellow-500/30 bg-yellow-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-yellow-700 dark:text-yellow-300">
                        <Shield className="w-5 h-5" />
                        Dicas de Segurança
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {tutorial.safety_tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                            <span className="text-yellow-700 dark:text-yellow-200">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Veículos Compatíveis */}
              {(tutorial.vehicle_makes?.length > 0 || tutorial.vehicle_models?.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="w-5 h-5 text-primary" />
                        Veículos Compatíveis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tutorial.vehicle_makes?.map((make, i) => (
                          <Badge key={`make-${i}`} variant="secondary">
                            {make}
                          </Badge>
                        ))}
                        {tutorial.vehicle_models?.map((model, i) => (
                          <Badge key={`model-${i}`} variant="outline">
                            {model}
                          </Badge>
                        ))}
                      </div>
                      {tutorial.vehicle_years && tutorial.vehicle_years.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Anos: {tutorial.vehicle_years.join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Link Original */}
              {tutorial.source_url && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => window.open(tutorial.source_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver fonte original
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default TutorialDetailPage;
