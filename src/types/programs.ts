/**
 * Strict TypeScript shapes for commercial program marketplace JSON columns.
 * Mirrors ProgramTemplate / UserProgram / ProgramCompletion payloads in Prisma.
 */

export type UnitSystem = "kg" | "lb";

export type ProgramDifficulty = "beginner" | "intermediate" | "advanced";

export type RecoveryDemand = "low" | "moderate" | "high";

/** Lift key → training max in the athlete's unitSystem. */
export type TrainingMaxesJson = Record<string, number>;

export interface ProgramSetPrescription {
  /** Target or range low (inclusive). */
  reps: number;
  /** Optional upper bound for a rep range. */
  repsMax?: number;
  /** Rate of Perceived Exertion 1–10. */
  rpe?: number;
  /** Optional RPE ceiling when prescribing a band. */
  rpeMax?: number;
  /** Absolute load when not percentage-based. */
  weight?: number;
  /** % of training max (0–100+). */
  percentOfTm?: number;
  /** Soft set label, e.g. "warmup" | "work" | "backoff". */
  kind?: string;
  notes?: string;
}

export interface ProgramExercisePrescription {
  /** Stable exercise id or catalog slug. */
  exerciseId: string;
  name?: string;
  sets: ProgramSetPrescription[];
  /** Default RPE applied when a set omits rpe. */
  defaultRpe?: number;
  restSeconds?: number;
  tempo?: string;
  notes?: string;
}

export interface ProgramDayPrescription {
  /** 1-based day index within the week, or weekday key. */
  day: number | string;
  label?: string;
  focus?: string;
  exercises: ProgramExercisePrescription[];
  notes?: string;
}

export interface ProgramWeekPrescription {
  /** 1-based week number. */
  week: number;
  label?: string;
  theme?: string;
  days: ProgramDayPrescription[];
  notes?: string;
}

/** ProgramTemplate.weeks column. */
export type ProgramWeeksJson = ProgramWeekPrescription[];

export interface ProgramBlockPrescription {
  id: string;
  name: string;
  /** Inclusive week range covered by this block. */
  startWeek: number;
  endWeek: number;
  intent?: string;
  notes?: string;
}

/** ProgramTemplate.blocks column. */
export type ProgramBlocksJson = ProgramBlockPrescription[];

/**
 * Session is a concrete training bout (often 1:1 with a day, but may split AM/PM).
 * ProgramTemplate.sessions column.
 */
export interface ProgramSessionPrescription {
  id: string;
  /** Links to ProgramWeekPrescription.week. */
  week: number;
  /** Links to ProgramDayPrescription.day when applicable. */
  day?: number | string;
  label?: string;
  estimatedMinutes?: number;
  exercises: ProgramExercisePrescription[];
  notes?: string;
}

export type ProgramSessionsJson = ProgramSessionPrescription[];

export interface ProgramCompletionSummaryJson {
  weeksCompleted?: number;
  sessionsCompleted?: number;
  sessionsSkipped?: number;
  notes?: string;
  /** Optional lift → best logged estimate at completion. */
  finalEstimates?: TrainingMaxesJson;
}
