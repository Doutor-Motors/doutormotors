import { useState, useEffect } from "react";
import { 
  Search, Loader2, Car, ChevronRight, ArrowLeft, Play, 
  BookOpen, Video, ExternalLink, Home, Filter, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface CarBrand {
  id: string;
  name: string;
  image: string;
  url?: string;
}

interface CarModel {
  id: string;
  name: string;
  years: string;
  image: string;
  url?: string;
}

interface Procedure {
  id: string;
  name: string;
  nameEn: string;
  url: string;
}

interface VideoCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  thumbnail?: string;
  url?: string;
  vehicleContext?: string;
  procedures?: Procedure[];
}

interface VideoDetails {
  title: string;
  description?: string;
  videoUrl?: string;
  sourceUrl?: string;
  steps?: string[];
  markdown?: string;
}

type ViewState = "brands" | "models" | "categories" | "procedures" | "video";

const StudyCarPage = () => {
  const { user } = useAuth();
  const { notifyError } = useNotifications();
  
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewState>("brands");
  const [isLoading, setIsLoading] = useState(false);
  
  // Data state
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  
  // Selection state
  const [selectedBrand, setSelectedBrand] = useState<CarBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  
  // Search/Filter state
  const [brandSearch, setBrandSearch] = useState("");
  const [quickSelectBrand, setQuickSelectBrand] = useState("");
  const [quickSelectModel, setQuickSelectModel] = useState("");
  const [quickSelectYear, setQuickSelectYear] = useState("");
  
  // User vehicle
  const [userVehicle, setUserVehicle] = useState<{ brand: string; model: string; year: number } | null>(null);

  // Fetch user's vehicle
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

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("carcare-api", {
        body: { action: "brands" },
      });

      if (error) throw error;
      
      if (data.success && data.data) {
        setBrands(data.data);
      }
    } catch (err) {
      console.error("Error loading brands:", err);
      notifyError("Erro", "Não foi possível carregar as marcas");
    }
    setIsLoading(false);
  };

  const handleBrandSelect = async (brand: CarBrand) => {
    setSelectedBrand(brand);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("carcare-api", {
        body: { action: "models", brand: brand.name },
      });

      if (error) throw error;
      
      if (data.success && data.data) {
        setModels(data.data);
        setCurrentView("models");
      }
    } catch (err) {
      console.error("Error loading models:", err);
      notifyError("Erro", "Não foi possível carregar os modelos");
    }
    setIsLoading(false);
  };

  const handleModelSelect = async (model: CarModel) => {
    setSelectedModel(model);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("carcare-api", {
        body: { 
          action: "videos", 
          brand: selectedBrand?.name,
          model: model.name,
          year: model.years.split("-")[0] || model.years
        },
      });

      if (error) throw error;
      
      if (data.success && data.data) {
        setCategories(data.data);
        setCurrentView("categories");
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      notifyError("Erro", "Não foi possível carregar as categorias");
    }
    setIsLoading(false);
  };

  const handleCategorySelect = async (category: VideoCategory) => {
    setSelectedCategory(category);
    
    // Se a categoria tem procedimentos, mostrar a view de procedimentos
    if (category.procedures && category.procedures.length > 0) {
      setCurrentView("procedures");
    } else {
      // Abrir diretamente no CarCareKiosk
      if (category.url) {
        window.open(category.url, "_blank");
      }
    }
  };

  const handleProcedureSelect = async (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("carcare-api", {
        body: { 
          action: "video-details", 
          procedure: procedure.url
        },
      });

      if (error) throw error;
      
      if (data.success && data.data) {
        setVideoDetails(data.data);
      }
    } catch (err) {
      console.error("Error loading video details:", err);
    }
    
    setCurrentView("video");
    setIsLoading(false);
  };

  const handleQuickSelect = async () => {
    if (!quickSelectBrand) return;
    
    setIsLoading(true);
    
    const brand = brands.find(b => b.name.toLowerCase() === quickSelectBrand.toLowerCase());
    setSelectedBrand(brand || { id: quickSelectBrand, name: quickSelectBrand, image: "" });
    
    if (quickSelectModel) {
      setSelectedModel({ 
        id: quickSelectModel, 
        name: quickSelectModel, 
        years: quickSelectYear || new Date().getFullYear().toString(),
        image: "" 
      });
      
      try {
        const { data, error } = await supabase.functions.invoke("carcare-api", {
          body: { 
            action: "videos", 
            brand: quickSelectBrand,
            model: quickSelectModel,
            year: quickSelectYear
          },
        });

        if (!error && data.success && data.data) {
          setCategories(data.data);
          setCurrentView("categories");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    } else {
      try {
        const { data, error } = await supabase.functions.invoke("carcare-api", {
          body: { action: "models", brand: quickSelectBrand },
        });

        if (!error && data.success && data.data) {
          setModels(data.data);
          setCurrentView("models");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
    
    setIsLoading(false);
  };

  const goBack = () => {
    switch (currentView) {
      case "models":
        setCurrentView("brands");
        setSelectedBrand(null);
        break;
      case "categories":
        setCurrentView("models");
        setSelectedModel(null);
        break;
      case "procedures":
        setCurrentView("categories");
        setSelectedCategory(null);
        break;
      case "video":
        if (selectedProcedure) {
          setCurrentView("procedures");
          setSelectedProcedure(null);
          setVideoDetails(null);
        } else {
          setCurrentView("categories");
          setSelectedCategory(null);
          setVideoDetails(null);
        }
        break;
    }
  };

  const goHome = () => {
    setCurrentView("brands");
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedCategory(null);
    setSelectedProcedure(null);
    setVideoDetails(null);
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const years = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Extrair YouTube video ID
  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    
    // Se já é uma URL de embed
    if (url.includes('/embed/')) {
      return url;
    }
    
    // Extrair video ID
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 md:pt-28">
        <AnimatePresence mode="wait">
          {/* BRANDS VIEW */}
          {currentView === "brands" && (
            <motion.div
              key="brands"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-16">
                <div className="container mx-auto px-4">
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Side - Info & Quick Select */}
                    <div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h1 className="font-chakra text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-foreground mb-4">
                          Estude seu <span className="text-primary">Carro</span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-2">
                          Com mais de 60.000 vídeos tutoriais gratuitos, aprenda a cuidar do seu veículo.
                        </p>
                        <p className="text-primary font-medium mb-6">
                          Prepare-se para o reparo™ com vídeos específicos para seu carro
                        </p>
                        
                        {userVehicle && (
                          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="text-sm text-muted-foreground mb-1">Seu veículo:</p>
                            <p className="font-bold text-lg">
                              {userVehicle.brand} {userVehicle.model} {userVehicle.year}
                            </p>
                            <Button 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setQuickSelectBrand(userVehicle.brand);
                                setQuickSelectModel(userVehicle.model);
                                setQuickSelectYear(userVehicle.year.toString());
                              }}
                            >
                              Buscar tutoriais para meu carro
                            </Button>
                          </div>
                        )}
                      </motion.div>

                      {/* Quick Select Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="font-chakra font-bold text-lg mb-4 flex items-center gap-2">
                              <Filter className="w-5 h-5 text-primary" />
                              Selecione seu Veículo
                            </h3>
                            <div className="space-y-3">
                              <Select value={quickSelectBrand} onValueChange={setQuickSelectBrand}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a Marca" />
                                </SelectTrigger>
                                <SelectContent>
                                  {brands.map(brand => (
                                    <SelectItem key={brand.id} value={brand.name}>
                                      {brand.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Input
                                placeholder="Digite o Modelo (ex: Civic, Corolla)"
                                value={quickSelectModel}
                                onChange={(e) => setQuickSelectModel(e.target.value)}
                              />

                              <Select value={quickSelectYear} onValueChange={setQuickSelectYear}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o Ano" />
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map(year => (
                                    <SelectItem key={year} value={year}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button 
                                className="w-full font-chakra uppercase" 
                                onClick={handleQuickSelect}
                                disabled={!quickSelectBrand || isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <Search className="w-4 h-4 mr-2" />
                                )}
                                Buscar Tutoriais
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Right Side - Brand Grid Title */}
                    <div>
                      <h2 className="font-chakra text-xl font-bold uppercase mb-4 text-center lg:text-left">
                        Ou navegue por marca
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 text-center lg:text-left">
                        Clique em uma marca para ver os modelos disponíveis
                      </p>
                      
                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar marca..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Brands Grid */}
              <section className="py-8">
                <div className="container mx-auto px-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-chakra font-bold text-lg">
                      {filteredBrands.length} Marcas Disponíveis
                    </h3>
                    <Button variant="ghost" size="sm" onClick={loadBrands}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredBrands.map((brand, index) => (
                        <motion.div
                          key={brand.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <Card 
                            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group overflow-hidden"
                            onClick={() => handleBrandSelect(brand)}
                          >
                            <div className="aspect-[4/3] relative bg-muted">
                              <img
                                src={brand.image}
                                alt={brand.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <Badge className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                                {brand.name}
                              </Badge>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* MODELS VIEW */}
          {currentView === "models" && selectedBrand && (
            <motion.div
              key="models"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Breadcrumb */}
              <section className="bg-muted/50 py-4 border-b">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Button variant="ghost" size="sm" onClick={goHome}>
                      <Home className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-primary font-medium">{selectedBrand.name}</span>
                  </div>
                </div>
              </section>

              {/* Header */}
              <section className="py-8 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={goBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                      <h1 className="font-chakra text-3xl font-bold uppercase flex items-center gap-3">
                        <Car className="w-8 h-8 text-primary" />
                        {selectedBrand.name}
                      </h1>
                      <p className="text-muted-foreground">
                        Selecione o modelo do seu veículo • {models.length} modelos
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Models Grid */}
              <section className="py-8">
                <div className="container mx-auto px-4">
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
                      ))}
                    </div>
                  ) : models.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {models.map((model, index) => (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Card 
                            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group overflow-hidden"
                            onClick={() => handleModelSelect(model)}
                          >
                            <div className="aspect-[4/3] relative bg-muted">
                              <img
                                src={model.image}
                                alt={model.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <div className="absolute bottom-3 left-0 right-0 text-center">
                                <p className="font-bold text-white text-lg drop-shadow-lg">{model.name}</p>
                                <Badge variant="secondary" className="mt-1">
                                  {model.years}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground">
                        Nenhum modelo encontrado para esta marca.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* CATEGORIES VIEW */}
          {currentView === "categories" && selectedBrand && selectedModel && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Breadcrumb */}
              <section className="bg-muted/50 py-4 border-b">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Button variant="ghost" size="sm" onClick={goHome}>
                      <Home className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span 
                      className="text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => { setCurrentView("brands"); setSelectedBrand(null); }}
                    >
                      {selectedBrand.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-primary font-medium">
                      {selectedModel.name} ({selectedModel.years})
                    </span>
                  </div>
                </div>
              </section>

              {/* Header */}
              <section className="py-8 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-4 mb-2">
                    <Button variant="outline" size="icon" onClick={goBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                      <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase">
                        {selectedBrand.name} {selectedModel.name}
                      </h1>
                      <p className="text-muted-foreground">
                        Selecione um tutorial de manutenção • {categories.length} categorias
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Categories Grid */}
              <section className="py-8">
                <div className="container mx-auto px-4">
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                      ))}
                    </div>
                  ) : categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {categories.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Card 
                            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group h-full"
                            onClick={() => handleCategorySelect(category)}
                          >
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full min-h-[120px] relative">
                              {category.procedures && category.procedures.length > 0 && (
                                <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                                  {category.procedures.length}
                                </Badge>
                              )}
                              <span className="text-4xl mb-2">{category.icon}</span>
                              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                {category.name}
                              </p>
                              {category.nameEn !== category.name && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {category.nameEn}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground">
                        Nenhuma categoria encontrada para este modelo.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* PROCEDURES VIEW */}
          {currentView === "procedures" && selectedBrand && selectedModel && selectedCategory && (
            <motion.div
              key="procedures"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Breadcrumb */}
              <section className="bg-muted/50 py-4 border-b">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Button variant="ghost" size="sm" onClick={goHome}>
                      <Home className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span 
                      className="text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => { setCurrentView("brands"); setSelectedBrand(null); }}
                    >
                      {selectedBrand.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span 
                      className="text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => { setCurrentView("models"); setSelectedModel(null); }}
                    >
                      {selectedModel.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-primary font-medium">{selectedCategory.name}</span>
                  </div>
                </div>
              </section>

              {/* Header */}
              <section className="py-8 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-4 mb-2">
                    <Button variant="outline" size="icon" onClick={goBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                      <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase flex items-center gap-3">
                        <span className="text-4xl">{selectedCategory.icon}</span>
                        {selectedCategory.name}
                      </h1>
                      <p className="text-muted-foreground">
                        {selectedBrand.name} {selectedModel.name} ({selectedModel.years}) • Selecione um procedimento
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Procedures List */}
              <section className="py-8">
                <div className="container mx-auto px-4">
                  <div className="grid gap-4 max-w-2xl">
                    {selectedCategory.procedures?.map((procedure, index) => (
                      <motion.div
                        key={procedure.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                          onClick={() => handleProcedureSelect(procedure)}
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Play className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium group-hover:text-primary transition-colors">
                                  {procedure.name}
                                </p>
                                {procedure.nameEn !== procedure.name && (
                                  <p className="text-sm text-muted-foreground">
                                    {procedure.nameEn}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(procedure.url, "_blank");
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Link para página do CarCareKiosk */}
                  {selectedCategory.url && (
                    <div className="mt-8 text-center">
                      <Button variant="outline" asChild>
                        <a 
                          href={selectedCategory.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver todos os tutoriais de {selectedCategory.name} no CarCareKiosk
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* VIDEO VIEW */}
          {currentView === "video" && selectedBrand && selectedModel && selectedCategory && (
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
                    <Button variant="ghost" size="sm" onClick={goHome}>
                      <Home className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span 
                      className="text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => { setCurrentView("brands"); setSelectedBrand(null); }}
                    >
                      {selectedBrand.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span 
                      className="text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => { setCurrentView("models"); setSelectedModel(null); }}
                    >
                      {selectedModel.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span 
                      className="text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={() => { setCurrentView("procedures"); setSelectedProcedure(null); }}
                    >
                      {selectedCategory.name}
                    </span>
                    {selectedProcedure && (
                      <>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-primary font-medium">{selectedProcedure.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Video Content */}
              <section className="py-8">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={goBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                      <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase">
                        {selectedCategory.icon} {selectedProcedure?.name || selectedCategory.name}
                      </h1>
                      <p className="text-muted-foreground">
                        {selectedBrand.name} {selectedModel.name} ({selectedModel.years})
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Video */}
                    <div className="lg:col-span-2">
                      <Card className="overflow-hidden">
                        {isLoading ? (
                          <Skeleton className="aspect-video" />
                        ) : videoDetails?.videoUrl ? (
                          <AspectRatio ratio={16 / 9}>
                            <iframe
                              src={getYouTubeEmbedUrl(videoDetails.videoUrl) || videoDetails.videoUrl}
                              title={videoDetails.title || selectedCategory.name}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </AspectRatio>
                        ) : (
                          <div className="aspect-video bg-muted flex flex-col items-center justify-center p-8 text-center">
                            <Video className="w-16 h-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">Vídeo em carregamento...</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Clique abaixo para assistir no CarCareKiosk
                            </p>
                            {(selectedProcedure?.url || selectedCategory.url) && (
                              <Button asChild>
                                <a 
                                  href={selectedProcedure?.url || selectedCategory.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Abrir no CarCareKiosk
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                        
                        <CardContent className="p-6">
                          <h2 className="font-chakra font-bold text-xl mb-2">
                            {videoDetails?.title || `${selectedProcedure?.name || selectedCategory.name} - ${selectedBrand.name} ${selectedModel.name}`}
                          </h2>
                          {videoDetails?.description && (
                            <p className="text-muted-foreground">{videoDetails.description}</p>
                          )}
                          
                          {(selectedProcedure?.url || selectedCategory.url) && (
                            <Button variant="outline" asChild className="mt-4">
                              <a 
                                href={selectedProcedure?.url || selectedCategory.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver tutorial completo no CarCareKiosk
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      {/* Steps */}
                      {videoDetails?.steps && videoDetails.steps.length > 0 && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" />
                              Passo a Passo
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ol className="space-y-3">
                              {videoDetails.steps.map((step, index) => (
                                <li key={index} className="flex gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </span>
                                  <span className="text-muted-foreground">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
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
                              .filter(c => c.id !== selectedCategory.id)
                              .slice(0, 8)
                              .map((category) => (
                                <button
                                  key={category.id}
                                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                                  onClick={() => handleCategorySelect(category)}
                                >
                                  <span className="text-2xl">{category.icon}</span>
                                  <div>
                                    <p className="font-medium text-sm">{category.name}</p>
                                    {category.nameEn !== category.name && (
                                      <p className="text-xs text-muted-foreground">{category.nameEn}</p>
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
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyCarPage;
