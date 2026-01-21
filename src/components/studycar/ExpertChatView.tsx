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
  Zap,
  MessageSquare,
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
import ConversationHistorySheet from "./chat/ConversationHistorySheet";
import DiagnosticPanel from "./chat/DiagnosticPanel";
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

// Base questions always shown
const BASE_QUESTIONS = [
  { icon: AlertTriangle, text: "Meu carro está fazendo um barulho estranho", color: "text-amber-400", gradient: "from-amber-500/20 to-orange-500/10" },
  { icon: Wrench, text: "Qual manutenção devo fazer agora?", color: "text-primary", gradient: "from-primary/20 to-primary/5" },
  { icon: Car, text: "Essa peça é compatível com meu carro?", color: "text-green-400", gradient: "from-green-500/20 to-emerald-500/10" },
  { icon: HelpCircle, text: "Como funciona o sistema de injeção?", color: "text-blue-400", gradient: "from-blue-500/20 to-cyan-500/10" },
];

// Vehicle-specific contextual questions
const getContextualQuestions = (vehicle: { brand: string; model: string; year: number } | null) => {
  if (!vehicle) return [];
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  const questions: Array<{ icon: typeof Car; text: string; color: string; gradient: string }> = [];
  
  if (vehicleAge >= 10) {
    questions.push({ icon: Wrench, text: `Quais peças devo verificar em um ${vehicle.brand} com ${vehicleAge} anos?`, color: "text-orange-400", gradient: "from-orange-500/20 to-red-500/10" });
  }
  if (vehicleAge >= 5) {
    questions.push({ icon: Activity, text: `Quando trocar a correia dentada do ${vehicle.model}?`, color: "text-rose-400", gradient: "from-rose-500/20 to-pink-500/10" });
  }
  questions.push({ icon: Sparkles, text: `Dicas para manter meu ${vehicle.brand} ${vehicle.model} em perfeito estado`, color: "text-purple-400", gradient: "from-purple-500/20 to-violet-500/10" });
  return questions.slice(0, 4);
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
  const { relatedTutorials, showTutorialSuggestions, searchRelatedTutorials, closeSuggestions } = useRelatedTutorials(isDiagnosticEnabled ? log : undefined);
  
  // Local state
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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
    setIsHistoryOpen(false);
    notifySuccess("Nova conversa", "Comece a conversar!");
  };

  const handleLoadConversation = async (convId: string) => {
    const success = await loadConversationMessages(convId);
    if (success) setIsHistoryOpen(false);
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
      className="min-h-screen flex flex-col bg-[hsl(222,47%,15%)]"
    >
      <ChatHeader
        userVehicle={userVehicle}
        currentConversation={currentConversation}
        conversationsCount={conversations.length}
        messagesCount={messages.length}
        isExportingPDF={isExportingPDF}
        onBack={onBack}
        onHome={onHome}
        onNewConversation={handleNewConversation}
        onOpenHistory={() => { loadConversations(); setIsHistoryOpen(true); }}
        onExportPDF={exportToPDF}
        onOpenRanking={() => { loadPopularQuestions(); setIsRankingOpen(true); }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        {/* OBD Context Panel */}
        {user && (
          <div className="mb-4">
            <OBDContextPanel onCodesSelected={setSelectedOBDCodes} selectedCodes={selectedOBDCodes} />
          </div>
        )}
        
        {/* Selected OBD Codes Display */}
        {selectedOBDCodes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Códigos OBD:</span>
              {selectedOBDCodes.map(code => (
                <Badge key={code.code} className="text-xs font-mono bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                  {code.code}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 -mr-4">
          <div className="space-y-5 pb-4">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="py-6"
              >
                {/* Welcome Card */}
                <div className="rounded-2xl bg-gradient-to-br from-[hsl(222,44%,18%)] via-[hsl(222,44%,16%)] to-[hsl(222,50%,12%)] border border-white/10 p-6 sm:p-8 shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-orange-600 mb-4 shadow-xl shadow-primary/30">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-chakra font-bold text-2xl text-white mb-2 tracking-wide">
                      ESPECIALISTA AUTOMOTIVO
                    </h3>
                    <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                      Posso ajudar com dúvidas sobre mecânica, manutenção, diagnóstico, 
                      <span className="text-green-400 font-medium"> analisar fotos</span>, 
                      <span className="text-amber-400 font-medium"> documentos</span> e 
                      <span className="text-primary font-medium"> códigos OBD</span>.
                    </p>
                  </div>
                  
                  {/* Favorite Questions */}
                  {favoriteQuestions.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 justify-center mb-4">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Suas Favoritas</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {favoriteQuestions.slice(0, 4).map((fav) => {
                          const IconComponent = ICON_MAP[fav.question_icon] || HelpCircle;
                          return (
                            <motion.div 
                              key={fav.id} 
                              whileHover={{ scale: 1.02, y: -2 }} 
                              whileTap={{ scale: 0.98 }} 
                              className="relative group"
                            >
                              <div className={`absolute inset-0 bg-gradient-to-r ${fav.question_gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`} />
                              <button
                                onClick={() => handleQuickQuestion(fav.question_text, fav.question_icon, fav.question_color, fav.question_gradient)}
                                className={`relative w-full text-left p-4 rounded-xl bg-[hsl(222,44%,14%)] border border-yellow-500/20 hover:border-yellow-500/40 transition-all flex items-start gap-3`}
                              >
                                <div className={`w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0 ${fav.question_color}`}>
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <span className="text-sm text-white/80 leading-relaxed pt-0.5">{fav.question_text}</span>
                              </button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white hover:bg-white/10" 
                                onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id); }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Vehicle-specific Questions */}
                  {contextualQuestions.length > 0 && userVehicle && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 justify-center mb-4">
                        <Car className="w-4 h-4 text-green-400" />
                        <p className="text-sm font-bold text-green-400 uppercase tracking-wider">
                          Sobre seu {userVehicle.brand}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {contextualQuestions.map((q, i) => (
                          <motion.div 
                            key={`ctx-${i}`} 
                            whileHover={{ scale: 1.02, y: -2 }} 
                            whileTap={{ scale: 0.98 }} 
                            className="relative group"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r ${q.gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`} />
                            <button
                              onClick={() => handleQuickQuestion(q.text, q.icon.name || "HelpCircle", q.color, q.gradient)}
                              className="relative w-full text-left p-4 rounded-xl bg-[hsl(222,44%,14%)] border border-green-500/20 hover:border-green-500/40 transition-all flex items-start gap-3"
                            >
                              <div className={`w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 ${q.color}`}>
                                <q.icon className="w-5 h-5" />
                              </div>
                              <span className="text-sm text-white/80 leading-relaxed pt-0.5">{q.text}</span>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* General Questions */}
                  <div>
                    <div className="flex items-center gap-2 justify-center mb-4">
                      <MessageSquare className="w-4 h-4 text-white/60" />
                      <p className="text-sm font-bold text-white/60 uppercase tracking-wider">Perguntas Gerais</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BASE_QUESTIONS.map((q, i) => (
                        <motion.div 
                          key={`base-${i}`} 
                          whileHover={{ scale: 1.02, y: -2 }} 
                          whileTap={{ scale: 0.98 }} 
                          className="relative group"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${q.gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500`} />
                          <button
                            onClick={() => handleQuickQuestion(q.text, q.icon.name || "HelpCircle", q.color, q.gradient)}
                            className="relative w-full text-left p-4 rounded-xl bg-[hsl(222,44%,14%)] border border-white/10 hover:border-white/20 transition-all flex items-start gap-3"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${q.color}`}>
                              <q.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-white/80 leading-relaxed pt-0.5">{q.text}</span>
                          </button>
                        </motion.div>
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

        {/* Tutorial Suggestions */}
        <AnimatePresence>
          {showTutorialSuggestions && relatedTutorials.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="mb-4"
            >
              <div className="rounded-xl bg-gradient-to-r from-green-500/15 to-green-500/5 border border-green-500/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold text-green-400 uppercase tracking-wider">Tutoriais Relacionados</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-6 h-6 text-white/40 hover:text-white hover:bg-white/10" 
                    onClick={closeSuggestions}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedTutorials.map((t) => (
                    <motion.a 
                      key={t.id} 
                      href={`/tutoriais/${t.slug}`} 
                      whileHover={{ scale: 1.03 }} 
                      className="block p-2.5 rounded-lg bg-[hsl(222,44%,14%)] hover:bg-[hsl(222,44%,18%)] border border-white/10 hover:border-green-500/30 transition-all group"
                    >
                      {t.thumbnail && (
                        <img src={t.thumbnail} alt="" className="w-full h-16 object-cover rounded-lg mb-2 border border-white/10" />
                      )}
                      <span className="text-xs text-white/70 line-clamp-2 group-hover:text-green-300 transition-colors font-medium">
                        {t.title}
                      </span>
                      {t.category && (
                        <Badge variant="outline" className="text-[10px] mt-1.5 border-white/10 text-white/50">
                          {t.category}
                        </Badge>
                      )}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachments Preview */}
        <AnimatePresence>
          {(selectedImage || selectedDocument) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }} 
              className="mb-3"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(222,44%,18%)] border border-white/10">
                {selectedImage && (
                  <div className="relative">
                    <img src={selectedImage} alt="Preview" className="h-16 rounded-lg border border-white/10" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full" 
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                {selectedDocument && (
                  <div className="relative flex items-center gap-3 px-3 py-2 rounded-lg bg-[hsl(222,44%,14%)] border border-white/10">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{selectedDocument.name}</p>
                      <p className="text-xs text-white/50">{(selectedDocument.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 shrink-0 text-white/40 hover:text-white hover:bg-white/10" 
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
        <div className="pt-4 border-t border-white/10">
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <input ref={documentInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleDocumentSelect} className="hidden" />
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isLoading} 
                title="Enviar foto" 
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/30"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => documentInputRef.current?.click()} 
                disabled={isLoading} 
                title="Enviar documento" 
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            
            <Input 
              placeholder="Digite sua pergunta..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())} 
              disabled={isLoading} 
              className="flex-1 bg-[hsl(222,44%,18%)] border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:ring-primary/20" 
            />
            
            <Button 
              onClick={handleSend} 
              disabled={isLoading || (!input.trim() && !selectedImage && !selectedDocument)} 
              className="px-5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/30"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          
          <p className="text-[11px] text-white/40 mt-3 text-center">
            Orientações gerais. Para diagnósticos definitivos, consulte um mecânico profissional.
          </p>
        </div>
      </div>

      {/* Sheets */}
      <ConversationHistorySheet 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        conversations={conversations} 
        isLoading={isLoadingHistory} 
        currentConversationId={currentConversationId} 
        onLoadConversation={handleLoadConversation} 
        onDeleteConversation={deleteConversation} 
        onTogglePin={togglePinConversation} 
        onRename={renameConversation} 
      />
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
        className={`fixed bottom-4 left-4 z-40 rounded-full w-10 h-10 border ${
          isDiagnosticEnabled 
            ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" 
            : "bg-[hsl(222,44%,18%)] text-white/60 border-white/10 hover:text-white hover:bg-white/10"
        }`}
        onClick={toggleDiagnosticMode}
        title={isDiagnosticEnabled ? "Desativar modo diagnóstico" : "Ativar modo diagnóstico"}
      >
        <Bug className="w-4 h-4" />
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
