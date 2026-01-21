import { motion } from "framer-motion";
import { User, FileText, Loader2, Play, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ExpertLogo from "../ExpertLogo";
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isAssistant && (
        <div className="shrink-0">
          <ExpertLogo size="sm" />
        </div>
      )}
      
      <div className={`max-w-[85%] space-y-1.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* Speaker label */}
        <div className={`text-[10px] font-medium ${isUser ? "text-right text-muted-foreground" : "text-left text-primary"}`}>
          {isUser ? (
            <span className="flex items-center gap-1 justify-end uppercase tracking-wider">
              <User className="w-2.5 h-2.5" />
              Você
            </span>
          ) : (
            <span className="flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" />
              Especialista IA
            </span>
          )}
        </div>
        
        {/* Message Card */}
        <div className={`rounded-xl overflow-hidden ${
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border"
        }`}>
          <div className="p-3">
            {/* Image preview */}
            {message.imageBase64 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-2"
              >
                <img 
                  src={message.imageBase64} 
                  alt="Imagem enviada" 
                  className="max-w-[180px] rounded-lg border border-border"
                />
              </motion.div>
            )}
            
            {/* Document indicator */}
            {message.documentName && (
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-muted"
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">{message.documentName}</span>
              </motion.div>
            )}
            
            {/* Message content */}
            <div className="text-sm leading-relaxed">
              {message.content ? (
                isAssistant && isTyping ? (
                  <span>
                    {typedContent}
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-block w-0.5 h-3.5 bg-green-500 ml-0.5 align-middle rounded-full"
                    />
                  </span>
                ) : (
                  <span className="whitespace-pre-wrap">{message.content}</span>
                )
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-1.5"
          >
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2.5">
              <p className="text-[10px] font-semibold text-green-500 mb-2 flex items-center gap-1 uppercase tracking-wider">
                <Play className="w-2.5 h-2.5" />
                Tutoriais
              </p>
              <div className="space-y-1.5">
                {message.suggestedTutorials.map((tutorial, i) => (
                  <motion.a
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    href={tutorial.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-all text-[11px] group"
                  >
                    {tutorial.thumbnail && (
                      <img 
                        src={tutorial.thumbnail} 
                        alt="" 
                        className="w-10 h-7 object-cover rounded"
                      />
                    )}
                    <span className="flex-1 truncate text-muted-foreground group-hover:text-green-500 transition-colors font-medium">
                      {tutorial.name}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-muted-foreground group-hover:text-green-500 shrink-0" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
