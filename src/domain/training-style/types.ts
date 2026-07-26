import type { ConfidenceLevel } from "@/domain/scoring/types";
import type {
  FrequencyBand,
  IntensityBand,
  TrainingStyleDimensionId,
  TrainingStyleSourceKind,
  VolumeToleranceBand,
} from "@/domain/training-style/constants";

export type TrainingStyleDimension = {
  id: TrainingStyleDimensionId;
  label: string;
  /** Human-readable band for UI. */
  bandLabel: string;
  band: IntensityBand | FrequencyBand | VolumeToleranceBand | null;
  confidence: ConfidenceLevel;
  source: TrainingStyleSourceKind;
  evidence: string[];
  missingNote: string | null;
};

export type TrainingStyleProfilePayload = {
  engineVersion: string;
  lookbackDays: number;
  generatedAtIso: string;
  /** One-line practical summary, e.g. "High-intensity · Moderate frequency · Low volume tolerance". */
  summaryLine: string | null;
  dimensions: TrainingStyleDimension[];
  statedChoices: {
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    coachingStatus: string | null;
  };
  honesty: readonly string[];
};

/** Raw signals for pure assembly. */
export type TrainingStyleSignals = {
  now: Date;
  lookbackDays: number;
  stated: {
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    coachingStatus: string | null;
  };
  /** Completed sessions in lookback. */
  completedSessions: number;
  skippedSessions: number;
  /** Distinct UTC days with a completed session. */
  trainingDays: number;
  /** Mean RPE from sets / session PE when available. */
  meanRpe: number | null;
  rpeSampleCount: number;
  /** Mean sets per completed session (proxy for session volume). */
  meanSetsPerSession: number | null;
  /** Adaptation decisions in window. */
  acceptedReduceVolume: number;
  acceptedIncreaseVolume: number;
  acceptedIncreaseLoad: number;
  acceptedReduceLoad: number;
  declinedIncreaseLoad: number;
  declinedReduceVolume: number;
  /** Athlete model-feedback on adaptations: helpful vs not. */
  feedbackHelpful: number;
  feedbackNotHelpful: number;
};
