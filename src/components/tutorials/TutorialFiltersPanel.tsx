import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  X, 
  Clock, 
  Star, 
  TrendingUp, 
  Calendar,
  Video,
  Filter,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DIFFICULTY_CONFIG } from '@/constants/tutorials';
import type { TutorialDifficulty } from '@/types/tutorials';

// Tipos de filtros
export interface TutorialFilters {
  difficulty: TutorialDifficulty | 'all';
  duration: 'all' | 'short' | 'medium' | 'long';
  hasVideo: boolean | null;
  sortBy: 'recent' | 'popular' | 'rating' | 'duration';
}

// Valores padrão
export const DEFAULT_FILTERS: TutorialFilters = {
  difficulty: 'all',
  duration: 'all',
  hasVideo: null,
  sortBy: 'popular',
};

// Configuração de duração
const DURATION_OPTIONS = [
  { value: 'all', label: 'Todas', description: 'Qualquer duração' },
  { value: 'short', label: 'Curto', description: 'Até 15 min', maxMinutes: 15 },
  { value: 'medium', label: 'Médio', description: '15-45 min', maxMinutes: 45 },
  { value: 'long', label: 'Longo', description: '45+ min', maxMinutes: Infinity },
];

// Configuração de ordenação
const SORT_OPTIONS = [
  { value: 'popular', label: 'Mais populares', icon: TrendingUp },
  { value: 'recent', label: 'Mais recentes', icon: Calendar },
  { value: 'rating', label: 'Melhor avaliados', icon: Star },
  { value: 'duration', label: 'Duração', icon: Clock },
];

interface TutorialFiltersProps {
  filters: TutorialFilters;
  onFiltersChange: (filters: TutorialFilters) => void;
  onApply?: () => void;
  resultsCount?: number;
}

const TutorialFiltersPanel = memo(({ 
  filters, 
  onFiltersChange,
  onApply,
  resultsCount
}: TutorialFiltersProps) => {

  // Contar filtros ativos
  const activeFiltersCount = [
    filters.difficulty !== 'all',
    filters.duration !== 'all',
    filters.hasVideo !== null,
    filters.sortBy !== 'popular',
  ].filter(Boolean).length;

  // Handlers
  const handleDifficultyChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, difficulty: value as TutorialFilters['difficulty'] });
  }, [filters, onFiltersChange]);

  const handleDurationChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, duration: value as TutorialFilters['duration'] });
  }, [filters, onFiltersChange]);

  const handleHasVideoChange = useCallback((checked: boolean) => {
    onFiltersChange({ ...filters, hasVideo: checked ? true : null });
  }, [filters, onFiltersChange]);

  const handleSortChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, sortBy: value as TutorialFilters['sortBy'] });
  }, [filters, onFiltersChange]);

  const handleReset = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          <AnimatePresence>
            {activeFiltersCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium"
              >
                {activeFiltersCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtros Avançados
          </SheetTitle>
          <SheetDescription>
            Refine sua busca por tutoriais
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Dificuldade */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Dificuldade</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filters.difficulty === 'all' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => handleDifficultyChange('all')}
              >
                Todas
              </Badge>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                <Badge
                  key={key}
                  variant={filters.difficulty === key ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    filters.difficulty === key 
                      ? `${config.bgColor} ${config.color} border-0` 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleDifficultyChange(key)}
                >
                  {config.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Duração */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Duração</Label>
            <Select value={filters.duration} onValueChange={handleDurationChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({option.description})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tem Vídeo */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4" />
                Apenas com vídeo
              </Label>
              <p className="text-xs text-muted-foreground">
                Mostrar apenas tutoriais com vídeo disponível
              </p>
            </div>
            <Switch
              checked={filters.hasVideo === true}
              onCheckedChange={handleHasVideoChange}
            />
          </div>

          <Separator />

          {/* Ordenação */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ordenar por</Label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = filters.sortBy === option.value;
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => handleSortChange(option.value)}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          {resultsCount !== undefined && (
            <p className="text-sm text-muted-foreground text-center">
              {resultsCount} tutorial{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
            </p>
          )}
          
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleReset}
              disabled={activeFiltersCount === 0}
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </Button>
            
            <SheetClose asChild>
              <Button className="flex-1" onClick={onApply}>
                Aplicar filtros
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

TutorialFiltersPanel.displayName = 'TutorialFiltersPanel';

// Função utilitária para aplicar filtros a uma lista de tutoriais
export function applyFilters(
  tutorials: any[],
  filters: TutorialFilters
): any[] {
  let filtered = [...tutorials];

  // Filtrar por dificuldade
  if (filters.difficulty !== 'all') {
    filtered = filtered.filter(t => t.difficulty === filters.difficulty);
  }

  // Filtrar por duração
  if (filters.duration !== 'all') {
    const durationConfig = DURATION_OPTIONS.find(d => d.value === filters.duration);
    if (durationConfig) {
      filtered = filtered.filter(t => {
        const duration = t.duration_minutes || 0;
        switch (filters.duration) {
          case 'short':
            return duration <= 15;
          case 'medium':
            return duration > 15 && duration <= 45;
          case 'long':
            return duration > 45;
          default:
            return true;
        }
      });
    }
  }

  // Filtrar por vídeo
  if (filters.hasVideo === true) {
    filtered = filtered.filter(t => 
      t.youtube_video_id || t.video_url
    );
  }

  // Ordenar
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'recent':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'popular':
        return (b.views_count || 0) - (a.views_count || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'duration':
        return (a.duration_minutes || 0) - (b.duration_minutes || 0);
      default:
        return 0;
    }
  });

  return filtered;
}

export default TutorialFiltersPanel;
