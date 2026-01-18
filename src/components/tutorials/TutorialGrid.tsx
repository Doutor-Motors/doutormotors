import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useTutorialFavorites();

  // Usar tutorials ou converter searchResults
  const items = tutorials || searchResults?.map((r) => ({
    id: r.url,
    slug: encodeURIComponent(r.url),
    source_url: r.url,
    title_pt: r.title,
    description_pt: r.description,
    thumbnail_url: r.thumbnail,
  })) || [];

  const handleCardClick = useCallback((item: Partial<Tutorial>) => {
    // Se tiver slug real, navegar para página de detalhes
    if (item.slug && !item.slug.startsWith('http')) {
      navigate(`/estude-seu-carro/${item.slug}`);
    } else if (item.source_url) {
      // Para resultados de busca, usar callback ou navegar com URL como param
      if (onTutorialClick) {
        onTutorialClick(item.source_url);
      } else {
        navigate(`/estude-seu-carro/${encodeURIComponent(item.id || 'tutorial')}?url=${encodeURIComponent(item.source_url)}`);
      }
    }
  }, [navigate, onTutorialClick]);

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
            onClick={() => handleCardClick(item)}
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
