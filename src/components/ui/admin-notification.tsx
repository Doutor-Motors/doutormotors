import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface AdminNotificationCardProps {
  title?: string;
  subtitle?: string;
  message: string;
  highlight?: string;
  secondaryMessage?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const AdminNotificationCard = ({
  title = "Sistema",
  subtitle,
  message,
  highlight,
  secondaryMessage,
  icon,
  onClose,
}: AdminNotificationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full max-w-sm"
    >
      <div className="flex flex-col gap-1 rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-b from-white to-red-50 dark:from-red-950/50 dark:to-red-900/30 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-b from-red-400 to-red-600 text-sm font-medium text-white shadow-md">
              {icon || title[0]}
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">{title}</span>
              {subtitle && (
                <span className="text-xs text-muted-foreground ml-2">{subtitle}</span>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <div className="relative flex w-8 justify-center">
            <div className="absolute top-0 h-full w-px bg-gradient-to-b from-red-300 via-red-400 to-transparent dark:from-red-600 dark:via-red-500" />
            <div className="absolute top-0 size-2 rounded-full border-2 border-red-400 bg-white dark:bg-red-950 dark:border-red-500" />
          </div>
          <div className="flex flex-col gap-2 pb-2">
            <div className="flex flex-wrap items-center gap-1">
              <p className="text-sm text-foreground/80">
                {message}{" "}
                {highlight && (
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {highlight}
                  </span>
                )}
              </p>
            </div>

            {secondaryMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                  <div className="size-1.5 rounded-full bg-red-500" />
                </div>
                <p className="text-xs leading-relaxed text-foreground/70">
                  {secondaryMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminNotificationCard;
