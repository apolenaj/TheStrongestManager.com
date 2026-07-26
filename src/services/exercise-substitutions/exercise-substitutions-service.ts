/**
 * Smart Exercise Substitutions service (Prompt 127).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import type { EquipmentKey } from "@/domain/exercises/types";
import {
  EXERCISE_SUBSTITUTION_GOALS,
  substituteExercises,
  type ExerciseSubstitutionCandidate,
  type ExerciseSubstitutionGoal,
  type ExerciseSubstitutionResult,
} from "@/domain/exercise-substitutions";
import { mapProfileEquipmentToCatalog } from "@/services/exercise-prescription/exercise-prescription-service";
import { getAthleteState } from "@/services/performance-intelligence";
import { isPainSafeModeActiveForAthlete } from "@/services/pain-safe-response-system";
import { isInjuryModificationActiveForAthlete } from "@/services/injury-modification";
import { getFatigueAlertAnalysis } from "@/services/fatigue-alert-system";

function parseJsonStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function parseSportRelevance(
  raw: string | null | undefined,
): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function parseRelatedSlugs(...blobs: Array<string | null | undefined>): string[] {
  const out = new Set<string>();
  for (const blob of blobs) {
    try {
      const arr = JSON.parse(blob || "[]") as Array<{ relatedSlug?: string }>;
      for (const item of arr) {
        if (item.relatedSlug) out.add(item.relatedSlug);
      }
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

function mapGoal(
  raw: string | null | undefined,
  goalTitle: string | null,
  discipline: string | null,
): ExerciseSubstitutionGoal {
  if ((EXERCISE_SUBSTITUTION_GOALS as readonly string[]).includes(raw ?? "")) {
    return raw as ExerciseSubstitutionGoal;
  }
  const blob = `${raw ?? ""} ${goalTitle ?? ""} ${discipline ?? ""}`.toLowerCase();
  if (/chest/.test(blob) && /strength|press|bench/.test(blob)) {
    return "chest_strength";
  }
  if (/powerlift/.test(blob)) return "powerlifting";
  if (/hypertrophy|physique|muscle/.test(blob)) return "hypertrophy";
  if (/strength/.test(blob)) return "strength";
  if (/general|fitness/.test(blob)) return "general";
  return "other";
}

function mapSkill(
  level: string | null,
): "beginner" | "intermediate" | "advanced" | "elite" | null {
  if (
    level === "beginner" ||
    level === "intermediate" ||
    level === "advanced" ||
    level === "elite"
  ) {
    return level;
  }
  return null;
}

export async function getExerciseSubstitutions(input: {
  userId: string;
  unavailableSlug: string;
  goal?: string | null;
  equipmentOverride?: EquipmentKey[];
}): Promise<
  | { ok: true; result: ExerciseSubstitutionResult }
  | { ok: false; error: string }
> {
  if (!featureFlags.exerciseSubstitutions) {
    return { ok: false, error: "Smart Exercise Substitutions is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    include: {
      trainingExperience: true,
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
  });

  if (!profile) {
    return { ok: false, error: "No athlete profile." };
  }

  const [detailRows, relations, athleteState, painSafe, injuryMod, fatigue] =
    await Promise.all([
      prisma.exercise.findMany({
        where: { isPublished: true },
        select: {
          slug: true,
          name: true,
          description: true,
          movementPattern: true,
          category: true,
          difficulty: true,
          equipment: true,
          primaryMuscles: true,
          secondaryMuscles: true,
          sportRelevance: true,
          regressions: true,
          progressions: true,
          variations: true,
        },
      }),
      prisma.exerciseRelation.findMany({
        include: {
          fromExercise: { select: { slug: true } },
          toExercise: { select: { slug: true } },
        },
      }),
      getAthleteState(input.userId),
      isPainSafeModeActiveForAthlete(profile.id),
      isInjuryModificationActiveForAthlete(profile.id),
      getFatigueAlertAnalysis({
        userId: input.userId,
        athleteProfileId: profile.id,
      }),
    ]);

  const relatedBySlug = new Map<string, Set<string>>();
  for (const e of detailRows) {
    relatedBySlug.set(e.slug, new Set());
  }
  for (const rel of relations) {
    relatedBySlug.get(rel.fromExercise.slug)?.add(rel.toExercise.slug);
    relatedBySlug.get(rel.toExercise.slug)?.add(rel.fromExercise.slug);
  }

  const catalog: ExerciseSubstitutionCandidate[] = detailRows.map((e) => {
    const related = relatedBySlug.get(e.slug) ?? new Set<string>();
    for (const slug of parseRelatedSlugs(
      e.regressions,
      e.progressions,
      e.variations,
    )) {
      related.add(slug);
    }
    return {
      slug: e.slug,
      name: e.name,
      description: e.description,
      movementPattern: e.movementPattern,
      category: e.category,
      difficulty: e.difficulty,
      equipment: parseJsonStringArray(e.equipment) as EquipmentKey[],
      primaryMuscles: parseJsonStringArray(e.primaryMuscles),
      secondaryMuscles: parseJsonStringArray(e.secondaryMuscles),
      sportRelevance: parseSportRelevance(e.sportRelevance),
      relatedSlugs: [...related],
    };
  });

  const equipment =
    input.equipmentOverride && input.equipmentOverride.length > 0
      ? input.equipmentOverride
      : mapProfileEquipmentToCatalog(
          parseJsonStringArray(profile.trainingExperience?.availableEquipment),
        );

  const activeGoal = profile.goals[0];
  const goal = mapGoal(
    input.goal,
    activeGoal?.title ?? null,
    profile.primaryDiscipline,
  );

  let fatiguePressure: "normal" | "elevated" | "high" = "normal";
  if (fatigue.ok) {
    if (fatigue.analysis.level === "high_concern") fatiguePressure = "high";
    else if (
      fatigue.analysis.level === "elevated" ||
      fatigue.analysis.level === "watch"
    ) {
      fatiguePressure = "elevated";
    }
  } else if (
    athleteState?.state.fatigueTrend.value?.direction === "up" ||
    athleteState?.state.fatigueTrend.value?.loadSpikeFlagged
  ) {
    fatiguePressure = "elevated";
  }

  const result = substituteExercises({
    unavailableSlug: input.unavailableSlug,
    goal,
    equipment,
    catalog,
    context: {
      fatiguePressure,
      skillContext: mapSkill(profile.trainingExperience?.level ?? null),
      painSafeActive: painSafe,
      injuryModificationActive: injuryMod && !painSafe,
    },
  });

  return { ok: true, result };
}
