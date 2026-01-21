import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Search, 
  Pin, 
  PinOff, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Car, 
  History,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Conversation } from "../hooks/useConversationHistory";

interface HistorySidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  currentConversationId: string | null;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onRename: (id: string, newTitle: string) => void;
  onNewConversation: () => void;
}

const HistorySidebar = ({
  conversations,
  isLoading,
  currentConversationId,
  onLoadConversation,
  onDeleteConversation,
  onTogglePin,
  onRename,
  onNewConversation,
}: HistorySidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === "" || conv.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPin = !showPinnedOnly || conv.is_pinned;
    return matchesSearch && matchesPin;
  });

  const pinnedConversations = filteredConversations.filter(c => c.is_pinned);
  const unpinnedConversations = filteredConversations.filter(c => !c.is_pinned);

  const handleStartEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveTitle = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      await onRename(convId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const ConversationItem = ({ conv, index }: { conv: Conversation; index: number }) => {
    const isActive = currentConversationId === conv.id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="group"
      >
        <div 
          className={`
            relative p-3 rounded-lg cursor-pointer transition-all duration-200
            ${isActive 
              ? "bg-primary/10 border border-primary/30" 
              : "bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border"
            }
          `}
          onClick={() => onLoadConversation(conv.id)}
        >
          {/* Pin indicator */}
          {conv.is_pinned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Pin className="w-2 h-2 text-primary-foreground" />
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            {/* Title row */}
            {editingId === conv.id ? (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <Input 
                  value={editingTitle} 
                  onChange={(e) => setEditingTitle(e.target.value)} 
                  className="h-7 text-xs bg-background" 
                  autoFocus 
                  onKeyDown={(e) => { 
                    if (e.key === "Enter") handleSaveTitle(conv.id, e as any); 
                    if (e.key === "Escape") setEditingId(null); 
                  }} 
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => handleSaveTitle(conv.id, e)}>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <p className={`font-medium text-sm line-clamp-2 ${isActive ? "text-primary" : "text-foreground"}`}>
                {conv.title}
              </p>
            )}

            {/* Preview */}
            {conv.last_message_preview && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {conv.last_message_preview}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(conv.updated_at), "dd/MM HH:mm", { locale: ptBR })}</span>
              </div>
              
              {conv.vehicle_context && (
                <Badge variant="outline" className="text-[10px] py-0.5 h-5 px-1.5 bg-background/50">
                  <Car className="w-2.5 h-2.5 mr-1" />
                  {conv.vehicle_context.brand}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions - appear on hover */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              title={conv.is_pinned ? "Desafixar" : "Fixar"}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(conv.id, conv.is_pinned || false);
              }}
            >
              {conv.is_pinned ? (
                <PinOff className="w-3 h-3" />
              ) : (
                <Pin className="w-3 h-3" />
              )}
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              title="Renomear"
              onClick={(e) => handleStartEditing(conv, e)}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="secondary"
                  size="icon" 
                  className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground" 
                  title="Excluir"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDeleteConversation(conv.id)} 
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 56 : 300 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full bg-card/95 backdrop-blur-sm border-r border-border flex flex-col shrink-0"
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold block">Histórico</span>
              <span className="text-[10px] text-muted-foreground">{conversations.length} conversas</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* New Conversation Button */}
            <div className="p-3 border-b border-border">
              <Button 
                onClick={onNewConversation}
                className="w-full h-9 text-sm gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Nova Conversa
              </Button>
            </div>

            {/* Search & Filters */}
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar conversas..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-8 h-8 text-xs bg-muted/50" 
                />
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant={!showPinnedOnly ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => setShowPinnedOnly(false)}
                >
                  Todas
                </Button>
                <Button
                  variant={showPinnedOnly ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs flex-1 gap-1"
                  onClick={() => setShowPinnedOnly(true)}
                >
                  <Pin className="w-3 h-3" />
                  Fixadas
                </Button>
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2 p-3 rounded-lg bg-muted/30">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Comece uma nova conversa acima
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Pinned Section */}
                    {pinnedConversations.length > 0 && !showPinnedOnly && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <Pin className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary uppercase tracking-wide">Fixadas</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="space-y-2">
                          {pinnedConversations.map((conv, idx) => (
                            <ConversationItem key={conv.id} conv={conv} index={idx} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Regular Conversations */}
                    {(showPinnedOnly ? pinnedConversations : unpinnedConversations).length > 0 && (
                      <div className="space-y-2">
                        {!showPinnedOnly && pinnedConversations.length > 0 && (
                          <div className="flex items-center gap-2 px-1 pt-2">
                            <MessageCircle className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recentes</span>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}
                        <div className="space-y-2">
                          {(showPinnedOnly ? pinnedConversations : unpinnedConversations).map((conv, idx) => (
                            <ConversationItem key={conv.id} conv={conv} index={idx + pinnedConversations.length} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State - Icons */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-2 p-2 pt-3">
          <Button
            variant="default"
            size="icon"
            className="w-10 h-10"
            onClick={onNewConversation}
            title="Nova Conversa"
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <div className="w-8 h-px bg-border my-1" />
          
          {pinnedConversations.slice(0, 4).map((conv) => (
            <Button
              key={conv.id}
              variant={currentConversationId === conv.id ? "secondary" : "ghost"}
              size="icon"
              className="w-10 h-10 relative"
              onClick={() => onLoadConversation(conv.id)}
              title={conv.title}
            >
              <MessageCircle className="w-4 h-4" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                <Pin className="w-1.5 h-1.5 text-primary-foreground" />
              </div>
            </Button>
          ))}
          
          {unpinnedConversations.slice(0, 3).map((conv) => (
            <Button
              key={conv.id}
              variant={currentConversationId === conv.id ? "secondary" : "ghost"}
              size="icon"
              className="w-10 h-10"
              onClick={() => onLoadConversation(conv.id)}
              title={conv.title}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          ))}
        </div>
      )}
    </motion.aside>
  );
};

export default HistorySidebar;
