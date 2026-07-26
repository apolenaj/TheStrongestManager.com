import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  buildCoachingContextCards,
  relatedMethodsForPattern,
  usefulForFromSportRelevance,
  type CoachingContextCard,
  type RelatedMethodRef,
} from "@/domain/exercises/detail-presentation";
import type {
  EquipmentKey,
  MuscleKey,
  RelatedMoveRef,
  SportRelevanceMap,
} from "@/domain/exercises/types";

/** Cache tag for published exercise detail — Performance 2.0. */
export const EXERCISE_CATALOG_CACHE_TAG = "exercise-catalog";

function parseJsonArray<T>(raw: string, fallback: T[] = []): T[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function parseJsonObject<T extends object>(raw: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as T)
      : fallback;
  } catch {
    return fallback;
  }
}

export type ExerciseListItem = {
  slug: string;
  name: string;
  description: string | null;
  aliases: string[];
  category: string;
  movementPattern: string;
  difficulty: string;
  equipment: EquipmentKey[];
  primaryMuscles: MuscleKey[];
  secondaryMuscles: MuscleKey[];
  sportRelevance: SportRelevanceMap;
};

export type ExerciseEvidenceView = {
  id: string;
  claim: string;
  citationLabel: string;
  citationUrl: string | null;
  supportLevel: string;
  notes: string | null;
};

export type ExerciseDetailView = {
  slug: string;
  name: string;
  aliases: string[];
  description: string | null;
  category: string;
  movementPattern: string;
  primaryMuscles: MuscleKey[];
  secondaryMuscles: MuscleKey[];
  equipment: EquipmentKey[];
  difficulty: string;
  laterality: string | null;
  sportRelevance: SportRelevanceMap;
  executionOverview: string | null;
  setup: string | null;
  execution: string | null;
  breathingBracing: string | null;
  commonMistakes: string[];
  regressions: RelatedMoveRef[];
  progressions: RelatedMoveRef[];
  variations: RelatedMoveRef[];
  programmingUses: string | null;
  safetyNotes: string | null;
  contentKind: string;
  contentStatus: string;
  /** Evidence claims only — empty unless real citations exist. */
  evidenceClaims: ExerciseEvidenceView[];
  catalogRelations: {
    relationType: string;
    note: string | null;
    exercise: { slug: string; name: string };
  }[];
  /** Derived presentation helpers for the detail page. */
  coachingContextCards: CoachingContextCard[];
  usefulFor: string[];
  relatedMethods: RelatedMethodRef[];
};

export async function listPublishedExercises(): Promise<ExerciseListItem[]> {
  const rows = await prisma.exercise.findMany({
    where: { isPublished: true },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    description: row.description,
    aliases: parseJsonArray<string>(row.aliases),
    category: row.category,
    movementPattern: row.movementPattern,
    difficulty: row.difficulty,
    equipment: parseJsonArray<EquipmentKey>(row.equipment),
    primaryMuscles: parseJsonArray<MuscleKey>(row.primaryMuscles),
    secondaryMuscles: parseJsonArray<MuscleKey>(row.secondaryMuscles),
    sportRelevance: parseJsonObject<SportRelevanceMap>(row.sportRelevance, {}),
  }));
}

async function loadPublishedExerciseBySlug(
  slug: string,
): Promise<ExerciseDetailView | null> {
  const row = await prisma.exercise.findFirst({
    where: { slug, isPublished: true },
    include: {
      evidenceClaims: { orderBy: { createdAt: "asc" } },
      relationsFrom: {
        include: { toExercise: { select: { slug: true, name: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!row) return null;

  const equipment = parseJsonArray<EquipmentKey>(row.equipment);
  const sportRelevance = parseJsonObject<SportRelevanceMap>(
    row.sportRelevance,
    {},
  );

  return {
    slug: row.slug,
    name: row.name,
    aliases: parseJsonArray<string>(row.aliases),
    description: row.description,
    category: row.category,
    movementPattern: row.movementPattern,
    primaryMuscles: parseJsonArray<MuscleKey>(row.primaryMuscles),
    secondaryMuscles: parseJsonArray<MuscleKey>(row.secondaryMuscles),
    equipment,
    difficulty: row.difficulty,
    laterality: row.laterality,
    sportRelevance,
    executionOverview: row.executionOverview,
    setup: row.setup,
    execution: row.execution,
    breathingBracing: row.breathingBracing,
    commonMistakes: parseJsonArray<string>(row.commonMistakes),
    regressions: parseJsonArray<RelatedMoveRef>(row.regressions),
    progressions: parseJsonArray<RelatedMoveRef>(row.progressions),
    variations: parseJsonArray<RelatedMoveRef>(row.variations),
    programmingUses: row.programmingUses,
    safetyNotes: row.safetyNotes,
    contentKind: row.contentKind,
    contentStatus: row.contentStatus,
    evidenceClaims: row.evidenceClaims.map((claim) => ({
      id: claim.id,
      claim: claim.claim,
      citationLabel: claim.citationLabel,
      citationUrl: claim.citationUrl,
      supportLevel: claim.supportLevel,
      notes: claim.notes,
    })),
    catalogRelations: row.relationsFrom.map((rel) => ({
      relationType: rel.relationType,
      note: rel.note,
      exercise: rel.toExercise,
    })),
    coachingContextCards: buildCoachingContextCards({
      difficulty: row.difficulty,
      movementPattern: row.movementPattern,
      equipment,
      laterality: row.laterality,
    }),
    usefulFor: usefulForFromSportRelevance(sportRelevance, row.difficulty),
    relatedMethods: relatedMethodsForPattern(row.movementPattern),
  };
}

/** Published exercise-by-slug with tagged cache (Performance 2.0). */
export async function getPublishedExerciseBySlug(
  slug: string,
): Promise<ExerciseDetailView | null> {
  return unstable_cache(
    () => loadPublishedExerciseBySlug(slug),
    ["exercise-by-slug", slug],
    { revalidate: 3600, tags: [EXERCISE_CATALOG_CACHE_TAG, `exercise:${slug}`] },
  )();
}
