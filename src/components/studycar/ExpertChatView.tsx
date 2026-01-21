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
  Activity,
  Pin,
  PinOff,
  Edit2,
  Check,
  FileText,
  Paperclip,
  Search,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateExpertConversationPDF, downloadExpertConversationPDF } from "@/services/pdf/expertConversationPDFGenerator";
import ExpertLogo from "./ExpertLogo";
import OBDContextPanel from "./OBDContextPanel";
import { useNotifications } from "@/hooks/useNotifications";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  documentName?: string;
  documentUrl?: string;
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
  is_pinned?: boolean;
  last_message_preview?: string;
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

// Base questions always shown
const BASE_QUESTIONS = [
  { icon: AlertTriangle, text: "Meu carro está fazendo um barulho estranho", color: "text-amber-500", gradient: "from-amber-500/20 to-orange-500/10" },
  { icon: Wrench, text: "Qual manutenção devo fazer agora?", color: "text-primary", gradient: "from-primary/20 to-primary/5" },
  { icon: Car, text: "Essa peça é compatível com meu carro?", color: "text-green-500", gradient: "from-green-500/20 to-emerald-500/10" },
  { icon: HelpCircle, text: "Como funciona o sistema de injeção?", color: "text-blue-500", gradient: "from-blue-500/20 to-cyan-500/10" },
];

// Vehicle-specific contextual questions
const getContextualQuestions = (vehicle: { brand: string; model: string; year: number } | null) => {
  if (!vehicle) return [];
  
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  const questions: Array<{ icon: typeof Car; text: string; color: string; gradient: string }> = [];
  
  // Age-based questions
  if (vehicleAge >= 10) {
    questions.push({
      icon: Wrench,
      text: `Quais peças devo verificar em um ${vehicle.brand} com ${vehicleAge} anos?`,
      color: "text-orange-500",
      gradient: "from-orange-500/20 to-red-500/10"
    });
  }
  
  if (vehicleAge >= 5) {
    questions.push({
      icon: Activity,
      text: `Qual a quilometragem ideal para trocar a correia dentada do ${vehicle.model}?`,
      color: "text-rose-500",
      gradient: "from-rose-500/20 to-pink-500/10"
    });
  }
  
  // Brand-specific questions
  const brandQuestions: Record<string, { icon: typeof Car; text: string; color: string; gradient: string }> = {
    "volkswagen": { icon: Car, text: `Problemas comuns no ${vehicle.model} ${vehicle.year}`, color: "text-blue-400", gradient: "from-blue-400/20 to-indigo-500/10" },
    "fiat": { icon: AlertTriangle, text: `Recalls ativos para ${vehicle.brand} ${vehicle.model}?`, color: "text-red-500", gradient: "from-red-500/20 to-rose-500/10" },
    "chevrolet": { icon: Wrench, text: `Manutenção preventiva do ${vehicle.model} ${vehicle.year}`, color: "text-yellow-500", gradient: "from-yellow-500/20 to-amber-500/10" },
    "ford": { icon: HelpCircle, text: `Qual óleo usar no ${vehicle.model} ${vehicle.year}?`, color: "text-blue-600", gradient: "from-blue-600/20 to-blue-400/10" },
    "honda": { icon: Activity, text: `Intervalo de revisão do ${vehicle.model}`, color: "text-red-400", gradient: "from-red-400/20 to-orange-500/10" },
    "toyota": { icon: Car, text: `Sistema híbrido do ${vehicle.model} - como funciona?`, color: "text-green-600", gradient: "from-green-600/20 to-teal-500/10" },
    "hyundai": { icon: Wrench, text: `Garantia e manutenção do ${vehicle.model} ${vehicle.year}`, color: "text-blue-500", gradient: "from-blue-500/20 to-sky-500/10" },
    "renault": { icon: AlertTriangle, text: `Problemas elétricos comuns no ${vehicle.model}`, color: "text-yellow-400", gradient: "from-yellow-400/20 to-orange-400/10" },
    "jeep": { icon: Car, text: `Sistema 4x4 do ${vehicle.model} - cuidados especiais`, color: "text-green-500", gradient: "from-green-500/20 to-lime-500/10" },
    "nissan": { icon: HelpCircle, text: `CVT do ${vehicle.model} - manutenção correta`, color: "text-red-500", gradient: "from-red-500/20 to-rose-400/10" },
  };
  
  const brandKey = vehicle.brand.toLowerCase();
  if (brandQuestions[brandKey]) {
    questions.push(brandQuestions[brandKey]);
  }
  
  // General vehicle-specific question
  questions.push({
    icon: Sparkles,
    text: `Dicas para manter meu ${vehicle.brand} ${vehicle.model} ${vehicle.year} em perfeito estado`,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-violet-500/10"
  });
  
  return questions.slice(0, 4); // Max 4 contextual questions
};

const ExpertChatView = ({ userVehicle, onBack, onHome }: ExpertChatViewProps) => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [selectedOBDCodes, setSelectedOBDCodes] = useState<DiagnosticCode[]>([]);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [historyTab, setHistoryTab] = useState<"all" | "pinned">("all");
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Load conversation history
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data } = await supabase
        .from("expert_conversations")
        .select("id, title, updated_at, vehicle_context, is_pinned, last_message_preview")
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(50);
      
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
      // Delete messages first
      await supabase
        .from("expert_messages")
        .delete()
        .eq("conversation_id", conversationId);
      
      // Then delete conversation
      await supabase
        .from("expert_conversations")
        .delete()
        .eq("id", conversationId);
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }
      
      notifySuccess("Excluída", "Conversa excluída com sucesso");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      notifyError("Erro", "Não foi possível excluir a conversa");
    }
  };

  // Pin/Unpin conversation
  const togglePinConversation = async (conversationId: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from("expert_conversations")
        .update({ is_pinned: !isPinned })
        .eq("id", conversationId);
      
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
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  // Rename conversation
  const startEditingTitle = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConversationId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveTitle = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingTitle.trim()) return;
    
    try {
      await supabase
        .from("expert_conversations")
        .update({ title: editingTitle.trim() })
        .eq("id", conversationId);
      
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, title: editingTitle.trim() } : c
        )
      );
      setEditingConversationId(null);
      notifySuccess("Renomeada", "Conversa renomeada com sucesso");
    } catch (error) {
      console.error("Error renaming:", error);
      notifyError("Erro", "Não foi possível renomear");
    }
  };

  // Start new conversation
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSelectedImage(null);
    setSelectedDocument(null);
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
      notifyError("Erro", "A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setSelectedDocument(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle document selection
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      notifyError("Erro", "Formato não suportado. Use PDF, TXT ou DOC");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notifyError("Erro", "O documento deve ter no máximo 10MB");
      return;
    }

    setSelectedDocument(file);
    setSelectedImage(null);
    e.target.value = "";
  };

  const streamChat = useCallback(async (userMessage: string, imageBase64?: string, documentFile?: File) => {
    let documentContent = "";
    let documentName = "";
    
    // Read document content if provided
    if (documentFile) {
      documentName = documentFile.name;
      if (documentFile.type === "text/plain") {
        documentContent = await documentFile.text();
      } else {
        // For other document types, just mention the file
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
    setSelectedImage(null);
    setSelectedDocument(null);

    let assistantContent = "";
    let newConversationId = currentConversationId;

    try {
      const response = await fetch(
        `https://txxgmxxssnogumcwsfvn.supabase.co/functions/v1/automotive-expert-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eGdteHhzc25vZ3VtY3dzZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY3OTcsImV4cCI6MjA4NDE4Mjc5N30.CpsvNMco1a5E3TjzWh37aUwcBvKjKi3WSlbjOKbx6w0`,
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
      if (newConversationId) {
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
    if ((!trimmed && !selectedImage && !selectedDocument) || isLoading) return;
    setInput("");
    streamChat(
      trimmed || (selectedImage ? "Analise esta imagem" : "Analise este documento"), 
      selectedImage || undefined,
      selectedDocument || undefined
    );
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

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === "" || 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = historyTab === "all" || 
      (historyTab === "pinned" && conv.is_pinned);
    return matchesSearch && matchesTab;
  });

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  return (
    <motion.div
      key="expert-chat"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header - Design atualizado */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-4 sm:py-6 border-b border-border/50">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onHome} className="hover:bg-primary/10">
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
                  className="gap-1.5 border-primary/30 hover:bg-primary/10"
                >
                  {isExportingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Exportar PDF</span>
                </Button>
              )}
              
              {user && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={startNewConversation}
                    className="gap-1.5 border-primary/30 hover:bg-primary/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Conversa</span>
                  </Button>
                  
                  <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="gap-1.5" 
                        onClick={() => loadConversations()}
                      >
                        <History className="w-4 h-4" />
                        <span className="hidden sm:inline">Histórico</span>
                        {conversations.length > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs bg-background/20">
                            {conversations.length}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-md p-0">
                      <SheetHeader className="p-4 border-b">
                        <SheetTitle className="flex items-center gap-2">
                          <History className="w-5 h-5 text-primary" />
                          Minhas Conversas
                        </SheetTitle>
                        
                        {/* Search */}
                        <div className="relative mt-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar conversas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        
                        {/* Tabs */}
                        <Tabs value={historyTab} onValueChange={(v) => setHistoryTab(v as "all" | "pinned")} className="mt-3">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all" className="gap-1.5">
                              <MessageCircle className="w-4 h-4" />
                              Todas
                            </TabsTrigger>
                            <TabsTrigger value="pinned" className="gap-1.5">
                              <Pin className="w-4 h-4" />
                              Fixadas
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </SheetHeader>
                      
                      <ScrollArea className="h-[calc(100vh-14rem)]">
                        <div className="p-4">
                          {isLoadingHistory ? (
                            <div className="space-y-3">
                              {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-lg" />
                              ))}
                            </div>
                          ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12">
                              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                              <p className="text-muted-foreground">
                                {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Inicie uma nova conversa para começar
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredConversations.map((conv) => (
                                <Card 
                                  key={conv.id}
                                  className={`cursor-pointer hover:bg-muted/50 transition-all group ${
                                    currentConversationId === conv.id ? "border-primary ring-1 ring-primary/30" : ""
                                  } ${conv.is_pinned ? "bg-primary/5" : ""}`}
                                  onClick={() => loadConversation(conv.id)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-3">
                                      {/* Icon */}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        conv.is_pinned ? "bg-primary/20" : "bg-muted"
                                      }`}>
                                        {conv.is_pinned ? (
                                          <Pin className="w-4 h-4 text-primary" />
                                        ) : (
                                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                        )}
                                      </div>
                                      
                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        {editingConversationId === conv.id ? (
                                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <Input
                                              value={editingTitle}
                                              onChange={(e) => setEditingTitle(e.target.value)}
                                              className="h-7 text-sm"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") saveTitle(conv.id, e as any);
                                                if (e.key === "Escape") setEditingConversationId(null);
                                              }}
                                            />
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={(e) => saveTitle(conv.id, e)}
                                            >
                                              <Check className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <p className="font-medium text-sm truncate">{conv.title}</p>
                                        )}
                                        
                                        {conv.last_message_preview && (
                                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {conv.last_message_preview}
                                          </p>
                                        )}
                                        
                                        <div className="flex items-center gap-2 mt-1.5">
                                          <span className="text-xs text-muted-foreground">
                                            {format(new Date(conv.updated_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                                          </span>
                                          {conv.vehicle_context && (
                                            <Badge variant="outline" className="text-xs py-0 h-5">
                                              <Car className="w-3 h-3 mr-1" />
                                              {conv.vehicle_context.brand}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Actions */}
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => togglePinConversation(conv.id, conv.is_pinned || false, e)}
                                          title={conv.is_pinned ? "Desafixar" : "Fixar"}
                                        >
                                          {conv.is_pinned ? (
                                            <PinOff className="w-4 h-4 text-primary" />
                                          ) : (
                                            <Pin className="w-4 h-4" />
                                          )}
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => startEditingTitle(conv, e)}
                                          title="Renomear"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                        
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 hover:text-destructive"
                                              onClick={(e) => e.stopPropagation()}
                                              title="Excluir"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. A conversa será permanentemente excluída.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={(e) => deleteConversation(conv.id, e)}
                                                className="bg-destructive hover:bg-destructive/90"
                                              >
                                                Excluir
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div className="flex items-center gap-4">
            <ExpertLogo size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-chakra text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Especialista Automotivo
                </h1>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Converse, envie fotos e documentos, analise códigos OBD
              </p>
              
              {/* Current conversation indicator */}
              {currentConversation && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {currentConversation.title}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle badge */}
          {userVehicle && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {userVehicle.brand} {userVehicle.model} {userVehicle.year}
              </span>
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
            <span className="text-xs text-muted-foreground">Códigos selecionados:</span>
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
                className="py-6"
              >
                <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <ExpertLogo size="lg" className="mx-auto mb-4" />
                    <h3 className="font-chakra font-bold text-lg mb-2">
                      Olá! Sou seu Especialista Automotivo
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                      Posso ajudar com dúvidas sobre mecânica, manutenção, diagnóstico, 
                      <strong> analisar fotos</strong>, <strong>documentos</strong> e <strong>códigos OBD</strong>.
                    </p>
                    
                    {/* Contextual questions based on vehicle */}
                    {userVehicle && (
                      <>
                        <div className="flex items-center gap-2 justify-center mb-3">
                          <Badge variant="outline" className="bg-primary/10 border-primary/30">
                            <Car className="w-3 h-3 mr-1" />
                            {userVehicle.brand} {userVehicle.model} {userVehicle.year}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-4 text-primary">Perguntas sobre seu veículo:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-6">
                          {getContextualQuestions(userVehicle).map((q, i) => (
                            <motion.div
                              key={`ctx-${i}`}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="relative group"
                            >
                              {/* Glow effect on hover */}
                              <div className={`absolute -inset-0.5 bg-gradient-to-r ${q.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500`} />
                              
                              <Card
                                className={`relative cursor-pointer border-border/50 bg-gradient-to-br ${q.gradient} backdrop-blur-sm hover:border-primary/50 transition-all duration-300 overflow-hidden`}
                                onClick={() => handleQuickQuestion(q.text)}
                              >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                
                                <CardContent className="p-4 flex items-start gap-3 relative z-10">
                                  <div className={`w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ${q.color}`}>
                                    <q.icon className="w-5 h-5" />
                                  </div>
                                  <span className="text-sm text-foreground leading-relaxed pt-1 group-hover:text-foreground transition-colors">{q.text}</span>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    <p className="text-sm font-medium mb-4">Perguntas gerais:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {BASE_QUESTIONS.map((q, i) => (
                        <motion.div
                          key={`base-${i}`}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative group"
                        >
                          {/* Glow effect on hover */}
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${q.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500`} />
                          
                          <Card
                            className="relative cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 overflow-hidden"
                            onClick={() => handleQuickQuestion(q.text)}
                          >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            
                            <CardContent className="p-4 flex items-start gap-3 relative z-10">
                              <div className={`w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ${q.color}`}>
                                <q.icon className="w-5 h-5" />
                              </div>
                              <span className="text-sm text-foreground/90 leading-relaxed pt-1 group-hover:text-foreground transition-colors">{q.text}</span>
                            </CardContent>
                          </Card>
                        </motion.div>
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
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className="max-w-[85%] space-y-2">
                    <Card className={`${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card border-border/50"
                    }`}>
                      <CardContent className="p-3">
                        {/* Image preview */}
                        {msg.imageBase64 && (
                          <img 
                            src={msg.imageBase64} 
                            alt="Imagem enviada" 
                            className="max-w-[200px] rounded-md mb-2"
                          />
                        )}
                        
                        {/* Document indicator */}
                        {msg.documentName && (
                          <div className="flex items-center gap-2 mb-2 p-2 rounded bg-background/20">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{msg.documentName}</span>
                          </div>
                        )}
                        
                        <div className={`text-sm whitespace-pre-wrap ${
                          msg.role === "assistant" ? "prose prose-sm dark:prose-invert max-w-none" : ""
                        }`}>
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
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Tutoriais Relacionados:
                          </p>
                          <div className="space-y-2">
                            {msg.suggestedTutorials.map((tutorial, i) => (
                              <a
                                key={i}
                                href={tutorial.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 transition-colors text-xs group"
                              >
                                {tutorial.thumbnail && (
                                  <img 
                                    src={tutorial.thumbnail} 
                                    alt="" 
                                    className="w-12 h-8 object-cover rounded"
                                  />
                                )}
                                <span className="flex-1 truncate group-hover:text-primary transition-colors">
                                  {tutorial.name}
                                </span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0" />
                              </a>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Attachments Preview */}
        <AnimatePresence>
          {(selectedImage || selectedDocument) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
                {selectedImage && (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="h-16 rounded-md border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-5 h-5"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {selectedDocument && (
                  <div className="relative flex items-center gap-2 px-3 py-2 rounded-md bg-background border">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedDocument.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedDocument.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => setSelectedDocument(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleDocumentSelect}
              className="hidden"
            />
            
            {/* Attachment buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Enviar foto"
                className="hover:bg-primary/10 hover:border-primary/50"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => documentInputRef.current?.click()}
                disabled={isLoading}
                title="Enviar documento"
                className="hover:bg-primary/10 hover:border-primary/50"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            
            <Input
              ref={inputRef}
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || (!input.trim() && !selectedImage && !selectedDocument)}
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Orientações gerais. Para diagnósticos definitivos, consulte um mecânico.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertChatView;