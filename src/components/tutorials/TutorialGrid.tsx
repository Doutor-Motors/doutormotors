import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Star, 
  Heart, 
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tutorial, SearchResult } from '@/types/tutorials';
import { formatDuration, getYouTubeThumbnail, DIFFICULTY_CONFIG } from '@/constants/tutorials';

interface TutorialGridProps {
  tutorials?: Tutorial[];
  searchResults?: SearchResult[];
  onTutorialClick?: (url: string) => void;
}

const TutorialGrid = ({ tutorials, searchResults, onTutorialClick }: TutorialGridProps) => {
  // Usar tutorials ou converter searchResults
  const items = tutorials || searchResults?.map((r) => ({
    id: r.url,
    slug: r.url,
    source_url: r.url,
    title_pt: r.title,
    description_pt: r.description,
    thumbnail_url: r.thumbnail,
  })) || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {items.map((item: any) => (
        <motion.div key={item.id || item.slug} variants={itemVariant}>
          <TutorialCard 
            tutorial={item} 
            onClick={() => onTutorialClick?.(item.source_url)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

interface TutorialCardProps {
  tutorial: Partial<Tutorial>;
  onClick?: () => void;
}

const TutorialCard = ({ tutorial, onClick }: TutorialCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const thumbnailUrl = tutorial.thumbnail_url || 
    (tutorial.youtube_video_id ? getYouTubeThumbnail(tutorial.youtube_video_id) : null) ||
    '/placeholder.svg';

  const difficultyConfig = tutorial.difficulty 
    ? DIFFICULTY_CONFIG[tutorial.difficulty as keyof typeof DIFFICULTY_CONFIG] 
    : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Integrar com API de favoritos
  };

  return (
    <Card 
      className="group overflow-hidden cursor-pointer bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={thumbnailUrl}
          alt={tutorial.title_pt || 'Tutorial'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay com Play */}
        <motion.div 
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1 : 0.8 }}
            className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
          >
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
          </motion.div>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {difficultyConfig && (
            <Badge className={`${difficultyConfig.bgColor} ${difficultyConfig.color} border-0`}>
              {difficultyConfig.label}
            </Badge>
          )}
        </div>

        {/* Duração */}
        {tutorial.duration_minutes && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(tutorial.duration_minutes)}
          </div>
        )}

        {/* Favorito */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white"
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Categoria */}
        {tutorial.category_pt && (
          <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wide">
            {tutorial.category_pt}
          </p>
        )}

        {/* Título */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {tutorial.title_pt || 'Tutorial'}
        </h3>

        {/* Descrição */}
        {tutorial.description_pt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {tutorial.description_pt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* Views */}
            {tutorial.views_count !== undefined && tutorial.views_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {tutorial.views_count.toLocaleString()}
              </span>
            )}
            
            {/* Rating */}
            {tutorial.rating !== undefined && tutorial.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {tutorial.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Card>
  );
};

export default TutorialGrid;
