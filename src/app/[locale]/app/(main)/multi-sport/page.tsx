import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { MultiSportModePanel } from "@/components/multi-sport-mode/MultiSportModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getMultiSportMode } from "@/services/multi-sport-mode";

export const metadata: Metadata = {
  title: "Multi-Sport Athlete Mode",
  robots: { index: false, follow: false },
};

export default async function MultiSportModePage() {
  const session = await requireSession();
  const result = await getMultiSportMode({ userId: session.user.id });

  return (
    <FeatureGate
      flag="multiSportAthleteMode"
      title="Multi-Sport Athlete Mode"
      description="Multi-Sport Athlete Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Sport mode"
        title="Multi-Sport Athlete Mode"
        description="Select multiple sport focuses on one profile — for example Powerlifting + Strongman. PRs stay separated by sport; training may mix goals."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <MultiSportModePanel mode={result.mode} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
