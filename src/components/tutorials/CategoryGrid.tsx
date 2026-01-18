import { motion } from 'framer-motion';
import { 
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
  Wrench,
  Layout,
  LucideIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TutorialCategory } from '@/types/tutorials';

// Mapa de ícones
const ICON_MAP: Record<string, LucideIcon> = {
  'disc': Disc,
  'git-merge': GitMerge,
  'cog': Cog,
  'zap': Zap,
  'settings': Settings,
  'thermometer': Thermometer,
  'wind': Wind,
  'navigation': Navigation,
  'snowflake': Snowflake,
  'fuel': Fuel,
  'wrench': Wrench,
  'layout': Layout,
};

// Cores das categorias
const COLOR_MAP: Record<string, string> = {
  'red': 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50',
  'blue': 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
  'gray': 'from-gray-500/20 to-gray-600/10 border-gray-500/30 hover:border-gray-500/50',
  'yellow': 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-500/50',
  'purple': 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
  'cyan': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
  'orange': 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50',
  'green': 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
  'sky': 'from-sky-500/20 to-sky-600/10 border-sky-500/30 hover:border-sky-500/50',
  'amber': 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
  'teal': 'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50',
  'brown': 'from-amber-700/20 to-amber-800/10 border-amber-700/30 hover:border-amber-700/50',
};

const ICON_COLOR_MAP: Record<string, string> = {
  'red': 'text-red-500',
  'blue': 'text-blue-500',
  'gray': 'text-gray-500',
  'yellow': 'text-yellow-500',
  'purple': 'text-purple-500',
  'cyan': 'text-cyan-500',
  'orange': 'text-orange-500',
  'green': 'text-green-500',
  'sky': 'text-sky-500',
  'amber': 'text-amber-500',
  'teal': 'text-teal-500',
  'brown': 'text-amber-700',
};

interface CategoryGridProps {
  categories: Partial<TutorialCategory>[];
  onSelect: (category: string) => void;
  selectedCategory?: string | null;
}

const CategoryGrid = ({ categories, onSelect, selectedCategory }: CategoryGridProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
    >
      {categories.map((category) => {
        const IconComponent = ICON_MAP[category.icon || 'wrench'] || Wrench;
        const colorClass = COLOR_MAP[category.color || 'gray'];
        const iconColorClass = ICON_COLOR_MAP[category.color || 'gray'];
        const isSelected = selectedCategory === category.name_pt;

        return (
          <motion.div key={category.slug} variants={item}>
            <Card
              className={`
                relative overflow-hidden cursor-pointer
                bg-gradient-to-br ${colorClass}
                transition-all duration-300
                hover:scale-105 hover:shadow-lg
                ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
              `}
              onClick={() => onSelect(category.name_pt || category.slug || '')}
            >
              <div className="p-4 md:p-5 text-center">
                {/* Ícone */}
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-background/50 flex items-center justify-center">
                  <IconComponent className={`w-6 h-6 ${iconColorClass}`} />
                </div>

                {/* Nome */}
                <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                  {category.name_pt}
                </h3>

                {/* Contagem de tutoriais */}
                {category.tutorials_count !== undefined && category.tutorials_count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {category.tutorials_count} tutorial{category.tutorials_count !== 1 ? 's' : ''}
                  </Badge>
                )}

                {/* Efeito de hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default CategoryGrid;
