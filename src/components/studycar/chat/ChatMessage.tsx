import { motion } from "framer-motion";
import { User, FileText, Loader2, Play, ExternalLink, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Message } from "../hooks/useExpertChat";
import { useTypewriterText } from "./useTypewriterText";

interface ChatMessageProps {
  message: Message;
  index: number;
  isTyping?: boolean;
}

const ChatMessage = ({ message, index, isTyping }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const typedContent = useTypewriterText(message.content ?? "", {
    enabled: Boolean(isAssistant && isTyping),
    tickMs: 16,
    maxDurationMs: 4500,
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isAssistant && (
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[hsl(222,44%,14%)]" />
        </div>
      )}
      
      <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Speaker label */}
        <div className={`text-[11px] font-medium mb-1.5 ${isUser ? "text-right text-white/50" : "text-left text-primary/80"}`}>
          {isUser ? (
            <span className="flex items-center gap-1.5 justify-end uppercase tracking-wider">
              <User className="w-3 h-3" />
              Você
            </span>
          ) : (
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Especialista IA
            </span>
          )}
        </div>
        
        {/* Message Card */}
        <div className={`relative rounded-2xl overflow-hidden ${
          isUser 
            ? "bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/20" 
            : "bg-gradient-to-br from-[hsl(222,44%,18%)] to-[hsl(222,44%,14%)] text-white border border-white/10 shadow-xl"
        }`}>
          {/* Tech pattern for assistant */}
          {isAssistant && (
            <div className="absolute inset-0 opacity-5">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(45deg, transparent 30%, hsl(var(--primary)/0.1) 50%, transparent 70%)`,
                  backgroundSize: "20px 20px"
                }}
              />
            </div>
          )}
          
          <div className="p-4 relative z-10">
            {/* Image preview */}
            {message.imageBase64 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-3"
              >
                <img 
                  src={message.imageBase64} 
                  alt="Imagem enviada" 
                  className="max-w-[220px] rounded-xl border-2 border-white/10 shadow-lg"
                />
              </motion.div>
            )}
            
            {/* Document indicator */}
            {message.documentName && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-white/10 backdrop-blur-sm"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">{message.documentName}</span>
              </motion.div>
            )}
            
            {/* Message content */}
            <div className={`text-sm leading-relaxed ${
              isAssistant ? "text-white/90" : "text-white"
            }`}>
              {message.content ? (
                isAssistant && isTyping ? (
                  <span>
                    {typedContent}
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-block w-0.5 h-4 bg-green-400 ml-1 align-middle rounded-full"
                    />
                  </span>
                ) : (
                  <span className="whitespace-pre-wrap">{message.content}</span>
                )
              ) : (
                <span className="flex items-center gap-2 text-white/60">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Analisando</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tutorial Suggestions */}
        {message.suggestedTutorials && message.suggestedTutorials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2"
          >
            <div className="rounded-xl bg-gradient-to-br from-green-500/15 to-green-500/5 border border-green-500/20 p-3">
              <p className="text-xs font-bold text-green-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Play className="w-3 h-3" />
                Tutoriais Relacionados
              </p>
              <div className="space-y-2">
                {message.suggestedTutorials.map((tutorial, i) => (
                  <motion.a
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    href={tutorial.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all text-xs group"
                  >
                    {tutorial.thumbnail && (
                      <img 
                        src={tutorial.thumbnail} 
                        alt="" 
                        className="w-14 h-10 object-cover rounded-lg shadow-md border border-white/10"
                      />
                    )}
                    <span className="flex-1 truncate text-white/80 group-hover:text-green-300 transition-colors font-medium">
                      {tutorial.name}
                    </span>
                    <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-green-400 shrink-0" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {isUser && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(222,44%,22%)] to-[hsl(222,44%,18%)] flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
          <User className="w-5 h-5 text-white/70" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
