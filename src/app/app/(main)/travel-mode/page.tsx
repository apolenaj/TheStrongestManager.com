import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { TravelTrainingModePanel } from "@/components/travel-training-mode/TravelTrainingModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { TRAVEL_TRAINING_HONESTY } from "@/domain/travel-training-mode";
import { requireSession } from "@/services/auth/session";
import { getTravelModeView } from "@/services/travel-training-mode";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Travel Mode",
  robots: { index: false, follow: false },
};

export default async function TravelModePage() {
  const session = await requireSession();

  if (!featureFlags.travelTrainingMode) {
    return (
      <AppPage
        eyebrow="Training"
        title="Travel Mode"
        description="Hotel gym, no gym, or limited equipment — temporary program adaptation."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_TRAVEL_TRAINING_MODE.
        </Alert>
      </AppPage>
    );
  }

  const result = await getTravelModeView({ userId: session.user.id });

  return (
    <FeatureGate
      flag="travelTrainingMode"
      title="Travel Mode"
      description="Travel Training Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Travel Mode"
        description={TRAVEL_TRAINING_HONESTY[0]}
      >
        {result.ok ? (
          <TravelTrainingModePanel view={result.view} />
        ) : result.error === "No athlete profile." ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before starting Travel Mode."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
