import { Crown, Shield, User, Zap, Star, Database, Sparkles, Check } from "lucide-react";
import { useUserTier, TIER_CONFIGS, UserTier } from "@/hooks/useUserTier";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  /** Override tier for preview purposes */
  overrideTier?: UserTier;
}

const ICON_SIZES = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const BADGE_SIZES = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
  lg: "text-sm px-3 py-1.5",
};

// Benefits for each tier
const TIER_BENEFITS = {
  basic: [
    { icon: Zap, text: "5 diagnósticos/mês" },
    { icon: Star, text: "1 veículo" },
    { icon: Database, text: "4 parâmetros" },
  ],
  pro: [
    { icon: Zap, text: "Diagnósticos ilimitados" },
    { icon: Star, text: "10 veículos" },
    { icon: Database, text: "Gravação de dados" },
    { icon: Sparkles, text: "IA ilimitada" },
  ],
  admin: [
    { icon: Shield, text: "Acesso total" },
    { icon: Zap, text: "Recursos ilimitados" },
    { icon: Star, text: "Painel administrativo" },
  ],
};

export function UserBadge({ 
  size = "md", 
  showLabel = true, 
  className,
  overrideTier,
}: UserBadgeProps) {
  const { tier: currentTier, isLoading } = useUserTier();
  
  const tier = overrideTier ?? currentTier;
  const config = TIER_CONFIGS[tier];
  const benefits = TIER_BENEFITS[tier];

  if (isLoading && !overrideTier) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full border animate-pulse",
        "bg-muted/50 text-muted-foreground border-muted",
        BADGE_SIZES[size],
        className
      )}>
        <span className={cn("rounded-full bg-muted-foreground/30", ICON_SIZES[size])} />
        {showLabel && <span className="opacity-50">...</span>}
      </span>
    );
  }

  const IconComponent = {
    user: User,
    crown: Crown,
    shield: Shield,
  }[config.icon];

  const isPremium = tier === "pro" || tier === "admin";

  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-chakra uppercase font-semibold transition-all duration-300 cursor-default",
        config.badgeBgColor,
        config.badgeColor,
        config.badgeBorderColor,
        BADGE_SIZES[size],
        // Pulsing animation for premium tiers
        isPremium && "animate-[pulse-glow_2s_ease-in-out_infinite]",
        className
      )}
      style={isPremium ? {
        animation: "pulse-glow 2s ease-in-out infinite",
      } : undefined}
    >
      <IconComponent className={cn(ICON_SIZES[size], isPremium && "animate-[spin_8s_linear_infinite]")} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-card/95 backdrop-blur-md border-border/50 p-3 max-w-[200px]"
        >
          <div className="space-y-2">
            <p className={cn(
              "font-chakra font-bold text-sm flex items-center gap-1.5",
              tier === "pro" ? "text-primary" : tier === "admin" ? "text-violet-400" : "text-blue-400"
            )}>
              <IconComponent className="w-4 h-4" />
              Plano {config.label}
            </p>
            <div className="space-y-1">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-green-500 shrink-0" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
            {tier === "basic" && (
              <p className="text-[10px] text-amber-400 pt-1 border-t border-border/30 mt-2">
                💡 Faça upgrade para Pro!
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Badge apenas PRO para features bloqueadas
interface ProBadgeProps {
  size?: "sm" | "md" | "lg";
  locked?: boolean;
  className?: string;
}

export function ProBadge({ size = "sm", locked = false, className }: ProBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border font-chakra uppercase font-semibold transition-all duration-300",
        locked 
          ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        BADGE_SIZES[size],
        className
      )}
    >
      <Crown className={ICON_SIZES[size]} />
      <span>PRO</span>
    </span>
  );
}

// Badge ADMIN
interface AdminBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AdminBadge({ size = "sm", className }: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border font-chakra uppercase font-semibold",
        "bg-violet-500/20 text-violet-400 border-violet-500/30",
        BADGE_SIZES[size],
        className
      )}
    >
      <Shield className={ICON_SIZES[size]} />
      <span>ADMIN</span>
    </span>
  );
}
