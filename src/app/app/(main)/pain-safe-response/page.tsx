import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PainSafeResponseSystemPanel } from "@/components/pain-safe-response-system/PainSafeResponseSystemPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { PAIN_SAFE_RESPONSE_HONESTY } from "@/domain/pain-safe-response-system";
import { requireSession } from "@/services/auth/session";
import {
  getPainSafeAnalysis,
  listActivePainSafeReports,
} from "@/services/pain-safe-response-system";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Pain-safe response",
  robots: { index: false, follow: false },
};

export default async function PainSafeResponsePage() {
  const session = await requireSession();

  if (!featureFlags.painSafeResponseSystem) {
    return (
      <AppPage
        eyebrow="Safety"
        title="Pain-safe response"
        description="Safety layer for sharp pain, neurological symptoms, and serious injury."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_PAIN_SAFE_RESPONSE_SYSTEM.
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
        eyebrow="Safety"
        title="Pain-safe response"
        description={PAIN_SAFE_RESPONSE_HONESTY[0]}
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before using the pain-safe safety layer."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const [result, reports] = await Promise.all([
    getPainSafeAnalysis({ athleteProfileId: profile.id }),
    listActivePainSafeReports(profile.id),
  ]);

  return (
    <FeatureGate
      flag="painSafeResponseSystem"
      title="Pain-safe response"
      description="Pain-Safe Response System is behind a feature flag."
    >
      <AppPage
        eyebrow="Safety"
        title="Pain-safe response"
        description={PAIN_SAFE_RESPONSE_HONESTY[0]}
      >
        {result.ok ? (
          <PainSafeResponseSystemPanel
            analysis={result.analysis}
            reports={reports}
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
