import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { StrongmanModePanel } from "@/components/strongman-mode/StrongmanModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getStrongmanMode } from "@/services/strongman-mode";
import { getAthleteUnitPreference } from "@/services/unit-system";

export const metadata: Metadata = {
  title: "Strongman Mode",
  robots: { index: false, follow: false },
};

export default async function StrongmanModePage() {
  const session = await requireSession();
  const [result, unitPref] = await Promise.all([
    getStrongmanMode({ userId: session.user.id }),
    getAthleteUnitPreference(session.user.id),
  ]);

  return (
    <FeatureGate
      flag="strongmanMode"
      title="Strongman Mode"
      description="Strongman Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Sport mode"
        title="Strongman Mode"
        description="Event types with weight, distance, time, and reps — event-specific PRs only. Powerlifting metrics are not forced here."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <StrongmanModePanel mode={result.mode} units={unitPref.mass} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
