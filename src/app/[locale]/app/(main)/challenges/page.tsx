import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ChallengeEnginePanel } from "@/components/challenge/ChallengeEnginePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getChallengePage } from "@/services/challenge";

export const metadata: Metadata = {
  title: "Challenges",
  robots: { index: false, follow: false },
};

export default async function ChallengesPage() {
  const session = await requireSession();
  const view = await getChallengePage(session.user.id);

  return (
    <FeatureGate
      flag="challengeEngine"
      title="Challenge Engine"
      description="Community challenges are behind a feature flag."
    >
      <AppPage
        eyebrow="Community"
        title="Challenges"
        description="Consistency, learning, and improvement — never max-daily-lift races. Leaderboards optional."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before joining challenges."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <ChallengeEnginePanel view={view} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
