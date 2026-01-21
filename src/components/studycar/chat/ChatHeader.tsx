import { motion } from "framer-motion";
import { 
  Plus, 
  FileDown, 
  Loader2,
  MessageCircle,
  Car,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ExpertLogo from "../ExpertLogo";
import type { Conversation } from "../hooks/useConversationHistory";

interface ChatHeaderProps {
  userVehicle: { brand: string; model: string; year: number } | null;
  currentConversation?: Conversation;
  conversationsCount: number;
  messagesCount: number;
  isExportingPDF: boolean;
  onNewConversation: () => void;
  onExportPDF: () => void;
  onOpenRanking: () => void;
}

const ChatHeader = ({
  userVehicle,
  currentConversation,
  conversationsCount,
  messagesCount,
  isExportingPDF,
  onNewConversation,
  onExportPDF,
  onOpenRanking,
}: ChatHeaderProps) => {
  return (
    <header className="relative bg-gradient-to-b from-background to-background/95 border-b border-border/50 backdrop-blur-sm">
      <div className="container mx-auto px-3 py-3">
        {/* Compact Navigation */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-2 min-w-0">

            <div className="flex items-center gap-2 min-w-0">
              <ExpertLogo size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-chakra text-sm font-bold text-foreground truncate">
                    Especialista IA
                  </h1>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-primary/30">
                    PRO
                  </Badge>
                </div>
                {currentConversation && (
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                    <MessageCircle className="w-2.5 h-2.5" />
                    {currentConversation.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {messagesCount > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onExportPDF}
                disabled={isExportingPDF}
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onOpenRanking}
              className="w-8 h-8 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onNewConversation}
              className="w-8 h-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
            
          </div>
        </div>

        {/* Vehicle badge - compact inline */}
        {userVehicle && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            <Badge variant="outline" className="text-[10px] border-green-500/30 bg-green-500/10 text-green-400">
              <Car className="w-3 h-3 mr-1" />
              {userVehicle.brand} {userVehicle.model} {userVehicle.year}
            </Badge>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
