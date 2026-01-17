import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/images/logo-new-car.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Sobre", path: "/sobre" },
    { name: "Serviços", path: "/servicos" },
    { name: "Como Funciona", path: "/como-funciona" },
    { name: "Contato", path: "/contato" },
  ];

  const isLandingPage = location.pathname === "/";
  
  // Páginas onde a logo e nome devem ser menores
  const compactLogoPages = ["/sobre", "/servicos", "/como-funciona", "/contato", "/termos", "/privacidade"];
  const isCompactLogo = compactLogoPages.includes(location.pathname);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {/* Logo e nome fixos - fora do header */}
      <div className={`absolute left-8 md:left-16 flex flex-col items-start cursor-default z-50 ${isCompactLogo ? "top-[-80px]" : "top-[-120px]"}`}>
        <img 
          src={logo} 
          alt="Doutor Motors" 
          className={`object-contain ${isCompactLogo ? "h-[250px] w-[250px] -ml-[45px]" : "h-[350px] w-[350px] -ml-[60px]"}`} 
        />
        <span className={`font-chakra text-primary-foreground font-bold tracking-wider ${isCompactLogo ? "text-xl md:text-2xl -mt-[100px] -ml-[38px]" : "text-2xl md:text-3xl -mt-[140px] -ml-[48px]"}`}>
          DOUTOR MOTORS
        </span>
      </div>

      <header className={`absolute top-0 left-0 w-full z-40 px-4 md:px-10 ${isLandingPage ? "" : "bg-secondary"}`}>
        <div className="container mx-auto flex justify-end items-center gap-6 lg:gap-12 py-6">
          {/* Botão Voltar - aparece em todas as páginas exceto landing */}
          {!isLandingPage && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-primary-foreground hover:bg-primary-foreground/10 gap-2 font-chakra uppercase text-sm mr-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}

          {/* Espaçador para a logo fixa */}
          <div className="hidden lg:block w-[300px]" />

          {/* Linha divisória sutil - apenas desktop */}
          <div className="hidden lg:block h-16 w-px bg-primary-foreground/20" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="font-chakra text-sm uppercase text-primary-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-primary-foreground hover:text-primary hover:bg-primary-foreground font-chakra uppercase">
              Entrar
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase rounded-pill flex items-center gap-2 border border-transparent hover:border-primary-foreground transition-all hover:-translate-y-1">
              <span>Começar Agora</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-primary-foreground z-50"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-20 bg-primary z-40 animate-slide-in">
            <nav className="flex flex-col p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-chakra text-base uppercase text-primary-foreground py-3 px-4 hover:bg-primary-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-6 px-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-chakra uppercase">
                    Entrar
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-dm-blue-3 text-primary-foreground font-chakra uppercase">
                    Começar Agora
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
        </div>
      </header>
    </>
  );
};

export default Header;
