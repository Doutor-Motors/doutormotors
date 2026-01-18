import { useState, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Star, 
  Heart, 
  Eye,
  Wrench,
  ChevronRight,
  Disc,
  GitMerge,
  Cog,
  Zap,
  Settings,
  Thermometer,
  Wind,
  Navigation,
  Snowflake,
  Fuel,
  Lightbulb,
  Circle,
  Layout,
  Car,
  Folder,
  LucideIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from '@/components/ui/tooltip';
import type { Tutorial } from '@/types/tutorials';
import { 
  formatDuration, 
  getYouTubeThumbnail, 
  DIFFICULTY_CONFIG,
  getCategoryIcon 
} from '@/constants/tutorials';

// Mapeamento de nomes de ícones para componentes Lucide
const ICON_MAP: Record<string, LucideIcon> = {
  disc: Disc,
  'git-merge': GitMerge,
  cog: Cog,
  zap: Zap,
  settings: Settings,
  thermometer: Thermometer,
  wind: Wind,
  navigation: Navigation,
  snowflake: Snowflake,
  fuel: Fuel,
  lightbulb: Lightbulb,
  circle: Circle,
  layout: Layout,
  car: Car,
  wrench: Wrench,
  folder: Folder,
};

// Função para obter componente de ícone
function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Folder;
}

interface TutorialCardProps {
  tutorial: Partial<Tutorial>;
  isFavorite?: boolean;
  onPreview?: (tutorial: Partial<Tutorial>) => void;
  onClick?: () => void;
  onFavoriteToggle?: (tutorialId: string) => void;
  showPreviewButton?: boolean;
}

const TutorialCard = memo(({ 
  tutorial, 
  isFavorite = false,
  onPreview,
  onClick, 
  onFavoriteToggle,
  showPreviewButton = true 
}: TutorialCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const thumbnailUrl = tutorial.thumbnail_url || 
    (tutorial.youtube_video_id ? getYouTubeThumbnail(tutorial.youtube_video_id) : null) ||
    '/placeholder.svg';

  const difficultyConfig = tutorial.difficulty 
    ? DIFFICULTY_CONFIG[tutorial.difficulty as keyof typeof DIFFICULTY_CONFIG] 
    : null;

  // Obter ícone da categoria
  const CategoryIcon = useMemo(() => {
    if (!tutorial.category_pt) return null;
    const iconName = getCategoryIcon(tutorial.category_pt);
    return getIconComponent(iconName);
  }, [tutorial.category_pt]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (tutorial.id && onFavoriteToggle) {
      onFavoriteToggle(tutorial.id);
    }
  }, [tutorial.id, onFavoriteToggle]);

  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPreview?.(tutorial);
  }, [tutorial, onPreview]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <TooltipProvider>
      <Card 
        className="group relative overflow-hidden cursor-pointer bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Glow Effect on Hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          initial={false}
        />

        {/* Thumbnail Container */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse" />
          )}
          
          {/* Thumbnail Image */}
          <motion.img
            src={imageError ? '/placeholder.svg' : thumbnailUrl}
            alt={tutorial.title_pt || 'Tutorial'}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            initial={{ scale: 1 }}
            animate={{ 
              scale: isHovered ? 1.08 : 1,
              filter: isHovered ? 'brightness(0.7)' : 'brightness(1)'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Main Play Button - Center */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative"
                >
                  {/* Pulse Ring */}
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-primary/30"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                  
                  {/* Play Button */}
                  <div className="relative w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center group/play hover:bg-primary/90 transition-colors">
                    <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview Button - Bottom Left */}
          <AnimatePresence>
            {isHovered && showPreviewButton && onPreview && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="absolute bottom-3 left-3"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-foreground shadow-lg backdrop-blur-sm gap-2"
                      onClick={handlePreviewClick}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Abrir mini player</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Difficulty Badge */}
            {difficultyConfig && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Badge 
                  className={`${difficultyConfig.bgColor} ${difficultyConfig.color} border-0 shadow-lg backdrop-blur-sm font-medium`}
                >
                  {difficultyConfig.label}
                </Badge>
              </motion.div>
            )}
            
            {/* Category Badge - Shows on Hover */}
            <AnimatePresence>
              {isHovered && tutorial.category_pt && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  <Badge variant="secondary" className="bg-black/60 text-white border-0 shadow-lg backdrop-blur-sm">
                    {CategoryIcon && <CategoryIcon className="w-3 h-3 mr-1" />}
                    {tutorial.category_pt}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Top Right - Favorite Button */}
          <motion.div 
            className="absolute top-3 right-3"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0.8 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-9 h-9 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 ${
                    isFavorite 
                      ? 'bg-red-500/90 hover:bg-red-500 text-white' 
                      : 'bg-black/40 hover:bg-black/60 text-white hover:text-red-400'
                  }`}
                  onClick={handleFavoriteClick}
                >
                  <motion.div
                    animate={{ 
                      scale: isFavorite ? [1, 1.3, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-all duration-300 ${
                        isFavorite ? 'fill-current' : ''
                      }`} 
                    />
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Bottom Right - Duration */}
          {tutorial.duration_minutes && tutorial.duration_minutes > 0 && (
            <motion.div 
              className="absolute bottom-3 right-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(tutorial.duration_minutes)}
              </div>
            </motion.div>
          )}

          {/* Tools Count - Shows on Hover */}
          <AnimatePresence>
            {isHovered && tutorial.tools && tutorial.tools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2"
              >
                <div className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                  <Wrench className="w-3.5 h-3.5" />
                  {tutorial.tools.length} ferramenta{tutorial.tools.length > 1 ? 's' : ''}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Section */}
        <div className="p-4 relative">
          {/* Category Label */}
          {tutorial.category_pt && !isHovered && (
            <motion.p 
              className="text-xs text-primary font-semibold mb-1.5 uppercase tracking-wider flex items-center gap-1"
              initial={{ opacity: 1 }}
              animate={{ opacity: isHovered ? 0 : 1 }}
            >
              {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
              {tutorial.category_pt}
            </motion.p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300 leading-tight">
            {tutorial.title_pt || 'Tutorial'}
          </h3>

          {/* Description */}
          <AnimatePresence mode="wait">
            {tutorial.description_pt && (
              <motion.p 
                className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              >
                {tutorial.description_pt}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-4">
              {/* Views */}
              {tutorial.views_count !== undefined && tutorial.views_count > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{formatViewCount(tutorial.views_count)}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tutorial.views_count.toLocaleString()} visualizações</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Rating */}
              {tutorial.rating !== undefined && tutorial.rating > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{tutorial.rating.toFixed(1)}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Avaliação: {tutorial.rating.toFixed(1)}/5</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Arrow Indicator */}
            <motion.div
              animate={{ 
                x: isHovered ? 4 : 0,
                color: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
              }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </Card>
    </TooltipProvider>
  );
});

TutorialCard.displayName = 'TutorialCard';

// Helper para formatar contagem de views
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default TutorialCard;
