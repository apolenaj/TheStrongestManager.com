import type { EquipmentKey } from "@/domain/exercises/types";
import { mapOnboardingEquipmentToCatalog } from "@/domain/equipment-profiles";
import {
  WEAK_POINTS,
  WEAK_POINT_LABELS,
  recommendExercises,
  type ExercisePrescriptionCandidate,
  type ExercisePrescriptionExperience,
  type ExercisePrescriptionGoal,
  type ExercisePrescriptionInputs,
  type ExercisePrescriptionResult,
  type WeakPointId,
} from "@/domain/exercise-prescription";
import { listPublishedExercises } from "@/services/exercises/exercise-catalog";
import { prisma } from "@/lib/db";
import { isInjuryModificationActiveForAthlete } from "@/services/injury-modification";
import { isPainSafeModeActiveForAthlete } from "@/services/pain-safe-response-system";

/** Map onboarding equipment ids → catalog EquipmentKey. */
export function mapProfileEquipmentToCatalog(
  raw: string[] | null | undefined,
): EquipmentKey[] {
  return mapOnboardingEquipmentToCatalog(raw);
}

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

function mapGoal(
  category: string | null,
  title: string | null,
  discipline: string | null,
): ExercisePrescriptionGoal {
  const blob = `${category ?? ""} ${title ?? ""} ${discipline ?? ""}`.toLowerCase();
  if (/powerlift/.test(blob)) return "powerlifting";
  if (/hypertrophy|physique|muscle/.test(blob)) return "hypertrophy";
  if (/strength/.test(blob)) return "strength";
  if (/general|fitness/.test(blob)) return "general";
  return "other";
}

function mapExperience(
  level: string | null,
): ExercisePrescriptionExperience | null {
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

function asWeakPoint(raw: string | null | undefined): WeakPointId {
  if (raw && (WEAK_POINTS as readonly string[]).includes(raw)) {
    return raw as WeakPointId;
  }
  return "none";
}

async function loadCurrentProgramSignals(athleteProfileId: string): Promise<{
  slugs: string[];
  patterns: string[];
}> {
  const program = await prisma.program.findFirst({
    where: { athleteProfileId, kind: "athlete", status: "active" },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        take: 1,
        include: {
          days: {
            include: {
              workout: {
                include: {
                  workoutExercises: {
                    include: {
                      exercise: {
                        select: {
                          slug: true,
                          movementPattern: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const slugs: string[] = [];
  const patterns: string[] = [];
  if (!program) return { slugs, patterns };

  for (const week of program.weeks) {
    for (const day of week.days) {
      for (const we of day.workout?.workoutExercises ?? []) {
        if (we.exercise.slug) slugs.push(we.exercise.slug);
        if (we.exercise.movementPattern) {
          patterns.push(we.exercise.movementPattern);
        }
      }
    }
  }

  return {
    slugs: [...new Set(slugs)],
    patterns: [...new Set(patterns)],
  };
}

export async function buildPrescriptionCandidates(): Promise<
  ExercisePrescriptionCandidate[]
> {
  const list = await listPublishedExercises();
  return list.map((e) => ({
    slug: e.slug,
    name: e.name,
    description: e.description,
    movementPattern: e.movementPattern,
    category: e.category,
    difficulty: e.difficulty,
    equipment: e.equipment,
    primaryMuscles: e.primaryMuscles,
    secondaryMuscles: e.secondaryMuscles,
    sportRelevance: e.sportRelevance as Record<string, string>,
    relatedSlugs: [],
  }));
}

export type ExercisePrescriptionView = {
  result: ExercisePrescriptionResult;
  weakPointOptions: { id: WeakPointId; label: string }[];
  profileDefaults: {
    goalLabel: string | null;
    experience: string | null;
    equipment: EquipmentKey[];
    sport: string | null;
    painFlags: boolean;
    techniqueLimitations: string | null;
  };
};

/**
 * Run exercise prescription for the athlete, optionally overriding weak point / goal.
 */
export async function getExercisePrescription(input: {
  userId: string;
  weakPoint?: string | null;
  goalOverride?: ExercisePrescriptionGoal | null;
}): Promise<ExercisePrescriptionView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
      trainingExperience: true,
    },
  });
  if (!profile) return null;

  const exp = profile.trainingExperience;
  const equipment = mapProfileEquipmentToCatalog(
    parseJsonStringArray(exp?.availableEquipment),
  );
  const program = await loadCurrentProgramSignals(profile.id);
  const candidates = await buildPrescriptionCandidates();

  const goal =
    input.goalOverride ??
    mapGoal(
      profile.goals[0]?.category ?? null,
      profile.goals[0]?.title ?? null,
      profile.primaryDiscipline,
    );

  const weakPoint = asWeakPoint(input.weakPoint);
  // Infer weak point from goal title when none selected
  let resolvedWeak = weakPoint;
  if (resolvedWeak === "none" && profile.goals[0]?.title) {
    const t = profile.goals[0].title.toLowerCase();
    if (/lockout/.test(t) && /deadlift/.test(t)) {
      resolvedWeak = "deadlift_lockout";
    } else if (/deadlift/.test(t)) {
      resolvedWeak = "posterior_chain";
    } else if (/squat/.test(t)) {
      resolvedWeak = "squat_strength";
    } else if (/bench/.test(t)) {
      resolvedWeak = "bench_press";
    }
  }

  const [injuryModActive, painSafeActive] = await Promise.all([
    isInjuryModificationActiveForAthlete(profile.id),
    isPainSafeModeActiveForAthlete(profile.id),
  ]);
  const limitationCaution =
    injuryModActive || Boolean(profile.movementNotes?.trim());

  const inputs: ExercisePrescriptionInputs = {
    goal,
    sport: profile.primaryDiscipline,
    weakPoint: resolvedWeak,
    equipment,
    experience: mapExperience(exp?.level ?? null),
    techniqueLimitations: limitationCaution
      ? profile.movementNotes?.trim() ||
        "User-declared training limitation active — prefer controlled options. Follow guidance from a qualified healthcare professional."
      : null,
    painFlags: limitationCaution || painSafeActive,
    currentProgramExerciseSlugs: program.slugs,
    currentProgramPatterns: program.patterns,
  };

  const result = recommendExercises({ inputs, candidates });

  return {
    result,
    weakPointOptions: WEAK_POINTS.map((id) => ({
      id,
      label: WEAK_POINT_LABELS[id],
    })),
    profileDefaults: {
      goalLabel: profile.goals[0]?.title ?? null,
      experience: exp?.level ?? null,
      equipment,
      sport: profile.primaryDiscipline,
      painFlags: Boolean(profile.movementNotes?.trim()),
      techniqueLimitations: profile.movementNotes,
    },
  };
}
