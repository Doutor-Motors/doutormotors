import { useState, useEffect } from "react";
import { Search, Loader2, Car, BookOpen, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryCard from "@/components/tutorials/CategoryCard";
import TutorialCard from "@/components/tutorials/TutorialCard";
import TutorialViewer from "@/components/tutorials/TutorialViewer";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { 
  searchTutorials, 
  fetchTutorialContent,
  Tutorial, 
  TutorialContent,
  TUTORIAL_CATEGORIES 
} from "@/services/tutorials/api";
import { motion, AnimatePresence } from "framer-motion";

const StudyCarPage = () => {
  const { user } = useAuth();
  const { notifyError, notifyInfo } = useNotifications();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [tutorialContent, setTutorialContent] = useState<TutorialContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [userVehicle, setUserVehicle] = useState<{ brand: string; model: string; year: number } | null>(null);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);

  // Fetch user's first vehicle for personalized content
  useEffect(() => {
    const fetchUserVehicle = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('vehicles')
        .select('brand, model, year')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setUserVehicle(data);
      }
    };

    fetchUserVehicle();
  }, [user]);

  // Load featured tutorials on mount
  useEffect(() => {
    if (!featuredLoaded) {
      handleSearch("car repair maintenance");
      setFeaturedLoaded(true);
    }
  }, [featuredLoaded]);

  const handleSearch = async (query?: string) => {
    const searchText = query || searchQuery;
    if (!searchText && !selectedCategory) return;

    setIsSearching(true);
    
    const response = await searchTutorials({
      query: searchText,
      category: selectedCategory || undefined,
      vehicleBrand: userVehicle?.brand,
      vehicleModel: userVehicle?.model,
      vehicleYear: userVehicle?.year,
      limit: 12,
    });

    if (response.success && response.tutorials) {
      setTutorials(response.tutorials);
    } else {
      notifyError("Erro na busca", response.error || "Não foi possível buscar tutoriais");
    }

    setIsSearching(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    setSelectedTutorial(null);
    setTutorialContent(null);
    
    // Search with new category
    setTimeout(() => {
      handleSearch(searchQuery || categoryId);
    }, 100);
  };

  const handleTutorialClick = async (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setIsLoadingContent(true);
    notifyInfo("Carregando", "Buscando conteúdo do tutorial...");

    const response = await fetchTutorialContent(tutorial.url, userVehicle || undefined);

    if (response.success && response.content) {
      setTutorialContent(response.content);
    } else {
      notifyError("Erro ao carregar", response.error || "Não foi possível carregar o tutorial");
      setSelectedTutorial(null);
    }

    setIsLoadingContent(false);
  };

  const handleCloseViewer = () => {
    setSelectedTutorial(null);
    setTutorialContent(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {tutorialContent && selectedTutorial ? (
            <motion.div
              key="viewer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-8"
            >
              <TutorialViewer content={tutorialContent} onClose={handleCloseViewer} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section */}
              <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h1 className="font-chakra text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-foreground mb-4">
                        Estude seu <span className="text-primary">Carro</span>
                      </h1>
                      <p className="text-lg md:text-xl text-muted-foreground mb-8">
                        Aprenda a cuidar do seu veículo com tutoriais detalhados e didáticos.
                        {userVehicle && (
                          <span className="block mt-2 text-primary font-medium">
                            📍 Conteúdo personalizado para seu {userVehicle.brand} {userVehicle.model}
                          </span>
                        )}
                      </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-2 max-w-xl mx-auto"
                    >
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Buscar tutorial... (ex: troca de óleo, freios)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="pl-10 h-12 text-lg"
                        />
                      </div>
                      <Button 
                        size="lg" 
                        onClick={() => handleSearch()}
                        disabled={isSearching}
                        className="font-chakra uppercase"
                      >
                        {isSearching ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Buscar"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 opacity-10">
                  <Car className="w-32 h-32 text-primary" />
                </div>
                <div className="absolute bottom-10 right-10 opacity-10">
                  <BookOpen className="w-24 h-24 text-primary" />
                </div>
              </section>

              {/* Categories Section */}
              <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                  <h2 className="font-chakra text-2xl font-bold uppercase text-foreground mb-6 text-center">
                    Categorias
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {TUTORIAL_CATEGORIES.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CategoryCard
                          {...category}
                          isSelected={selectedCategory === category.id}
                          onClick={handleCategoryClick}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Tutorials Grid */}
              <section className="py-12">
                <div className="container mx-auto px-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-chakra text-2xl font-bold uppercase text-foreground">
                      {selectedCategory 
                        ? `Tutoriais de ${TUTORIAL_CATEGORIES.find(c => c.id === selectedCategory)?.name}`
                        : "Tutoriais em Destaque"
                      }
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSearch(searchQuery || "car maintenance")}
                      disabled={isSearching}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isSearching ? "animate-spin" : ""}`} />
                      Atualizar
                    </Button>
                  </div>

                  {isSearching ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <Card key={i}>
                          <Skeleton className="h-40 w-full" />
                          <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : tutorials.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {tutorials.map((tutorial, index) => (
                        <motion.div
                          key={tutorial.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TutorialCard 
                            tutorial={tutorial} 
                            onClick={handleTutorialClick}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
                        Nenhum tutorial encontrado
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Tente uma busca diferente ou selecione uma categoria
                      </p>
                      <Button onClick={() => handleSearch("car repair")}>
                        Ver Tutoriais Populares
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* Loading Content Modal */}
              {isLoadingContent && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <Card className="max-w-sm w-full mx-4">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                      <h3 className="font-chakra font-bold text-lg mb-2">Carregando Tutorial</h3>
                      <p className="text-muted-foreground text-sm">
                        Buscando e processando conteúdo do CarCareKiosk...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Info Section */}
              <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                  <div className="grid md:grid-cols-3 gap-8">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-chakra font-bold text-lg mb-2">Tutoriais em Vídeo</h3>
                        <p className="text-muted-foreground text-sm">
                          Aprenda visualmente com tutoriais passo a passo
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-chakra font-bold text-lg mb-2">Guias Detalhados</h3>
                        <p className="text-muted-foreground text-sm">
                          Instruções claras em português brasileiro
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Car className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-chakra font-bold text-lg mb-2">Específico por Veículo</h3>
                        <p className="text-muted-foreground text-sm">
                          Conteúdo personalizado para seu carro
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default StudyCarPage;
