import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, ArrowLeft, Smartphone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/images/logo-new-car.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Sobre", path: "/sobre" },
    { name: "Serviços", path: "/servicos" },
    { name: "Como Funciona", path: "/como-funciona" },
    { name: "Contato", path: "/contato" },
    { name: "Baixar App", path: "/baixar-app", icon: Smartphone, highlight: true },
  ];

  const isLandingPage = location.pathname === "/";

  // Scroll detection - hide on scroll down, show only at top
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Só mostra o header quando estiver no topo (< 100px)
      // Esconde assim que começar a rolar para baixo
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setIsScrolled(currentScrollY > 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset visibility when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      setIsVisible(true);
    }
  }, [isMenuOpen]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled 
          ? "bg-secondary/90 backdrop-blur-xl shadow-2xl shadow-black/20 py-2" 
          : isLandingPage 
            ? "bg-gradient-to-b from-black/40 to-transparent py-4" 
            : "bg-secondary/95 backdrop-blur-md py-4"
      }`}
    >
      {/* Borda inferior animada */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-300 ${isScrolled ? "opacity-100" : "opacity-0"}`} />
      
      <div className="container mx-auto px-4 md:px-10 flex items-center gap-2 sm:gap-4 lg:gap-8">
        {/* Logo - Com animação de scroll - Responsiva */}
        <Link 
          to="/" 
          className={`flex flex-col items-start shrink-0 transition-all duration-500 group ${
            isScrolled 
              ? "scale-[0.6] md:scale-[0.7] origin-left -my-3 md:-my-2" 
              : "scale-[0.7] md:scale-[0.85] lg:scale-100"
          }`}
        >
          <img 
            src={logo} 
            alt="Doutor Motors" 
            className="h-[100px] w-auto object-contain -ml-1 transition-all duration-300 group-hover:brightness-110" 
          />
          <span 
            className={`font-chakra text-primary-foreground font-bold tracking-wider transition-all duration-300 ${
              isScrolled 
                ? "text-sm md:text-base -mt-[22px] ml-0.5" 
                : "text-sm md:text-base lg:text-lg -mt-[22px] md:-mt-[26px] lg:-mt-[29px] ml-0.5 md:ml-1"
            }`}
          >
            DOUTOR MOTORS
          </span>
        </Link>

        {/* Botão Voltar - aparece em todas as páginas exceto landing */}
        {!isLandingPage && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-1 sm:gap-2 font-chakra uppercase text-[10px] sm:text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300 px-2 sm:px-3"
            size="sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center">
          <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/10">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              const isHighlight = (link as any).highlight;
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative font-chakra text-xs uppercase px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : isHighlight
                        ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-primary-foreground border border-purple-500/30 hover:from-purple-600/50 hover:to-pink-600/50"
                        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login">
            <Button 
              variant="ghost" 
              size="sm"
              className="font-chakra uppercase text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300"
            >
              Entrar
            </Button>
          </Link>
          <Link to="/signup">
            <Button 
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground font-chakra uppercase text-xs rounded-full flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 border border-primary-foreground/20"
            >
              <span>Começar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
            isMenuOpen 
              ? "bg-primary text-primary-foreground" 
              : "bg-white/10 text-primary-foreground hover:bg-white/20"
          }`}
          aria-label="Toggle menu"
        >
          <span className={`absolute transition-all duration-300 ${isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}>
            <Menu className="w-5 h-5" />
          </span>
          <span className={`absolute transition-all duration-300 ${isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}>
            <X className="w-5 h-5" />
          </span>
        </button>

        {/* Mobile Navigation - Fullscreen Overlay */}
        <div 
          className={`lg:hidden fixed inset-0 bg-gradient-to-b from-secondary via-secondary to-dm-blue-3 z-40 transition-all duration-500 ${
            isMenuOpen 
              ? "opacity-100 pointer-events-auto" 
              : "opacity-0 pointer-events-none"
          }`}
          style={{ top: "0" }}
        >
          {/* Close area at top */}
          <div className="h-20" onClick={() => setIsMenuOpen(false)} />
          
          <nav className="flex flex-col px-6 py-8 h-[calc(100%-5rem)] overflow-auto">
            {/* Nav Links */}
            <div className="space-y-2">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                const isHighlight = (link as any).highlight;
                
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl font-chakra text-lg uppercase transition-all duration-300 ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : isHighlight
                          ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-primary-foreground border border-purple-500/30"
                          : "text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
                    }`}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transform: isMenuOpen ? "translateX(0)" : "translateX(-20px)",
                      opacity: isMenuOpen ? 1 : 0,
                      transition: `all 0.3s ease-out ${index * 50}ms`
                    }}
                  >
                    <span className="flex items-center gap-3">
                      {link.icon && <link.icon className="w-5 h-5" />}
                      {link.name}
                    </span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? "translate-x-1" : ""}`} />
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Auth Buttons */}
            <div className="flex flex-col gap-3 mt-auto">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-chakra uppercase rounded-2xl h-14 text-base transition-all duration-300"
                >
                  Entrar
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-chakra uppercase rounded-2xl h-14 text-base shadow-lg shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Footer info */}
            <p className="text-center text-primary-foreground/40 text-xs mt-6 font-chakra">
              DOUTOR MOTORS © 2025
            </p>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
