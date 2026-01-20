import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  Home, 
  Sparkles, 
  Car,
  Wrench,
  AlertTriangle,
  HelpCircle,
  Loader2,
  User,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExpertChatViewProps {
  userVehicle: { brand: string; model: string; year: number } | null;
  onBack: () => void;
  onHome: () => void;
}

const QUICK_QUESTIONS = [
  { icon: AlertTriangle, text: "Meu carro está fazendo um barulho estranho", color: "text-amber-500" },
  { icon: Wrench, text: "Qual manutenção devo fazer agora?", color: "text-primary" },
  { icon: Car, text: "Essa peça é compatível com meu carro?", color: "text-green-500" },
  { icon: HelpCircle, text: "Como esse sistema funciona?", color: "text-blue-500" },
];

const ExpertChatView = ({ userVehicle, onBack, onHome }: ExpertChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const streamChat = useCallback(async (userMessage: string) => {
    const userMsg: Message = { role: "user", content: userMessage };
    const allMessages = [...messages, userMsg];
    
    setMessages(allMessages);
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/automotive-expert-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: allMessages.map(m => ({ role: m.role, content: m.content })),
            vehicleContext: userVehicle,
          }),
        }
      );

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao conectar com o especialista");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message to start
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev.filter(m => !(m.role === "assistant" && m.content === "")),
        { 
          role: "assistant", 
          content: `❌ ${error instanceof Error ? error.message : "Erro ao processar sua pergunta. Tente novamente."}` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userVehicle]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    streamChat(trimmed);
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    setInput("");
    streamChat(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      key="expert-chat"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onHome}>
              <Home className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="font-chakra text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                Especialista Automotivo
                <Badge variant="secondary" className="text-xs">IA</Badge>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Converse com um especialista para tirar dúvidas sobre mecânica, manutenção e seu veículo.
              </p>
            </div>
          </div>

          {userVehicle && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Seu veículo:</span>
              <Badge variant="outline">
                {userVehicle.brand} {userVehicle.model} {userVehicle.year}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-4xl">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8"
              >
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="font-chakra font-bold text-lg mb-2">
                      Olá! Sou seu Especialista Automotivo
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Posso ajudar com dúvidas sobre mecânica, manutenção preventiva, 
                      diagnóstico de problemas e orientações gerais sobre seu veículo.
                    </p>
                    
                    <p className="text-sm font-medium mb-4">Perguntas rápidas:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                      {QUICK_QUESTIONS.map((q, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                          onClick={() => handleQuickQuestion(q.text)}
                          disabled={isLoading}
                        >
                          <q.icon className={`w-4 h-4 mr-2 shrink-0 ${q.color}`} />
                          <span className="text-xs">{q.text}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <Card className={`max-w-[85%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                    <CardContent className="p-3">
                      <div className={`text-sm whitespace-pre-wrap ${msg.role === "assistant" ? "prose prose-sm dark:prose-invert max-w-none" : ""}`}>
                        {msg.content || (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Pensando...
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="pt-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Este assistente oferece orientações gerais. Para diagnósticos definitivos, consulte um mecânico.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertChatView;
