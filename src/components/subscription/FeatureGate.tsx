import { ReactNode } from "react";
import { useUserTier, PlanFeatureKey } from "@/hooks/useUserTier";
import { ProFeatureGate } from "./ProFeatureGate";

interface FeatureGateProps {
  feature: PlanFeatureKey;
  featureName: string;
  description?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showPrompt?: boolean;
  compact?: boolean;
}

/**
 * @deprecated Use ProFeatureGate instead for more features
 */
export function FeatureGate({
  feature,
  featureName,
  description,
  children,
  fallback,
  showPrompt = true,
  compact = false,
}: FeatureGateProps) {
  return (
    <ProFeatureGate
      feature={feature}
      featureName={featureName}
      description={description}
      fallback={fallback}
      showPrompt={showPrompt}
      compact={compact}
    >
      {children}
    </ProFeatureGate>
  );
}
