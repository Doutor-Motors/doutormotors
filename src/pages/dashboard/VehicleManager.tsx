import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Car, 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Fuel,
  Calendar,
  Settings,
  Loader2
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore, Vehicle } from "@/store/useAppStore";

const brands = ["Volkswagen", "Honda", "Toyota", "Fiat", "Chevrolet", "Ford", "Hyundai", "Renault", "Nissan", "Jeep", "BMW", "Mercedes-Benz", "Audi"];
const fuelTypes = ["Gasolina", "Etanol", "Flex", "Diesel", "Elétrico", "Híbrido"];

const VehicleManager = () => {
  const { user } = useAuth();
  const { 
    vehicles, 
    setVehicles, 
    addVehicle, 
    updateVehicle, 
    removeVehicle,
    activeVehicleId,
    setActiveVehicleId 
  } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    engine: "",
    fuelType: "",
    licensePlate: "",
  });
  const { toast } = useToast();

  // Fetch vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          title: "Erro ao carregar veículos",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setVehicles(data || []);
        // Set active vehicle if none is set
        if (!activeVehicleId && data && data.length > 0) {
          setActiveVehicleId(data[0].id);
        }
      }
      setIsLoading(false);
    };

    fetchVehicles();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    
    if (editingVehicle) {
      // Update existing vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          engine: formData.engine || null,
          fuel_type: formData.fuelType || null,
          license_plate: formData.licensePlate || null,
        })
        .eq('id', editingVehicle.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao atualizar veículo",
          description: error.message,
          variant: "destructive",
        });
      } else {
        updateVehicle(data);
        toast({
          title: "Veículo atualizado!",
          description: `${formData.brand} ${formData.model} foi atualizado.`,
        });
        setIsDialogOpen(false);
      }
    } else {
      // Create new vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          user_id: user.id,
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          engine: formData.engine || null,
          fuel_type: formData.fuelType || null,
          license_plate: formData.licensePlate || null,
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao adicionar veículo",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addVehicle(data);
        if (!activeVehicleId) {
          setActiveVehicleId(data.id);
        }
        toast({
          title: "Veículo adicionado!",
          description: `${formData.brand} ${formData.model} foi adicionado.`,
        });
        setIsDialogOpen(false);
      }
    }

    setIsSaving(false);
    setEditingVehicle(null);
    setFormData({ brand: "", model: "", year: "", engine: "", fuelType: "", licensePlate: "" });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      engine: vehicle.engine || "",
      fuelType: vehicle.fuel_type || "",
      licensePlate: vehicle.license_plate || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao remover veículo",
        description: error.message,
        variant: "destructive",
      });
    } else {
      removeVehicle(id);
      toast({
        title: "Veículo removido",
        description: "O veículo foi removido da sua lista.",
      });
    }
  };

  const handleSetActive = (id: string) => {
    setActiveVehicleId(id);
    toast({
      title: "Veículo ativo alterado",
      description: "O veículo selecionado agora está ativo.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                  setFormData({ brand: "", model: "", year: "", engine: "", fuelType: "", licensePlate: "" });
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
                      max="2026"
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
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">Placa</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                      placeholder="Ex: ABC1234"
                      maxLength={7}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      editingVehicle ? "Salvar Alterações" : "Adicionar"
                    )}
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
                  vehicle.id === activeVehicleId ? "ring-2 ring-primary" : ""
                }`}
              >
                {vehicle.id === activeVehicleId && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs font-chakra uppercase py-1 text-center">
                    Veículo Ativo
                  </div>
                )}
                <CardHeader className={`${vehicle.id === activeVehicleId ? "pt-8" : ""} flex flex-row items-start justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-chakra text-lg uppercase">
                        {vehicle.brand} {vehicle.model}
                      </CardTitle>
                      {vehicle.license_plate && (
                        <p className="text-sm text-muted-foreground">{vehicle.license_plate}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {vehicle.id !== activeVehicleId && (
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
                    {vehicle.engine && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Settings className="w-4 h-4" />
                        <span>Motor: {vehicle.engine}</span>
                      </div>
                    )}
                    {vehicle.fuel_type && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Fuel className="w-4 h-4" />
                        <span>Combustível: {vehicle.fuel_type}</span>
                      </div>
                    )}
                  </div>
                  <Link to={`/dashboard/diagnostics?vehicle=${vehicle.id}`} className="block mt-4">
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
