import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AchievementPanel } from "@/components/achievement/AchievementPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getAchievementPage } from "@/services/achievement";

export const metadata: Metadata = {
  title: "Achievements",
  robots: { index: false, follow: false },
};

export default async function AchievementsPage() {
  const session = await requireSession();
  const view = await getAchievementPage(session.user.id);

  return (
    <FeatureGate
      flag="achievementSystem"
      title="Achievement System"
      description="Achievements are behind a feature flag."
    >
      <AppPage
        eyebrow="Progress"
        title="Achievements"
        description="A small set of milestones for showing up, technique, honest logging, and finishing prep — not empty gamification."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding to start earning achievements."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <AchievementPanel view={view} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
