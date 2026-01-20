import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import logo from "@/assets/images/logo-new-car.png";
import heroBg from "@/assets/images/hero-bg.jpg";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();
  const { notifySuccess, notifyError, notifyWarning } = useNotifications();

  // Se usuário já está logado, redireciona para upgrade/checkout
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard/upgrade");
    }
  }, [user, loading, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      notifyWarning('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      notifyError('Senhas não coincidem', 'As senhas digitadas são diferentes.');
      return;
    }

    if (password.length < 6) {
      notifyWarning('Senha muito curta', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notifyError('Email inválido', 'Digite um email válido.');
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, name);

    setIsLoading(false);

    if (error) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado.";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Digite um email válido.";
      }

      notifyError('Erro ao criar conta', errorMessage);
      return;
    }

    // IMPORTANTE: Após criar conta, redireciona para seleção de plano
    // O usuário pode escolher Basic (grátis) ou Pro (pago)
    notifySuccess(
      'Conta criada com sucesso!', 
      'Agora escolha o plano que melhor atende suas necessidades.'
    );
    
    // Redireciona para página de seleção de plano
    navigate("/select-plan", { 
      state: { 
        fromSignup: true,
        email: email,
        name: name
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ 
        backgroundImage: `url(${heroBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Botão Voltar Fixo */}
      <Button
        variant="ghost-light"
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 gap-2 font-chakra uppercase text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>

      <div className="w-full max-w-md">
        {/* Logo sem link de redirecionamento */}
        <div className="flex flex-col items-center mb-8 cursor-default">
          <img src={logo} alt="Doutor Motors" className="h-[100px] w-auto object-contain" />
          <span className="font-chakra text-primary-foreground text-lg font-bold tracking-wider -mt-[29px]">DOUTOR MOTORS</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-lg shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="font-chakra text-2xl font-bold uppercase text-foreground mb-2">
              Criar Conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Comece a diagnosticar seu veículo
            </p>
          </div>

          {/* Aviso sobre pagamento */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-6">
            <p className="text-sm text-center text-foreground">
              <strong>Passo 1 de 2:</strong> Crie sua conta e depois finalize o pagamento para acessar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-background border-border focus:border-primary"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  className="pl-10 bg-background border-border focus:border-primary"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background border-border focus:border-primary"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-background border-border focus:border-primary"
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
                <span>Criando conta...</span>
              ) : (
                <>
                  <span>Criar Conta e Continuar</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
