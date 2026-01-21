import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Home, 
  Plus, 
  History, 
  FileDown, 
  Loader2,
  MessageCircle,
  Sparkles,
  Car,
  TrendingUp,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "../hooks/useConversationHistory";

interface ChatHeaderProps {
  userVehicle: { brand: string; model: string; year: number } | null;
  currentConversation?: Conversation;
  conversationsCount: number;
  messagesCount: number;
  isExportingPDF: boolean;
  onBack: () => void;
  onHome: () => void;
  onNewConversation: () => void;
  onOpenHistory: () => void;
  onExportPDF: () => void;
  onOpenRanking: () => void;
}

const ChatHeader = ({
  userVehicle,
  currentConversation,
  conversationsCount,
  messagesCount,
  isExportingPDF,
  onBack,
  onHome,
  onNewConversation,
  onOpenHistory,
  onExportPDF,
  onOpenRanking,
}: ChatHeaderProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,12%)] via-[hsl(222,44%,14%)] to-[hsl(222,50%,11%)]" />
      
      {/* Glowing orb effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-5">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack} 
              className="text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onHome} 
              className="text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {messagesCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onExportPDF}
                disabled={isExportingPDF}
                className="gap-1.5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span className="hidden sm:inline text-xs">PDF</span>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenRanking}
              className="gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Ranking</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNewConversation}
              className="gap-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Nova</span>
            </Button>
            
            <Button 
              size="sm" 
              className="gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30" 
              onClick={onOpenHistory}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Histórico</span>
              {conversationsCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5 bg-white/20 text-white border-0">
                  {conversationsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4"
        >
          {/* Expert Icon */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-orange-600 flex items-center justify-center shadow-xl shadow-primary/30">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            {/* Online indicator */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[hsl(222,44%,14%)] flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </motion.div>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-chakra text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide">
                ESPECIALISTA AUTOMOTIVO
              </h1>
              <Badge className="bg-gradient-to-r from-primary to-orange-500 text-white border-0 text-[10px] font-bold shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                IA PRO
              </Badge>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xl">
              Converse, envie <span className="text-green-400 font-medium">fotos</span> e <span className="text-amber-400 font-medium">documentos</span>, analise <span className="text-primary font-medium">códigos OBD</span>
            </p>
            
            {/* Current conversation indicator */}
            {currentConversation && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-3"
              >
                <Badge variant="outline" className="text-xs border-white/20 bg-white/5 text-white/80 font-normal">
                  <MessageCircle className="w-3 h-3 mr-1.5 text-primary" />
                  {currentConversation.title}
                </Badge>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Vehicle badge */}
        {userVehicle && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500/20 to-green-500/5 border border-green-500/30 shadow-lg">
              <Car className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-green-300 font-chakra tracking-wide">
                {userVehicle.brand.toUpperCase()} {userVehicle.model.toUpperCase()} {userVehicle.year}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ChatHeader;
