import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Car, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_MAKES, AVAILABLE_YEARS } from '@/constants/tutorials';
import type { SelectedVehicle } from '@/types/tutorials';

// Modelos por marca (simplificado - pode ser expandido ou buscado via API)
const MODELS_BY_MAKE: Record<string, string[]> = {
  'Chevrolet': ['Onix', 'Tracker', 'Cruze', 'S10', 'Spin', 'Cobalt', 'Montana', 'Prisma', 'Equinox'],
  'Volkswagen': ['Gol', 'Polo', 'T-Cross', 'Virtus', 'Nivus', 'Amarok', 'Saveiro', 'Jetta', 'Tiguan'],
  'Fiat': ['Argo', 'Mobi', 'Strada', 'Toro', 'Pulse', 'Fastback', 'Uno', 'Cronos', 'Ducato'],
  'Ford': ['Ka', 'EcoSport', 'Ranger', 'Territory', 'Bronco', 'Mustang', 'Focus', 'Fiesta', 'Fusion'],
  'Toyota': ['Corolla', 'Hilux', 'Yaris', 'SW4', 'RAV4', 'Camry', 'Prius', 'Etios', 'Corolla Cross'],
  'Honda': ['Civic', 'HR-V', 'City', 'Fit', 'CR-V', 'Accord', 'WR-V', 'ZR-V'],
  'Hyundai': ['HB20', 'Creta', 'Tucson', 'Santa Fe', 'i30', 'Azera', 'Elantra', 'IX35'],
  'Renault': ['Kwid', 'Sandero', 'Duster', 'Captur', 'Logan', 'Oroch', 'Master', 'Stepway'],
  'Jeep': ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Grand Cherokee', 'Gladiator'],
  'Nissan': ['Kicks', 'Versa', 'Sentra', 'Frontier', 'March', 'Leaf', 'X-Trail'],
  'Peugeot': ['208', '2008', '3008', '308', '408', 'Partner', 'Expert', 'Boxer'],
  'Citroën': ['C3', 'C4 Cactus', 'C4 Lounge', 'Aircross', 'Berlingo', 'Jumper', 'Jumpy'],
  'Mitsubishi': ['L200', 'Outlander', 'Eclipse Cross', 'Pajero', 'ASX', 'Lancer'],
  'Kia': ['Sportage', 'Cerato', 'Sorento', 'Soul', 'Picanto', 'Stinger', 'Carnival'],
  'BMW': ['320i', '328i', 'X1', 'X3', 'X5', '118i', 'M3', 'M4', 'M5'],
  'Mercedes-Benz': ['C180', 'C200', 'A200', 'GLA', 'GLC', 'E300', 'S500', 'AMG'],
  'Audi': ['A3', 'A4', 'A5', 'Q3', 'Q5', 'Q7', 'TT', 'RS3', 'RS5'],
};

// Gerar modelos genéricos para marcas não mapeadas
const getModelsForMake = (make: string): string[] => {
  return MODELS_BY_MAKE[make] || ['Sedan', 'Hatch', 'SUV', 'Pickup', 'Crossover'];
};

interface VehicleSelectorProps {
  onSelect: (vehicle: SelectedVehicle) => void;
  isLoading?: boolean;
}

const VehicleSelector = ({ onSelect, isLoading }: VehicleSelectorProps) => {
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  const models = useMemo(() => getModelsForMake(make), [make]);

  const isComplete = make && model && year;

  const handleConfirm = () => {
    if (!isComplete) return;
    
    onSelect({
      make,
      model,
      year,
      displayName: `${make} ${model} ${year}`,
    });
    setIsExpanded(false);
  };

  const handleMakeChange = (value: string) => {
    setMake(value);
    setModel(''); // Reset model when make changes
  };

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur border-border/50">
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : '60px' }}
        className="overflow-hidden"
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Selecione seu veículo</p>
              <p className="text-sm text-muted-foreground">
                Para tutoriais personalizados
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Selectors */}
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Marca */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Marca</label>
              <Select value={make} onValueChange={handleMakeChange}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {SUPPORTED_MAKES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Modelo</label>
              <Select value={model} onValueChange={setModel} disabled={!make}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={make ? "Selecione o modelo" : "Escolha a marca primeiro"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ano</label>
              <Select value={year} onValueChange={setYear} disabled={!model}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={model ? "Selecione o ano" : "Escolha o modelo primeiro"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {AVAILABLE_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Confirm Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isComplete ? 1 : 0.5, y: 0 }}
          >
            <Button
              className="w-full"
              size="lg"
              disabled={!isComplete || isLoading}
              onClick={handleConfirm}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando tutoriais...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar veículo
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Card>
  );
};

export default VehicleSelector;
