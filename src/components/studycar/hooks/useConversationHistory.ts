import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  vehicle_context?: any;
  is_pinned?: boolean;
  last_message_preview?: string;
}

export const useConversationHistory = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("expert_conversations")
        .select("id, title, updated_at, vehicle_context, is_pinned, last_message_preview")
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  const deleteConversation = async (conversationId: string) => {
    if (!user) {
      notifyError("Erro", "Você precisa estar logado");
      return false;
    }
    try {
      // Delete messages first (now allowed by RLS)
      const { error: msgError } = await supabase
        .from("expert_messages")
        .delete()
        .eq("conversation_id", conversationId);
      
      if (msgError) throw msgError;
      
      // Then delete conversation
      const { data: deleted, error: convError } = await supabase
        .from("expert_conversations")
        .delete()
        .eq("id", conversationId)
        .select("id");
      
      if (convError) throw convError;
      if (!deleted || deleted.length === 0) {
        throw new Error("Sem permissão para excluir esta conversa (RLS)");
      }
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      notifySuccess("Excluída", "Conversa excluída com sucesso");
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      notifyError(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível excluir a conversa"
      );
      return false;
    }
  };

  const togglePinConversation = async (conversationId: string, isPinned: boolean) => {
    if (!user) {
      notifyError("Erro", "Você precisa estar logado");
      return false;
    }
    try {
      const { data: updated, error } = await supabase
        .from("expert_conversations")
        .update({ is_pinned: !isPinned })
        .eq("id", conversationId)
        .select("id");
      
      if (error) throw error;
      if (!updated || updated.length === 0) {
        throw new Error("Sem permissão para fixar/desafixar esta conversa (RLS)");
      }
      
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, is_pinned: !isPinned } : c
        ).sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })
      );
      
      notifySuccess(isPinned ? "Desafixada" : "Fixada", 
        isPinned ? "Conversa desafixada" : "Conversa fixada no topo");
      return true;
    } catch (error) {
      console.error("Error toggling pin:", error);
      notifyError(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível fixar/desafixar"
      );
      return false;
    }
  };

  const renameConversation = async (conversationId: string, newTitle: string) => {
    if (!newTitle.trim()) return false;
    if (!user) {
      notifyError("Erro", "Você precisa estar logado");
      return false;
    }
    
    try {
      const { data: updated, error } = await supabase
        .from("expert_conversations")
        .update({ title: newTitle.trim() })
        .eq("id", conversationId)
        .select("id");
      
      if (error) throw error;
      if (!updated || updated.length === 0) {
        throw new Error("Sem permissão para renomear esta conversa (RLS)");
      }
      
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, title: newTitle.trim() } : c
        )
      );
      notifySuccess("Renomeada", "Conversa renomeada com sucesso");
      return true;
    } catch (error) {
      console.error("Error renaming:", error);
      notifyError(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível renomear"
      );
      return false;
    }
  };

  const createNewConversation = async (vehicleContext?: any) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from("expert_conversations")
        .insert({
          user_id: user.id,
          title: "Nova Conversa",
          vehicle_context: vehicleContext || null,
        })
        .select("id")
        .single();
      
      if (error) throw error;
      
      await loadConversations();
      notifySuccess("Nova conversa", "Conversa criada com sucesso");
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      notifyError("Erro", "Não foi possível criar nova conversa");
      return null;
    }
  };

  return {
    conversations,
    isLoadingHistory,
    loadConversations,
    deleteConversation,
    togglePinConversation,
    renameConversation,
    createNewConversation,
  };
};
