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
  TrendingUp
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
    <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-4 sm:py-6 border-b border-border/50 relative overflow-hidden">
      {/* Tech pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
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
            {messagesCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onExportPDF}
                disabled={isExportingPDF}
                className="gap-1.5 border-primary/30 hover:bg-primary/10"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">PDF</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOpenRanking}
              className="gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-500"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onNewConversation}
              className="gap-1.5 border-green-500/30 hover:bg-green-500/10 text-green-500"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova</span>
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1.5" 
              onClick={onOpenHistory}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
              {conversationsCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs bg-background/20">
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
          className="flex items-center gap-4"
        >
          <div className="relative">
            <ExpertLogo size="lg" />
            {/* Pulse animation */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 rounded-full bg-primary/20"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-chakra text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Especialista Automotivo
              </h1>
              <Badge className="bg-gradient-to-r from-primary/30 to-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                IA
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Converse, envie fotos e documentos, analise códigos OBD
            </p>
            
            {/* Current conversation indicator */}
            {currentConversation && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mt-2"
              >
                <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5">
                  <MessageCircle className="w-3 h-3 mr-1" />
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
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 shadow-lg shadow-primary/10"
          >
            <Car className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {userVehicle.brand} {userVehicle.model} {userVehicle.year}
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ChatHeader;
