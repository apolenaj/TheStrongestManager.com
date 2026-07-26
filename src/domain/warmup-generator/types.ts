import type { WarmupExerciseId } from "@/domain/warmup-generator/constants";

export type WarmupHistorySignal = {
  /** Distinct training days with this exercise in lookback. */
  sessionCount: number;
  /** Sum of loadKg × reps for working sets in lookback. */
  volumeKgReps: number;
  /** Heaviest logged set load in lookback (kg). */
  heaviestLoadKg: number | null;
  /** Most recent session date ISO, if any. */
  lastTrainedAt: string | null;
};

export type WarmupGeneratorInput = {
  targetWorkingWeightKg: number;
  exerciseId: WarmupExerciseId;
  exerciseLabel: string;
  history: WarmupHistorySignal | null;
  /**
   * Prefer fewer sets when true — also auto-set from history volume.
   * Defaults conservative.
   */
  preferFewerSets?: boolean;
};

export type WarmupSetPlan = {
  id: string;
  order: number;
  loadKg: number;
  reps: number;
  label: string;
  /** Fraction of target used to derive default load (null if user-edited). */
  fractionOfTarget: number | null;
  userModified: boolean;
};

export type WarmupPlan = {
  exerciseId: WarmupExerciseId;
  exerciseLabel: string;
  targetWorkingWeightKg: number;
  sets: WarmupSetPlan[];
  usedFatigueLadder: boolean;
  historySummary: string;
  notes: string[];
  honesty: readonly string[];
};

export type WarmupGeneratorResult =
  | { ok: true; plan: WarmupPlan }
  | { ok: false; reason: string };

export type WarmupGeneratorSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  maxSets: number;
  topFractionCap: number;
  defaultLadderSteps: number;
  fatigueLadderSteps: number;
  knownExercises: Array<{ id: WarmupExerciseId; label: string }>;
  docPath: "docs/WARMUP_GENERATOR.md";
  generatedAt: string;
};
