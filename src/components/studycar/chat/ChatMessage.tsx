import { motion } from "framer-motion";
import { Bot, User, FileText, Loader2, Play, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Message, Tutorial } from "../hooks/useExpertChat";

interface ChatMessageProps {
  message: Message;
  index: number;
  isTyping?: boolean;
}

const ChatMessage = ({ message, index, isTyping }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isAssistant && (
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/10">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          {/* Status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        </div>
      )}
      
      <div className="max-w-[85%] space-y-2">
        {/* Speaker label */}
        <div className={`text-xs text-muted-foreground mb-1 ${isUser ? "text-right" : "text-left"}`}>
          {isUser ? (
            <span className="flex items-center gap-1 justify-end">
              <User className="w-3 h-3" />
              Você
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              Especialista Automotivo
            </span>
          )}
        </div>
        
        <Card className={`relative overflow-hidden ${
          isUser 
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/50" 
            : "bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-lg"
        }`}>
          {/* Tech pattern overlay for assistant */}
          {isAssistant && (
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,hsl(var(--background))_100%)]" />
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>
          )}
          
          <CardContent className="p-4 relative z-10">
            {/* Image preview */}
            {message.imageBase64 && (
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={message.imageBase64} 
                alt="Imagem enviada" 
                className="max-w-[200px] rounded-lg mb-3 border border-white/10"
              />
            )}
            
            {/* Document indicator */}
            {message.documentName && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-background/20 backdrop-blur-sm"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{message.documentName}</span>
              </motion.div>
            )}
            
            {/* Message content with typing animation for assistant */}
            <div className={`text-sm whitespace-pre-wrap leading-relaxed ${
              isAssistant ? "prose prose-sm dark:prose-invert max-w-none" : ""
            }`}>
              {message.content ? (
                isAssistant && isTyping ? (
                  <span>
                    {message.content}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      className="inline-block w-2 h-4 bg-primary ml-0.5 align-middle"
                    />
                  </span>
                ) : (
                  message.content
                )
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
          </CardContent>
        </Card>

        {/* Tutorial Suggestions */}
        {message.suggestedTutorials && message.suggestedTutorials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  Tutoriais Relacionados:
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
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-all text-xs group"
                    >
                      {tutorial.thumbnail && (
                        <img 
                          src={tutorial.thumbnail} 
                          alt="" 
                          className="w-14 h-10 object-cover rounded-md shadow-sm"
                        />
                      )}
                      <span className="flex-1 truncate group-hover:text-primary transition-colors font-medium">
                        {tutorial.name}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0" />
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center shrink-0 border border-border shadow-lg">
          <User className="w-5 h-5 text-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
