import { ArrowLeft, Home, ChevronRight, Video, Bot, MessageCircle, BookOpen, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CarBrand, CarModel, VideoCategory } from "./types";
import ExpertLogo from "./ExpertLogo";

interface CategoriesViewProps {
  selectedBrand: CarBrand;
  selectedModel: CarModel;
  categories: VideoCategory[];
  isLoading: boolean;
  hasVideosAvailable: boolean;
  onCategorySelect: (category: VideoCategory) => void;
  onExpertClick: () => void;
  onBack: () => void;
  onHome: () => void;
  onBrandClick: () => void;
}

const CategoriesView = ({
  selectedBrand,
  selectedModel,
  categories,
  isLoading,
  hasVideosAvailable,
  onCategorySelect,
  onExpertClick,
  onBack,
  onHome,
  onBrandClick,
}: CategoriesViewProps) => {
  // Conta quantas categorias têm vídeos (procedures)
  const categoriesWithVideos = categories.filter(
    (cat) => cat.procedures && cat.procedures.length > 0
  );

  return (
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
            <Button variant="ghost" size="sm" onClick={onHome} className="hover:bg-muted hover:text-foreground">
              <Home className="w-4 h-4" />
            </Button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span
              className="text-muted-foreground hover:text-primary cursor-pointer"
              onClick={onBrandClick}
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
            <Button variant="outline" size="icon" onClick={onBack} className="hover:bg-muted hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase">
                {selectedBrand.name} {selectedModel.name}
              </h1>
              <p className="text-muted-foreground">
                Selecione como deseja aprender sobre seu veículo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opções de Aprendizado - Cards Principais */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Cards de Opção Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Card 1: Passo a Passo (sempre visível) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                className="cursor-pointer hover:border-primary hover:shadow-xl transition-all group h-full bg-gradient-to-br from-card to-card/80 border-2"
                onClick={() => {
                  if (categoriesWithVideos.length > 0) {
                    onCategorySelect(categoriesWithVideos[0]);
                  }
                }}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-chakra text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Passo a Passo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Guia educacional detalhado com instruções escritas para manutenção
                  </p>
                  <Badge variant="secondary" className="mt-4">
                    {categories.length} categorias
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Tutorial em Vídeo OU Falar com Especialista */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {hasVideosAvailable && categoriesWithVideos.length > 0 ? (
                /* Se há vídeos disponíveis, mostra Tutorial em Vídeo */
                <Card
                  className="cursor-pointer hover:border-primary hover:shadow-xl transition-all group h-full bg-gradient-to-br from-card to-card/80 border-2"
                  onClick={() => {
                    if (categoriesWithVideos.length > 0) {
                      onCategorySelect(categoriesWithVideos[0]);
                    }
                  }}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                      <PlayCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="font-chakra text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                      Tutorial em Vídeo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Assista vídeos explicativos passo a passo para seu veículo
                    </p>
                    <Badge variant="secondary" className="mt-4 bg-green-500/10 text-green-600">
                      {categoriesWithVideos.length} vídeos disponíveis
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                /* Se NÃO há vídeos, mostra Falar com Especialista */
                <Card
                  className="cursor-pointer hover:border-amber-500 hover:shadow-xl transition-all group h-full bg-gradient-to-br from-amber-500/5 to-card border-2 border-amber-500/30"
                  onClick={onExpertClick}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] relative overflow-hidden">
                    {/* Efeito de brilho sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-shimmer" />
                    
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors relative z-10">
                      <ExpertLogo size="sm" />
                    </div>
                    <h3 className="font-chakra text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors relative z-10">
                      Falar com Especialista
                    </h3>
                    <p className="text-sm text-muted-foreground relative z-10">
                      Para este modelo, não há tutorial em vídeo. Converse com nosso especialista automotivo.
                    </p>
                    <Badge variant="secondary" className="mt-4 bg-amber-500/10 text-amber-600 relative z-10">
                      <Bot className="w-3 h-3 mr-1" />
                      Suporte Inteligente
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Card 3: Especialista Automotivo (sempre visível) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card
                className="cursor-pointer hover:border-primary hover:shadow-xl transition-all group h-full bg-gradient-to-br from-primary/5 to-card border-2 border-primary/30"
                onClick={onExpertClick}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <ExpertLogo size="sm" />
                  </div>
                  <h3 className="font-chakra text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Especialista Automotivo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tire dúvidas com IA sobre mecânica, manutenção e diagnóstico
                  </p>
                  <Badge variant="secondary" className="mt-4 bg-primary/10 text-primary">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Chat Inteligente
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Título da seção de categorias */}
          {categories.length > 0 && (
            <div className="mb-6">
              <h2 className="font-chakra text-xl font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Categorias de Manutenção
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {categoriesWithVideos.length > 0 
                  ? `${categoriesWithVideos.length} categorias com tutoriais disponíveis`
                  : "Selecione uma categoria para ver o guia educacional"
                }
              </p>
            </div>
          )}

          {/* Categories Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category, index) => {
                const hasVideoContent = category.procedures && category.procedures.length > 0;
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className={`cursor-pointer hover:border-primary hover:shadow-lg transition-all group h-full ${
                        !hasVideoContent ? 'opacity-70' : ''
                      }`}
                      onClick={() => onCategorySelect(category)}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full min-h-[120px] relative">
                        {hasVideoContent && (
                          <Badge
                            className="absolute top-2 right-2 text-xs"
                            variant="secondary"
                          >
                            {category.procedures.length}
                          </Badge>
                        )}
                        {!hasVideoContent && (
                          <Badge
                            className="absolute top-2 right-2 text-xs bg-muted text-muted-foreground"
                            variant="outline"
                          >
                            Guia
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 mx-auto text-primary mb-4" />
              <p className="text-lg font-medium mb-2">
                Nenhuma categoria encontrada para este modelo.
              </p>
              <p className="text-muted-foreground mb-6">
                Mas você pode conversar com nosso especialista automotivo!
              </p>
              <Button onClick={onExpertClick} className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Falar com Especialista
              </Button>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default CategoriesView;
