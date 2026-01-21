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
  Car, 
  History,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

  const ConversationItem = ({ conv, index }: { conv: Conversation; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card 
        className={`cursor-pointer hover:bg-muted/50 transition-all group ${
          currentConversationId === conv.id ? "border-primary bg-primary/5" : ""
        }`} 
        onClick={() => onLoadConversation(conv.id)}
      >
        <CardContent className="p-2">
          <div className="flex items-start gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              conv.is_pinned ? "bg-primary/20" : "bg-muted"
            }`}>
              {conv.is_pinned ? (
                <Pin className="w-3 h-3 text-primary" />
              ) : (
                <MessageCircle className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {editingId === conv.id ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Input 
                    value={editingTitle} 
                    onChange={(e) => setEditingTitle(e.target.value)} 
                    className="h-6 text-xs" 
                    autoFocus 
                    onKeyDown={(e) => { 
                      if (e.key === "Enter") handleSaveTitle(conv.id, e as any); 
                      if (e.key === "Escape") setEditingId(null); 
                    }} 
                  />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleSaveTitle(conv.id, e)}>
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p className="font-medium text-xs truncate">{conv.title}</p>
              )}
              <p className="text-[10px] text-muted-foreground truncate">{conv.last_message_preview}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-muted-foreground">
                  {format(new Date(conv.updated_at), "dd/MM HH:mm", { locale: ptBR })}
                </span>
                {conv.vehicle_context && (
                  <Badge variant="outline" className="text-[9px] py-0 h-4 px-1">
                    <Car className="w-2 h-2 mr-0.5" />
                    {conv.vehicle_context.brand}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Actions - show on hover */}
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                title={conv.is_pinned ? "Desafixar" : "Fixar"}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(conv.id, conv.is_pinned || false);
                }}
              >
                {conv.is_pinned ? (
                  <PinOff className="w-2.5 h-2.5 text-primary" />
                ) : (
                  <Pin className="w-2.5 h-2.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                title="Renomear"
                onClick={(e) => handleStartEditing(conv, e)}
              >
                <Edit2 className="w-2.5 h-2.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 hover:text-destructive" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
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
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 48 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full bg-card border-r border-border flex flex-col shrink-0"
    >
      {/* Header */}
      <div className="p-2 border-b border-border flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 min-w-0">
            <History className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-semibold truncate">Histórico</span>
            <Badge variant="secondary" className="text-[9px] h-4 px-1">
              {conversations.length}
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 shrink-0"
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
            <div className="p-2 border-b border-border">
              <Button 
                onClick={onNewConversation}
                className="w-full h-8 text-xs gap-1.5"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Conversa
              </Button>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-7 h-7 text-xs" 
                />
              </div>
              <div className="flex gap-1 mt-2">
                <Button
                  variant={showPinnedOnly ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-[10px] flex-1"
                  onClick={() => setShowPinnedOnly(false)}
                >
                  Todas
                </Button>
                <Button
                  variant={showPinnedOnly ? "outline" : "default"}
                  size="sm"
                  className="h-6 text-[10px] flex-1 gap-1"
                  onClick={() => setShowPinnedOnly(true)}
                >
                  <Pin className="w-2.5 h-2.5" />
                  Fixadas
                </Button>
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1.5">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">
                      {searchQuery ? "Nenhuma encontrada" : "Sem conversas"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Pinned Section */}
                    {pinnedConversations.length > 0 && !showPinnedOnly && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-1.5 px-1">
                          <Pin className="w-2.5 h-2.5 text-primary" />
                          <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">Fixadas</span>
                        </div>
                        <div className="space-y-1">
                          {pinnedConversations.map((conv, idx) => (
                            <ConversationItem key={conv.id} conv={conv} index={idx} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Regular Conversations */}
                    {(showPinnedOnly ? pinnedConversations : unpinnedConversations).length > 0 && (
                      <div className="space-y-1">
                        {!showPinnedOnly && pinnedConversations.length > 0 && (
                          <div className="flex items-center gap-1 mb-1.5 px-1 pt-2 border-t border-border">
                            <MessageCircle className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Recentes</span>
                          </div>
                        )}
                        {(showPinnedOnly ? pinnedConversations : unpinnedConversations).map((conv, idx) => (
                          <ConversationItem key={conv.id} conv={conv} index={idx + pinnedConversations.length} />
                        ))}
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
        <div className="flex flex-col items-center gap-2 p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={onNewConversation}
            title="Nova Conversa"
          >
            <Plus className="w-4 h-4" />
          </Button>
          {pinnedConversations.slice(0, 3).map((conv) => (
            <Button
              key={conv.id}
              variant={currentConversationId === conv.id ? "secondary" : "ghost"}
              size="icon"
              className="w-8 h-8"
              onClick={() => onLoadConversation(conv.id)}
              title={conv.title}
            >
              <Pin className="w-3.5 h-3.5 text-primary" />
            </Button>
          ))}
        </div>
      )}
    </motion.aside>
  );
};

export default HistorySidebar;
