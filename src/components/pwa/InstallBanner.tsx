import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Download, Smartphone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { motion, AnimatePresence } from "framer-motion";

const BANNER_DISMISSED_KEY = "pwa-install-banner-dismissed";

const InstallBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  useEffect(() => {
    // Check if banner was already dismissed
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    
    // Don't show if already installed
    if (isInstalled) {
      setIsVisible(false);
      return;
    }
    
    // Show banner only on first visit
    if (!dismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    }, 300);
  };

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await promptInstall();
      if (installed) {
        setJustInstalled(true);
        setTimeout(() => {
          handleDismiss();
        }, 2000);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
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
              {justInstalled ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <Smartphone className="w-8 h-8 text-primary" />
              )}
            </div>
            
            <div className="flex-1 pr-4">
              {justInstalled ? (
                <>
                  <h3 className="font-chakra text-green-400 font-bold text-lg mb-1">
                    App Instalado! 🎉
                  </h3>
                  <p className="text-white/80 text-sm">
                    O Doutor Motors foi adicionado à sua tela inicial!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-chakra text-primary-foreground font-bold text-lg mb-1">
                    Instale o App!
                  </h3>
                  <p className="text-white/80 text-sm mb-3">
                    Acesse o Doutor Motors direto da sua tela inicial, como um app nativo!
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Native install prompt (Chrome, Edge, etc) */}
                    {isInstallable && (
                      <Button 
                        size="sm" 
                        onClick={handleNativeInstall}
                        disabled={isInstalling}
                        className="bg-green-500 hover:bg-green-600 text-white font-chakra uppercase text-xs gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {isInstalling ? 'Instalando...' : 'Instalar Agora'}
                      </Button>
                    )}
                    
                    {/* Manual instructions link (for iOS or when native not available) */}
                    {(isIOS || !isInstallable) && (
                      <Link to="/instalar" onClick={handleDismiss}>
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-dm-blue-3 text-primary-foreground font-chakra uppercase text-xs gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {isIOS ? 'Como Instalar (iOS)' : 'Como Instalar'}
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost-light"
                      onClick={handleDismiss}
                      className="text-xs"
                    >
                      Agora não
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallBanner;
