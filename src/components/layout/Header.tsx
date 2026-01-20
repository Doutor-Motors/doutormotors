import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, ArrowLeft, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/images/logo-new-car.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Scroll detection for header animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-40 px-4 md:px-10 transition-all duration-300 ${
        isScrolled 
          ? "bg-secondary/95 backdrop-blur-md shadow-lg py-2" 
          : isLandingPage 
            ? "bg-transparent py-4" 
            : "bg-secondary py-4"
      }`}
    >
      <div className="container mx-auto flex items-center gap-6 lg:gap-12">
        {/* Logo - Com animação de scroll */}
        <Link 
          to="/" 
          className={`flex flex-col items-start shrink-0 transition-all duration-300 ${
            isScrolled ? "scale-75 origin-left" : "scale-100"
          }`}
        >
          <img 
            src={logo} 
            alt="Doutor Motors" 
            className="h-[100px] w-auto object-contain -ml-1 transition-all duration-300" 
          />
          <span 
            className={`font-chakra text-primary-foreground font-bold tracking-wider transition-all duration-300 ${
              isScrolled ? "text-base -mt-[22px] ml-0.5" : "text-lg -mt-[29px] ml-1"
            }`}
          >
            DOUTOR MOTORS
          </span>
        </Link>

        {/* Botão Voltar - aparece em todas as páginas exceto landing */}
        {!isLandingPage && (
          <Button
            variant="ghost-light"
            onClick={handleBack}
            className="gap-2 font-chakra uppercase text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-chakra text-sm uppercase text-primary-foreground hover:text-primary transition-colors flex items-center gap-1.5 ${
                link.icon ? "text-primary" : ""
              } ${
                (link as any).highlight ? "bg-purple-600/20 px-3 py-1.5 rounded-full border border-purple-500/30 hover:bg-purple-600/30" : ""
              }`}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost-light" className="font-chakra uppercase">
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
                  className={`font-chakra text-base uppercase text-primary-foreground py-3 px-4 hover:bg-primary-foreground hover:text-primary transition-colors flex items-center gap-2 ${
                    link.icon ? "text-primary" : ""
                  } ${
                    (link as any).highlight ? "bg-purple-600/20 border-l-4 border-purple-500" : ""
                  }`}
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
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
  );
};

export default Header;
