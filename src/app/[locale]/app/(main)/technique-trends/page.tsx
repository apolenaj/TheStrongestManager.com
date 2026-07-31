import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { TechniqueTrendPanel } from "@/components/technique-trend/TechniqueTrendPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getTechniqueTrends } from "@/services/technique-trend";

export const metadata: Metadata = {
  title: "Technique trends",
  robots: { index: false, follow: false },
};

export default async function TechniqueTrendsPage() {
  const session = await requireSession();
  const view = await getTechniqueTrends(session.user.id);

  return (
    <FeatureGate
      flag="techniqueTrendEngine"
      title="Technique Trend Engine"
      description="Longitudinal technique analytics are behind a feature flag."
    >
      <AppPage
        eyebrow="Technique"
        title="Technique trends"
        description="Track Technique Score over time — improved, stable, and regressed metrics on compatible camera angles only."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding, then upload scored technique videos to build trends."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <TechniqueTrendPanel result={view.result} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
