import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  Home, 
  Car,
  Wrench,
  AlertTriangle,
  HelpCircle,
  Loader2,
  User,
  Bot,
  Image as ImageIcon,
  X,
  History,
  Plus,
  Play,
  ExternalLink,
  Trash2,
  FileDown,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateExpertConversationPDF, downloadExpertConversationPDF } from "@/services/pdf/expertConversationPDFGenerator";
import ExpertLogo from "./ExpertLogo";
import OBDContextPanel from "./OBDContextPanel";
import { useNotifications } from "@/hooks/useNotifications";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  suggestedTutorials?: Tutorial[];
}

interface Tutorial {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  url?: string;
  thumbnail?: string;
  slug?: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  vehicle_context?: any;
}

interface DiagnosticCode {
  code: string;
  description: string;
  priority: "critical" | "attention" | "preventive";
  severity: number;
}

interface ExpertChatViewProps {
  userVehicle: { brand: string; model: string; year: number } | null;
  onBack: () => void;
  onHome: () => void;
}

const QUICK_QUESTIONS = [
  { icon: AlertTriangle, text: "Meu carro está fazendo um barulho estranho", color: "text-amber-500" },
  { icon: Wrench, text: "Qual manutenção devo fazer agora?", color: "text-primary" },
  { icon: Car, text: "Essa peça é compatível com meu carro?", color: "text-green-500" },
  { icon: HelpCircle, text: "Como esse sistema funciona?", color: "text-blue-500" },
];

const ExpertChatView = ({ userVehicle, onBack, onHome }: ExpertChatViewProps) => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [selectedOBDCodes, setSelectedOBDCodes] = useState<DiagnosticCode[]>([]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversation history
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data } = await supabase
        .from("expert_conversations")
        .select("id, title, updated_at, vehicle_context")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);
      
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  // Load a specific conversation
  const loadConversation = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const { data: messagesData } = await supabase
        .from("expert_messages")
        .select("role, content, image_url, suggested_tutorials")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      
      if (messagesData) {
        const loadedMessages: Message[] = messagesData.map((m: any) => ({
          role: m.role,
          content: m.content,
          imageBase64: m.image_url === "image_uploaded" ? undefined : m.image_url,
          suggestedTutorials: m.suggested_tutorials || undefined,
        }));
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
        setIsHistoryOpen(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from("expert_conversations")
        .delete()
        .eq("id", conversationId);
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Start new conversation
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSelectedImage(null);
    setSelectedOBDCodes([]);
    setIsHistoryOpen(false);
  };

  // Export conversation to PDF
  const exportToPDF = async () => {
    if (messages.length === 0) {
      notifyError("Erro", "Não há conversa para exportar");
      return;
    }

    setIsExportingPDF(true);
    try {
      const conversation = conversations.find(c => c.id === currentConversationId);
      
      const blob = await generateExpertConversationPDF({
        messages,
        vehicle: userVehicle,
        userName: user?.email,
        conversationTitle: conversation?.title,
        obdCodes: selectedOBDCodes.map(c => c.code),
      });
      
      downloadExpertConversationPDF(blob, conversation?.title);
      notifySuccess("PDF Exportado", "Arquivo salvo com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      notifyError("Erro", "Falha ao exportar PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const streamChat = useCallback(async (userMessage: string, imageBase64?: string) => {
    const userMsg: Message = { 
      role: "user", 
      content: userMessage,
      imageBase64: imageBase64 
    };
    const allMessages = [...messages, userMsg];
    
    setMessages(allMessages);
    setIsLoading(true);
    setSelectedImage(null);

    let assistantContent = "";
    let newConversationId = currentConversationId;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/automotive-expert-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: allMessages.map(m => ({ 
              role: m.role, 
              content: m.content,
              imageBase64: m.imageBase64 
            })),
            vehicleContext: userVehicle,
            conversationId: currentConversationId,
            obdCodes: selectedOBDCodes,
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

      // Refresh conversation list
      if (newConversationId && newConversationId !== currentConversationId) {
        loadConversations();
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev.filter(m => !(m.role === "assistant" && m.content === "")),
        { 
          role: "assistant", 
          content: `❌ ${error instanceof Error ? error.message : "Erro ao processar sua pergunta. Tente novamente."}` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userVehicle, currentConversationId, loadConversations, selectedOBDCodes]);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && !selectedImage) || isLoading) return;
    setInput("");
    streamChat(trimmed || "Analise esta imagem", selectedImage || undefined);
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    setInput("");
    streamChat(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      key="expert-chat"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-4 sm:py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onHome}>
                <Home className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportToPDF}
                  disabled={isExportingPDF}
                  className="gap-1"
                >
                  {isExportingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              )}
              
              {user && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={startNewConversation}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova</span>
                  </Button>
                  
                  <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => loadConversations()}>
                        <History className="w-4 h-4" />
                        <span className="hidden sm:inline">Histórico</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <History className="w-5 h-5" />
                          Conversas Anteriores
                        </SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                        {isLoadingHistory ? (
                          <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                              <Skeleton key={i} className="h-16 w-full" />
                            ))}
                          </div>
                        ) : conversations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Nenhuma conversa ainda</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {conversations.map((conv) => (
                              <Card 
                                key={conv.id}
                                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                                  currentConversationId === conv.id ? "border-primary" : ""
                                }`}
                                onClick={() => loadConversation(conv.id)}
                              >
                                <CardContent className="p-3 flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{conv.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(conv.updated_at), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => deleteConversation(conv.id, e)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ExpertLogo size="md" />
            <div className="min-w-0">
              <h1 className="font-chakra text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                Especialista Automotivo
                <Badge variant="secondary" className="text-xs">IA</Badge>
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base line-clamp-2">
                Converse, envie fotos e analise códigos OBD para tirar dúvidas.
              </p>
            </div>
          </div>

          {userVehicle && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Seu veículo:</span>
              <Badge variant="outline" className="truncate">
                {userVehicle.brand} {userVehicle.model} {userVehicle.year}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-4xl">
        {/* OBD Context Panel */}
        {user && (
          <div className="mb-4">
            <OBDContextPanel 
              onCodesSelected={setSelectedOBDCodes}
              selectedCodes={selectedOBDCodes}
            />
          </div>
        )}

        {/* Selected OBD Codes indicator */}
        {selectedOBDCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center gap-2 flex-wrap"
          >
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Analisando:</span>
            {selectedOBDCodes.map(code => (
              <Badge key={code.code} variant="secondary" className="text-xs font-mono">
                {code.code}
              </Badge>
            ))}
          </motion.div>
        )}

        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-4 sm:py-8"
              >
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <ExpertLogo size="lg" className="mx-auto mb-4" />
                    <h3 className="font-chakra font-bold text-base sm:text-lg mb-2">
                      Olá! Sou seu Especialista Automotivo
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 sm:mb-6 max-w-md mx-auto">
                      Posso ajudar com dúvidas sobre mecânica, manutenção preventiva, 
                      diagnóstico de problemas, <strong>analisar fotos</strong> e <strong>interpretar códigos OBD</strong>.
                    </p>
                    
                    <p className="text-sm font-medium mb-3 sm:mb-4">Perguntas rápidas:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                      {QUICK_QUESTIONS.map((q, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                          onClick={() => handleQuickQuestion(q.text)}
                          disabled={isLoading}
                        >
                          <q.icon className={`w-4 h-4 mr-2 shrink-0 ${q.color}`} />
                          <span className="text-xs">{q.text}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className="max-w-[85%] space-y-2">
                    <Card className={`${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                      <CardContent className="p-2.5 sm:p-3">
                        {msg.imageBase64 && (
                          <img 
                            src={msg.imageBase64} 
                            alt="Imagem enviada" 
                            className="max-w-[200px] rounded-md mb-2"
                          />
                        )}
                        <div className={`text-sm whitespace-pre-wrap ${msg.role === "assistant" ? "prose prose-sm dark:prose-invert max-w-none" : ""}`}>
                          {msg.content || (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analisando...
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tutorial Suggestions */}
                    {msg.suggestedTutorials && msg.suggestedTutorials.length > 0 && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-2.5 sm:p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Tutoriais Relacionados:
                          </p>
                          <div className="space-y-1.5">
                            {msg.suggestedTutorials.map((tutorial, i) => (
                              <a
                                key={i}
                                href={tutorial.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-xs group"
                              >
                                {tutorial.thumbnail && (
                                  <img 
                                    src={tutorial.thumbnail} 
                                    alt="" 
                                    className="w-10 h-7 object-cover rounded"
                                  />
                                )}
                                <span className="flex-1 truncate group-hover:text-primary transition-colors">
                                  {tutorial.name}
                                </span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                              </a>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {msg.role === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Image Preview */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2"
            >
              <div className="relative inline-block">
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="max-h-24 rounded-md border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="pt-3 sm:pt-4 border-t border-border">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Enviar foto"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Input
              ref={inputRef}
              placeholder="Digite sua pergunta ou envie uma foto..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Este assistente oferece orientações gerais. Para diagnósticos definitivos, consulte um mecânico.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertChatView;
