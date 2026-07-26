import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { BodyweightPerformancePanel } from "@/components/bodyweight-performance/BodyweightPerformancePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { BODYWEIGHT_PERFORMANCE_HONESTY } from "@/domain/bodyweight-performance";
import { requireSession } from "@/services/auth/session";
import { getBodyweightPerformanceAnalysis } from "@/services/bodyweight-performance";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Bodyweight & performance",
  robots: { index: false, follow: false },
};

export default async function BodyweightPerformancePage() {
  const session = await requireSession();

  if (!featureFlags.bodyweightPerformance) {
    return (
      <AppPage
        eyebrow="Performance"
        title="Bodyweight & performance"
        description="Relationship between bodyweight, strength, and relative strength."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_BODYWEIGHT_PERFORMANCE.
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
        eyebrow="Performance"
        title="Bodyweight & performance"
        description={BODYWEIGHT_PERFORMANCE_HONESTY[0]}
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding to analyze bodyweight and strength trends."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const result = await getBodyweightPerformanceAnalysis({
    athleteProfileId: profile.id,
  });

  return (
    <FeatureGate
      flag="bodyweightPerformance"
      title="Bodyweight & performance"
      description="Bodyweight / Performance Relationship is behind a feature flag."
    >
      <AppPage
        eyebrow="Performance"
        title="Bodyweight & performance"
        description={BODYWEIGHT_PERFORMANCE_HONESTY[0]}
      >
        {result.ok ? (
          <BodyweightPerformancePanel analysis={result.analysis} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
