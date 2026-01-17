import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, CheckCircle, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import logo from "@/assets/images/logo-new.png";
import heroBg from "@/assets/images/hero-bg.jpg";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { notifySuccess, notifyError, notifyWarning } = useNotifications();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasValidSession(!!session);
    };
    
    checkSession();

    // Listen for auth state changes (when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setHasValidSession(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      notifyWarning('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    if (password.length < 8) {
      notifyWarning('Senha muito curta', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      notifyError('Senhas não coincidem', 'As senhas digitadas são diferentes.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      notifySuccess('Senha alterada!', 'Sua senha foi redefinida com sucesso.');

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      
      let errorMessage = "Não foi possível redefinir sua senha. Tente novamente.";
      
      if (error.message.includes("same_password")) {
        errorMessage = "A nova senha deve ser diferente da anterior.";
      } else if (error.message.includes("weak_password")) {
        errorMessage = "A senha é muito fraca. Use letras, números e símbolos.";
      }
      
      notifyError('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (hasValidSession === null) {
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
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // No valid session
  if (!hasValidSession && !isSuccess) {
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
        {/* Botão Voltar Fixo */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 text-primary-foreground hover:bg-primary-foreground/10 gap-2 font-chakra uppercase text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>

        <div className="w-full max-w-md animate-fade-in">
          {/* Logo sem link de redirecionamento */}
          <div className="flex flex-col items-center mb-8 cursor-default">
            <img src={logo} alt="Doutor Motors" className="h-[130px] w-[200px] object-contain" />
            <span className="font-chakra text-primary-foreground text-sm font-bold tracking-wider -mt-[60px]">DOUTOR MOTORS</span>
          </div>

          <div className="bg-card rounded-lg shadow-2xl p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            
            <h1 className="font-chakra text-2xl font-bold uppercase text-foreground mb-2">
              Link Inválido
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              O link de redefinição de senha expirou ou é inválido. 
              Por favor, solicite um novo link.
            </p>

            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill transition-all hover:-translate-y-1">
                  Solicitar Novo Link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full font-chakra uppercase rounded-pill">
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Botão Voltar Fixo */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 text-primary-foreground hover:bg-primary-foreground/10 gap-2 font-chakra uppercase text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo sem link de redirecionamento */}
        <div className="flex flex-col items-center mb-8 cursor-default">
          <img src={logo} alt="Doutor Motors" className="h-[130px] w-[200px] object-contain" />
          <span className="font-chakra text-primary-foreground text-sm font-bold tracking-wider -mt-[60px]">DOUTOR MOTORS</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-lg shadow-2xl p-8 animate-scale-in">
          {isSuccess ? (
            // Success State
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-scale-in">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              
              <div>
                <h1 className="font-chakra text-2xl font-bold uppercase text-foreground mb-2">
                  Senha Alterada!
                </h1>
                <p className="text-muted-foreground text-sm">
                  Sua senha foi redefinida com sucesso. Você será redirecionado automaticamente.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-primary">
                <span className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm">Redirecionando...</span>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-chakra text-2xl font-bold uppercase text-foreground mb-2">
                  Nova Senha
                </h1>
                <p className="text-muted-foreground text-sm">
                  Crie uma nova senha segura para sua conta
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background border-border focus:border-primary transition-all"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1 animate-fade-in">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i < passwordStrength 
                                ? strengthColors[passwordStrength - 1] 
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        passwordStrength <= 2 ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        Força: {strengthLabels[passwordStrength - 1] || "Muito fraca"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 pr-10 bg-background border-border focus:border-primary transition-all ${
                        confirmPassword && password !== confirmPassword 
                          ? "border-destructive focus:border-destructive" 
                          : ""
                      }`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive animate-fade-in">
                      As senhas não coincidem
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-500 flex items-center gap-1 animate-fade-in">
                      <CheckCircle className="w-3 h-3" />
                      Senhas coincidem
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">A senha deve conter:</p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-500" : "text-muted-foreground"}`}>
                      <CheckCircle className={`w-3 h-3 ${password.length >= 8 ? "opacity-100" : "opacity-30"}`} />
                      Mínimo 8 caracteres
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                      <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(password) ? "opacity-100" : "opacity-30"}`} />
                      Uma letra maiúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                      <CheckCircle className={`w-3 h-3 ${/[0-9]/.test(password) ? "opacity-100" : "opacity-30"}`} />
                      Um número
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || password !== confirmPassword || password.length < 8}
                  className="w-full bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center justify-center gap-2 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>Redefinir Senha</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
