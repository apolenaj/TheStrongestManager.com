import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { SessionReadinessPanel } from "@/components/session-readiness-adjuster/SessionReadinessPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getSessionReadinessPageData } from "@/services/session-readiness-adjuster";

export const metadata: Metadata = {
  title: "Session readiness",
  robots: { index: false, follow: false },
};

export default async function SessionReadinessPage() {
  const session = await requireSession();
  const data = await getSessionReadinessPageData(session.user.id);

  return (
    <FeatureGate
      flag="sessionReadinessAdjuster"
      title="Session readiness"
      description="Pre-workout readiness adjuster is behind a feature flag."
    >
      <AppPage
        eyebrow="Before training"
        title="Session readiness"
        description="Quick check-in — sleep, fatigue, soreness, motivation. Proceed, minor adjustment, or review load. Never cancel from one metric."
      >
        {!data ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before a pre-workout check-in."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <SessionReadinessPanel data={data} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
