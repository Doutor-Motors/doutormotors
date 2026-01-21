import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import type { DiagnosticLogEntry } from "./useDiagnosticMode";

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  vehicle_context?: any;
  is_pinned?: boolean;
  last_message_preview?: string;
}

type LogFn = (level: "info" | "success" | "error" | "warn", operation: string, message: string, details?: string) => void;

export const useConversationHistory = (log?: LogFn) => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const safeLog = useCallback((
    level: "info" | "success" | "error" | "warn",
    operation: string,
    message: string,
    details?: string
  ) => {
    if (log) log(level, operation, message, details);
  }, [log]);

  const loadConversations = useCallback(async () => {
    if (!user) {
      safeLog("warn", "loadConversations", "Usuário não autenticado");
      return;
    }
    
    setIsLoadingHistory(true);
    safeLog("info", "loadConversations", "Carregando conversas...");
    
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
        safeLog("success", "loadConversations", `${data.length} conversas carregadas`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      safeLog("error", "loadConversations", "Falha ao carregar", msg);
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, safeLog]);

  const deleteConversation = async (conversationId: string) => {
    if (!user) {
      notifyError("Erro", "Você precisa estar logado");
      safeLog("error", "deleteConversation", "Usuário não autenticado");
      return false;
    }

    safeLog("info", "deleteConversation", `Excluindo conversa ${conversationId.slice(0, 8)}...`);

    try {
      // Delete messages first (now allowed by RLS)
      const { error: msgError } = await supabase
        .from("expert_messages")
        .delete()
        .eq("conversation_id", conversationId);
      
      if (msgError) {
        safeLog("error", "deleteConversation", "Falha ao excluir mensagens", JSON.stringify(msgError));
        throw msgError;
      }
      
      safeLog("info", "deleteConversation", "Mensagens excluídas, excluindo conversa...");
      
      // Then delete conversation
      const { data: deleted, error: convError } = await supabase
        .from("expert_conversations")
        .delete()
        .eq("id", conversationId)
        .select("id");
      
      if (convError) {
        safeLog("error", "deleteConversation", "Falha ao excluir conversa", JSON.stringify(convError));
        throw convError;
      }

      if (!deleted || deleted.length === 0) {
        const rlsError = "Sem permissão para excluir esta conversa (RLS)";
        safeLog("error", "deleteConversation", rlsError, "Nenhuma linha retornada do DELETE. Verifique as RLS policies.");
        throw new Error(rlsError);
      }
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      notifySuccess("Excluída", "Conversa excluída com sucesso");
      safeLog("success", "deleteConversation", "Conversa excluída com sucesso");
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      const msg = error instanceof Error ? error.message : "Não foi possível excluir a conversa";
      notifyError("Erro", msg);
      safeLog("error", "deleteConversation", msg);
      return false;
    }
  };

  const togglePinConversation = async (conversationId: string, isPinned: boolean) => {
    if (!user) {
      notifyError("Erro", "Você precisa estar logado");
      safeLog("error", "togglePin", "Usuário não autenticado");
      return false;
    }

    const action = isPinned ? "desafixar" : "fixar";
    safeLog("info", "togglePin", `Tentando ${action} conversa ${conversationId.slice(0, 8)}...`);

    try {
      const { data: updated, error } = await supabase
        .from("expert_conversations")
        .update({ is_pinned: !isPinned })
        .eq("id", conversationId)
        .select("id");
      
      if (error) {
        safeLog("error", "togglePin", "Falha no UPDATE", JSON.stringify(error));
        throw error;
      }

      if (!updated || updated.length === 0) {
        const rlsError = `Sem permissão para ${action} esta conversa (RLS)`;
        safeLog("error", "togglePin", rlsError, "Nenhuma linha retornada do UPDATE. Verifique as RLS policies.");
        throw new Error(rlsError);
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
      safeLog("success", "togglePin", `Conversa ${isPinned ? "desafixada" : "fixada"} com sucesso`);
      return true;
    } catch (error) {
      console.error("Error toggling pin:", error);
      const msg = error instanceof Error ? error.message : `Não foi possível ${action}`;
      notifyError("Erro", msg);
      safeLog("error", "togglePin", msg);
      return false;
    }
  };

  const renameConversation = async (conversationId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      safeLog("warn", "rename", "Título vazio ignorado");
      return false;
    }
    if (!user) {
      notifyError("Erro", "Você precisa estar logado");
      safeLog("error", "rename", "Usuário não autenticado");
      return false;
    }

    safeLog("info", "rename", `Renomeando conversa para "${newTitle.trim()}"...`);
    
    try {
      const { data: updated, error } = await supabase
        .from("expert_conversations")
        .update({ title: newTitle.trim() })
        .eq("id", conversationId)
        .select("id");
      
      if (error) {
        safeLog("error", "rename", "Falha no UPDATE", JSON.stringify(error));
        throw error;
      }

      if (!updated || updated.length === 0) {
        const rlsError = "Sem permissão para renomear esta conversa (RLS)";
        safeLog("error", "rename", rlsError, "Nenhuma linha retornada do UPDATE. Verifique as RLS policies.");
        throw new Error(rlsError);
      }
      
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, title: newTitle.trim() } : c
        )
      );
      notifySuccess("Renomeada", "Conversa renomeada com sucesso");
      safeLog("success", "rename", "Conversa renomeada com sucesso");
      return true;
    } catch (error) {
      console.error("Error renaming:", error);
      const msg = error instanceof Error ? error.message : "Não foi possível renomear";
      notifyError("Erro", msg);
      safeLog("error", "rename", msg);
      return false;
    }
  };

  const createNewConversation = async (vehicleContext?: any) => {
    if (!user) {
      safeLog("error", "createConversation", "Usuário não autenticado");
      return null;
    }

    safeLog("info", "createConversation", "Criando nova conversa...");
    
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
      
      if (error) {
        safeLog("error", "createConversation", "Falha no INSERT", JSON.stringify(error));
        throw error;
      }
      
      await loadConversations();
      notifySuccess("Nova conversa", "Conversa criada com sucesso");
      safeLog("success", "createConversation", `Conversa criada: ${data.id.slice(0, 8)}`);
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      const msg = error instanceof Error ? error.message : "Não foi possível criar nova conversa";
      notifyError("Erro", msg);
      safeLog("error", "createConversation", msg);
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
