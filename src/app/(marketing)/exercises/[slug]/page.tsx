import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseDetailPageContent } from "@/components/exercises/ExerciseDetailPageContent";
import { TrackExerciseView } from "@/components/exercises/TrackExerciseView";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import {
  JsonLdScript,
  exerciseDetailJsonLd,
} from "@/components/seo/JsonLdScript";
import { PRIORITY_EXERCISES } from "@/domain/exercises/priority-seed";
import { getPublishedExerciseBySlug } from "@/services/exercises/exercise-catalog";

/** ISR — priority exercise pages stay warm without per-request DB cost. */
export const revalidate = 3600;

type ExerciseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PRIORITY_EXERCISES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: ExerciseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await getPublishedExerciseBySlug(slug);
  if (!exercise) {
    return {
      title: "Exercise not found",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: exercise.name,
    description:
      exercise.description ??
      `${exercise.name} — exercise intelligence (coaching practice).`,
    alternates: { canonical: `/exercises/${exercise.slug}` },
  };
}

export default async function ExerciseDetailPage({
  params,
}: ExerciseDetailPageProps) {
  const { slug } = await params;
  const exercise = await getPublishedExerciseBySlug(slug);
  if (!exercise) notFound();

  const description =
    exercise.description ??
    `${exercise.name} — exercise intelligence (coaching practice).`;

  return (
    <MarketingContainer>
      <JsonLdScript
        data={exerciseDetailJsonLd({
          name: exercise.name,
          description,
          slug: exercise.slug,
        })}
      />
      <TrackExerciseView slug={exercise.slug} name={exercise.name} />
      <ExerciseDetailPageContent exercise={exercise} />
    </MarketingContainer>
  );
}
