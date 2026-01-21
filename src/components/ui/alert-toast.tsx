import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XOctagon,
  X,
} from "lucide-react";

const alertToastVariants = cva(
  "relative w-full max-w-sm overflow-hidden rounded-lg shadow-lg flex items-start p-4 space-x-4",
  {
    variants: {
      variant: {
        success: "",
        warning: "",
        info: "",
        error: "",
      },
      styleVariant: {
        default: "bg-background border",
        filled: "",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        styleVariant: "default",
        className: "text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
      },
      {
        variant: "warning",
        styleVariant: "default",
        className: "text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
      },
      {
        variant: "info",
        styleVariant: "default",
        className: "text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
      },
      {
        variant: "error",
        styleVariant: "default",
        className: "text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
      },
      {
        variant: "success",
        styleVariant: "filled",
        className: "bg-green-500 text-white",
      },
      {
        variant: "warning",
        styleVariant: "filled",
        className: "bg-yellow-500 text-black",
      },
      {
        variant: "info",
        styleVariant: "filled",
        className: "bg-blue-500 text-white",
      },
      {
        variant: "error",
        styleVariant: "filled",
        className: "bg-red-500 text-white",
      },
    ],
    defaultVariants: {
      variant: "info",
      styleVariant: "default",
    },
  }
);

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XOctagon,
};

const iconColorClasses: Record<string, Record<string, string>> = {
  default: {
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    error: "text-red-500",
  },
  filled: {
    success: "text-white",
    warning: "text-black",
    info: "text-white",
    error: "text-white",
  },
};

export interface AlertToastProps extends VariantProps<typeof alertToastVariants> {
  title: string;
  description: string;
  onClose: () => void;
  className?: string;
}

const AlertToast: React.FC<AlertToastProps> = ({ 
  className, 
  variant = 'info', 
  styleVariant = 'default', 
  title, 
  description, 
  onClose 
}) => {
  const Icon = iconMap[variant || 'info'];
  const iconColor = iconColorClasses[styleVariant || 'default'][variant || 'info'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(alertToastVariants({ variant, styleVariant }), className)}
    >
      <div className={cn("flex-shrink-0", iconColor)}>
        <Icon className="h-6 w-6" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm opacity-80 mt-0.5">{description}</p>
      </div>

      <button
        onClick={onClose}
        className={cn(
          "flex-shrink-0 p-1 rounded-full transition-colors",
          styleVariant === 'filled' 
            ? "hover:bg-white/20" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

AlertToast.displayName = "AlertToast";

export { AlertToast, alertToastVariants };
