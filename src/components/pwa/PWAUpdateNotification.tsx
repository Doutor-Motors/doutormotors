import { X, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAUpdate } from "@/hooks/usePWAUpdate";
import { motion, AnimatePresence } from "framer-motion";

const PWAUpdateNotification = () => {
  const { needsUpdate, updateReady, updateServiceWorker, dismissUpdate } = usePWAUpdate();

  if (!needsUpdate || !updateReady) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[60]"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 shadow-2xl border border-green-400/30">
          <button
            onClick={dismissUpdate}
            className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
              <Download className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1 pr-4">
              <h3 className="font-chakra text-white font-bold text-lg mb-1">
                Nova Versão Disponível!
              </h3>
              <p className="text-white/90 text-sm mb-3">
                Uma atualização do app está pronta. Atualize agora para ter acesso às últimas melhorias.
              </p>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={updateServiceWorker}
                  className="bg-white hover:bg-gray-100 text-green-700 font-chakra uppercase text-xs gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar Agora
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={dismissUpdate}
                  className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
                >
                  Depois
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAUpdateNotification;
