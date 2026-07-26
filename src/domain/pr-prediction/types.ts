/**
 * Conservative PR / estimated 1RM prediction types (Prompt 68).
 */

export type PrPredictionConfidence = "low" | "moderate" | "high";

export type TrainingPhaseHint =
  | "accumulation"
  | "intensification"
  | "peaking"
  | "deload"
  | "unknown";

export type PerformanceTrendHint =
  | "improving"
  | "stable"
  | "declining"
  | "unknown";

export type WorkingSetInput = {
  loadKg: number;
  reps: number;
  /** Athlete-logged RPE 0–10; null when not logged. */
  rpe: number | null;
  completedAt: Date;
  /** Whether performed reps met prescription; null if unknown. */
  hitRepTarget: boolean | null;
};

export type PrPredictionContext = {
  exerciseKey: string;
  exerciseLabel: string;
  workingSets: WorkingSetInput[];
  trend: PerformanceTrendHint;
  trainingPhase: TrainingPhaseHint;
  /** Latest subjective fatigue 1–10, or null. */
  fatigue: number | null;
  /** Latest readiness 0–100, or null. */
  readiness: number | null;
};

export type PrPrediction = {
  exerciseKey: string;
  exerciseLabel: string;
  /** Inclusive estimated 1RM range in kg — never a single point claim. */
  rangeKg: { low: number; high: number };
  confidence: PrPredictionConfidence;
  assumptions: string[];
  inputsUsed: {
    qualifyingSetCount: number;
    hardSetCount: number;
    setsWithRpe: number;
    medianE1rmKg: number;
    trend: PerformanceTrendHint;
    trainingPhase: TrainingPhaseHint;
    fatigue: number | null;
    readiness: number | null;
  };
};

export type PrPredictionWithheld = {
  exerciseKey: string;
  exerciseLabel: string;
  reason: string;
};

export type PrPredictionResult = {
  predictions: PrPrediction[];
  withheld: PrPredictionWithheld[];
  generatedAt: string;
};
