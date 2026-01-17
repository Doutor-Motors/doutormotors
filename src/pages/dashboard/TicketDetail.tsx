import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Clock, CheckCircle, User, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Ticket = Tables<"support_tickets">;
type TicketMessage = Tables<"ticket_messages">;

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

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");

  // Fetch ticket details
  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Ticket;
    },
    enabled: !!id,
  });

  // Fetch ticket messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["ticket-messages", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as TicketMessage[];
    },
    enabled: !!id,
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id || !newMessage.trim()) throw new Error("Dados inválidos");

      const { data, error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: id,
          user_id: user.id,
          message: newMessage.trim(),
          is_staff: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", id] });
      setNewMessage("");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    },
  });

  // Close ticket mutation
  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID do ticket não encontrado");

      const { error } = await supabase
        .from("support_tickets")
        .update({ 
          status: "closed" as any, 
          closed_at: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      toast({
        title: "Ticket fechado",
        description: "O ticket foi fechado com sucesso.",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate();
    }
  };

  const isLoading = ticketLoading || messagesLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Ticket não encontrado</h2>
          <p className="text-muted-foreground mb-4">O ticket solicitado não existe ou você não tem acesso.</p>
          <Button onClick={() => navigate("/dashboard/support")}>
            Voltar à Central de Suporte
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <Link to="/dashboard/support" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à Central de Suporte
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">
                  {ticket.ticket_number}
                </Badge>
                <Badge className={`${statusLabels[ticket.status]?.color} text-white`}>
                  {statusLabels[ticket.status]?.label}
                </Badge>
                <Badge className={`${priorityLabels[ticket.priority]?.color} text-white`}>
                  {priorityLabels[ticket.priority]?.label}
                </Badge>
              </div>
              <h1 className="font-chakra text-xl md:text-2xl font-bold text-foreground">
                {ticket.subject}
              </h1>
            </div>

            {!isClosed && (
              <Button
                variant="outline"
                onClick={() => closeTicketMutation.mutate()}
                disabled={closeTicketMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Fechar Ticket
              </Button>
            )}
          </div>
        </div>

        {/* Ticket Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Detalhes do Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Categoria:</span>
              <p className="font-medium">{categoryLabels[ticket.category] || ticket.category}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Criado em:</span>
              <p className="font-medium">
                {new Date(ticket.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Última atualização:</span>
              <p className="font-medium">
                {new Date(ticket.updated_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {ticket.resolved_at && (
              <div>
                <span className="text-muted-foreground">Resolvido em:</span>
                <p className="font-medium">
                  {new Date(ticket.resolved_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Original Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Descrição Original
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="font-chakra uppercase text-sm">
              Conversação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages && messages.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.is_staff ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.is_staff ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      {msg.is_staff ? (
                        <Shield className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div
                      className={`flex-1 p-3 rounded-lg ${
                        msg.is_staff
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">
                          {msg.is_staff ? "Suporte" : "Você"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma mensagem ainda. Inicie a conversação abaixo.
              </p>
            )}

            <Separator />

            {/* Reply Form */}
            {!isClosed ? (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 bg-muted rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Este ticket está {ticket.status === 'resolved' ? 'resolvido' : 'fechado'}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TicketDetail;