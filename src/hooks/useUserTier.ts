import { useMemo } from "react";
import { useAdmin } from "./useAdmin";
import { useSubscription, PLAN_FEATURES } from "./useSubscription";

export { PLAN_FEATURES };

export type PlanFeatureKey = keyof typeof PLAN_FEATURES.pro;

export type UserTier = "basic" | "pro" | "admin";

export interface TierConfig {
  tier: UserTier;
  label: string;
  badgeColor: string;
  badgeBgColor: string;
  badgeBorderColor: string;
  icon: "user" | "crown" | "shield";
  canAccessProFeatures: boolean;
  canAccessAdminFeatures: boolean;
}

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  basic: {
    tier: "basic",
    label: "Basic",
    badgeColor: "text-muted-foreground",
    badgeBgColor: "bg-muted/50",
    badgeBorderColor: "border-muted",
    icon: "user",
    canAccessProFeatures: false,
    canAccessAdminFeatures: false,
  },
  pro: {
    tier: "pro",
    label: "Usuário PRO",
    badgeColor: "text-emerald-400",
    badgeBgColor: "bg-emerald-500/20",
    badgeBorderColor: "border-emerald-500/30",
    icon: "crown",
    canAccessProFeatures: true,
    canAccessAdminFeatures: false,
  },
  admin: {
    tier: "admin",
    label: "Administrador",
    badgeColor: "text-violet-400",
    badgeBgColor: "bg-violet-500/20",
    badgeBorderColor: "border-violet-500/30",
    icon: "shield",
    canAccessProFeatures: true,
    canAccessAdminFeatures: true,
  },
};

export const PRO_BADGE_CONFIG = {
  color: "text-amber-400",
  bgColor: "bg-amber-500/20",
  borderColor: "border-amber-500/30",
  lockedColor: "text-muted-foreground",
  lockedBgColor: "bg-muted/30",
};

export function useUserTier() {
  const { isAdmin, loading: adminLoading, userRole } = useAdmin();
  const { 
    subscription, 
    isLoading: subscriptionLoading, 
    currentPlan, 
    isPro,
    canUseFeature,
    getFeatureLimit,
    planFeatures,
  } = useSubscription();

  const isLoading = adminLoading || subscriptionLoading;

  // Determine user tier: Admin > Pro > Basic
  const tier: UserTier = useMemo(() => {
    if (isAdmin) return "admin";
    if (isPro) return "pro";
    return "basic";
  }, [isAdmin, isPro]);

  const tierConfig = TIER_CONFIGS[tier];

  // Check if user can access a specific feature
  const canAccess = (feature: keyof typeof PLAN_FEATURES.pro): boolean => {
    // Admins can access everything
    if (isAdmin) return true;
    // Otherwise check subscription
    return canUseFeature(feature);
  };

  // Check if a feature requires Pro (for showing badge)
  const isProFeature = (feature: keyof typeof PLAN_FEATURES.pro): boolean => {
    const basicValue = PLAN_FEATURES.basic[feature as keyof typeof PLAN_FEATURES.basic];
    const proValue = PLAN_FEATURES.pro[feature];
    
    if (typeof basicValue === "boolean" && typeof proValue === "boolean") {
      return proValue && !basicValue;
    }
    if (typeof basicValue === "number" && typeof proValue === "number") {
      return proValue > basicValue || proValue === -1;
    }
    return false;
  };

  // Check if feature is locked for current user
  const isFeatureLocked = (feature: keyof typeof PLAN_FEATURES.pro): boolean => {
    return isProFeature(feature) && !canAccess(feature);
  };

  return {
    // State
    isLoading,
    tier,
    tierConfig,
    userRole,
    
    // Flags
    isBasic: tier === "basic",
    isPro: tier === "pro" || tier === "admin",
    isAdmin,
    
    // Feature access
    canAccess,
    isProFeature,
    isFeatureLocked,
    getFeatureLimit,
    
    // Subscription data
    subscription,
    planFeatures,
  };
}

