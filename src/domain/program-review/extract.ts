import type { ProgramStructureSignals } from "@/domain/program-review/types";
import { estimateSetsFromRepsTarget } from "@/domain/program-review/assemble";

export type ProgramGraphForReview = {
  id: string;
  name: string;
  kind: string;
  status: string;
  description: string | null;
  weeks: Array<{
    weekNumber: number;
    name: string | null;
    workoutId: string | null;
    workout: WorkoutNode | null;
    days: Array<{
      dayIndex: number;
      name: string | null;
      workoutId: string | null;
      workout: WorkoutNode | null;
    }>;
  }>;
  progressionRules: Array<{ ruleKind: string }>;
};

type WorkoutNode = {
  name: string;
  estimatedMinutes: number | null;
  workoutExercises: Array<{
    targetSets: number | null;
    targetReps: string | null;
    targetRpe: number | null;
    targetPercent: number | null;
    targetLoadKg: number | null;
    exercise: {
      name: string;
      movementPattern: string;
      category: string;
      difficulty: string;
      equipment: string;
    };
  }>;
};

function parseEquipmentJson(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

/**
 * Extract structural signals from a loaded program graph (pure).
 */
export function extractProgramStructureSignals(
  program: ProgramGraphForReview,
): ProgramStructureSignals {
  const exerciseLines: ProgramStructureSignals["exerciseLines"] = [];
  const dayAgg = new Map<
    number,
    {
      label: string;
      exerciseCount: number;
      estimatedSets: number;
      rpes: number[];
      percents: number[];
    }
  >();

  function ingestWorkout(
    workout: WorkoutNode,
    dayIndex: number | null,
    weekNumber: number | null,
    dayLabel: string,
  ) {
    for (const we of workout.workoutExercises) {
      const sets = estimateSetsFromRepsTarget(we.targetSets, we.targetReps);
      exerciseLines.push({
        name: we.exercise.name,
        movementPattern: we.exercise.movementPattern,
        category: we.exercise.category,
        difficulty: we.exercise.difficulty,
        equipment: parseEquipmentJson(we.exercise.equipment),
        targetSets: we.targetSets,
        targetReps: we.targetReps,
        targetRpe: we.targetRpe,
        targetPercent: we.targetPercent,
        targetLoadKg: we.targetLoadKg,
        dayIndex,
        weekNumber,
      });

      if (dayIndex != null) {
        const cur = dayAgg.get(dayIndex) ?? {
          label: dayLabel,
          exerciseCount: 0,
          estimatedSets: 0,
          rpes: [] as number[],
          percents: [] as number[],
        };
        cur.exerciseCount += 1;
        cur.estimatedSets += sets;
        if (we.targetRpe != null) cur.rpes.push(we.targetRpe);
        if (we.targetPercent != null) cur.percents.push(we.targetPercent);
        dayAgg.set(dayIndex, cur);
      }
    }
  }

  // Prefer first week that has ProgramDay rows; else flatten all days; else week.workout
  const weekWithDays =
    program.weeks.find((w) => w.days.some((d) => d.workout)) ??
    program.weeks.find((w) => w.days.length > 0) ??
    program.weeks[0] ??
    null;

  if (weekWithDays) {
    for (const day of weekWithDays.days) {
      if (day.workout) {
        ingestWorkout(
          day.workout,
          day.dayIndex,
          weekWithDays.weekNumber,
          day.name ?? `Day ${day.dayIndex}`,
        );
      }
    }
    if (
      weekWithDays.days.length === 0 &&
      weekWithDays.workout
    ) {
      ingestWorkout(
        weekWithDays.workout,
        1,
        weekWithDays.weekNumber,
        weekWithDays.name ?? "Week workout",
      );
    }
  }

  const trainingDaysPerWeek = [...dayAgg.values()].filter(
    (d) => d.exerciseCount > 0,
  ).length;

  const dayLoads = [...dayAgg.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayIndex, d]) => ({
      dayIndex,
      label: d.label,
      exerciseCount: d.exerciseCount,
      estimatedSets: d.estimatedSets,
      avgRpe:
        d.rpes.length > 0
          ? Math.round(
              (d.rpes.reduce((a, b) => a + b, 0) / d.rpes.length) * 10,
            ) / 10
          : null,
      avgPercent:
        d.percents.length > 0
          ? Math.round(
              d.percents.reduce((a, b) => a + b, 0) / d.percents.length,
            )
          : null,
    }));

  // If we ingested from multiple weeks accidentally, estimated weekly sets = first week only
  const estimatedWeeklySets = dayLoads.reduce(
    (s, d) => s + d.estimatedSets,
    0,
  );

  let totalWorkoutSlots = 0;
  for (const w of program.weeks) {
    if (w.days.length) {
      totalWorkoutSlots += w.days.filter((d) => d.workoutId || d.workout).length;
    } else if (w.workoutId || w.workout) {
      totalWorkoutSlots += 1;
    }
  }

  return {
    programId: program.id,
    name: program.name,
    kind: program.kind,
    status: program.status,
    description: program.description,
    weekCount: program.weeks.length,
    trainingDaysPerWeek,
    totalWorkoutSlots,
    exerciseLines,
    progressionRuleKinds: program.progressionRules.map((r) => r.ruleKind),
    dayLoads,
    estimatedWeeklySets,
    hasPercentPrescription: exerciseLines.some((e) => e.targetPercent != null),
    hasRpePrescription: exerciseLines.some((e) => e.targetRpe != null),
    hasLoadPrescription: exerciseLines.some((e) => e.targetLoadKg != null),
  };
}
