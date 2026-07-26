import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PowerliftingModePanel } from "@/components/powerlifting-mode/PowerliftingModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getPowerliftingMode } from "@/services/powerlifting-mode";

export const metadata: Metadata = {
  title: "Powerlifting Mode",
  robots: { index: false, follow: false },
};

export default async function PowerliftingModePage() {
  const session = await requireSession();
  const result = await getPowerliftingMode({ userId: session.user.id });

  return (
    <FeatureGate
      flag="powerliftingMode"
      title="Powerlifting Mode"
      description="Powerlifting Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Sport mode"
        title="Powerlifting Mode"
        description="Squat, bench, deadlift, total, competition, weight class, and attempt planning — DOTS via the cited calculator; Wilks/IPF GL and federation selection later."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <PowerliftingModePanel mode={result.mode} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
