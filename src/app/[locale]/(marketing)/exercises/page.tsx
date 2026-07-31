import type { Metadata } from "next";
import { ExerciseDiscovery } from "@/components/exercises/ExerciseDiscovery";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import { getExerciseDiscovery } from "@/services/exercises/exercise-discovery";

export const metadata: Metadata = {
  title: "Exercises",
  description:
    "Search the curated exercise catalog by name, muscle, movement, equipment, sport, and difficulty.",
  alternates: { canonical: "/exercises" },
};

type ExercisesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExercisesPage({
  searchParams,
}: ExercisesPageProps) {
  const params = await searchParams;
  const discovery = await getExerciseDiscovery(params);

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Exercises"
        title="Exercises"
        description="Search the curated catalog. Filters live in the URL so views are shareable. Recently viewed stays on your device."
      />
      <div className="mt-8">
        <ExerciseDiscovery discovery={discovery} />
      </div>
    </MarketingContainer>
  );
}
