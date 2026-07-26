import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { WeightliftingModePanel } from "@/components/weightlifting-mode/WeightliftingModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getWeightliftingMode } from "@/services/weightlifting-mode";

export const metadata: Metadata = {
  title: "Weightlifting Mode",
  robots: { index: false, follow: false },
};

export default async function WeightliftingModePage() {
  const session = await requireSession();
  const result = await getWeightliftingMode({ userId: session.user.id });

  return (
    <FeatureGate
      flag="weightliftingMode"
      title="Weightlifting Mode"
      description="Weightlifting Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Sport mode"
        title="Weightlifting Mode"
        description="Snatch, clean, jerk, and clean & jerk — with positions, attempts, and competition total. Technique analysis waits for specific models; advanced video analysis is separately flagged."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <WeightliftingModePanel mode={result.mode} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
