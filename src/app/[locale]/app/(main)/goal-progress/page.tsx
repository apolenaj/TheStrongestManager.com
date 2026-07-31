import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { GoalProbabilityPanel } from "@/components/goal-probability/GoalProbabilityPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getGoalProbability } from "@/services/goal-probability";

export const metadata: Metadata = {
  title: "Goal progress",
  robots: { index: false, follow: false },
};

export default async function GoalProbabilityPage() {
  const session = await requireSession();
  const view = await getGoalProbability(session.user.id);

  return (
    <FeatureGate
      flag="goalProbability"
      title="Goal Probability Engine"
      description="Goal progress estimation is behind a feature flag."
    >
      <AppPage
        eyebrow="Intelligence"
        title="Goal progress"
        description="Current estimate, required improvement, time remaining, and trajectory — qualitative status only, never a precise probability."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding and set a measurable strength goal to see trajectory."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <GoalProbabilityPanel result={view.result} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
