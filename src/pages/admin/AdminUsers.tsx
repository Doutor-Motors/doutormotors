import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, UserCog, Shield, User, Trash2, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  role: AppRole;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>("user");

  const [showQuickDeleteDialog, setShowQuickDeleteDialog] = useState(false);
  const [quickDeleteEmail, setQuickDeleteEmail] = useState("");
  const [quickDeleteLoading, setQuickDeleteLoading] = useState(false);

  const { notifySuccess, notifyError } = useAdminNotifications();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || "user",
        } as UserData;
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + Realtime subscription
  useEffect(() => {
    fetchUsers();

    // Subscribe to realtime changes on profiles
    const profilesChannel = supabase
      .channel("admin-profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    // Subscribe to realtime changes on user_roles
    const rolesChannel = supabase
      .channel("admin-roles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", selectedUser.user_id)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", selectedUser.user_id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: selectedUser.user_id, role: newRole });

        if (error) throw error;
      }

      toast.success("Papel atualizado com sucesso!");
      notifySuccess("Papel Atualizado", `${selectedUser.name} agora é ${newRole === 'admin' ? 'Administrador' : 'Usuário'}`);
      setShowRoleDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erro ao atualizar papel");
      notifyError("Erro", "Não foi possível atualizar o papel do usuário");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Call the edge function to properly delete user from auth.users
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: selectedUser.user_id },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro ao excluir usuário");
      }

      if (!data.success) {
        throw new Error(data.error || "Erro ao excluir usuário");
      }

      toast.success("Usuário removido permanentemente do sistema!");
      notifySuccess(
        "Usuário Removido",
        `${selectedUser.name} foi removido permanentemente do sistema`
      );
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage = error.message || "Erro ao remover usuário. Verifique os logs.";
      toast.error(errorMessage);
      notifyError("Erro", errorMessage);
    }
  };

  const handleQuickDeleteByEmail = async () => {
    const email = quickDeleteEmail.trim();
    if (!email) {
      toast.error("Informe um email para excluir");
      return;
    }

    try {
      setQuickDeleteLoading(true);

      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { email },
      });

      if (error) throw new Error(error.message || "Erro ao excluir usuário");
      if (!data?.success) throw new Error(data?.error || "Erro ao excluir usuário");

      toast.success(`Usuário ${email} removido permanentemente!`);
      notifySuccess("Usuário Removido", `${email} foi removido permanentemente do sistema`);
      setShowQuickDeleteDialog(false);
      setQuickDeleteEmail("");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user by email:", error);
      const errorMessage = error.message || "Erro ao remover usuário. Verifique os logs.";
      toast.error(errorMessage);
      notifyError("Erro", errorMessage);
    } finally {
      setQuickDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: AppRole) => {
    const styles = {
      admin: "bg-destructive/15 text-destructive",
      user: "bg-primary/15 text-primary",
    };

    const labels = {
      admin: "Administrador",
      user: "Usuário",
    } as const;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role]}`}>
        {labels[role]}
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
              Gerenciar Usuários
            </h1>
            <p className="text-muted-foreground mt-1">
              {users.length} usuários cadastrados
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowQuickDeleteDialog(true)}
              disabled={loading}
              title="Remover usuário por email"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir por email
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchUsers}
              disabled={loading}
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="border-dm-cadet/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Papel</TableHead>
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
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleDialog(true);
                            }}
                            title="Alterar papel"
                          >
                            <UserCog className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                            title="Remover usuário"
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

        {/* Quick Delete Dialog */}
        <Dialog open={showQuickDeleteDialog} onOpenChange={setShowQuickDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Excluir usuário por email
              </DialogTitle>
              <DialogDescription>
                Essa ação remove permanentemente a conta de login e todos os dados vinculados ao usuário.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-2">
              <Input
                placeholder="email@exemplo.com"
                value={quickDeleteEmail}
                onChange={(e) => setQuickDeleteEmail(e.target.value)}
                disabled={quickDeleteLoading}
              />
              <p className="text-xs text-muted-foreground">
                Dica: use isso para excluir usuários que conseguem logar mas não aparecem na lista (sem perfil).
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowQuickDeleteDialog(false)}
                disabled={quickDeleteLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleQuickDeleteByEmail}
                disabled={quickDeleteLoading}
              >
                {quickDeleteLoading ? "Removendo..." : "Remover permanentemente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Papel do Usuário</DialogTitle>
              <DialogDescription>
                Altere o papel de {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Usuário
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateRole}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Remover Usuário Permanentemente
              </DialogTitle>
              <DialogDescription className="space-y-2">
                <p>
                  Tem certeza que deseja remover <strong>{selectedUser?.name}</strong>?
                </p>
                <p className="text-destructive font-medium">
                  ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e irá:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Remover a conta de login do usuário</li>
                  <li>Excluir todos os veículos cadastrados</li>
                  <li>Excluir todos os diagnósticos realizados</li>
                  <li>Excluir tickets de suporte</li>
                  <li>Cancelar assinaturas ativas</li>
                  <li>Remover todos os dados do usuário</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  O usuário <strong>NÃO poderá mais fazer login</strong> após esta ação.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Permanentemente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
