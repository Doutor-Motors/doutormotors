import { Crown, Shield, User } from "lucide-react";
import { useUserTier, TIER_CONFIGS, UserTier } from "@/hooks/useUserTier";
import { cn } from "@/lib/utils";

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

export function UserBadge({ 
  size = "md", 
  showLabel = true, 
  className,
  overrideTier,
}: UserBadgeProps) {
  const { tier: currentTier, isLoading } = useUserTier();
  
  const tier = overrideTier ?? currentTier;
  const config = TIER_CONFIGS[tier];

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

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-chakra uppercase font-semibold transition-all duration-300",
        config.badgeBgColor,
        config.badgeColor,
        config.badgeBorderColor,
        BADGE_SIZES[size],
        className
      )}
    >
      <IconComponent className={ICON_SIZES[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
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
