import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingMenuButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const FloatingMenuButton = ({ isVisible, onClick }: FloatingMenuButtonProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={onClick}
          className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingMenuButton;
