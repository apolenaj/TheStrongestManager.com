/**
 * Build Exercise A vs B comparison views (Prompt 166).
 */

import { PRIORITY_EXERCISES } from "@/domain/exercises/priority-seed";
import {
  EXERCISE_COMPARISON_DIMENSIONS,
  EXERCISE_COMPARE_MAX,
  EXERCISE_COMPARE_MIN,
  EXERCISE_FATIGUE_BAND_LABELS,
  type ExerciseComparisonDimensionId,
} from "@/domain/exercise-comparison/constants";
import {
  EXERCISE_COMPARISON_PROFILES,
  getExerciseComparisonProfile,
  type ExerciseComparisonProfile,
} from "@/domain/exercise-comparison/profiles";
import {
  findSeoPairForExercises,
  type ExerciseComparisonSeoPair,
} from "@/domain/exercise-comparison/seo-pairs";

export type ComparedExercise = {
  slug: string;
  name: string;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  movementPattern: string;
  profile: ExerciseComparisonProfile;
};

export type ExerciseComparisonCell = {
  slug: string;
  name: string;
  primary: string;
  bandLabel?: string;
};

export type ExerciseComparisonRow = {
  dimensionId: ExerciseComparisonDimensionId;
  label: string;
  description: string;
  cells: ExerciseComparisonCell[];
};

export type ExerciseComparisonView = {
  exercises: ComparedExercise[];
  rows: ExerciseComparisonRow[];
  title: string;
  sharePath: string;
  seoPair: ExerciseComparisonSeoPair | null;
  warnings: string[];
};

function exerciseName(slug: string): string {
  return (
    PRIORITY_EXERCISES.find((e) => e.slug === slug)?.name ?? slug
  );
}

export function listComparableExercises(): Array<{
  slug: string;
  name: string;
}> {
  return EXERCISE_COMPARISON_PROFILES.map((p) => ({
    slug: p.slug,
    name: exerciseName(p.slug),
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export function parseExerciseCompareParams(input: {
  a?: string | string[];
  b?: string | string[];
  exercises?: string | string[];
}): string[] {
  if (input.exercises) {
    const raw = Array.isArray(input.exercises)
      ? input.exercises[0]
      : input.exercises;
    return (raw ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, EXERCISE_COMPARE_MAX);
  }
  const a = Array.isArray(input.a) ? input.a[0] : input.a;
  const b = Array.isArray(input.b) ? input.b[0] : input.b;
  return [a, b].filter((s): s is string => Boolean(s && s.trim()));
}

export function buildExerciseSharePath(slugs: string[]): string {
  if (slugs.length < EXERCISE_COMPARE_MIN) return "/compare/exercises";
  const seo = findSeoPairForExercises(slugs[0]!, slugs[1]!);
  if (seo) return `/compare/exercises/${seo.slug}`;
  return `/compare/exercises?a=${encodeURIComponent(slugs[0]!)}&b=${encodeURIComponent(slugs[1]!)}`;
}

function cellFor(
  profile: ExerciseComparisonProfile,
  name: string,
  dimensionId: ExerciseComparisonDimensionId,
): ExerciseComparisonCell {
  switch (dimensionId) {
    case "purpose":
      return { slug: profile.slug, name, primary: profile.purpose };
    case "technique":
      return { slug: profile.slug, name, primary: profile.technique };
    case "muscles":
      return { slug: profile.slug, name, primary: profile.muscles };
    case "fatigue":
      return {
        slug: profile.slug,
        name,
        primary: profile.fatigueNote,
        bandLabel: EXERCISE_FATIGUE_BAND_LABELS[profile.fatigue],
      };
    case "programming":
      return { slug: profile.slug, name, primary: profile.programming };
    case "whoShouldChoose":
      return { slug: profile.slug, name, primary: profile.whoShouldChoose };
  }
}

export function buildExerciseComparison(
  slugs: string[],
): ExerciseComparisonView {
  const warnings: string[] = [];
  const unique = [...new Set(slugs)].slice(0, EXERCISE_COMPARE_MAX);
  const exercises: ComparedExercise[] = [];

  for (const slug of unique) {
    const profile = getExerciseComparisonProfile(slug);
    const seed = PRIORITY_EXERCISES.find((e) => e.slug === slug);
    if (!profile) {
      warnings.push(`No comparison profile for “${slug}”.`);
      continue;
    }
    if (!seed) {
      warnings.push(`Exercise “${slug}” is not in the priority catalog.`);
      continue;
    }
    exercises.push({
      slug,
      name: seed.name,
      description: seed.description,
      primaryMuscles: [...seed.primaryMuscles],
      secondaryMuscles: [...seed.secondaryMuscles],
      movementPattern: seed.movementPattern,
      profile,
    });
  }

  if (exercises.length < EXERCISE_COMPARE_MIN && unique.length >= 1) {
    warnings.push("Select two profiled exercises to compare.");
  }

  const rows: ExerciseComparisonRow[] = EXERCISE_COMPARISON_DIMENSIONS.map(
    (dim) => ({
      dimensionId: dim.id,
      label: dim.label,
      description: dim.description,
      cells: exercises.map((ex) =>
        cellFor(ex.profile, ex.name, dim.id),
      ),
    }),
  );

  const title =
    exercises.length >= 2
      ? `${exercises[0]!.name} vs ${exercises[1]!.name}`
      : "Compare exercises";

  const seoPair =
    exercises.length >= 2
      ? findSeoPairForExercises(exercises[0]!.slug, exercises[1]!.slug) ?? null
      : null;

  return {
    exercises,
    rows,
    title,
    sharePath: buildExerciseSharePath(exercises.map((e) => e.slug)),
    seoPair,
    warnings,
  };
}
