import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

export interface Message {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  documentName?: string;
  documentUrl?: string;
  suggestedTutorials?: Tutorial[];
}

export interface Tutorial {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  url?: string;
  thumbnail?: string;
  slug?: string;
}

export interface DiagnosticCode {
  code: string;
  description: string;
  priority: "critical" | "attention" | "preventive";
  severity: number;
}

interface UseExpertChatProps {
  userVehicle: { brand: string; model: string; year: number } | null;
}

export const useExpertChat = ({ userVehicle }: UseExpertChatProps) => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [selectedOBDCodes, setSelectedOBDCodes] = useState<DiagnosticCode[]>([]);

  const streamChat = useCallback(async (
    userMessage: string,
    imageBase64?: string,
    documentFile?: File,
    onConversationCreated?: () => void
  ) => {
    let documentContent = "";
    let documentName = "";

    // Read document content if provided
    if (documentFile) {
      documentName = documentFile.name;
      if (documentFile.type === "text/plain") {
        documentContent = await documentFile.text();
      } else {
        documentContent = `[Documento anexado: ${documentFile.name}]`;
      }
    }

    const finalMessage = documentContent
      ? `${userMessage}\n\n--- Documento anexado: ${documentName} ---\n${documentContent}`
      : userMessage;

    const userMsg: Message = {
      role: "user",
      content: userMessage,
      imageBase64: imageBase64,
      documentName: documentName || undefined,
    };
    const allMessages = [...messages, userMsg];

    setMessages(allMessages);
    setIsLoading(true);

    let assistantContent = "";
    let newConversationId = currentConversationId;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Você precisa estar logado para usar o especialista");
      }

      // Use Supabase client to get the correct URL
      const functionUrl = `${supabase.supabaseUrl}/functions/v1/automotive-expert-chat`;

      const response = await fetch(
        functionUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messages: allMessages.map(m => ({
              role: m.role,
              content: m.role === "user" && m === userMsg ? finalMessage : m.content,
              imageBase64: m.imageBase64
            })),
            vehicleContext: userVehicle,
            conversationId: currentConversationId,
            obdCodes: selectedOBDCodes,
            documentName: documentName || undefined,
          }),
        }
      );

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao conectar com o especialista");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let suggestedTutorials: Tutorial[] = [];

      // Add empty assistant message to start
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);

            // Handle special events
            if (parsed.type === "tutorials") {
              suggestedTutorials = parsed.tutorials;
              continue;
            }
            if (parsed.type === "conversation") {
              newConversationId = parsed.conversationId;
              setCurrentConversationId(parsed.conversationId);

              // Notify that conversation was created
              if (!currentConversationId) {
                notifySuccess("Conversa salva", "Sua conversa foi salva automaticamente");
                onConversationCreated?.();
              }
              continue;
            }

            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                  suggestedTutorials: suggestedTutorials.length > 0 ? suggestedTutorials : undefined
                };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final update with tutorials
      if (suggestedTutorials.length > 0) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
            suggestedTutorials
          };
          return updated;
        });
      }

      return newConversationId;
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev.filter(m => !(m.role === "assistant" && m.content === "")),
        {
          role: "assistant",
          content: `❌ ${error instanceof Error ? error.message : "Erro ao processar sua pergunta. Tente novamente."}`
        }
      ]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, userVehicle, currentConversationId, selectedOBDCodes, notifySuccess]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setSelectedOBDCodes([]);
  }, []);

  const loadConversationMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    try {
      const { data: messagesData } = await supabase
        .from("expert_messages")
        .select("role, content, image_url, document_url, document_name, suggested_tutorials")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesData) {
        const loadedMessages: Message[] = messagesData.map((m: any) => ({
          role: m.role,
          content: m.content,
          imageBase64: m.image_url === "image_uploaded" ? undefined : m.image_url,
          documentName: m.document_name,
          documentUrl: m.document_url,
          suggestedTutorials: m.suggested_tutorials || undefined,
        }));
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading conversation:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    currentConversationId,
    selectedOBDCodes,
    setSelectedOBDCodes,
    streamChat,
    clearConversation,
    loadConversationMessages,
  };
};
