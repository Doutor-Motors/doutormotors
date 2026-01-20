import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/back-button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import {
  BrandsView,
  ModelsView,
  CategoriesView,
  ProceduresView,
  VideoView,
  ExpertChatView,
  CarBrand,
  CarModel,
  VideoCategory,
  Procedure,
  VideoDetails,
  ViewState,
} from "@/components/studycar";

const StudyCarPage = () => {
  const { user } = useAuth();
  const { notifyError } = useNotifications();

  // Navigation state
  const [currentView, setCurrentView] = useState<ViewState>("brands");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

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

  // User vehicle
  const [userVehicle, setUserVehicle] = useState<{ brand: string; model: string; year: number } | null>(null);

  // Fetch user's vehicle
  useEffect(() => {
    const fetchUserVehicle = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("vehicles")
        .select("brand, model, year")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (data) setUserVehicle(data);
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
      if (data.success && data.data) setBrands(data.data);
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
          year: model.years.split("-")[0] || model.years,
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
    if (category.procedures && category.procedures.length > 0) {
      setCurrentView("procedures");
    } else if (category.url) {
      window.open(category.url, "_blank");
    }
  };

  const handleProcedureSelect = useCallback(async (procedure: Procedure, forceRefresh: boolean = false) => {
    setSelectedProcedure(procedure);
    setIsLoading(true);
    setIsTranscribing(true);
    setVideoDetails(null);
    setCurrentView("video");

    try {
      const { data, error } = await supabase.functions.invoke("carcare-api", {
        body: {
          action: "video-details",
          procedure: procedure.url,
          brand: selectedBrand?.name,
          model: selectedModel?.name,
          year: selectedModel?.years?.split("-")[0],
          skipCache: forceRefresh,
        },
      });
      if (error) throw error;
      if (data.success && data.data) setVideoDetails(data.data);
    } catch (err) {
      console.error("Error loading video details:", err);
    }
    setIsTranscribing(false);
    setIsLoading(false);
  }, [selectedBrand, selectedModel]);

  const handleProcedureRetry = (forceRefresh?: boolean) => {
    if (selectedProcedure) handleProcedureSelect(selectedProcedure, forceRefresh || false);
  };

  const handleQuickSelect = async (brand: string, model: string, year: string) => {
    setIsLoading(true);
    const foundBrand = brands.find((b) => b.name.toLowerCase() === brand.toLowerCase());
    setSelectedBrand(foundBrand || { id: brand, name: brand, image: "" });

    if (model) {
      setSelectedModel({ id: model, name: model, years: year || new Date().getFullYear().toString(), image: "" });
      try {
        const { data, error } = await supabase.functions.invoke("carcare-api", {
          body: { action: "videos", brand, model, year },
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
          body: { action: "models", brand },
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
      case "models": setCurrentView("brands"); setSelectedBrand(null); break;
      case "categories": setCurrentView("models"); setSelectedModel(null); break;
      case "procedures": setCurrentView("categories"); setSelectedCategory(null); break;
      case "video":
        if (selectedProcedure) { setCurrentView("procedures"); setSelectedProcedure(null); setVideoDetails(null); }
        else { setCurrentView("categories"); setSelectedCategory(null); setVideoDetails(null); }
        break;
      case "expert-chat": setCurrentView("brands"); break;
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <BackButton variant="ghost" label="Voltar" />
        </div>
      </div>

      <main className="flex-1 pt-20 sm:pt-24">
        <AnimatePresence mode="wait">
          {currentView === "brands" && (
            <BrandsView
              brands={brands}
              isLoading={isLoading}
              userVehicle={userVehicle}
              onBrandSelect={handleBrandSelect}
              onQuickSelect={handleQuickSelect}
              onExpertClick={() => setCurrentView("expert-chat")}
            />
          )}

          {currentView === "models" && selectedBrand && (
            <ModelsView
              selectedBrand={selectedBrand}
              models={models}
              isLoading={isLoading}
              onModelSelect={handleModelSelect}
              onBack={goBack}
              onHome={goHome}
            />
          )}

          {currentView === "categories" && selectedBrand && selectedModel && (
            <CategoriesView
              selectedBrand={selectedBrand}
              selectedModel={selectedModel}
              categories={categories}
              isLoading={isLoading}
              onCategorySelect={handleCategorySelect}
              onBack={goBack}
              onHome={goHome}
              onBrandClick={() => { setCurrentView("brands"); setSelectedBrand(null); }}
            />
          )}

          {currentView === "procedures" && selectedBrand && selectedModel && selectedCategory && (
            <ProceduresView
              selectedBrand={selectedBrand}
              selectedModel={selectedModel}
              selectedCategory={selectedCategory}
              onProcedureSelect={handleProcedureSelect}
              onBack={goBack}
              onHome={goHome}
              onBrandClick={() => { setCurrentView("brands"); setSelectedBrand(null); }}
              onModelClick={() => { setCurrentView("models"); setSelectedModel(null); }}
            />
          )}

          {currentView === "video" && selectedBrand && selectedModel && selectedCategory && (
            <VideoView
              selectedBrand={selectedBrand}
              selectedModel={selectedModel}
              selectedCategory={selectedCategory}
              selectedProcedure={selectedProcedure}
              videoDetails={videoDetails}
              categories={categories}
              isLoading={isLoading}
              isTranscribing={isTranscribing}
              onProcedureRetry={handleProcedureRetry}
              onCategorySelect={handleCategorySelect}
              onBack={goBack}
              onHome={goHome}
              onBrandClick={() => { setCurrentView("brands"); setSelectedBrand(null); }}
              onModelClick={() => { setCurrentView("models"); setSelectedModel(null); }}
              onProceduresClick={() => { setCurrentView("procedures"); setSelectedProcedure(null); }}
            />
          )}

          {currentView === "expert-chat" && (
            <ExpertChatView
              userVehicle={userVehicle}
              onBack={goBack}
              onHome={goHome}
            />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default StudyCarPage;
