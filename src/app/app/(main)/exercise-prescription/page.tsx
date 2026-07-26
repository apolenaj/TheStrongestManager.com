import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ExercisePrescriptionPanel } from "@/components/exercise-prescription/ExercisePrescriptionPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getExercisePrescription } from "@/services/exercise-prescription";

export const metadata: Metadata = {
  title: "Exercise prescription",
  robots: { index: false, follow: false },
};

export default async function ExercisePrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ weakPoint?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const view = await getExercisePrescription({
    userId: session.user.id,
    weakPoint: params.weakPoint ?? null,
  });

  return (
    <FeatureGate
      flag="exercisePrescription"
      title="Exercise prescription"
      description="Exercise recommendation engine is behind a feature flag."
    >
      <AppPage
        eyebrow="Programming"
        title="Exercise prescription"
        description="Choose exercises from multi-rule recommendations — reason, purpose, fatigue, skill, placement, and alternatives."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding so goal, equipment, and experience can inform prescriptions."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <ExercisePrescriptionPanel view={view} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
