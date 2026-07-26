import type { FeatureFlagKey } from "@/config/feature-flags";
import { isFeatureEnabled } from "@/config/routes";
import { ComingSoon } from "@/components/ui/ComingSoon";

type FeatureGateProps = {
  flag?: FeatureFlagKey;
  title: string;
  description: string;
  children?: React.ReactNode;
};

/**
 * Renders children when the flag is on (or unset).
 * Otherwise shows an honest unavailable state — never fake UI.
 */
export function FeatureGate({
  flag,
  title,
  description,
  children,
}: FeatureGateProps) {
  if (!isFeatureEnabled(flag)) {
    return (
      <ComingSoon
        title={title}
        description={description}
        reason="This module is behind a feature flag and is not available yet."
      />
    );
  }

  return <>{children}</>;
}
