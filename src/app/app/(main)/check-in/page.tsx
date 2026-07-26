import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { WeeklyCheckInPanel } from "@/components/check-in-system/WeeklyCheckInPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { CHECK_IN_HONESTY } from "@/domain/check-in-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getAthleteCheckInView } from "@/services/check-in-system";

export const metadata: Metadata = {
  title: "Weekly check-in",
  robots: { index: false, follow: false },
};

export default async function CheckInPage() {
  const session = await requireSession();

  if (!featureFlags.checkInSystem) {
    return (
      <AppPage
        eyebrow="Training"
        title="Weekly check-in"
        description="Customizable weekly check-in — training-safe questions only."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_CHECK_IN_SYSTEM.
        </Alert>
      </AppPage>
    );
  }

  const result = await getAthleteCheckInView({ userId: session.user.id });

  return (
    <FeatureGate
      flag="checkInSystem"
      title="Weekly check-in"
      description="Check-in System is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Weekly check-in"
        description={CHECK_IN_HONESTY[0]}
      >
        {result.ok ? (
          <WeeklyCheckInPanel view={result.view} />
        ) : result.error === "No athlete profile." ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding to use weekly check-ins."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
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
