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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { generateExpertConversationPDF, downloadExpertConversationPDF } from "@/services/pdf/expertConversationPDFGenerator";
import ExpertLogo from "./ExpertLogo";
import OBDContextPanel from "./OBDContextPanel";
import ChatMessage from "./chat/ChatMessage";
import ChatHeader from "./chat/ChatHeader";
import PopularQuestionsSheet from "./chat/PopularQuestionsSheet";
import ConversationHistorySheet from "./chat/ConversationHistorySheet";
import { useExpertChat } from "./hooks/useExpertChat";
import { useConversationHistory } from "./hooks/useConversationHistory";
import { useFavoriteQuestions } from "./hooks/useFavoriteQuestions";
import { useRelatedTutorials } from "./hooks/useRelatedTutorials";

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
  
  if (vehicleAge >= 10) {
    questions.push({ icon: Wrench, text: `Quais peças devo verificar em um ${vehicle.brand} com ${vehicleAge} anos?`, color: "text-orange-500", gradient: "from-orange-500/20 to-red-500/10" });
  }
  if (vehicleAge >= 5) {
    questions.push({ icon: Activity, text: `Qual a quilometragem ideal para trocar a correia dentada do ${vehicle.model}?`, color: "text-rose-500", gradient: "from-rose-500/20 to-pink-500/10" });
  }
  questions.push({ icon: Sparkles, text: `Dicas para manter meu ${vehicle.brand} ${vehicle.model} em perfeito estado`, color: "text-purple-500", gradient: "from-purple-500/20 to-violet-500/10" });
  return questions.slice(0, 4);
};

const ExpertChatView = ({ userVehicle, onBack, onHome }: ExpertChatViewProps) => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  
  // Custom hooks
  const { messages, isLoading, currentConversationId, selectedOBDCodes, setSelectedOBDCodes, streamChat, clearConversation, loadConversationMessages } = useExpertChat({ userVehicle });
  const { conversations, isLoadingHistory, loadConversations, deleteConversation, togglePinConversation, renameConversation, createNewConversation } = useConversationHistory();
  const { favoriteQuestions, popularQuestions, isLoadingPopular, loadFavorites, loadPopularQuestions, saveQuestionAsFavorite, removeFavorite } = useFavoriteQuestions();
  const { relatedTutorials, showTutorialSuggestions, searchRelatedTutorials, closeSuggestions } = useRelatedTutorials();
  
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
    searchRelatedTutorials(question);
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
    <motion.div key="expert-chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="min-h-[calc(100vh-8rem)] flex flex-col">
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

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-4xl">
        {user && <div className="mb-4"><OBDContextPanel onCodesSelected={setSelectedOBDCodes} selectedCodes={selectedOBDCodes} /></div>}
        
        {selectedOBDCodes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-center gap-2 flex-wrap">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Códigos selecionados:</span>
            {selectedOBDCodes.map(code => <Badge key={code.code} variant="secondary" className="text-xs font-mono">{code.code}</Badge>)}
          </motion.div>
        )}

        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6">
                <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <ExpertLogo size="lg" className="mx-auto mb-4" />
                    <h3 className="font-chakra font-bold text-lg mb-2">Olá! Sou seu Especialista Automotivo</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Posso ajudar com dúvidas sobre mecânica, manutenção, diagnóstico, <strong>analisar fotos</strong>, <strong>documentos</strong> e <strong>códigos OBD</strong>.</p>
                    
                    {favoriteQuestions.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 justify-center mb-3"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><p className="text-sm font-medium text-yellow-500">Suas perguntas favoritas:</p></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                          {favoriteQuestions.slice(0, 4).map((fav) => {
                            const IconComponent = ICON_MAP[fav.question_icon] || HelpCircle;
                            return (
                              <motion.div key={fav.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
                                <Card className={`cursor-pointer border-yellow-500/30 bg-gradient-to-br ${fav.question_gradient} hover:border-yellow-500/50 transition-all`} onClick={() => handleQuickQuestion(fav.question_text, fav.question_icon, fav.question_color, fav.question_gradient)}>
                                  <CardContent className="p-4 flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center shrink-0 ${fav.question_color}`}><IconComponent className="w-5 h-5" /></div>
                                    <span className="text-sm leading-relaxed pt-1">{fav.question_text}</span>
                                  </CardContent>
                                </Card>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id); }}><X className="w-3 h-3" /></Button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {contextualQuestions.length > 0 && userVehicle && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 justify-center mb-3"><Car className="w-4 h-4 text-primary" /><p className="text-sm font-medium">Perguntas sobre seu {userVehicle.brand}:</p></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                          {contextualQuestions.map((q, i) => (
                            <motion.div key={`ctx-${i}`} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="relative group">
                              <div className={`absolute -inset-0.5 bg-gradient-to-r ${q.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500`} />
                              <Card className={`relative cursor-pointer border-border/50 bg-gradient-to-br ${q.gradient} backdrop-blur-sm hover:border-primary/50 transition-all`} onClick={() => handleQuickQuestion(q.text, q.icon.name || "HelpCircle", q.color, q.gradient)}>
                                <CardContent className="p-4 flex items-start gap-3 relative z-10"><div className={`w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center shrink-0 ${q.color}`}><q.icon className="w-5 h-5" /></div><span className="text-sm leading-relaxed pt-1">{q.text}</span></CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm font-medium mb-4">Perguntas gerais:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {BASE_QUESTIONS.map((q, i) => (
                        <motion.div key={`base-${i}`} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="relative group">
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${q.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500`} />
                          <Card className="relative cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all" onClick={() => handleQuickQuestion(q.text, q.icon.name || "HelpCircle", q.color, q.gradient)}>
                            <CardContent className="p-4 flex items-start gap-3 relative z-10"><div className={`w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center shrink-0 ${q.color}`}><q.icon className="w-5 h-5" /></div><span className="text-sm leading-relaxed pt-1">{q.text}</span></CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              messages.map((msg, idx) => <ChatMessage key={idx} message={msg} index={idx} isTyping={isLoading && idx === messages.length - 1 && msg.role === "assistant"} />)
            )}
          </div>
        </ScrollArea>

        {/* Tutorial suggestions */}
        <AnimatePresence>
          {showTutorialSuggestions && relatedTutorials.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mb-3">
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Video className="w-4 h-4 text-primary" /><span className="text-sm font-medium text-primary">Tutoriais relacionados:</span></div>
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={closeSuggestions}><X className="w-3 h-3" /></Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {relatedTutorials.map((t) => (
                      <motion.a key={t.id} href={`/tutoriais/${t.slug}`} whileHover={{ scale: 1.02 }} className="block p-2 rounded-lg bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 transition-all group">
                        {t.thumbnail && <img src={t.thumbnail} alt="" className="w-full h-16 object-cover rounded mb-1" />}
                        <span className="text-xs line-clamp-2 group-hover:text-primary transition-colors">{t.title}</span>
                        {t.category && <Badge variant="outline" className="text-[10px] mt-1">{t.category}</Badge>}
                      </motion.a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachments Preview */}
        <AnimatePresence>
          {(selectedImage || selectedDocument) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
                {selectedImage && <div className="relative"><img src={selectedImage} alt="Preview" className="h-16 rounded-md border" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 w-5 h-5" onClick={() => setSelectedImage(null)}><X className="w-3 h-3" /></Button></div>}
                {selectedDocument && <div className="relative flex items-center gap-2 px-3 py-2 rounded-md bg-background border"><FileText className="w-5 h-5 text-primary" /><div className="min-w-0"><p className="text-sm font-medium truncate">{selectedDocument.name}</p><p className="text-xs text-muted-foreground">{(selectedDocument.size / 1024).toFixed(1)} KB</p></div><Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setSelectedDocument(null)}><X className="w-3 h-3" /></Button></div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <input ref={documentInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleDocumentSelect} className="hidden" />
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Enviar foto" className="hover:bg-primary/10 hover:border-primary/50"><ImageIcon className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => documentInputRef.current?.click()} disabled={isLoading} title="Enviar documento" className="hover:bg-primary/10 hover:border-primary/50"><Paperclip className="w-4 h-4" /></Button>
            </div>
            <Input placeholder="Digite sua pergunta..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())} disabled={isLoading} className="flex-1" />
            <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage && !selectedDocument)} className="px-4">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Orientações gerais. Para diagnósticos definitivos, consulte um mecânico.</p>
        </div>
      </div>

      {/* Sheets */}
      <ConversationHistorySheet isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} conversations={conversations} isLoading={isLoadingHistory} currentConversationId={currentConversationId} onLoadConversation={handleLoadConversation} onDeleteConversation={deleteConversation} onTogglePin={togglePinConversation} onRename={renameConversation} />
      <PopularQuestionsSheet isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} popularQuestions={popularQuestions} isLoading={isLoadingPopular} onSelectQuestion={(q) => { handleQuickQuestion(q.question_text, q.question_icon, q.question_color, q.question_gradient); setIsRankingOpen(false); }} />
    </motion.div>
  );
};

export default ExpertChatView;
