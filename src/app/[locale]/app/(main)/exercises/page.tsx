import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ExerciseDiscovery } from "@/components/exercises/ExerciseDiscovery";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { getExerciseDiscovery } from "@/services/exercises/exercise-discovery";

export const metadata: Metadata = {
  title: "Exercises",
  robots: { index: false, follow: false },
};

type AppExercisesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AppExercisesPage({
  searchParams,
}: AppExercisesPageProps) {
  const discovery = await getExerciseDiscovery(await searchParams);

  return (
    <FeatureGate
      flag="appExercises"
      title="Exercises"
      description="In-app exercise library unlocks when the appExercises flag is enabled."
    >
      <AppPage
        eyebrow="Library"
        title="Exercises"
        description="Search and filter the published catalog. URL filters are shareable."
      >
        <ExerciseDiscovery discovery={discovery} formAction="/app/exercises" />
      </AppPage>
    </FeatureGate>
  );
}
