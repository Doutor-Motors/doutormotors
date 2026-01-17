import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MessageSquare, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Ticket = Tables<"support_tickets">;

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: "Aberto", color: "bg-blue-500", icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "Em Andamento", color: "bg-yellow-500", icon: <Loader2 className="w-3 h-3" /> },
  resolved: { label: "Resolvido", color: "bg-green-500", icon: <CheckCircle className="w-3 h-3" /> },
  closed: { label: "Fechado", color: "bg-gray-500", icon: <CheckCircle className="w-3 h-3" /> },
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

const SupportCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "general" as string,
    priority: "medium" as string,
  });

  // Fetch user tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!user,
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      // Generate temporary ticket number (trigger will overwrite with proper sequence)
      const tempTicketNumber = `TKT-${Date.now()}`;
      
      const { data, error } = await supabase
        .from("support_tickets")
        .insert([{
          user_id: user.id,
          subject: newTicket.subject,
          description: newTicket.description,
          category: newTicket.category as "general" | "technical" | "account" | "billing" | "diagnostic",
          priority: newTicket.priority as "low" | "medium" | "high" | "urgent",
          ticket_number: tempTicketNumber,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setIsDialogOpen(false);
      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      toast({
        title: "Ticket criado!",
        description: `Seu ticket ${data.ticket_number} foi criado com sucesso.`,
      });
      
      // Send notification
      supabase.functions.invoke("send-notification", {
        body: {
          type: "ticket_created",
          userId: user!.id,
          data: {
            ticketId: data.id,
            ticketNumber: data.ticket_number,
            subject: data.subject,
            category: categoryLabels[data.category] || data.category,
            priority: priorityLabels[data.priority]?.label || data.priority,
          },
        },
      });
    },
    onError: (error) => {
      console.error("Error creating ticket:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    createTicketMutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
              Central de Suporte
            </h1>
            <p className="text-muted-foreground">
              Abra tickets e acompanhe suas solicitações
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-chakra uppercase">
                <Plus className="w-4 h-4 mr-2" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-chakra">Criar Novo Ticket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Descreva brevemente o problema"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="account">Conta</SelectItem>
                        <SelectItem value="billing">Financeiro</SelectItem>
                        <SelectItem value="diagnostic">Diagnóstico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Descreva o problema em detalhes. Inclua passos para reproduzir, se aplicável."
                    rows={5}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createTicketMutation.isPending}>
                    {createTicketMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Ticket"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tickets && tickets.length > 0 ? (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/support/${ticket.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {ticket.ticket_number}
                        </Badge>
                        <Badge className={`${statusLabels[ticket.status]?.color} text-white flex items-center gap-1`}>
                          {statusLabels[ticket.status]?.icon}
                          {statusLabels[ticket.status]?.label}
                        </Badge>
                        <Badge className={`${priorityLabels[ticket.priority]?.color} text-white`}>
                          {priorityLabels[ticket.priority]?.label}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-col items-end">
                      <span>{categoryLabels[ticket.category] || ticket.category}</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-chakra text-lg font-bold mb-2">Nenhum ticket encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não abriu nenhum ticket de suporte.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Ticket
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="bg-muted/30">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="text-center sm:text-left">
                <h3 className="font-medium mb-1">Precisa de ajuda imediata?</h3>
                <p className="text-sm text-muted-foreground">
                  Consulte nossa{" "}
                  <Link to="/faq" className="text-primary hover:underline">
                    FAQ
                  </Link>{" "}
                  ou entre em contato pelo{" "}
                  <Link to="/contato" className="text-primary hover:underline">
                    formulário de contato
                  </Link>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupportCenter;