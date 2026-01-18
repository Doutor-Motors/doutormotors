import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Play, 
  Pause, 
  X, 
  Minimize2, 
  Maximize2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  List,
  Clock,
  CheckCircle2,
  Circle,
  GripHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from '@/components/ui/tooltip';
import type { Tutorial, TutorialStep } from '@/types/tutorials';
import { 
  getYouTubeEmbedUrl, 
  formatDuration,
  timestampToSeconds,
  secondsToTimestamp 
} from '@/constants/tutorials';

interface MiniPlayerProps {
  tutorial: Partial<Tutorial> | null;
  isVisible: boolean;
  onClose: () => void;
  onExpand?: () => void;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  currentStepIndex: number;
  showSteps: boolean;
}

const MiniPlayer = memo(({ 
  tutorial, 
  isVisible, 
  onClose,
  onExpand 
}: MiniPlayerProps) => {
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: (tutorial?.duration_minutes || 0) * 60,
    isMuted: false,
    currentStepIndex: 0,
    showSteps: false,
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = tutorial?.steps || [];
  const hasSteps = steps.length > 0;
  const currentStep = hasSteps ? steps[playerState.currentStepIndex] : null;

  // Reset player state when tutorial changes
  useEffect(() => {
    if (tutorial) {
      setPlayerState(prev => ({
        ...prev,
        currentTime: 0,
        duration: (tutorial.duration_minutes || 0) * 60,
        currentStepIndex: 0,
      }));
      setCompletedSteps(new Set());
    }
  }, [tutorial?.id]);

  // Handlers
  const handlePlayPause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const handleMuteToggle = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handlePrevStep = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const handleNextStep = useCallback(() => {
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, playerState.currentStepIndex]));
    
    setPlayerState(prev => ({
      ...prev,
      currentStepIndex: Math.min(steps.length - 1, prev.currentStepIndex + 1),
    }));
  }, [playerState.currentStepIndex, steps.length]);

  const handleStepClick = useCallback((index: number) => {
    setPlayerState(prev => ({ ...prev, currentStepIndex: index }));
  }, []);

  const handleToggleSteps = useCallback(() => {
    setPlayerState(prev => ({ ...prev, showSteps: !prev.showSteps }));
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
    setPlayerState(prev => ({ ...prev, showSteps: false }));
  }, []);

  const handleOpenExternal = useCallback(() => {
    if (tutorial?.source_url) {
      window.open(tutorial.source_url, '_blank', 'noopener,noreferrer');
    } else if (tutorial?.video_url) {
      window.open(tutorial.video_url, '_blank', 'noopener,noreferrer');
    }
  }, [tutorial]);

  // YouTube embed URL
  const embedUrl = tutorial?.youtube_video_id 
    ? getYouTubeEmbedUrl(tutorial.youtube_video_id, { 
        autoplay: playerState.isPlaying,
        start: currentStep?.timestamp ? timestampToSeconds(currentStep.timestamp) : undefined,
      })
    : null;

  // Progress calculation
  const progressPercent = hasSteps 
    ? ((playerState.currentStepIndex + 1) / steps.length) * 100
    : (playerState.currentTime / playerState.duration) * 100;

  if (!isVisible || !tutorial) return null;

  return (
    <AnimatePresence>
      <TooltipProvider>
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            width: isMinimized ? 320 : (playerState.showSteps ? 600 : 400),
            height: isMinimized ? 'auto' : (playerState.showSteps ? 500 : 'auto'),
          }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={{
            top: 0,
            left: 0,
            right: typeof window !== 'undefined' ? window.innerWidth - 400 : 0,
            bottom: typeof window !== 'undefined' ? window.innerHeight - 300 : 0,
          }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="overflow-hidden bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl shadow-black/20">
            {/* Drag Handle */}
            <div 
              className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-move border-b border-border/50"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                  {tutorial.title_pt || 'Tutorial'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Steps Toggle */}
                {hasSteps && !isMinimized && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={handleToggleSteps}
                      >
                        <List className={`w-4 h-4 ${playerState.showSteps ? 'text-primary' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{playerState.showSteps ? 'Ocultar passos' : 'Ver passos'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {/* External Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7"
                      onClick={handleOpenExternal}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Abrir no site original</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Minimize */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7"
                      onClick={handleMinimize}
                    >
                      {isMinimized ? (
                        <Maximize2 className="w-4 h-4" />
                      ) : (
                        <Minimize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMinimized ? 'Expandir' : 'Minimizar'}</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Close */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 hover:bg-destructive/20 hover:text-destructive"
                      onClick={onClose}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fechar</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  {/* Video Section */}
                  <div className={`flex-1 ${playerState.showSteps ? 'max-w-[60%]' : ''}`}>
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black">
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={tutorial.title_pt || 'Tutorial'}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : tutorial.thumbnail_url ? (
                        <>
                          <img 
                            src={tutorial.thumbnail_url} 
                            alt={tutorial.title_pt || 'Tutorial'}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <p className="text-sm mb-2">Vídeo não disponível</p>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={handleOpenExternal}
                              >
                                Abrir no site
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <Play className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Current Step Info (quando há passos) */}
                    {hasSteps && currentStep && (
                      <div className="p-3 border-t border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            Passo {playerState.currentStepIndex + 1} de {steps.length}
                          </Badge>
                          {currentStep.timestamp && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {currentStep.timestamp}
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                          {currentStep.title}
                        </h4>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {currentStep.description}
                        </p>

                        {currentStep.warning && (
                          <div className="mt-2 px-2 py-1 rounded bg-destructive/10 border border-destructive/20">
                            <p className="text-xs text-destructive">
                              ⚠️ {currentStep.warning}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="px-3 py-2">
                      <Progress value={progressPercent} className="h-1" />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between px-3 pb-3">
                      {/* Left Controls */}
                      <div className="flex items-center gap-1">
                        {/* Mute */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={handleMuteToggle}
                            >
                              {playerState.isMuted ? (
                                <VolumeX className="w-4 h-4" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{playerState.isMuted ? 'Ativar som' : 'Silenciar'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Center Controls - Step Navigation */}
                      {hasSteps && (
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8"
                                onClick={handlePrevStep}
                                disabled={playerState.currentStepIndex === 0}
                              >
                                <SkipBack className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Passo anterior</p>
                            </TooltipContent>
                          </Tooltip>

                          <Button
                            variant="default"
                            size="sm"
                            className="gap-2"
                            onClick={handleNextStep}
                            disabled={playerState.currentStepIndex >= steps.length - 1}
                          >
                            {playerState.currentStepIndex >= steps.length - 1 ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Concluído
                              </>
                            ) : (
                              <>
                                Próximo
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </Button>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8"
                                onClick={handleNextStep}
                                disabled={playerState.currentStepIndex >= steps.length - 1}
                              >
                                <SkipForward className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Próximo passo</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}

                      {/* Right - Duration */}
                      <div className="text-xs text-muted-foreground">
                        {tutorial.duration_minutes && (
                          <span>{formatDuration(tutorial.duration_minutes)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Steps Panel (quando expandido) */}
                  <AnimatePresence>
                    {playerState.showSteps && hasSteps && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '40%', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-l border-border/50 bg-muted/30"
                      >
                        <div className="p-3 border-b border-border/50">
                          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <List className="w-4 h-4 text-primary" />
                            Passos do Tutorial
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {completedSteps.size} de {steps.length} concluídos
                          </p>
                        </div>
                        
                        <ScrollArea className="h-[300px]">
                          <div className="p-2 space-y-1">
                            {steps.map((step, index) => {
                              const isCompleted = completedSteps.has(index);
                              const isCurrent = index === playerState.currentStepIndex;
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => handleStepClick(index)}
                                  className={`w-full text-left p-2 rounded-lg transition-all ${
                                    isCurrent 
                                      ? 'bg-primary/10 border border-primary/30' 
                                      : 'hover:bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="mt-0.5">
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      ) : isCurrent ? (
                                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                          <span className="text-[10px] text-primary-foreground font-bold">
                                            {index + 1}
                                          </span>
                                        </div>
                                      ) : (
                                        <Circle className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-medium line-clamp-1 ${
                                        isCurrent ? 'text-primary' : 'text-foreground'
                                      }`}>
                                        {step.title}
                                      </p>
                                      {step.timestamp && (
                                        <p className="text-[10px] text-muted-foreground">
                                          {step.timestamp}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimized State */}
            {isMinimized && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 py-2 flex items-center gap-3"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  {tutorial.thumbnail_url ? (
                    <img 
                      src={tutorial.thumbnail_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tutorial.title_pt}
                  </p>
                  {hasSteps && (
                    <p className="text-xs text-muted-foreground">
                      Passo {playerState.currentStepIndex + 1}/{steps.length}
                    </p>
                  )}
                </div>

                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 flex-shrink-0"
                  onClick={handlePlayPause}
                >
                  {playerState.isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </TooltipProvider>
    </AnimatePresence>
  );
});

MiniPlayer.displayName = 'MiniPlayer';

export default MiniPlayer;
