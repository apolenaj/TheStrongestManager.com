import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { RecoveryCorrelationPanel } from "@/components/recovery-correlation/RecoveryCorrelationPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { RECOVERY_CORRELATION_HONESTY } from "@/domain/recovery-correlation";
import { requireSession } from "@/services/auth/session";
import { getRecoveryCorrelationAnalysis } from "@/services/recovery-correlation";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Recovery correlations",
  robots: { index: false, follow: false },
};

export default async function RecoveryCorrelationPage() {
  const session = await requireSession();

  if (!featureFlags.recoveryCorrelation) {
    return (
      <AppPage
        eyebrow="Recovery"
        title="Recovery correlations"
        description="Observed associations between sleep, stress, soreness, and performance."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_RECOVERY_CORRELATION.
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
        title="Recovery correlations"
        description={RECOVERY_CORRELATION_HONESTY[0]}
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding to analyze recovery and performance associations."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const result = await getRecoveryCorrelationAnalysis({
    athleteProfileId: profile.id,
  });

  return (
    <FeatureGate
      flag="recoveryCorrelation"
      title="Recovery correlations"
      description="Recovery Correlation Insights is behind a feature flag."
    >
      <AppPage
        eyebrow="Recovery"
        title="Recovery correlations"
        description={RECOVERY_CORRELATION_HONESTY[0]}
      >
        {result.ok ? (
          <RecoveryCorrelationPanel analysis={result.analysis} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
