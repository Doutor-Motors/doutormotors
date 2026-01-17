import { useState, useEffect } from "react";
import { 
  Search, Loader2, Car, ChevronRight, ArrowLeft, Play, 
  BookOpen, Video, ExternalLink, Home 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { 
  fetchBrands, 
  fetchModels, 
  fetchMaintenanceCategories,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  CarBrand,
  CarModel,
  MaintenanceCategory,
} from "@/services/carcare/api";
import { motion, AnimatePresence } from "framer-motion";

type ViewState = "brands" | "models" | "tutorials" | "video";

const StudyCarPage = () => {
  const { user } = useAuth();
  const { notifyError, notifyInfo } = useNotifications();
  
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewState>("brands");
  const [isLoading, setIsLoading] = useState(false);
  
  // Data state
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [categories, setCategories] = useState<MaintenanceCategory[]>([]);
  
  // Selection state
  const [selectedBrand, setSelectedBrand] = useState<CarBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  
  // Search state
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
    const response = await fetchBrands();
    
    if (response.success && response.data) {
      setBrands(response.data);
    } else {
      notifyError("Erro", "Não foi possível carregar as marcas");
    }
    setIsLoading(false);
  };

  const handleBrandSelect = async (brand: CarBrand) => {
    setSelectedBrand(brand);
    setIsLoading(true);
    
    const response = await fetchModels(brand.name);
    
    if (response.success && response.data) {
      setModels(response.data);
      setCurrentView("models");
    } else {
      notifyError("Erro", "Não foi possível carregar os modelos");
    }
    setIsLoading(false);
  };

  const handleModelSelect = async (model: CarModel) => {
    setSelectedModel(model);
    setIsLoading(true);
    
    const response = await fetchMaintenanceCategories(
      selectedBrand?.name,
      model.name,
      model.years.split("-")[1] || model.years
    );
    
    if (response.success && response.data) {
      setCategories(response.data);
      setCurrentView("tutorials");
    } else {
      notifyError("Erro", "Não foi possível carregar as categorias");
    }
    setIsLoading(false);
  };

  const handleCategorySelect = (category: MaintenanceCategory) => {
    setSelectedCategory(category);
    setSelectedVideoIndex(0);
    setCurrentView("video");
  };

  const handleQuickSelect = async () => {
    if (!quickSelectBrand) return;
    
    setIsLoading(true);
    
    // Find brand
    const brand = brands.find(b => b.name.toLowerCase() === quickSelectBrand.toLowerCase());
    if (brand) {
      setSelectedBrand(brand);
    } else {
      setSelectedBrand({ id: quickSelectBrand, name: quickSelectBrand, image: "" });
    }
    
    // If model selected, go directly to tutorials
    if (quickSelectModel) {
      setSelectedModel({ 
        id: quickSelectModel, 
        name: quickSelectModel, 
        years: quickSelectYear || "2020-2024",
        image: "" 
      });
      
      const response = await fetchMaintenanceCategories(
        quickSelectBrand,
        quickSelectModel,
        quickSelectYear
      );
      
      if (response.success && response.data) {
        setCategories(response.data);
        setCurrentView("tutorials");
      }
    } else {
      // Just go to models
      const response = await fetchModels(quickSelectBrand);
      if (response.success && response.data) {
        setModels(response.data);
        setCurrentView("models");
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
      case "tutorials":
        setCurrentView("models");
        setSelectedModel(null);
        break;
      case "video":
        setCurrentView("tutorials");
        setSelectedCategory(null);
        break;
    }
  };

  const goHome = () => {
    setCurrentView("brands");
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedCategory(null);
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Get years for dropdown
  const years = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString());

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
                            <h3 className="font-chakra font-bold text-lg mb-4 text-center">
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
                                placeholder="Digite o Modelo"
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
                        Navegue por vídeos tutoriais para consertar seu carro
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 text-center lg:text-left">
                        Toque em um carro parecido com o seu e veja como consertá-lo
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
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <Badge className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 hover:bg-gray-700">
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
              <section className="bg-muted/50 py-4">
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
                      <h1 className="font-chakra text-3xl font-bold uppercase">
                        {selectedBrand.name}
                      </h1>
                      <p className="text-muted-foreground">
                        Selecione o modelo do seu veículo
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
                        <Card key={i}>
                          <Skeleton className="aspect-[4/3]" />
                          <CardContent className="p-4">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {models.map((model, index) => (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
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
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            <CardContent className="p-4 text-center">
                              <Badge className="bg-primary mb-2">
                                {model.name}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {model.years}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* TUTORIALS VIEW */}
          {currentView === "tutorials" && selectedBrand && selectedModel && (
            <motion.div
              key="tutorials"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Breadcrumb */}
              <section className="bg-muted/50 py-4">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Button variant="ghost" size="sm" onClick={goHome}>
                      <Home className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <Button variant="ghost" size="sm" onClick={() => setCurrentView("brands")}>
                      {selectedBrand.name}
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-primary font-medium">
                      {selectedModel.name} {selectedModel.years}
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
                        {selectedBrand.name} {selectedModel.name} {selectedModel.years}
                      </h1>
                      <p className="text-muted-foreground">
                        Selecione uma categoria de manutenção para ver os tutoriais
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Categories Grid */}
              <section className="py-8">
                <div className="container mx-auto px-4">
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[...Array(9)].map((_, i) => (
                        <Card key={i}>
                          <Skeleton className="aspect-video" />
                          <CardContent className="p-4">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {categories.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Card 
                            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group overflow-hidden"
                            onClick={() => handleCategorySelect(category)}
                          >
                            <div className="aspect-video relative bg-gradient-to-br from-primary/20 to-secondary/20">
                              {category.videos[0] && (
                                <img
                                  src={getYouTubeThumbnail(category.videos[0].url) || "/placeholder.svg"}
                                  alt={category.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                                </div>
                              </div>
                              <div className="absolute top-3 left-3">
                                <span className="text-3xl">{category.icon}</span>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-chakra font-bold text-lg group-hover:text-primary transition-colors">
                                    {category.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {category.videos.length} vídeo{category.videos.length > 1 ? "s" : ""} disponíve{category.videos.length > 1 ? "is" : "l"}
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              {category.procedures.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {category.procedures.slice(0, 3).map(proc => (
                                    <Badge key={proc.id} variant="secondary" className="text-xs">
                                      {proc.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* VIDEO VIEW */}
          {currentView === "video" && selectedCategory && (
            <motion.div
              key="video"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Breadcrumb */}
              <section className="bg-muted/50 py-4">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Button variant="ghost" size="sm" onClick={goHome}>
                      <Home className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <Button variant="ghost" size="sm" onClick={() => setCurrentView("brands")}>
                      {selectedBrand?.name}
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <Button variant="ghost" size="sm" onClick={() => setCurrentView("models")}>
                      {selectedModel?.name}
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-primary font-medium">{selectedCategory.name}</span>
                  </div>
                </div>
              </section>

              {/* Video Player Section */}
              <section className="py-6">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={goBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedCategory.icon}</span>
                        <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase">
                          {selectedCategory.name}
                        </h1>
                      </div>
                      {selectedBrand && selectedModel && (
                        <p className="text-muted-foreground">
                          {selectedBrand.name} {selectedModel.name} {selectedModel.years}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Video Player */}
                    <div className="lg:col-span-2">
                      <Card className="overflow-hidden">
                        <div className="aspect-video bg-black">
                          {selectedCategory.videos[selectedVideoIndex] && (
                            <iframe
                              src={getYouTubeEmbedUrl(selectedCategory.videos[selectedVideoIndex].url) || ""}
                              title={selectedCategory.videos[selectedVideoIndex].title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h2 className="font-bold text-lg mb-2">
                            {selectedCategory.videos[selectedVideoIndex]?.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              Vídeo {selectedVideoIndex + 1} de {selectedCategory.videos.length}
                            </span>
                            <a 
                              href={selectedCategory.videos[selectedVideoIndex]?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Abrir no YouTube
                            </a>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Procedures Info */}
                      {selectedCategory.procedures.length > 0 && (
                        <Card className="mt-4">
                          <CardContent className="p-4">
                            <h3 className="font-chakra font-bold mb-3 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" />
                              Procedimentos Disponíveis
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {selectedCategory.procedures.map(proc => (
                                <div 
                                  key={proc.id}
                                  className="p-3 bg-muted rounded-lg"
                                >
                                  <p className="font-medium">{proc.name}</p>
                                  <p className="text-xs text-muted-foreground">{proc.nameEn}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Video List */}
                    <div className="lg:col-span-1">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-chakra font-bold mb-4 flex items-center gap-2">
                            <Play className="w-5 h-5 text-primary" />
                            Vídeos Relacionados
                          </h3>
                          <div className="space-y-3">
                            {selectedCategory.videos.map((video, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedVideoIndex(index)}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                  selectedVideoIndex === index
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className="relative w-24 aspect-video bg-muted rounded overflow-hidden flex-shrink-0">
                                    <img
                                      src={getYouTubeThumbnail(video.url) || "/placeholder.svg"}
                                      alt={video.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = "/placeholder.svg";
                                      }}
                                    />
                                    {selectedVideoIndex === index && (
                                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-2">
                                      {video.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      YouTube
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Links */}
                      <Card className="mt-4">
                        <CardContent className="p-4">
                          <h3 className="font-chakra font-bold mb-3">Outras Categorias</h3>
                          <div className="space-y-2">
                            {categories
                              .filter(c => c.id !== selectedCategory.id)
                              .slice(0, 5)
                              .map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategorySelect(cat)}
                                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-left"
                                >
                                  <span>{cat.icon}</span>
                                  <span className="text-sm">{cat.name}</span>
                                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
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

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
            <Card className="max-w-sm w-full mx-4">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="font-chakra font-bold text-lg mb-2">Carregando...</h3>
                <p className="text-muted-foreground text-sm">
                  Buscando informações do veículo
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudyCarPage;
