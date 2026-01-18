import { ReactNode } from "react";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUserTier, PlanFeatureKey } from "@/hooks/useUserTier";
import { ProBadge } from "./UserBadge";
import { cn } from "@/lib/utils";

interface ProFeatureGateProps {
  feature: PlanFeatureKey;
  featureName: string;
  description?: string;
  children: ReactNode;
  /** Content to show when locked instead of default prompt */
  fallback?: ReactNode;
  /** Show upgrade prompt when locked */
  showPrompt?: boolean;
  /** Compact version for inline use */
  compact?: boolean;
  /** Overlay mode - shows content grayed out with overlay */
  overlay?: boolean;
}

export function ProFeatureGate({
  feature,
  featureName,
  description,
  children,
  fallback,
  showPrompt = true,
  compact = false,
  overlay = false,
}: ProFeatureGateProps) {
  const { canAccess, isLoading, isAdmin } = useUserTier();
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return null;
  }

  // Admin or has access - show content
  if (isAdmin || canAccess(feature)) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Overlay mode - show grayed out content with lock overlay
  if (overlay) {
    return (
      <div className="relative">
        {/* Grayed out content */}
        <div className="opacity-40 grayscale pointer-events-none select-none">
          {children}
        </div>
        
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <div className="text-center space-y-3 p-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{featureName}</p>
              <p className="text-sm text-muted-foreground">Recurso exclusivo PRO</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/upgrade")}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              <Crown className="w-4 h-4" />
              Fazer Upgrade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Compact mode
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-dashed border-amber-500/30">
        <Lock className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-muted-foreground flex-1">{featureName}</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          onClick={() => navigate("/dashboard/upgrade")}
        >
          <Crown className="w-3 h-3 mr-1" />
          PRO
        </Button>
      </div>
    );
  }

  // Default prompt - show prompt
  if (!showPrompt) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        {/* Icon container */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <ProBadge locked className="absolute -top-1 -right-3" />
        </div>
        
        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold font-chakra uppercase">{featureName}</h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-md">
              {description}
            </p>
          )}
        </div>
        
        {/* CTA Button */}
        <Button 
          onClick={() => navigate("/dashboard/upgrade")} 
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25"
        >
          <Crown className="w-4 h-4" />
          Fazer Upgrade para Pro
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Component to show PRO badge on menu/list items
interface ProFeatureIndicatorProps {
  feature: PlanFeatureKey;
  children: ReactNode;
  className?: string;
}

export function ProFeatureIndicator({ 
  feature, 
  children, 
  className 
}: ProFeatureIndicatorProps) {
  const { canAccess, isAdmin, isProFeature } = useUserTier();

  const isLocked = isProFeature(feature) && !isAdmin && !canAccess(feature);
  const showBadge = isProFeature(feature);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn(isLocked && "text-muted-foreground")}>
        {children}
      </span>
      {showBadge && (
        <ProBadge 
          locked={isLocked} 
          size="sm" 
        />
      )}
    </div>
  );
}

// Wrapper for clickable items that should show upgrade prompt
interface ProFeatureButtonProps {
  feature: PlanFeatureKey;
  featureName: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ProFeatureButton({
  feature,
  featureName,
  children,
  onClick,
  className,
}: ProFeatureButtonProps) {
  const { canAccess, isAdmin, isProFeature } = useUserTier();
  const navigate = useNavigate();

  const isLocked = isProFeature(feature) && !isAdmin && !canAccess(feature);

  const handleClick = () => {
    if (isLocked) {
      navigate("/dashboard/upgrade");
    } else {
      onClick?.();
    }
  };

  return (
    <div 
      className={cn(
        "cursor-pointer transition-all",
        isLocked && "opacity-60 grayscale",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
