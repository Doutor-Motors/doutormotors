import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Send,
  Users,
  User,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Eye,
  Mail,
  Clock,
  Search,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Profile {
  user_id: string;
  name: string;
  email: string;
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  target_type: string;
  target_user_ids: string[] | null;
  target_role: string | null;
  sent_by: string;
  send_email: boolean;
  email_sent_count: number;
  read_by: string[];
  expires_at: string | null;
  created_at: string;
}

const AdminAlerts = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<"info" | "warning" | "success" | "error">("info");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [targetType, setTargetType] = useState<"all" | "specific" | "role">("all");
  const [targetRole, setTargetRole] = useState<"user" | "admin">("user");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sendEmail, setSendEmail] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchAlerts();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, email")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts((data as SystemAlert[]) || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }

    if (targetType === "specific" && selectedUserIds.length === 0) {
      toast.error("Selecione pelo menos um usuário");
      return;
    }

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada");
        return;
      }

      const response = await supabase.functions.invoke("send-system-alert", {
        body: {
          title,
          message,
          type: alertType,
          priority,
          targetType,
          targetUserIds: targetType === "specific" ? selectedUserIds : undefined,
          targetRole: targetType === "role" ? targetRole : undefined,
          sendEmail,
          expiresAt: expiresAt || undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Alerta enviado com sucesso! ${sendEmail ? `(${response.data.emailsSent} emails enviados)` : ""}`);
      
      // Reset form
      setTitle("");
      setMessage("");
      setAlertType("info");
      setPriority("normal");
      setTargetType("all");
      setSelectedUserIds([]);
      setSendEmail(false);
      setExpiresAt("");

      // Refresh alerts list
      fetchAlerts();
    } catch (error: any) {
      console.error("Error sending alert:", error);
      toast.error(error.message || "Erro ao enviar alerta");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("system_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
      toast.success("Alerta removido");
      fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Erro ao remover alerta");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.user_id));
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      error: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      warning: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    };
    return <Badge className={variants[type] || variants.info}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      urgent: "bg-red-600 text-white",
      high: "bg-orange-500 text-white",
      normal: "bg-blue-500 text-white",
      low: "bg-gray-400 text-white",
    };
    return <Badge className={variants[priority] || variants.normal}>{priority}</Badge>;
  };

  const getTargetLabel = (alert: SystemAlert) => {
    if (alert.target_type === "all") return "Todos os usuários";
    if (alert.target_type === "role") return `Grupo: ${alert.target_role}`;
    if (alert.target_type === "specific") return `${alert.target_user_ids?.length || 0} usuário(s)`;
    return "N/A";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-chakra text-foreground">
            Central de Alertas
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie alertas e notificações do sistema para os usuários
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send" className="font-chakra">
              <Send className="w-4 h-4 mr-2" />
              Enviar Alerta
            </TabsTrigger>
            <TabsTrigger value="history" className="font-chakra">
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Send Alert Tab */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alert Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-chakra flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Novo Alerta
                    </CardTitle>
                    <CardDescription>
                      Configure e envie um alerta do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo do Alerta</Label>
                        <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">
                              <span className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-500" />
                                Informação
                              </span>
                            </SelectItem>
                            <SelectItem value="warning">
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                Aviso
                              </span>
                            </SelectItem>
                            <SelectItem value="success">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Sucesso
                              </span>
                            </SelectItem>
                            <SelectItem value="error">
                              <span className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                Crítico
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Manutenção programada"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mensagem *</Label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Descreva o alerta em detalhes..."
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {message.length}/1000
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Destinatários</Label>
                        <Select value={targetType} onValueChange={(v: any) => setTargetType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Todos os Usuários
                              </span>
                            </SelectItem>
                            <SelectItem value="role">
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Por Grupo/Papel
                              </span>
                            </SelectItem>
                            <SelectItem value="specific">
                              <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Usuários Específicos
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {targetType === "role" && (
                        <div className="space-y-2">
                          <Label>Grupo</Label>
                          <Select value={targetRole} onValueChange={(v: any) => setTargetRole(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuários</SelectItem>
                              <SelectItem value="admin">Administradores</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Expira em (opcional)</Label>
                        <Input
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="cursor-pointer">Enviar por Email</Label>
                          <p className="text-xs text-muted-foreground">
                            Também enviar notificação por email
                          </p>
                        </div>
                      </div>
                      <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
                    </div>

                    <Button
                      onClick={handleSendAlert}
                      disabled={sending || !title.trim() || !message.trim()}
                      className="w-full font-chakra uppercase"
                      size="lg"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Alerta
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* User Selection (when specific) */}
              {targetType === "specific" && (
                <div className="lg:col-span-1">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-chakra text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Selecionar Usuários
                        </span>
                        <Badge variant="outline">
                          {selectedUserIds.length} selecionados
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar usuários..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Checkbox
                          checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={selectAllUsers}
                        />
                        <span className="text-sm text-muted-foreground">
                          Selecionar todos ({filteredUsers.length})
                        </span>
                      </div>

                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {filteredUsers.map((user) => (
                            <label
                              key={user.user_id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={selectedUserIds.includes(user.user_id)}
                                onCheckedChange={() => toggleUserSelection(user.user_id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Histórico de Alertas
                </CardTitle>
                <CardDescription>
                  {alerts.length} alerta(s) enviado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum alerta enviado ainda</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Destinatários</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alerts.map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(alert.type)}
                                {getPriorityBadge(alert.priority)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <p className="font-medium truncate">{alert.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {alert.message.substring(0, 50)}...
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{getTargetLabel(alert)}</span>
                            </TableCell>
                            <TableCell>
                              {alert.send_email ? (
                                <Badge variant="outline" className="text-green-600">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {alert.email_sent_count}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {format(new Date(alert.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover alerta?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. O alerta será removido permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAlert(alert.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAlerts;