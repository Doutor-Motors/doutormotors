import { ArrowLeft, Home, ChevronRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CarBrand, CarModel, VideoCategory } from "./types";

interface CategoriesViewProps {
  selectedBrand: CarBrand;
  selectedModel: CarModel;
  categories: VideoCategory[];
  isLoading: boolean;
  onCategorySelect: (category: VideoCategory) => void;
  onBack: () => void;
  onHome: () => void;
  onBrandClick: () => void;
}

const CategoriesView = ({
  selectedBrand,
  selectedModel,
  categories,
  isLoading,
  onCategorySelect,
  onBack,
  onHome,
  onBrandClick,
}: CategoriesViewProps) => {
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
                    onClick={() => onCategorySelect(category)}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full min-h-[120px] relative">
                      {category.procedures && category.procedures.length > 0 && (
                        <Badge
                          className="absolute top-2 right-2 text-xs"
                          variant="secondary"
                        >
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
  );
};

export default CategoriesView;
