import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_DISMISSED_KEY = "pwa-install-banner-dismissed";

const InstallBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if banner was already dismissed
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    
    // Check if app is already installed (PWA standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Show banner only on first visit and if not installed
    if (!dismissed && !isStandalone) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 transition-all duration-300 ${
        isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="bg-gradient-to-r from-dm-blue-1 to-dm-blue-2 rounded-2xl p-4 shadow-2xl border border-primary/30">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="bg-primary/20 p-3 rounded-xl flex-shrink-0">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1 pr-4">
            <h3 className="font-chakra text-primary-foreground font-bold text-lg mb-1">
              Instale o App!
            </h3>
            <p className="text-white/80 text-sm mb-3">
              Acesse o Doutor Motors direto da sua tela inicial, como um app nativo!
            </p>
            
            <div className="flex items-center gap-2">
              <Link to="/instalar" onClick={handleDismiss}>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase text-xs gap-2"
                >
                  <Download className="w-4 h-4" />
                  Como Instalar
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="ghost-light"
                onClick={handleDismiss}
                className="text-xs"
              >
                Agora não
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
