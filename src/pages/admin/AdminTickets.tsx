import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Loader2, MessageSquare, Clock, CheckCircle, Search,
  Filter, ChevronDown, Send, Eye, Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TicketWithProfile {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  profiles: { name: string; email: string } | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: "Aberto", color: "bg-blue-500" },
  in_progress: { label: "Em Andamento", color: "bg-yellow-500" },
  resolved: { label: "Resolvido", color: "bg-green-500" },
  closed: { label: "Fechado", color: "bg-gray-500" },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-gray-400" },
  medium: { label: "Média", color: "bg-blue-400" },
  high: { label: "Alta", color: "bg-orange-500" },
  urgent: { label: "Urgente", color: "bg-red-500" },
};

const categoryLabels: Record<string, string> = {
  technical: "Técnico",
  account: "Conta",
  billing: "Financeiro",
  diagnostic: "Diagnóstico",
  general: "Geral",
};

const AdminTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithProfile | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch all tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-tickets", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("support_tickets")
        .select(`*`)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "open" | "in_progress" | "resolved" | "closed");
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as TicketWithProfile[];
    },
  });

  // Fetch messages for selected ticket
  const { data: ticketMessages } = useQuery({
    queryKey: ["admin-ticket-messages", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedTicket,
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const updateData: Record<string, any> = { status };
      
      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      } else if (status === "closed") {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);

      if (error) throw error;
      return { ticketId, status };
    },
    onSuccess: ({ ticketId, status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast({
        title: "Status atualizado",
        description: `Ticket atualizado para ${statusLabels[status]?.label || status}`,
      });

      // Find the ticket to send notification
      const ticket = tickets?.find(t => t.id === ticketId);
      if (ticket && (status === "resolved" || status === "in_progress")) {
        supabase.functions.invoke("send-notification", {
          body: {
            type: status === "resolved" ? "ticket_resolved" : "ticket_updated",
            userId: ticket.user_id,
            data: {
              ticketId: ticket.id,
              ticketNumber: ticket.ticket_number,
              subject: ticket.subject,
              message: status === "resolved" ? "Seu ticket foi resolvido!" : "Seu ticket está em andamento.",
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicket || !user || !replyMessage.trim()) throw new Error("Dados inválidos");

      const { error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: replyMessage.trim(),
          is_staff: true,
        });

      if (error) throw error;

      // Update ticket status to in_progress if it's open
      if (selectedTicket.status === "open") {
        await supabase
          .from("support_tickets")
          .update({ status: "in_progress" })
          .eq("id", selectedTicket.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      setReplyMessage("");
      toast({
        title: "Resposta enviada",
        description: "O usuário será notificado por email.",
      });

      // Send notification to user
      if (selectedTicket) {
        supabase.functions.invoke("send-notification", {
          body: {
            type: "ticket_updated",
            userId: selectedTicket.user_id,
            data: {
              ticketId: selectedTicket.id,
              ticketNumber: selectedTicket.ticket_number,
              subject: selectedTicket.subject,
              message: replyMessage.trim(),
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error("Error sending reply:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    },
  });

  const filteredTickets = tickets?.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticket_number.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.profiles?.name?.toLowerCase().includes(query) ||
      ticket.profiles?.email?.toLowerCase().includes(query)
    );
  });

  const openTicketDetail = (ticket: TicketWithProfile) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const stats = {
    total: tickets?.length || 0,
    open: tickets?.filter(t => t.status === 'open').length || 0,
    inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    resolved: tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
            Central de Tickets
          </h1>
          <p className="text-muted-foreground">
            Gerencie solicitações de suporte dos usuários
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
              <p className="text-sm text-muted-foreground">Abertos</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, assunto, usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
              <SelectItem value="closed">Fechados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTickets && filteredTickets.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={() => openTicketDetail(ticket)}>
                        <div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {ticket.ticket_number}
                          </div>
                          <div className="font-medium line-clamp-1">{ticket.subject}</div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => openTicketDetail(ticket)}>
                        <div>
                          <div className="font-medium">{ticket.profiles?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.profiles?.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {categoryLabels[ticket.category] || ticket.category}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${priorityLabels[ticket.priority]?.color} text-white`}>
                          {priorityLabels[ticket.priority]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusLabels[ticket.status]?.color} text-white`}>
                          {statusLabels[ticket.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-muted hover:text-foreground">
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openTicketDetail(ticket)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ 
                                ticketId: ticket.id, 
                                status: "in_progress" 
                              })}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Em Andamento
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ 
                                ticketId: ticket.id, 
                                status: "resolved" 
                              })}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar Resolvido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-chakra text-lg font-bold mb-2">Nenhum ticket encontrado</h3>
              <p className="text-muted-foreground">
                {statusFilter !== "all" 
                  ? `Não há tickets com status "${statusLabels[statusFilter]?.label}"`
                  : "Não há tickets de suporte no momento."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ticket Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {selectedTicket.ticket_number}
                    </span>
                    <Badge className={`${statusLabels[selectedTicket.status]?.color} text-white`}>
                      {statusLabels[selectedTicket.status]?.label}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{selectedTicket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.profiles?.name} ({selectedTicket.profiles?.email})
                    </p>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Categoria: </span>
                      {categoryLabels[selectedTicket.category] || selectedTicket.category}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prioridade: </span>
                      <Badge className={`${priorityLabels[selectedTicket.priority]?.color} text-white`}>
                        {priorityLabels[selectedTicket.priority]?.label}
                      </Badge>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Descrição Original</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                    </CardContent>
                  </Card>

                  {/* Messages */}
                  {ticketMessages && ticketMessages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Conversação</h4>
                      {ticketMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.is_staff ? "bg-primary/10 border-l-4 border-primary" : "bg-muted"
                          }`}
                        >
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{msg.is_staff ? "Suporte" : "Usuário"}</span>
                            <span>{new Date(msg.created_at).toLocaleString('pt-BR')}</span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {selectedTicket.status !== "closed" && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Responder</h4>
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Digite sua resposta..."
                        rows={3}
                      />
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ 
                              ticketId: selectedTicket.id, 
                              status: "in_progress" 
                            })}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Em Andamento
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ 
                              ticketId: selectedTicket.id, 
                              status: "resolved" 
                            })}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                        </div>
                        <Button
                          onClick={() => sendReplyMutation.mutate()}
                          disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                        >
                          {sendReplyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Enviar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTickets;