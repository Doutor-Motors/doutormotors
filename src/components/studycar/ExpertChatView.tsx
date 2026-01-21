import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Car,
  Wrench,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Image as ImageIcon,
  X,
  FileText,
  Paperclip,
  Sparkles,
  Star,
  Video,
  Activity,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { generateExpertConversationPDF, downloadExpertConversationPDF } from "@/services/pdf/expertConversationPDFGenerator";
import OBDContextPanel from "./OBDContextPanel";
import ChatMessage from "./chat/ChatMessage";
import ChatHeader from "./chat/ChatHeader";
import PopularQuestionsSheet from "./chat/PopularQuestionsSheet";
import HistorySidebar from "./chat/HistorySidebar";
import DiagnosticPanel from "./chat/DiagnosticPanel";
import ExpertLogo from "./ExpertLogo";
import QuickQuestionCard from "./chat/QuickQuestionCard";
import TutorialSkeleton from "./chat/TutorialSkeleton";
import { useExpertChat } from "./hooks/useExpertChat";
import { useConversationHistory } from "./hooks/useConversationHistory";
import { useFavoriteQuestions } from "./hooks/useFavoriteQuestions";
import { useRelatedTutorials } from "./hooks/useRelatedTutorials";
import { useDiagnosticMode } from "./hooks/useDiagnosticMode";

// Icon mapping for favorites
const ICON_MAP: Record<string, typeof Car> = {
  AlertTriangle,
  Wrench,
  Car,
  HelpCircle,
  Activity,
  Sparkles,
};

interface ExpertChatViewProps {
  userVehicle: { brand: string; model: string; year: number } | null;
  onBack: () => void;
  onHome: () => void;
}

// Compact base questions
const BASE_QUESTIONS = [
  { icon: AlertTriangle, text: "Barulho estranho no carro", color: "text-amber-500", gradient: "from-amber-500/20 to-orange-500/10" },
  { icon: Wrench, text: "Manutenção preventiva", color: "text-primary", gradient: "from-primary/20 to-primary/5" },
  { icon: Car, text: "Compatibilidade de peças", color: "text-green-500", gradient: "from-green-500/20 to-emerald-500/10" },
  { icon: HelpCircle, text: "Como funciona injeção?", color: "text-blue-500", gradient: "from-blue-500/20 to-cyan-500/10" },
];

// Vehicle-specific contextual questions
const getContextualQuestions = (vehicle: { brand: string; model: string; year: number } | null) => {
  if (!vehicle) return [];
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  const questions: Array<{ icon: typeof Car; text: string; color: string; gradient: string }> = [];
  
  if (vehicleAge >= 10) {
    questions.push({ icon: Wrench, text: `Peças para verificar (${vehicleAge} anos)`, color: "text-orange-500", gradient: "from-orange-500/20 to-red-500/10" });
  }
  if (vehicleAge >= 5) {
    questions.push({ icon: Activity, text: `Correia dentada ${vehicle.model}`, color: "text-rose-500", gradient: "from-rose-500/20 to-pink-500/10" });
  }
  questions.push({ icon: Sparkles, text: `Manter ${vehicle.brand} em dia`, color: "text-purple-500", gradient: "from-purple-500/20 to-violet-500/10" });
  return questions.slice(0, 3);
};

const ExpertChatView = ({ userVehicle, onBack, onHome }: ExpertChatViewProps) => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  
  // Diagnostic mode hook
  const { isDiagnosticEnabled, toggleDiagnosticMode, logs, log, clearLogs } = useDiagnosticMode();
  
  // Custom hooks with diagnostic logging
  const { messages, isLoading, currentConversationId, selectedOBDCodes, setSelectedOBDCodes, streamChat, clearConversation, loadConversationMessages } = useExpertChat({ userVehicle });
  const { conversations, isLoadingHistory, loadConversations, deleteConversation, togglePinConversation, renameConversation, createNewConversation } = useConversationHistory(isDiagnosticEnabled ? log : undefined);
  const { favoriteQuestions, popularQuestions, isLoadingPopular, loadFavorites, loadPopularQuestions, saveQuestionAsFavorite, removeFavorite } = useFavoriteQuestions();
  const { relatedTutorials, showTutorialSuggestions, isSearching, searchRelatedTutorials, closeSuggestions } = useRelatedTutorials(isDiagnosticEnabled ? log : undefined);
  
  // Local state
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll and load data on mount
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => { loadConversations(); loadFavorites(); }, [loadConversations, loadFavorites]);

  // Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { notifyError("Erro", "A imagem deve ter no máximo 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (event) => { setSelectedImage(event.target?.result as string); setSelectedDocument(null); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) { notifyError("Erro", "Formato não suportado"); return; }
    if (file.size > 10 * 1024 * 1024) { notifyError("Erro", "O documento deve ter no máximo 10MB"); return; }
    setSelectedDocument(file); setSelectedImage(null);
    e.target.value = "";
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && !selectedImage && !selectedDocument) || isLoading) return;
    setInput("");
    const img = selectedImage; const doc = selectedDocument;
    setSelectedImage(null); setSelectedDocument(null);
    streamChat(trimmed || (img ? "Analise esta imagem" : "Analise este documento"), img || undefined, doc || undefined, loadConversations);
  };

  const handleQuickQuestion = (question: string, icon?: string, color?: string, gradient?: string) => {
    if (isLoading) return;
    setInput("");
    if (icon && color && gradient) saveQuestionAsFavorite(question, icon, color, gradient);
    searchRelatedTutorials(question, userVehicle || undefined);
    streamChat(question, undefined, undefined, loadConversations);
  };

  const handleNewConversation = async () => {
    clearConversation();
    notifySuccess("Nova conversa", "Comece a conversar!");
  };

  const handleLoadConversation = async (convId: string) => {
    await loadConversationMessages(convId);
  };

  const exportToPDF = async () => {
    if (messages.length === 0) { notifyError("Erro", "Não há conversa para exportar"); return; }
    setIsExportingPDF(true);
    try {
      const conversation = conversations.find(c => c.id === currentConversationId);
      const blob = await generateExpertConversationPDF({ messages, vehicle: userVehicle, userName: user?.email, conversationTitle: conversation?.title, obdCodes: selectedOBDCodes.map(c => c.code) });
      downloadExpertConversationPDF(blob, conversation?.title);
      notifySuccess("PDF Exportado", "Arquivo salvo com sucesso!");
    } catch { notifyError("Erro", "Falha ao exportar PDF"); }
    finally { setIsExportingPDF(false); }
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const contextualQuestions = getContextualQuestions(userVehicle);

  return (
    <motion.div 
      key="expert-chat" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] flex bg-background overflow-hidden isolate"
    >
      {/* Left Sidebar - History */}
      <HistorySidebar
        conversations={conversations}
        isLoading={isLoadingHistory}
        currentConversationId={currentConversationId}
        onLoadConversation={handleLoadConversation}
        onDeleteConversation={deleteConversation}
        onTogglePin={togglePinConversation}
        onRename={renameConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        <ChatHeader
          userVehicle={userVehicle}
          currentConversation={currentConversation}
          conversationsCount={conversations.length}
          messagesCount={messages.length}
          isExportingPDF={isExportingPDF}
          onNewConversation={handleNewConversation}
          onExportPDF={exportToPDF}
          onOpenRanking={() => { loadPopularQuestions(); setIsRankingOpen(true); }}
        />

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-8 py-4">
        {/* OBD Context Panel - Compact */}
        {user && (
          <div className="mb-3">
            <OBDContextPanel onCodesSelected={setSelectedOBDCodes} selectedCodes={selectedOBDCodes} />
          </div>
        )}
        
        {/* Selected OBD Codes Display - Compact */}
        {selectedOBDCodes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-3 p-2 rounded-lg bg-primary/10 border border-primary/20"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground">OBD:</span>
              {selectedOBDCodes.map(code => (
                <Badge key={code.code} className="text-[10px] font-mono px-1.5 py-0 h-5 bg-primary/20 text-primary border-primary/30">
                  {code.code}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2 -mr-2">
          <div className="space-y-4 pb-3">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="py-4"
              >
                {/* Compact Welcome Card */}
                <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
                  {/* Header - Compact */}
                  <div className="flex items-center gap-3 mb-4">
                    <ExpertLogo size="md" />
                    <div>
                      <h3 className="font-semibold text-foreground text-base">
                        Especialista Automotivo
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-500">Fotos</span> · <span className="text-amber-500">Docs</span> · <span className="text-primary">OBD</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Favorite Questions - Animated Grid */}
                  {favoriteQuestions.length > 0 && (
                    <div className="mb-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 mb-2"
                      >
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-semibold text-yellow-500 uppercase tracking-wider">Favoritas</span>
                      </motion.div>
                      <div className="grid grid-cols-2 gap-2">
                        {favoriteQuestions.slice(0, 4).map((fav, i) => {
                          const IconComponent = ICON_MAP[fav.question_icon] || HelpCircle;
                          return (
                            <div key={fav.id} className="relative group">
                              <QuickQuestionCard
                                icon={IconComponent}
                                text={fav.question_text}
                                color={fav.question_color}
                                index={i}
                                variant="favorite"
                                onClick={() => handleQuickQuestion(fav.question_text, fav.question_icon, fav.question_color, fav.question_gradient)}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted z-10" 
                                onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id); }}
                              >
                                <X className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Vehicle-specific Questions - Animated */}
                  {contextualQuestions.length > 0 && userVehicle && (
                    <div className="mb-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-1.5 mb-2"
                      >
                        <Car className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">
                          {userVehicle.brand}
                        </span>
                      </motion.div>
                      <div className="flex flex-wrap gap-2">
                        {contextualQuestions.map((q, i) => (
                          <QuickQuestionCard
                            key={`ctx-${i}`}
                            icon={q.icon}
                            text={q.text}
                            color={q.color}
                            index={i + (favoriteQuestions.length > 0 ? 4 : 0)}
                            variant="vehicle"
                            onClick={() => handleQuickQuestion(q.text, q.icon.name || "HelpCircle", q.color, q.gradient)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* General Questions - Animated Chips */}
                  <div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-1.5 mb-2"
                    >
                      <Sparkles className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Perguntas</span>
                    </motion.div>
                    <div className="flex flex-wrap gap-2">
                      {BASE_QUESTIONS.map((q, i) => (
                        <QuickQuestionCard
                          key={`base-${i}`}
                          icon={q.icon}
                          text={q.text}
                          color={q.color}
                          index={i + (favoriteQuestions.length > 0 ? 4 : 0) + contextualQuestions.length}
                          variant="general"
                          onClick={() => handleQuickQuestion(q.text, q.icon.name || "HelpCircle", q.color, q.gradient)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage 
                  key={idx} 
                  message={msg} 
                  index={idx} 
                  isTyping={isLoading && idx === messages.length - 1 && msg.role === "assistant"} 
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Tutorial Suggestions with Skeleton Loading */}
        <AnimatePresence>
          {(showTutorialSuggestions || isSearching) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }} 
              className="mb-3"
            >
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Tutoriais</span>
                    {isSearching && (
                      <Loader2 className="w-3 h-3 text-green-500 animate-spin ml-1" />
                    )}
                  </div>
                  {!isSearching && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-5 h-5 text-muted-foreground hover:text-foreground" 
                      onClick={closeSuggestions}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                {isSearching ? (
                  <TutorialSkeleton count={4} />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {relatedTutorials.map((t, i) => (
                      <motion.a 
                        key={t.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        href={`/tutoriais/${t.slug}`} 
                        className="block p-2 rounded-lg bg-card border border-border hover:border-green-500/30 transition-all group"
                      >
                        {t.thumbnail && (
                          <img src={t.thumbnail} alt="" className="w-full h-12 object-cover rounded mb-1.5" />
                        )}
                        <span className="text-[10px] text-muted-foreground line-clamp-2 group-hover:text-green-500 transition-colors font-medium">
                          {t.title}
                        </span>
                      </motion.a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachments Preview - Compact */}
        <AnimatePresence>
          {(selectedImage || selectedDocument) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }} 
              className="mb-2"
            >
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border">
                {selectedImage && (
                  <div className="relative">
                    <img src={selectedImage} alt="Preview" className="h-12 rounded border border-border" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full" 
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                )}
                {selectedDocument && (
                  <div className="relative flex items-center gap-2 px-2 py-1.5 rounded bg-card border border-border">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{selectedDocument.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(selectedDocument.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground" 
                      onClick={() => setSelectedDocument(null)}
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area - Compact */}
        <div className="pt-3 border-t border-border">
          <div className="flex gap-1.5">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <input ref={documentInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleDocumentSelect} className="hidden" />
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isLoading} 
              title="Enviar foto" 
              className="w-9 h-9 text-green-500 hover:text-green-400 hover:bg-green-500/10"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => documentInputRef.current?.click()} 
              disabled={isLoading} 
              title="Enviar documento" 
              className="w-9 h-9 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Input 
              placeholder="Digite sua pergunta..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())} 
              disabled={isLoading} 
              className="flex-1 h-9 text-sm" 
            />
            
            <Button 
              onClick={handleSend} 
              disabled={isLoading || (!input.trim() && !selectedImage && !selectedDocument)} 
              size="sm"
              className="h-9 px-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Orientações gerais. Consulte um mecânico para diagnósticos definitivos.
          </p>
        </div>
      </div>
      </div>
      <PopularQuestionsSheet 
        isOpen={isRankingOpen} 
        onClose={() => setIsRankingOpen(false)} 
        popularQuestions={popularQuestions} 
        isLoading={isLoadingPopular} 
        onSelectQuestion={(q) => { handleQuickQuestion(q.question_text, q.question_icon, q.question_color, q.question_gradient); setIsRankingOpen(false); }} 
      />
      
      {/* Diagnostic Mode Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed bottom-4 left-4 z-40 rounded-full w-8 h-8 ${
          isDiagnosticEnabled 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
        onClick={toggleDiagnosticMode}
        title={isDiagnosticEnabled ? "Desativar modo diagnóstico" : "Ativar modo diagnóstico"}
      >
        <Bug className="w-3.5 h-3.5" />
      </Button>
      
      {/* Diagnostic Panel */}
      <DiagnosticPanel
        isOpen={isDiagnosticEnabled}
        logs={logs}
        onClose={toggleDiagnosticMode}
        onClear={clearLogs}
      />
    </motion.div>
  );
};

export default ExpertChatView;
