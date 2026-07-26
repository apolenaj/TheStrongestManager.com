import type { MassUnit } from "@/services/units/convert";
import { formatMass } from "@/services/units/convert";

export type PreviousPerformanceSummary = {
  performedReps: number | null;
  performedLoadKg: number | null;
  performedRpe: number | null;
  completedAt: string | null;
  sessionLabel: string | null;
};

export type WorkoutSetView = {
  sessionSetId: string;
  setNumber: number;
  setType: string;
  prescribedReps: number | null;
  prescribedLoadKg: number | null;
  prescribedPercent: number | null;
  prescribedRpe: number | null;
  prescribedRir: number | null;
  prescribedRestSeconds: number | null;
  performedReps: number | null;
  performedLoadKg: number | null;
  performedRpe: number | null;
  performedRir: number | null;
  notes: string | null;
  completedAt: string | null;
  isComplete: boolean;
};

export type WorkoutExerciseView = {
  sessionExerciseId: string;
  exerciseId: string;
  exerciseSlug: string | null;
  name: string;
  sortOrder: number;
  targetSets: number | null;
  targetReps: string | null;
  targetLoadKg: number | null;
  targetPercent: number | null;
  targetRpe: number | null;
  targetRir: number | null;
  restSeconds: number | null;
  techniqueCue: string | null;
  previous: PreviousPerformanceSummary | null;
  sets: WorkoutSetView[];
};

export type WorkoutSessionView = {
  sessionId: string;
  status: string;
  title: string;
  goal: string | null;
  estimatedMinutes: number | null;
  units: MassUnit;
  programName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  prescriptionLocked: boolean;
  notes: string | null;
  exercises: WorkoutExerciseView[];
  completedSetCount: number;
  totalSetCount: number;
};

export type TodayWorkoutView = {
  units: MassUnit;
  goalTitle: string | null;
  /** Active in-progress session when present. */
  activeSessionId: string | null;
  /** Resolved prescription for today (may not be started yet). */
  prescription: {
    workoutId: string;
    programId: string | null;
    programDayId: string | null;
    title: string;
    goal: string | null;
    estimatedMinutes: number | null;
    programName: string | null;
    exerciseCount: number;
    exercisesPreview: Array<{
      name: string;
      targetSets: number | null;
      targetReps: string | null;
      targetLoadKg: number | null;
      targetRpe: number | null;
      targetRir: number | null;
      restSeconds: number | null;
      techniqueCue: string | null;
    }>;
  } | null;
  emptyReason: string | null;
};

/** Display helper for previous performance line (safe for client). */
export function formatPreviousLine(
  previous: PreviousPerformanceSummary | null,
  units: MassUnit,
): string | null {
  if (!previous) return null;
  const parts: string[] = [];
  if (previous.performedLoadKg != null) {
    parts.push(formatMass(previous.performedLoadKg, units));
  }
  if (previous.performedReps != null) {
    parts.push(`${previous.performedReps} reps`);
  }
  if (previous.performedRpe != null) {
    parts.push(`RPE ${previous.performedRpe}`);
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}
