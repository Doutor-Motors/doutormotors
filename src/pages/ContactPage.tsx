import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, Mail, MapPin, Send, MessageCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import heroBg from "@/assets/images/hero-bg.jpg";
import textBarsLight from "@/assets/images/text-bars-light.png";
import textBarsDark from "@/assets/images/text-bars-dark.png";

// Cloudflare Turnstile Site Key
const TURNSTILE_SITE_KEY = "0x4AAAAAACNUOQK41DJ3NPJV";

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        language?: string;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const contactInfo = [
  {
    icon: Phone,
    title: "Telefone",
    value: "+55 11 99999-9999",
    link: "tel:+5511999999999",
  },
  {
    icon: Mail,
    title: "E-mail",
    value: "contato@doutormotors.com",
    link: "mailto:contato@doutormotors.com",
  },
  {
    icon: MapPin,
    title: "Localização",
    value: "São Paulo, SP - Brasil",
    link: null,
  },
  {
    icon: Clock,
    title: "Horário",
    value: "Seg - Sex: 9h às 18h",
    link: null,
  },
];

const supportTopics = [
  {
    title: "Problemas Técnicos",
    description: "Ajuda com diagnósticos, conexão OBD2 ou erros no sistema.",
  },
  {
    title: "Dúvidas sobre Planos",
    description: "Informações sobre preços, recursos e upgrades de conta.",
  },
  {
    title: "Parcerias",
    description: "Propostas comerciais e parcerias com oficinas mecânicas.",
  },
  {
    title: "Outros Assuntos",
    description: "Qualquer outra dúvida ou sugestão.",
  },
];

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const handleTurnstileCallback = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileError(false);
  }, []);

  const handleTurnstileExpired = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileError(true);
    setTurnstileToken(null);
  }, []);

  useEffect(() => {
    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: handleTurnstileCallback,
          'expired-callback': handleTurnstileExpired,
          'error-callback': handleTurnstileError,
          theme: 'auto',
          language: 'pt-br',
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      const existingScript = document.querySelector('script[src*="turnstile"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [handleTurnstileCallback, handleTurnstileExpired, handleTurnstileError]);

  const resetTurnstile = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      toast({
        title: "Verificação necessária",
        description: "Por favor, complete a verificação de segurança antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...formData,
          turnstileToken,
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        // Handle rate limit or validation errors
        if (data.error.includes('limite') || data.error.includes('bloqueado')) {
          toast({
            title: "Muitas tentativas",
            description: data.error,
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        resetTurnstile();
        return;
      }

      toast({
        title: "Mensagem enviada!",
        description: "Recebemos sua mensagem e você receberá uma confirmação por email.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      resetTurnstile();
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      
      let errorMessage = "Não foi possível enviar sua mensagem. Tente novamente.";
      if (error.message?.includes('rate') || error.message?.includes('limit')) {
        errorMessage = "Você atingiu o limite de mensagens. Tente novamente mais tarde.";
      } else if (error.message?.includes('captcha') || error.message?.includes('verification')) {
        errorMessage = "Falha na verificação de segurança. Atualize a página e tente novamente.";
      }
      
      toast({
        title: "Erro ao enviar",
        description: errorMessage,
        variant: "destructive",
      });
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative pt-40 pb-20 overflow-hidden text-center"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <p className="flex items-center justify-center gap-2 font-chakra text-sm uppercase text-primary-foreground mb-3 fade-in-up">
            <img src={textBarsLight} alt="" className="w-7 h-4" />
            Contato
          </p>
          
          <h1 className="font-chakra text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-primary-foreground leading-tight mb-4 fade-in-up">
            Fale Conosco
          </h1>
          
          <p className="text-white/90 text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto fade-in-up">
            Estamos aqui para ajudar. Entre em contato conosco e responderemos 
            o mais rápido possível.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-chakra text-lg font-semibold uppercase text-foreground mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a 
                    href={info.link}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-muted-foreground">{info.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Contact Form & Support Topics */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <div className="mb-8">
                <p className="flex items-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
                  <img src={textBarsDark} alt="" className="w-7 h-4" />
                  Envie sua Mensagem
                </p>
                <h2 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
                  Formulário de Contato
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="bg-card border-border"
                    />
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Seu e-mail"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      maxLength={255}
                      className="bg-card border-border"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="phone"
                      placeholder="Telefone (opcional)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={20}
                      className="bg-card border-border"
                    />
                  </div>
                  <div>
                    <Input
                      name="subject"
                      placeholder="Assunto"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      maxLength={200}
                      className="bg-card border-border"
                    />
                  </div>
                </div>

                <div>
                  <Textarea
                    name="message"
                    placeholder="Sua mensagem"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    maxLength={5000}
                    rows={5}
                    className="bg-card border-border resize-none"
                  />
                </div>

                {/* Turnstile CAPTCHA Widget */}
                <div className="flex flex-col items-start gap-2">
                  <div ref={turnstileRef} className="min-h-[65px]" />
                  {turnstileError && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Erro na verificação. Atualize a página.
                    </p>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting || !turnstileToken}
                  className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Mensagem</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Support Topics */}
            <div>
              <div className="mb-8">
                <p className="flex items-center gap-2 font-chakra text-sm uppercase text-primary mb-3">
                  <img src={textBarsDark} alt="" className="w-7 h-4" />
                  Como Podemos Ajudar
                </p>
                <h2 className="font-chakra text-2xl md:text-3xl font-bold uppercase text-foreground">
                  Tópicos de Suporte
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                {supportTopics.map((topic, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, subject: topic.title }));
                      document.querySelector('input[name="subject"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      toast({
                        title: "Tópico selecionado",
                        description: `"${topic.title}" foi adicionado ao assunto do formulário.`,
                      });
                    }}
                    className="bg-card p-5 rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group border-2 border-transparent hover:border-primary"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                        <MessageCircle className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-chakra text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {topic.description}
                        </p>
                        <span className="text-xs text-primary mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                          Clique para selecionar →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 relative"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-chakra text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-primary-foreground mb-4">
            Prefere Resolver Sozinho?
          </h2>
          
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Confira nossa seção de perguntas frequentes ou comece a usar o Doutor Motors agora mesmo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/como-funciona">
              <Button 
                size="lg"
                className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1 px-8"
              >
                <span>Ver FAQ</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button 
                size="lg"
                variant="outline"
                className="border-dm-blue-1 text-dm-blue-1 hover:bg-dm-blue-1 hover:text-white font-chakra uppercase rounded-pill px-8"
              >
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
