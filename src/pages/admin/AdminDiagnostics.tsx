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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Activity, Eye, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DiagnosticStatus = Database["public"]["Enums"]["diagnostic_status"];

interface DiagnosticData {
  id: string;
  status: DiagnosticStatus;
  notes: string | null;
  created_at: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  owner_name?: string;
  items_count?: number;
  critical_count?: number;
}

const AdminDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticData | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [diagnosticItems, setDiagnosticItems] = useState<any[]>([]);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const { data: diagnosticsData, error } = await supabase
        .from("diagnostics")
        .select(`
          *,
          vehicles (brand, model, year, user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for owner names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name");

      // Fetch diagnostic items counts
      const { data: items } = await supabase
        .from("diagnostic_items")
        .select("diagnostic_id, priority");

      const diagnosticsWithDetails = (diagnosticsData || []).map((diag) => {
        const owner = profiles?.find((p) => p.user_id === diag.vehicles?.user_id);
        const diagItems = items?.filter((i) => i.diagnostic_id === diag.id) || [];
        const criticalItems = diagItems.filter((i) => i.priority === "critical");

        return {
          id: diag.id,
          status: diag.status,
          notes: diag.notes,
          created_at: diag.created_at,
          vehicle_brand: diag.vehicles?.brand,
          vehicle_model: diag.vehicles?.model,
          vehicle_year: diag.vehicles?.year,
          owner_name: owner?.name || "Desconhecido",
          items_count: diagItems.length,
          critical_count: criticalItems.length,
        };
      });

      setDiagnostics(diagnosticsWithDetails);
    } catch (error) {
      console.error("Error fetching diagnostics:", error);
      toast.error("Erro ao carregar diagnósticos");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnosticItems = async (diagnosticId: string) => {
    try {
      const { data, error } = await supabase
        .from("diagnostic_items")
        .select("*")
        .eq("diagnostic_id", diagnosticId);

      if (error) throw error;
      setDiagnosticItems(data || []);
    } catch (error) {
      console.error("Error fetching diagnostic items:", error);
    }
  };

  const handleDeleteDiagnostic = async () => {
    if (!selectedDiagnostic) return;

    try {
      // First delete diagnostic items
      await supabase
        .from("diagnostic_items")
        .delete()
        .eq("diagnostic_id", selectedDiagnostic.id);

      // Then delete the diagnostic
      const { error } = await supabase
        .from("diagnostics")
        .delete()
        .eq("id", selectedDiagnostic.id);

      if (error) throw error;

      toast.success("Diagnóstico removido com sucesso!");
      setShowDeleteDialog(false);
      fetchDiagnostics();
    } catch (error) {
      console.error("Error deleting diagnostic:", error);
      toast.error("Erro ao remover diagnóstico");
    }
  };

  const filteredDiagnostics = diagnostics.filter((diag) => {
    const matchesSearch =
      diag.vehicle_brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diag.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diag.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || diag.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DiagnosticStatus) => {
    const styles = {
      pending: "bg-gray-500/20 text-gray-500",
      in_progress: "bg-yellow-500/20 text-yellow-500",
      completed: "bg-green-500/20 text-green-500",
    };

    const labels = {
      pending: "Pendente",
      in_progress: "Em andamento",
      completed: "Concluído",
    };

    const icons = {
      pending: Clock,
      in_progress: Activity,
      completed: CheckCircle,
    };

    const Icon = icons[status];

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {labels[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: "bg-red-500/20 text-red-500",
      urgent: "bg-orange-500/20 text-orange-500",
      attention: "bg-yellow-500/20 text-yellow-500",
      normal: "bg-blue-500/20 text-blue-500",
      low: "bg-gray-500/20 text-gray-500",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority] || styles.normal}`}>
        {priority}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-chakra text-foreground">
              Diagnósticos
            </h1>
            <p className="text-muted-foreground mt-1">
              {diagnostics.length} diagnósticos realizados
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Diagnostics Table */}
        <Card className="border-dm-cadet/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Críticos</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredDiagnostics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum diagnóstico encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiagnostics.map((diag) => (
                    <TableRow key={diag.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {diag.vehicle_brand} {diag.vehicle_model} ({diag.vehicle_year})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{diag.owner_name}</TableCell>
                      <TableCell>{getStatusBadge(diag.status)}</TableCell>
                      <TableCell>{diag.items_count}</TableCell>
                      <TableCell>
                        {diag.critical_count && diag.critical_count > 0 ? (
                          <span className="flex items-center gap-1 text-red-500">
                            <AlertTriangle className="w-4 h-4" />
                            {diag.critical_count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(diag.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDiagnostic(diag);
                              fetchDiagnosticItems(diag.id);
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
                              setSelectedDiagnostic(diag);
                              setShowDeleteDialog(true);
                            }}
                            title="Remover diagnóstico"
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Diagnóstico</DialogTitle>
            </DialogHeader>
            {selectedDiagnostic && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p className="font-medium">
                      {selectedDiagnostic.vehicle_brand} {selectedDiagnostic.vehicle_model} ({selectedDiagnostic.vehicle_year})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proprietário</p>
                    <p className="font-medium">{selectedDiagnostic.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedDiagnostic.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {new Date(selectedDiagnostic.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                {selectedDiagnostic.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="font-medium">{selectedDiagnostic.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Itens do Diagnóstico ({diagnosticItems.length})
                  </p>
                  <div className="space-y-2">
                    {diagnosticItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-muted/50 rounded-lg flex items-start justify-between"
                      >
                        <div>
                          <p className="font-medium">{item.dtc_code}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description_human}
                          </p>
                        </div>
                        {getPriorityBadge(item.priority)}
                      </div>
                    ))}
                    {diagnosticItems.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum item encontrado
                      </p>
                    )}
                  </div>
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
              <DialogTitle>Remover Diagnóstico</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover este diagnóstico e todos os seus itens? 
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteDiagnostic}>
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDiagnostics;
