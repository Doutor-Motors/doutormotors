import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getModelImage } from "@/utils/carImages";
import { CarBrand, CarModel } from "./types";

interface ModelsViewProps {
  selectedBrand: CarBrand;
  models: CarModel[];
  isLoading: boolean;
  onModelSelect: (model: CarModel) => void;
  onBack: () => void;
  onHome: () => void;
}

const ModelsView = ({
  selectedBrand,
  models,
  isLoading,
  onModelSelect,
  onBack,
  onHome,
}: ModelsViewProps) => {
  return (
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
            <Button variant="ghost" size="sm" onClick={onHome} className="hover:bg-muted hover:text-foreground">
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
          <div className="flex items-center gap-4 mb-2">
            <Button variant="outline" size="icon" onClick={onBack} className="hover:bg-muted hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(15)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {models.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group overflow-hidden"
                    onClick={() => onModelSelect(model)}
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={getModelImage(selectedBrand.name, model.name)}
                        alt={`${selectedBrand.name} ${model.name}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = model.image;
                        }}
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {model.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{model.years}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default ModelsView;
