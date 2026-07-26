import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AthleteLevelPanel } from "@/components/athlete-level/AthleteLevelPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getAthleteLevelPage } from "@/services/athlete-level";

export const metadata: Metadata = {
  title: "Athlete Level",
  robots: { index: false, follow: false },
};

export default async function AthleteLevelPage() {
  const session = await requireSession();
  const view = await getAthleteLevelPage(session.user.id);

  return (
    <FeatureGate
      flag="athleteLevel"
      title="Athlete Level"
      description="Athlete Level is behind a feature flag."
    >
      <AppPage
        eyebrow="Progress"
        title="Athlete Level"
        description="Optional multi-factor level — consistency, knowledge, technique, history, progress. Elite never from app usage alone."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before using Athlete Level."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <AthleteLevelPanel view={view} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
