import { motion } from 'framer-motion';
import type { Tutorial, SearchResult } from '@/types/tutorials';
import TutorialCard from './TutorialCard';
import { useTutorialFavorites } from '@/hooks/useTutorialFavorites';

interface TutorialGridProps {
  tutorials?: Tutorial[];
  searchResults?: SearchResult[];
  onTutorialClick?: (url: string) => void;
  onPreview?: (tutorial: Partial<Tutorial>) => void;
  showPreviewButton?: boolean;
}

const TutorialGrid = ({ 
  tutorials, 
  searchResults, 
  onTutorialClick,
  onPreview,
  showPreviewButton = true
}: TutorialGridProps) => {
  const { isFavorite, toggleFavorite } = useTutorialFavorites();

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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      {items.map((item: any) => (
        <motion.div key={item.id || item.slug} variants={itemVariant}>
          <TutorialCard 
            tutorial={item} 
            isFavorite={item.id ? isFavorite(item.id) : false}
            onClick={() => onTutorialClick?.(item.source_url)}
            onPreview={onPreview}
            onFavoriteToggle={toggleFavorite}
            showPreviewButton={showPreviewButton}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TutorialGrid;
