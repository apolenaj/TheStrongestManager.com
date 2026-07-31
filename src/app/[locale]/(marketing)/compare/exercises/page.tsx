import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ExerciseCompareExperience } from "@/components/exercises/ExerciseCompareExperience";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import { ComingSoon } from "@/components/ui/ComingSoon";
import {
  allExerciseComparisonSeoSlugs,
  buildExerciseComparison,
  getExerciseComparisonSeoPair,
  listComparableExercises,
  parseExerciseCompareParams,
} from "@/domain/exercise-comparison";

type PageProps = {
  searchParams: Promise<{
    a?: string | string[];
    b?: string | string[];
    exercises?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Compare exercises",
  description:
    "Exercise A vs B — purpose, technique, muscles, fatigue, programming, and who should choose which. SEO pages only for allowlisted pairs.",
  alternates: { canonical: "/compare/exercises" },
};

export default async function ExerciseCompareHubPage({
  searchParams,
}: PageProps) {
  if (!featureFlags.exerciseComparison) {
    return (
      <ComingSoon
        title="Exercise Comparison"
        description="Exercise A vs B comparison is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_EXERCISE_COMPARISON=true to compare profiled exercises."
      />
    );
  }

  const params = await searchParams;
  const slugs = parseExerciseCompareParams(params);
  if (slugs.length >= 2) {
    const preview = buildExerciseComparison(slugs);
    if (preview.seoPair) {
      redirect(`/compare/exercises/${preview.seoPair.slug}`);
    }
  }

  const defaultSlugs =
    slugs.length >= 2
      ? slugs
      : ["romanian-deadlift", "stiff-leg-deadlift"];
  const view = buildExerciseComparison(defaultSlugs);
  const options = listComparableExercises();
  const seoPairs = allExerciseComparisonSeoSlugs()
    .map((slug) => getExerciseComparisonSeoPair(slug))
    .filter(Boolean);

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Compare"
        title="Compare exercises"
        description="Exercise A vs B across purpose, technique, muscles, fatigue, programming, and who should choose which. Qualitative only — allowlisted pairs are SEO-optimized."
      />
      <div className="mt-8">
        <ExerciseCompareExperience
          options={options}
          initialSlugs={defaultSlugs}
          view={view}
        />
      </div>
      <section className="mt-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Indexed comparison guides
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          {seoPairs.map((pair) =>
            pair ? (
              <li key={pair.slug}>
                <Link
                  href={`/compare/exercises/${pair.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {pair.title}
                </Link>
              </li>
            ) : null,
          )}
        </ul>
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          Looking for training methods?{" "}
          <Link href="/compare" className="underline-offset-4 hover:underline">
            Compare methods
          </Link>
          .
        </p>
      </section>
    </MarketingContainer>
  );
}
