import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface QuickQuestionCardProps {
  icon: LucideIcon;
  text: string;
  color: string;
  gradient?: string;
  index: number;
  variant?: "favorite" | "vehicle" | "general";
  onClick: () => void;
}

const variantStyles = {
  favorite: {
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20 hover:border-yellow-500/40",
    iconBg: "bg-yellow-500/10",
  },
  vehicle: {
    bg: "bg-green-500/5",
    border: "border-green-500/20 hover:border-green-500/40",
    iconBg: "bg-green-500/10",
  },
  general: {
    bg: "bg-muted/50",
    border: "border-border hover:border-primary/30",
    iconBg: "bg-muted",
  },
};

const QuickQuestionCard = ({
  icon: Icon,
  text,
  color,
  index,
  variant = "general",
  onClick,
}: QuickQuestionCardProps) => {
  const styles = variantStyles[variant];

  return (
    <motion.button
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.15 }
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        relative w-full text-left p-2 rounded-lg 
        ${styles.bg} ${styles.border}
        border transition-all duration-200
        flex items-center gap-2
        group overflow-hidden
      `}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
        initial={{ x: "-200%" }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      {/* Icon */}
      <div className={`
        w-6 h-6 rounded-md ${styles.iconBg}
        flex items-center justify-center shrink-0
        transition-transform duration-200
        group-hover:scale-110
      `}>
        <Icon className={`w-3 h-3 ${color}`} />
      </div>
      
      {/* Text */}
      <span className="text-[11px] text-foreground/80 line-clamp-1 group-hover:text-foreground transition-colors">
        {text}
      </span>
    </motion.button>
  );
};

export default QuickQuestionCard;
