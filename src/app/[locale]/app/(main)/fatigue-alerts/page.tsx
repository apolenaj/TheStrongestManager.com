import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { FatigueAlertSystemPanel } from "@/components/fatigue-alert-system/FatigueAlertSystemPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { FATIGUE_ALERT_HONESTY } from "@/domain/fatigue-alert-system";
import { requireSession } from "@/services/auth/session";
import { getFatigueAlertAnalysis } from "@/services/fatigue-alert-system";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Fatigue alerts",
  robots: { index: false, follow: false },
};

export default async function FatigueAlertSystemPage() {
  const session = await requireSession();

  if (!featureFlags.fatigueAlertSystem) {
    return (
      <AppPage
        eyebrow="Recovery"
        title="Fatigue alerts"
        description="Conservative fatigue awareness levels — not medical claims."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_FATIGUE_ALERT_SYSTEM.
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
        title="Fatigue alerts"
        description={FATIGUE_ALERT_HONESTY[0]}
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding so fatigue awareness can use your logs."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const result = await getFatigueAlertAnalysis({
    userId: session.user.id,
    athleteProfileId: profile.id,
  });

  return (
    <FeatureGate
      flag="fatigueAlertSystem"
      title="Fatigue alerts"
      description="Fatigue Alert System is behind a feature flag."
    >
      <AppPage
        eyebrow="Recovery"
        title="Fatigue alerts"
        description={FATIGUE_ALERT_HONESTY[0]}
      >
        {result.ok ? (
          <FatigueAlertSystemPanel analysis={result.analysis} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
