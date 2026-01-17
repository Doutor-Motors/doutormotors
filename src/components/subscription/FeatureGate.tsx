import { ReactNode } from "react";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureGateProps {
  feature: keyof typeof PLAN_FEATURES.pro;
  featureName: string;
  description?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showPrompt?: boolean;
  compact?: boolean;
}

export function FeatureGate({
  feature,
  featureName,
  description,
  children,
  fallback,
  showPrompt = true,
  compact = false,
}: FeatureGateProps) {
  const { canUseFeature, isLoading } = useSubscription();

  if (isLoading) {
    return null;
  }

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showPrompt) {
    return (
      <UpgradePrompt
        feature={featureName}
        description={description}
        compact={compact}
      />
    );
  }

  return null;
}
