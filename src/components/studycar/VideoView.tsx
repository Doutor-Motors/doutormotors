import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Home,
  ChevronRight,
  Video,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Bot,
  Database,
  Clock,
  Loader2,
  Play,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { CarBrand, CarModel, VideoCategory, Procedure, VideoDetails, RelatedVideo } from "./types";

interface VideoViewProps {
  selectedBrand: CarBrand;
  selectedModel: CarModel;
  selectedCategory: VideoCategory;
  selectedProcedure: Procedure | null;
  videoDetails: VideoDetails | null;
  categories: VideoCategory[];
  isLoading: boolean;
  isTranscribing: boolean;
  onProcedureRetry: (forceRefresh?: boolean) => void;
  onCategorySelect: (category: VideoCategory) => void;
  onBack: () => void;
  onHome: () => void;
  onBrandClick: () => void;
  onModelClick: () => void;
  onProceduresClick: () => void;
}

const VideoView = ({
  selectedBrand,
  selectedModel,
  selectedCategory,
  selectedProcedure,
  videoDetails,
  categories,
  isLoading,
  isTranscribing,
  onProcedureRetry,
  onCategorySelect,
  onBack,
  onHome,
  onBrandClick,
  onModelClick,
  onProceduresClick,
}: VideoViewProps) => {
  // Estado para controlar qual vídeo está sendo exibido quando há múltiplos
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  
  // Determinar o vídeo atual a ser exibido
  const currentVideoUrl = useMemo(() => {
    if (videoDetails?.relatedVideos && videoDetails.relatedVideos.length > 0 && selectedVideoIndex > 0) {
      return videoDetails.relatedVideos[selectedVideoIndex - 1]?.url || videoDetails.videoUrl;
    }
    return videoDetails?.videoUrl;
  }, [videoDetails, selectedVideoIndex]);

  // Verificar se é uma URL de vídeo MP4 (CloudFront ou outro CDN)
  const isMP4Video = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.includes('.mp4') || url.includes('cloudfront.net');
  };

  // Extrair YouTube video ID
  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    
    // Se for MP4, não é YouTube
    if (isMP4Video(url)) return null;

    // Se já é uma URL de embed
    if (url.includes("/embed/")) {
      return url;
    }

    // Extrair video ID
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // Calculate remaining cache time
  const cacheTimeRemaining = useMemo(() => {
    if (!videoDetails?.cacheExpiresAt) return null;
    const expiresAt = new Date(videoDetails.cacheExpiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    if (diffMs <= 0) return "Expirado";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `${diffDays} dia${diffDays > 1 ? "s" : ""}`;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? "s" : ""}`;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  }, [videoDetails?.cacheExpiresAt]);

  return (
    <motion.div
      key="video"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Breadcrumb */}
      <section className="bg-muted/50 py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Button variant="ghost" size="sm" onClick={onHome} className="hover:bg-muted hover:text-foreground">
              <Home className="w-4 h-4" />
            </Button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span
              className="text-muted-foreground hover:text-primary cursor-pointer"
              onClick={onBrandClick}
            >
              {selectedBrand.name}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span
              className="text-muted-foreground hover:text-primary cursor-pointer"
              onClick={onModelClick}
            >
              {selectedModel.name}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span
              className="text-muted-foreground hover:text-primary cursor-pointer"
              onClick={onProceduresClick}
            >
              {selectedCategory.name}
            </span>
            {selectedProcedure && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-primary font-medium">
                  {selectedProcedure.name}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Video Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={onBack} className="hover:bg-muted hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase">
                {selectedCategory.icon}{" "}
                {selectedProcedure?.name || selectedCategory.name}
              </h1>
              <p className="text-muted-foreground">
                {selectedBrand.name} {selectedModel.name} ({selectedModel.years})
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Video */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mini Video Card - Compact & Native */}
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-border/50 shadow-lg">
                {isLoading && !videoDetails ? (
                  <div className="aspect-video bg-muted/30 flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative mb-4">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      {isTranscribing && (
                        <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-pulse" />
                      )}
                    </div>
                    {isTranscribing ? (
                      <>
                        <p className="text-base font-medium mb-1 flex items-center gap-2">
                          <Bot className="w-4 h-4 text-primary" />
                          Transcrevendo vídeo...
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Gerando passo a passo detalhado em português
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-medium">Carregando...</p>
                    )}
                  </div>
                ) : currentVideoUrl ? (
                  <>
                    {/* Video Player - Clean & Immersive */}
                    <div className="relative">
                      <AspectRatio ratio={16 / 9}>
                        {isMP4Video(currentVideoUrl) ? (
                          <video
                            key={currentVideoUrl}
                            src={currentVideoUrl}
                            title={videoDetails?.title || selectedCategory.name}
                            className="w-full h-full bg-black rounded-t-xl"
                            controls
                            preload="metadata"
                            playsInline
                          >
                            Seu navegador não suporta vídeos HTML5.
                          </video>
                        ) : (
                          <iframe
                            src={
                              getYouTubeEmbedUrl(currentVideoUrl) ||
                              currentVideoUrl
                            }
                            title={videoDetails?.title || selectedCategory.name}
                            className="w-full h-full rounded-t-xl"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </AspectRatio>
                    </div>
                    
                    {/* Video Info - Compact */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h2 className="font-chakra font-bold text-base leading-tight truncate">
                            {videoDetails?.title ||
                              `${selectedProcedure?.name || selectedCategory.name}`}
                          </h2>
                          {videoDetails?.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {videoDetails.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {videoDetails?.relatedVideos && videoDetails.relatedVideos.length > 0 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              <List className="w-3 h-3 mr-1" />
                              {videoDetails.relatedVideos.length + 1}
                            </Badge>
                          )}
                          {videoDetails?.sourceUrl && (
                            <a
                              href={videoDetails.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Related Videos - Compact Tabs */}
                      {videoDetails?.relatedVideos && videoDetails.relatedVideos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                          <Button
                            size="sm"
                            variant={selectedVideoIndex === 0 ? "default" : "ghost"}
                            onClick={() => setSelectedVideoIndex(0)}
                            className="text-xs h-6 px-2"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Principal
                          </Button>
                          {videoDetails.relatedVideos.slice(0, 4).map((video, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant={selectedVideoIndex === idx + 1 ? "default" : "ghost"}
                              onClick={() => setSelectedVideoIndex(idx + 1)}
                              className="text-xs h-6 px-2"
                            >
                              {video.name?.substring(0, 15) || `Vídeo ${idx + 2}`}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Video Description - Collapsible */}
                      {videoDetails?.videoDescription && (
                        <details className="pt-2 border-t border-border/30">
                          <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Descrição do vídeo
                          </summary>
                          <div className="mt-2 text-xs text-muted-foreground leading-relaxed max-h-32 overflow-y-auto pr-2">
                            {videoDetails.videoDescription.split("\n\n").slice(0, 2).map((p, i) => (
                              <p key={i} className="mb-2 last:mb-0">{p}</p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
                    <Video className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">
                      {videoDetails?.error ? "Vídeo indisponível" : "Carregando..."}
                    </p>
                    {videoDetails?.errorMessage && (
                      <p className="text-xs text-muted-foreground mb-3 max-w-xs">
                        {videoDetails.errorMessage}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onProcedureRetry(true)}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                        Tentar
                      </Button>
                      {(selectedProcedure?.url || selectedCategory.url || videoDetails?.sourceUrl) && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={selectedProcedure?.url || selectedCategory.url || videoDetails?.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Fonte
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Steps - Passo a Passo Guiado */}
              {videoDetails?.steps && videoDetails.steps.length > 0 && (
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Passo a Passo Guiado
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          {videoDetails.fromCache && cacheTimeRemaining && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="text-muted-foreground border-muted-foreground/30 cursor-help"
                                >
                                  <Database className="w-3 h-3 mr-1" />
                                  Cache
                                  <span className="ml-1 text-xs opacity-70 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {cacheTimeRemaining}
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Dados em cache. Expira em {cacheTimeRemaining}.</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {videoDetails.transcriptionUsed && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="secondary"
                                  className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 cursor-help"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Passos gerados por IA a partir da transcrição do
                                  vídeo.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                        <AlertDialog>
                          <Tooltip>
                            <TooltipProvider>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isLoading}
                                  >
                                    <RefreshCw
                                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                                    />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reprocessar transcrição (ignorar cache)</p>
                              </TooltipContent>
                            </TooltipProvider>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Reprocessar Transcrição?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>
                                    Baixar e transcrever o áudio do vídeo novamente
                                  </li>
                                  <li>Gerar novos passos detalhados com IA</li>
                                  <li>
                                    Consumir créditos de API (ElevenLabs + Motor IA)
                                  </li>
                                </ul>
                                <p className="mt-3 text-sm">
                                  Use apenas se os passos atuais parecem incorretos
                                  ou incompletos.
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onProcedureRetry(true)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reprocessar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardTitle>
                    {videoDetails.transcriptionUsed && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Gerado automaticamente a partir da transcrição do vídeo e
                        traduzido para português
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {videoDetails.steps.map((step, index) => (
                        <li
                          key={index}
                          className="flex gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                        >
                          {!videoDetails.transcriptionUsed && (
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                              {index + 1}
                            </span>
                          )}
                          <span
                            className={`${
                              videoDetails.transcriptionUsed
                                ? "text-foreground"
                                : "text-muted-foreground"
                            } leading-relaxed`}
                          >
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* No Steps - Show Retry */}
              {videoDetails &&
                (!videoDetails.steps || videoDetails.steps.length === 0) &&
                !isLoading && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-bold text-lg mb-2">
                        Passo a passo não disponível
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Não foi possível gerar o tutorial escrito para este vídeo.
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                          onClick={() => onProcedureRetry(true)}
                          disabled={isLoading}
                        >
                          <RefreshCw
                            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                          />
                          Tentar novamente
                        </Button>
                        {videoDetails?.sourceUrl && (
                          <Button variant="outline" asChild>
                            <a
                              href={videoDetails.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Abrir na fonte
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Link discreto para fonte */}
              {videoDetails?.sourceUrl && (
                <div className="flex justify-center">
                  <a
                    href={videoDetails.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    Fonte: CarCareKiosk
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar - Other Categories */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outros Tutoriais</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {categories
                      .filter((c) => c.id !== selectedCategory.id)
                      .slice(0, 8)
                      .map((category) => (
                        <button
                          key={category.id}
                          className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                          onClick={() => onCategorySelect(category)}
                        >
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{category.name}</p>
                            {category.nameEn !== category.name && (
                              <p className="text-xs text-muted-foreground">
                                {category.nameEn}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default VideoView;
