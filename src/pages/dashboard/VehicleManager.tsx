import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Car, 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Fuel,
  Calendar,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock data
const mockVehicles = [
  {
    id: "1",
    brand: "Volkswagen",
    model: "Golf",
    year: 2020,
    engine: "1.4 TSI",
    fuelType: "Flex",
    isActive: true,
  },
  {
    id: "2",
    brand: "Honda",
    model: "Civic",
    year: 2019,
    engine: "2.0",
    fuelType: "Gasolina",
    isActive: false,
  },
];

const brands = ["Volkswagen", "Honda", "Toyota", "Fiat", "Chevrolet", "Ford", "Hyundai", "Renault", "Nissan", "Jeep"];
const fuelTypes = ["Gasolina", "Etanol", "Flex", "Diesel", "Elétrico", "Híbrido"];

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<typeof mockVehicles[0] | null>(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    engine: "",
    fuelType: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVehicle) {
      setVehicles(vehicles.map(v => 
        v.id === editingVehicle.id 
          ? { ...v, ...formData, year: parseInt(formData.year) }
          : v
      ));
      toast({
        title: "Veículo atualizado!",
        description: `${formData.brand} ${formData.model} foi atualizado.`,
      });
    } else {
      const newVehicle = {
        id: Date.now().toString(),
        ...formData,
        year: parseInt(formData.year),
        isActive: vehicles.length === 0,
      };
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Veículo adicionado!",
        description: `${formData.brand} ${formData.model} foi adicionado.`,
      });
    }

    setIsDialogOpen(false);
    setEditingVehicle(null);
    setFormData({ brand: "", model: "", year: "", engine: "", fuelType: "" });
  };

  const handleEdit = (vehicle: typeof mockVehicles[0]) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      engine: vehicle.engine,
      fuelType: vehicle.fuelType,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    toast({
      title: "Veículo removido",
      description: "O veículo foi removido da sua lista.",
    });
  };

  const handleSetActive = (id: string) => {
    setVehicles(vehicles.map(v => ({
      ...v,
      isActive: v.id === id,
    })));
    toast({
      title: "Veículo ativo alterado",
      description: "O veículo selecionado agora está ativo.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Meus Veículos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os veículos cadastrados na sua conta.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingVehicle(null);
                  setFormData({ brand: "", model: "", year: "", engine: "", fuelType: "" });
                }}
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Veículo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-chakra uppercase">
                  {editingVehicle ? "Editar Veículo" : "Adicionar Veículo"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do seu veículo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => setFormData({ ...formData, brand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ex: Golf"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="Ex: 2020"
                      min="1990"
                      max="2025"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engine">Motorização</Label>
                    <Input
                      id="engine"
                      value={formData.engine}
                      onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                      placeholder="Ex: 1.4 TSI"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Combustível</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((fuel) => (
                        <SelectItem key={fuel} value={fuel}>
                          {fuel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                    {editingVehicle ? "Salvar Alterações" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card 
                key={vehicle.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  vehicle.isActive ? "ring-2 ring-primary" : ""
                }`}
              >
                {vehicle.isActive && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs font-chakra uppercase py-1 text-center">
                    Veículo Ativo
                  </div>
                )}
                <CardHeader className={`${vehicle.isActive ? "pt-8" : ""} flex flex-row items-start justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-chakra text-lg uppercase">
                        {vehicle.brand} {vehicle.model}
                      </CardTitle>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!vehicle.isActive && (
                        <DropdownMenuItem onClick={() => handleSetActive(vehicle.id)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Definir como Ativo
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Ano: {vehicle.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Settings className="w-4 h-4" />
                      <span>Motor: {vehicle.engine}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Fuel className="w-4 h-4" />
                      <span>Combustível: {vehicle.fuelType}</span>
                    </div>
                  </div>
                  <Link to="/dashboard/diagnostics" className="block mt-4">
                    <Button className="w-full bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                      Iniciar Diagnóstico
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-chakra text-xl font-bold uppercase text-foreground mb-2">
              Nenhum veículo cadastrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Adicione seu primeiro veículo para começar a usar o diagnóstico.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Veículo
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VehicleManager;
