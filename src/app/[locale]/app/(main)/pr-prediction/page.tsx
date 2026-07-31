import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PrPredictionPanel } from "@/components/pr-prediction/PrPredictionPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getPrPredictions } from "@/services/pr-prediction";

export const metadata: Metadata = {
  title: "PR prediction",
  robots: { index: false, follow: false },
};

export default async function PrPredictionPage() {
  const session = await requireSession();
  const view = await getPrPredictions(session.user.id);

  return (
    <FeatureGate
      flag="prPrediction"
      title="PR Prediction Engine"
      description="Conservative estimated 1RM ranges are behind a feature flag."
    >
      <AppPage
        eyebrow="Intelligence"
        title="PR prediction"
        description="Estimated 1RM ranges from recent work — never a single exact number, never when data quality is insufficient."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding and log working sets so conservative 1RM ranges can be estimated."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <PrPredictionPanel
            result={view.result}
            lookbackDays={view.lookbackDays}
            painSafeModeActive={view.painSafeModeActive}
            painSafeMessage={view.painSafeMessage}
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}
