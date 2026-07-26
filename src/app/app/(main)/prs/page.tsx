import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PrIntelligencePanel } from "@/components/pr-intelligence/PrIntelligencePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getPrIntelligence } from "@/services/pr-intelligence";

export const metadata: Metadata = {
  title: "Personal records",
  robots: { index: false, follow: false },
};

export default async function PrIntelligencePage() {
  const session = await requireSession();
  const view = await getPrIntelligence(session.user.id);

  return (
    <FeatureGate
      flag="prIntelligence"
      title="Personal Record Intelligence"
      description="Typed PR tracking is behind a feature flag."
    >
      <AppPage
        eyebrow="Tracking"
        title="Personal records"
        description="1RM, estimated 1RM, rep, volume, and technical PRs on one timeline — shareable celebration cards."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding, then log lifts to build your PR timeline."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <PrIntelligencePanel timeline={view.timeline} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
