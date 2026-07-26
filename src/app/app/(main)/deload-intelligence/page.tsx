import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { DeloadIntelligencePanel } from "@/components/deload-intelligence/DeloadIntelligencePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { DELOAD_INTELLIGENCE_HONESTY } from "@/domain/deload-intelligence";
import { requireSession } from "@/services/auth/session";
import { getDeloadIntelligenceAnalysis } from "@/services/deload-intelligence";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Deload intelligence",
  robots: { index: false, follow: false },
};

export default async function DeloadIntelligencePage() {
  const session = await requireSession();

  if (!featureFlags.deloadIntelligence) {
    return (
      <AppPage
        eyebrow="Recovery"
        title="Deload intelligence"
        description="Multi-signal Consider deload recommendations — you decide."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_DELOAD_INTELLIGENCE.
        </Alert>
      </AppPage>
    );
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return (
      <AppPage
        eyebrow="Recovery"
        title="Deload intelligence"
        description={DELOAD_INTELLIGENCE_HONESTY[0]}
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding so deload signals can be evaluated."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const result = await getDeloadIntelligenceAnalysis({
    userId: session.user.id,
    athleteProfileId: profile.id,
  });

  return (
    <FeatureGate
      flag="deloadIntelligence"
      title="Deload intelligence"
      description="Deload Intelligence is behind a feature flag."
    >
      <AppPage
        eyebrow="Recovery"
        title="Deload intelligence"
        description={DELOAD_INTELLIGENCE_HONESTY[0]}
      >
        {result.ok ? (
          <DeloadIntelligencePanel analysis={result.analysis} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
