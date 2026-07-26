import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { TrainingConsistencyIntelligencePanel } from "@/components/training-consistency-intelligence/TrainingConsistencyIntelligencePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { TRAINING_CONSISTENCY_HONESTY } from "@/domain/training-consistency-intelligence";
import { requireSession } from "@/services/auth/session";
import { getTrainingConsistencyAnalysis } from "@/services/training-consistency-intelligence";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Training consistency",
  robots: { index: false, follow: false },
};

export default async function TrainingConsistencyPage() {
  const session = await requireSession();

  if (!featureFlags.trainingConsistencyIntelligence) {
    return (
      <AppPage
        eyebrow="Training"
        title="Training consistency"
        description="Plan adherence intelligence — not days in the gym."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_TRAINING_CONSISTENCY_INTELLIGENCE.
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
        eyebrow="Training"
        title="Training consistency"
        description={TRAINING_CONSISTENCY_HONESTY[0]}
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding to measure plan adherence."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const result = await getTrainingConsistencyAnalysis({
    athleteProfileId: profile.id,
  });

  return (
    <FeatureGate
      flag="trainingConsistencyIntelligence"
      title="Training consistency"
      description="Training Consistency Intelligence is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Training consistency"
        description={TRAINING_CONSISTENCY_HONESTY[0]}
      >
        {result.ok ? (
          <TrainingConsistencyIntelligencePanel analysis={result.analysis} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
