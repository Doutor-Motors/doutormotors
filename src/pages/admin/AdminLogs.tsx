import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RefreshCw, User, Car, Activity, Calendar } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  id: string;
  type: "user" | "vehicle" | "diagnostic" | "admin" | "payment";
  action: string;
  description: string;
  timestamp: string;
  user_name?: string;
  metadata?: Record<string, any>;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const allLogs: LogEntry[] = [];

      // Fetch audit logs first (admin actions)
      const { data: auditLogs } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: auditProfiles } = await supabase
        .from("profiles")
        .select("user_id, name");

      auditLogs?.forEach((log) => {
        const admin = auditProfiles?.find((p) => p.user_id === log.user_id);
        allLogs.push({
          id: `audit-${log.id}`,
          type: "admin",
          action: log.action,
          description: `${log.action} em ${log.entity_type}${log.entity_id ? ` (${log.entity_id.slice(0, 8)}...)` : ""}`,
          timestamp: log.created_at,
          user_name: admin?.name || "Admin",
          metadata: log.metadata as Record<string, any> | undefined,
        });
      });

      // Fetch PIX payments
      const { data: payments } = await supabase
        .from("pix_payments")
        .select("id, customer_name, customer_email, amount, status, created_at, paid_at")
        .order("created_at", { ascending: false })
        .limit(50);

      payments?.forEach((payment) => {
        allLogs.push({
          id: `payment-${payment.id}`,
          type: "payment",
          action: payment.status === "paid" ? "Pagamento Confirmado" : payment.status === "pending" ? "PIX Gerado" : "Pagamento " + payment.status,
          description: `${payment.customer_name} - R$ ${(payment.amount / 100).toFixed(2)}`,
          timestamp: payment.paid_at || payment.created_at,
          user_name: payment.customer_name,
        });
      });

      // Fetch recent profiles (user registrations)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, name, email, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(50);

      profiles?.forEach((profile) => {
        allLogs.push({
          id: `profile-created-${profile.id}`,
          type: "user",
          action: "Cadastro",
          description: `Usuário ${profile.name} (${profile.email}) se cadastrou`,
          timestamp: profile.created_at,
          user_name: profile.name,
        });

        if (profile.updated_at !== profile.created_at) {
          allLogs.push({
            id: `profile-updated-${profile.id}`,
            type: "user",
            action: "Atualização",
            description: `Perfil de ${profile.name} foi atualizado`,
            timestamp: profile.updated_at,
            user_name: profile.name,
          });
        }
      });

      // Fetch recent vehicles
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id, brand, model, year, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: vehicleProfiles } = await supabase
        .from("profiles")
        .select("user_id, name");

      vehicles?.forEach((vehicle) => {
        const owner = vehicleProfiles?.find((p) => p.user_id === vehicle.user_id);
        allLogs.push({
          id: `vehicle-${vehicle.id}`,
          type: "vehicle",
          action: "Cadastro",
          description: `Veículo ${vehicle.brand} ${vehicle.model} (${vehicle.year}) cadastrado`,
          timestamp: vehicle.created_at,
          user_name: owner?.name || "Desconhecido",
        });
      });

      // Fetch recent diagnostics
      const { data: diagnostics } = await supabase
        .from("diagnostics")
        .select(`
          id,
          status,
          created_at,
          updated_at,
          vehicles (brand, model, year, user_id)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      diagnostics?.forEach((diag) => {
        const owner = vehicleProfiles?.find((p) => p.user_id === diag.vehicles?.user_id);
        allLogs.push({
          id: `diagnostic-${diag.id}`,
          type: "diagnostic",
          action: diag.status === "completed" ? "Concluído" : "Iniciado",
          description: `Diagnóstico ${diag.status === "completed" ? "concluído" : "iniciado"} para ${diag.vehicles?.brand} ${diag.vehicles?.model}`,
          timestamp: diag.status === "completed" ? diag.updated_at : diag.created_at,
          user_name: owner?.name || "Desconhecido",
        });
      });

      // Sort by timestamp
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(allLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || log.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4 text-blue-500" />;
      case "vehicle":
        return <Car className="w-4 h-4 text-green-500" />;
      case "diagnostic":
        return <Activity className="w-4 h-4 text-purple-500" />;
      case "admin":
        return <RefreshCw className="w-4 h-4 text-red-500" />;
      case "payment":
        return <Activity className="w-4 h-4 text-emerald-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      user: "bg-blue-500/20 text-blue-500",
      vehicle: "bg-green-500/20 text-green-500",
      diagnostic: "bg-purple-500/20 text-purple-500",
      admin: "bg-red-500/20 text-red-500",
      payment: "bg-emerald-500/20 text-emerald-500",
    };

    const labels: Record<string, string> = {
      user: "Usuário",
      vehicle: "Veículo",
      diagnostic: "Diagnóstico",
      admin: "Admin",
      payment: "Pagamento",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type]}`}>
        {labels[type]}
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
              Logs do Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Histórico de atividades
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
                <SelectItem value="vehicle">Veículos</SelectItem>
                <SelectItem value="diagnostic">Diagnósticos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="payment">Pagamentos</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <Card className="border-dm-cadet/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          {getTypeBadge(log.type)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>{log.user_name}</TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
