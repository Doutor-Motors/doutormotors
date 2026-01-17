import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Car, Eye, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleData {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string | null;
  fuel_type: string | null;
  engine: string | null;
  created_at: string;
  user_id: string;
  owner_name?: string;
  owner_email?: string;
}

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (vehiclesError) throw vehiclesError;

      // Fetch owner info
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, email");

      const vehiclesWithOwners = (vehiclesData || []).map((vehicle) => {
        const owner = profiles?.find((p) => p.user_id === vehicle.user_id);
        return {
          ...vehicle,
          owner_name: owner?.name || "Desconhecido",
          owner_email: owner?.email || "-",
        };
      });

      setVehicles(vehiclesWithOwners);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", selectedVehicle.id);

      if (error) throw error;

      toast.success("Veículo removido com sucesso!");
      setShowDeleteDialog(false);
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Erro ao remover veículo");
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-chakra text-foreground">
              Veículos Cadastrados
            </h1>
            <p className="text-muted-foreground mt-1">
              {vehicles.length} veículos no sistema
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar veículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Vehicles Table */}
        <Card className="border-dm-cadet/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum veículo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.license_plate || "-"}</TableCell>
                      <TableCell>{vehicle.fuel_type || "-"}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vehicle.owner_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.owner_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(vehicle.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowDetailsDialog(true);
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowDeleteDialog(true);
                            }}
                            title="Remover veículo"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Veículo</DialogTitle>
            </DialogHeader>
            {selectedVehicle && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Marca</p>
                    <p className="font-medium">{selectedVehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ano</p>
                    <p className="font-medium">{selectedVehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-medium">{selectedVehicle.license_plate || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Combustível</p>
                    <p className="font-medium">{selectedVehicle.fuel_type || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motor</p>
                    <p className="font-medium">{selectedVehicle.engine || "-"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Proprietário</p>
                  <p className="font-medium">{selectedVehicle.owner_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVehicle.owner_email}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover Veículo</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover {selectedVehicle?.brand} {selectedVehicle?.model}? 
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteVehicle}>
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminVehicles;
