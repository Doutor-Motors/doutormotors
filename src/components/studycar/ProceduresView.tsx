import { ArrowLeft, Home, ChevronRight, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CarBrand, CarModel, VideoCategory, Procedure } from "./types";

interface ProceduresViewProps {
  selectedBrand: CarBrand;
  selectedModel: CarModel;
  selectedCategory: VideoCategory;
  onProcedureSelect: (procedure: Procedure) => void;
  onBack: () => void;
  onHome: () => void;
  onBrandClick: () => void;
  onModelClick: () => void;
}

const ProceduresView = ({
  selectedBrand,
  selectedModel,
  selectedCategory,
  onProcedureSelect,
  onBack,
  onHome,
  onBrandClick,
  onModelClick,
}: ProceduresViewProps) => {
  return (
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
            <Button variant="ghost" size="sm" onClick={onHome}>
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
            <span
              className="text-muted-foreground hover:text-primary cursor-pointer"
              onClick={onModelClick}
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
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase flex items-center gap-3">
                <span className="text-4xl">{selectedCategory.icon}</span>
                {selectedCategory.name}
              </h1>
              <p className="text-muted-foreground">
                {selectedBrand.name} {selectedModel.name} ({selectedModel.years}) •
                Selecione um procedimento
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
                  onClick={() => onProcedureSelect(procedure)}
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
  );
};

export default ProceduresView;
