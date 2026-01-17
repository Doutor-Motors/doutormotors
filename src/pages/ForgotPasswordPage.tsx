import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/images/logo.png";
import heroBg from "@/assets/images/hero-bg.jpg";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Preencha o campo de email.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Erro",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `url(${heroBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-8 hover-scale">
          <img src={logo} alt="Doutor Motors" className="w-32" />
        </Link>

        {/* Card */}
        <div className="bg-card rounded-lg shadow-2xl p-8 animate-scale-in">
          {emailSent ? (
            // Success State
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-scale-in">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              
              <div>
                <h1 className="font-chakra text-2xl font-bold uppercase text-foreground mb-2">
                  Email Enviado!
                </h1>
                <p className="text-muted-foreground text-sm">
                  Enviamos um link de recuperação para:
                </p>
                <p className="text-primary font-medium mt-1">{email}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Próximos passos:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Verifique sua caixa de entrada</li>
                  <li>Clique no link do email</li>
                  <li>Crie uma nova senha</li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                Não recebeu o email? Verifique sua pasta de spam ou{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  tente novamente
                </button>
              </p>

              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full font-chakra uppercase rounded-pill flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Voltar para Login</span>
                </Button>
              </Link>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-chakra text-2xl font-bold uppercase text-foreground mb-2">
                  Esqueceu sua senha?
                </h1>
                <p className="text-muted-foreground text-sm">
                  Não se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Link</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  to="/login" 
                  className="text-muted-foreground text-sm hover:text-primary inline-flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-dm-cadet hover:text-primary-foreground text-sm transition-colors">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
