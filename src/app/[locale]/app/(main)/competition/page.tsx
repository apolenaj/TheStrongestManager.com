import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CompetitionModePanel } from "@/components/competition-mode/CompetitionModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getCompetitionMode } from "@/services/competition-mode";

export const metadata: Metadata = {
  title: "Competition Mode",
  robots: { index: false, follow: false },
};

export default async function CompetitionModePage() {
  const session = await requireSession();
  const page = await getCompetitionMode(session.user.id);

  return (
    <FeatureGate
      flag="competitionMode"
      title="Competition Mode"
      description="Competition preparation is behind a feature flag."
    >
      <AppPage
        eyebrow="Performance"
        title="Competition Mode"
        description="Countdown, phase, taper sketches, attempt planning, bodyweight, and readiness — never an automatic dehydration cut."
      >
        {!page ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before setting a meet."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <CompetitionModePanel page={page} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
