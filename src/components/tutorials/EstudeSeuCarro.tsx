import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Car, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Play,
  Filter,
  X,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import VehicleSelector from '@/components/tutorials/VehicleSelector';
import CategoryGrid from '@/components/tutorials/CategoryGrid';
import TutorialGrid from '@/components/tutorials/TutorialGrid';
import MiniPlayer from '@/components/tutorials/MiniPlayer';
import TutorialFiltersPanel, { 
  TutorialFilters, 
  DEFAULT_FILTERS, 
  applyFilters 
} from '@/components/tutorials/TutorialFiltersPanel';
import { tutorialApi } from '@/services/tutorials/tutorialApi';
import type { Tutorial, TutorialCategory, SelectedVehicle, SearchResult } from '@/types/tutorials';
import { DEFAULT_CATEGORIES } from '@/constants/tutorials';

const EstudeSeuCarro = () => {
  const { toast } = useToast();
  
  // Estados principais
  const [selectedVehicle, setSelectedVehicle] = useState<SelectedVehicle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Dados
  const [categories, setCategories] = useState<Partial<TutorialCategory>[]>(DEFAULT_CATEGORIES);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'tutorials' | 'search'>('categories');
  
  // Filtros avançados
  const [filters, setFilters] = useState<TutorialFilters>(DEFAULT_FILTERS);
  
  // Mini Player State
  const [miniPlayerTutorial, setMiniPlayerTutorial] = useState<Partial<Tutorial> | null>(null);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);

  // Tutoriais filtrados
  const filteredTutorials = useMemo(() => {
    return applyFilters(tutorials, filters);
  }, [tutorials, filters]);

  // Handler para seleção de veículo
  const handleVehicleSelect = useCallback(async (vehicle: SelectedVehicle) => {
    setSelectedVehicle(vehicle);
    setIsSyncing(true);
    
    try {
      // Sincronizar tutoriais para o veículo
      const result = await tutorialApi.sync({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year.toString(),
      });
      
      if (result.synced > 0) {
        toast({
          title: 'Tutoriais sincronizados!',
          description: `${result.synced} tutoriais encontrados para ${vehicle.displayName}`,
        });
        setTutorials(result.tutorials);
        setViewMode('tutorials');
      } else {
        toast({
          title: 'Buscando tutoriais...',
          description: 'Selecione uma categoria para ver os tutoriais disponíveis',
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Veículo selecionado',
        description: 'Navegue pelas categorias para encontrar tutoriais',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [toast]);

  // Handler para seleção de categoria
  const handleCategorySelect = useCallback(async (category: string) => {
    setSelectedCategory(category);
    setIsSearching(true);
    
    try {
      // Buscar tutoriais da categoria
      const query = selectedVehicle 
        ? `${selectedVehicle.make} ${selectedVehicle.model} ${category}`
        : category;
      
      const results = await tutorialApi.search({ 
        query,
        category,
        make: selectedVehicle?.make,
        model: selectedVehicle?.model,
        year: selectedVehicle?.year?.toString(),
      });
      
      setSearchResults(results);
      setViewMode('search');
    } catch (error) {
      console.error('Category search error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar',
        description: 'Não foi possível carregar os tutoriais. Tente novamente.',
      });
    } finally {
      setIsSearching(false);
    }
  }, [selectedVehicle, toast]);

  // Handler para busca
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const results = await tutorialApi.search({
        query: searchQuery,
        make: selectedVehicle?.make,
        model: selectedVehicle?.model,
        year: selectedVehicle?.year?.toString(),
      });
      
      setSearchResults(results);
      setViewMode('search');
      
      if (results.length === 0) {
        toast({
          title: 'Nenhum resultado',
          description: 'Tente outros termos ou navegue pelas categorias',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na busca',
        description: 'Não foi possível buscar. Tente novamente.',
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedVehicle, toast]);

  // Voltar para categorias
  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setSearchResults([]);
    setViewMode('categories');
  }, []);

  // Limpar veículo
  const handleClearVehicle = useCallback(() => {
    setSelectedVehicle(null);
    setTutorials([]);
    setSearchResults([]);
    setViewMode('categories');
  }, []);

  // Handler para preview no Mini Player
  const handlePreview = useCallback(async (tutorial: Partial<Tutorial>) => {
    // Se já temos os dados completos, usar direto
    if (tutorial.steps && tutorial.steps.length > 0) {
      setMiniPlayerTutorial(tutorial);
      setIsMiniPlayerVisible(true);
      return;
    }

    // Caso contrário, buscar dados completos
    if (tutorial.source_url) {
      try {
        toast({
          title: 'Carregando tutorial...',
          description: 'Buscando informações detalhadas',
        });
        
        const fullTutorial = await tutorialApi.fetch(tutorial.source_url);
        setMiniPlayerTutorial(fullTutorial);
        setIsMiniPlayerVisible(true);
      } catch (error) {
        console.error('Error loading tutorial for preview:', error);
        // Usar dados parciais mesmo assim
        setMiniPlayerTutorial(tutorial);
        setIsMiniPlayerVisible(true);
      }
    } else {
      // Usar dados parciais
      setMiniPlayerTutorial(tutorial);
      setIsMiniPlayerVisible(true);
    }
  }, [toast]);

  // Fechar Mini Player
  const handleCloseMiniPlayer = useCallback(() => {
    setIsMiniPlayerVisible(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        
        <div className="relative container mx-auto px-4 py-8 md:py-12">
          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Tutoriais em Vídeo</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Estude seu <span className="text-primary">Carro</span>
            </h1>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Aprenda a fazer manutenções e reparos com tutoriais passo a passo em vídeo
            </p>
          </motion.div>

          {/* Seletor de Veículo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto mb-8"
          >
            {selectedVehicle ? (
              <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Veículo selecionado</p>
                      <p className="font-semibold text-foreground">{selectedVehicle.displayName}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearVehicle}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Trocar
                  </Button>
                </div>
              </Card>
            ) : (
              <VehicleSelector onSelect={handleVehicleSelect} isLoading={isSyncing} />
            )}
          </motion.div>

          {/* Barra de Busca */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tutoriais... ex: trocar pastilhas de freio"
                  className="pl-12 pr-24 h-14 text-lg bg-card/50 backdrop-blur border-border/50 focus:border-primary/50"
                />
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Buscar'
                  )}
                </Button>
              </div>
            </form>
            
            {/* Tags de busca rápida */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Troca de óleo', 'Freios', 'Bateria', 'Filtro de ar', 'Velas'].map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Breadcrumb / Navegação */}
          {(selectedCategory || viewMode === 'search') && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 mb-6"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCategories}
                className="text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Categorias
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {selectedCategory || 'Resultados da busca'}
              </span>
              {searchResults.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {(isSearching || isSyncing) && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Categories View */}
          {viewMode === 'categories' && !isSearching && !isSyncing && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Categorias de Tutoriais
                </h2>
                <TutorialFiltersPanel 
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
              
              <CategoryGrid 
                categories={categories} 
                onSelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </motion.div>
          )}

          {/* Tutorials View */}
          {viewMode === 'tutorials' && filteredTutorials.length > 0 && !isSearching && (
            <motion.div
              key="tutorials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Tutoriais para {selectedVehicle?.displayName}
                  {filteredTutorials.length !== tutorials.length && (
                    <Badge variant="secondary" className="ml-2">
                      {filteredTutorials.length} de {tutorials.length}
                    </Badge>
                  )}
                </h2>
                <TutorialFiltersPanel 
                  filters={filters}
                  onFiltersChange={setFilters}
                  resultsCount={filteredTutorials.length}
                />
              </div>
              
              <TutorialGrid 
                tutorials={filteredTutorials}
                onPreview={handlePreview}
              />
            </motion.div>
          )}

          {/* No results after filtering */}
          {viewMode === 'tutorials' && tutorials.length > 0 && filteredTutorials.length === 0 && !isSearching && (
            <motion.div
              key="no-filter-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum tutorial com esses filtros
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros para ver mais resultados
              </p>
              <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Limpar filtros
              </Button>
            </motion.div>
          )}

          {/* Search Results View */}
          {viewMode === 'search' && searchResults.length > 0 && !isSearching && (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TutorialGrid 
                searchResults={searchResults}
                onPreview={handlePreview}
                onTutorialClick={async (url) => {
                  try {
                    const tutorial = await tutorialApi.fetch(url);
                    handlePreview(tutorial);
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Erro ao carregar',
                      description: 'Não foi possível carregar o tutorial.',
                    });
                  }
                }}
              />
            </motion.div>
          )}

          {/* Empty State */}
          {viewMode === 'search' && searchResults.length === 0 && !isSearching && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum tutorial encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente outros termos de busca ou navegue pelas categorias
              </p>
              <Button variant="outline" onClick={handleBackToCategories}>
                Ver categorias
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini Player */}
      <MiniPlayer
        tutorial={miniPlayerTutorial}
        isVisible={isMiniPlayerVisible}
        onClose={handleCloseMiniPlayer}
      />
    </div>
  );
};

export default EstudeSeuCarro;
