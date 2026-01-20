import { useEffect } from "react";
import type { ComponentType } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type NavLink = {
  name: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
  highlight?: boolean;
};

type MobileMenuOverlayProps = {
  isOpen: boolean;
  navLinks: NavLink[];
  currentPath: string;
  onClose: () => void;
};

export default function MobileMenuOverlay({
  isOpen,
  navLinks,
  currentPath,
  onClose,
}: MobileMenuOverlayProps) {
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`lg:hidden fixed inset-0 bg-gradient-to-b from-secondary via-secondary to-dm-blue-3 z-[100] transition-all duration-500 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
    >
      {/* Close area at top */}
      <div className="h-20" onClick={onClose} />

      <nav className="flex flex-col px-6 py-8 h-[calc(100%-5rem)] overflow-auto">
        {/* Nav Links */}
        <div className="space-y-2">
          {navLinks.map((link, index) => {
            const isActive = currentPath === link.path;
            const isHighlight = !!link.highlight;
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={onClose}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl font-chakra text-lg uppercase transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : isHighlight
                      ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-primary-foreground border border-purple-500/30"
                      : "text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                  opacity: isOpen ? 1 : 0,
                  transition: `all 0.3s ease-out ${index * 50}ms`,
                }}
              >
                <span className="flex items-center gap-3">
                  {Icon ? <Icon className="w-5 h-5" /> : null}
                  {link.name}
                </span>
                <ChevronRight
                  className={`w-5 h-5 transition-transform ${isActive ? "translate-x-1" : ""}`}
                />
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Auth Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <Link to="/login" onClick={onClose}>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-chakra uppercase rounded-2xl h-14 text-base transition-all duration-300"
            >
              Entrar
            </Button>
          </Link>
          <Link to="/signup" onClick={onClose}>
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
    </div>,
    document.body,
  );
}
