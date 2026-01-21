import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Search, Pin, PinOff, Edit2, Trash2, Check, Car, History } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Conversation } from "../hooks/useConversationHistory";

interface ConversationHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  isLoading: boolean;
  currentConversationId: string | null;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onRename: (id: string, newTitle: string) => void;
}

const ConversationHistorySheet = ({ isOpen, onClose, conversations, isLoading, currentConversationId, onLoadConversation, onDeleteConversation, onTogglePin, onRename }: ConversationHistorySheetProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyTab, setHistoryTab] = useState<"all" | "pinned">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === "" || conv.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = historyTab === "all" || (historyTab === "pinned" && conv.is_pinned);
    return matchesSearch && matchesTab;
  });

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

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        // Only close when Radix requests closing (overlay click / ESC).
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" />Minhas Conversas</SheetTitle>
          <div className="relative mt-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar conversas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
          <Tabs value={historyTab} onValueChange={(v) => setHistoryTab(v as "all" | "pinned")} className="mt-3">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="all" className="gap-1.5"><MessageCircle className="w-4 h-4" />Todas</TabsTrigger><TabsTrigger value="pinned" className="gap-1.5"><Pin className="w-4 h-4" />Fixadas</TabsTrigger></TabsList>
          </Tabs>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12"><MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" /><p className="text-muted-foreground">{searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}</p></div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <motion.div key={conv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className={`cursor-pointer hover:bg-muted/50 transition-all group ${currentConversationId === conv.id ? "border-primary ring-1 ring-primary/30" : ""} ${conv.is_pinned ? "bg-primary/5" : ""}`} onClick={() => onLoadConversation(conv.id)}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${conv.is_pinned ? "bg-primary/20" : "bg-muted"}`}>{conv.is_pinned ? <Pin className="w-4 h-4 text-primary" /> : <MessageCircle className="w-4 h-4 text-muted-foreground" />}</div>
                          <div className="flex-1 min-w-0">
                            {editingId === conv.id ? (
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <Input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="h-7 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(conv.id, e as any); if (e.key === "Escape") setEditingId(null); }} />
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleSaveTitle(conv.id, e)}><Check className="w-3 h-3" /></Button>
                              </div>
                            ) : (
                              <p className="font-medium text-sm truncate">{conv.title}</p>
                            )}
                            {conv.last_message_preview && <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message_preview}</p>}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-muted-foreground">{format(new Date(conv.updated_at), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                              {conv.vehicle_context && <Badge variant="outline" className="text-xs py-0 h-5"><Car className="w-3 h-3 mr-1" />{conv.vehicle_context.brand}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={conv.is_pinned ? "Desafixar" : "Fixar"}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(conv.id, conv.is_pinned || false);
                              }}
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
                              title="Renomear"
                              onClick={(e) => handleStartEditing(conv, e)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader><AlertDialogTitle>Excluir conversa?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteConversation(conv.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationHistorySheet;
