import type { ProgramStructureSignals } from "@/domain/program-review/types";
import type { TrainingAuditDraft } from "@/domain/training-audit/types";

/**
 * Map an imported draft into ProgramStructureSignals.
 * Never invents sets/reps/loads — nulls stay null.
 */
export function draftToProgramStructureSignals(
  draft: TrainingAuditDraft,
): ProgramStructureSignals {
  const exerciseLines = draft.lines.map((line) => ({
    name: line.exerciseName,
    movementPattern: line.movementPattern ?? "other",
    category: line.category ?? "other",
    difficulty: "unknown",
    equipment: [] as string[],
    targetSets: line.sets,
    targetReps: line.reps,
    targetRpe: line.rpe,
    targetPercent: line.percent,
    targetLoadKg: line.loadKg,
    dayIndex: line.dayIndex,
    weekNumber: 1,
  }));

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

  for (const line of draft.lines) {
    const cur = dayAgg.get(line.dayIndex) ?? {
      label: `Day ${line.dayIndex}`,
      exerciseCount: 0,
      estimatedSets: 0,
      rpes: [] as number[],
      percents: [] as number[],
    };
    cur.exerciseCount += 1;
    cur.estimatedSets += line.sets ?? 0;
    if (line.rpe != null) cur.rpes.push(line.rpe);
    if (line.percent != null) cur.percents.push(line.percent);
    dayAgg.set(line.dayIndex, cur);
  }

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

  const estimatedWeeklySets = dayLoads.reduce(
    (s, d) => s + d.estimatedSets,
    0,
  );

  return {
    programId: "training-audit-draft",
    name: draft.name,
    kind: "import",
    status: "draft",
    description: `Imported via ${draft.inputMode}`,
    weekCount: 1,
    trainingDaysPerWeek: dayLoads.filter((d) => d.exerciseCount > 0).length,
    totalWorkoutSlots: dayLoads.length,
    exerciseLines,
    progressionRuleKinds: [],
    dayLoads,
    estimatedWeeklySets,
    hasPercentPrescription: draft.lines.some((l) => l.percent != null),
    hasRpePrescription: draft.lines.some((l) => l.rpe != null),
    hasLoadPrescription: draft.lines.some((l) => l.loadKg != null),
  };
}
