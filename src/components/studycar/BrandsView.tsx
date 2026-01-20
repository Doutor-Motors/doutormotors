import { useState } from "react";
import { Search, Car, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { getBrandImage } from "@/utils/carImages";
import { CarBrand } from "./types";
import ExpertCard from "./ExpertCard";

interface BrandsViewProps {
  brands: CarBrand[];
  isLoading: boolean;
  userVehicle: { brand: string; model: string; year: number } | null;
  onBrandSelect: (brand: CarBrand) => void;
  onQuickSelect: (brand: string, model: string, year: string) => void;
  onExpertClick: () => void;
}

const BrandsView = ({
  brands,
  isLoading,
  userVehicle,
  onBrandSelect,
  onQuickSelect,
  onExpertClick,
}: BrandsViewProps) => {
  const [brandSearch, setBrandSearch] = useState("");
  const [quickSelectBrand, setQuickSelectBrand] = useState("");
  const [quickSelectModel, setQuickSelectModel] = useState("");
  const [quickSelectYear, setQuickSelectYear] = useState("");

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const years = Array.from(
    { length: 15 },
    (_, i) => (new Date().getFullYear() - i).toString()
  );

  const handleQuickSelect = () => {
    if (quickSelectBrand) {
      onQuickSelect(quickSelectBrand, quickSelectModel, quickSelectYear);
    }
  };

  return (
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
                  Com mais de 60.000 vídeos tutoriais, aprenda a cuidar do seu
                  veículo.
                </p>
                <p className="text-primary font-medium mb-6">
                  Prepare-se para o reparo™ com vídeos específicos para seu
                  carro
                </p>

                {userVehicle && (
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">
                      Seu veículo:
                    </p>
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
                      <Select
                        value={quickSelectBrand}
                        onValueChange={setQuickSelectBrand}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a Marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
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

                      <Select
                        value={quickSelectYear}
                        onValueChange={setQuickSelectYear}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={handleQuickSelect}
                        className="w-full"
                        disabled={!quickSelectBrand}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Tutoriais
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Expert Card */}
              <div className="mt-4">
                <ExpertCard onClick={onExpertClick} />
              </div>
            </div>

            {/* Right Side - Search Brands */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar marca..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="font-chakra text-2xl font-bold mb-6 flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            Selecione uma Marca ({filteredBrands.length})
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {[...Array(24)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredBrands.map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group overflow-hidden"
                    onClick={() => onBrandSelect(brand)}
                  >
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden mb-2 bg-muted">
                        <img
                          src={getBrandImage(brand.name)}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = brand.image;
                          }}
                        />
                      </div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {brand.name}
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
  );
};

export default BrandsView;
