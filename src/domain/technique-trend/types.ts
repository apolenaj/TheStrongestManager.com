import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { DeadliftTechniqueComponentId } from "@/domain/movement/deadlift/score/thresholds";

export type TechniqueTrendDirection = "up" | "down" | "flat" | "unknown";

export type MetricTrendStatus = "improved" | "stable" | "regressed";

export type TechniqueTrendSample = {
  analysisId: string;
  createdAtIso: string;
  exerciseSlug: string;
  exerciseName: string;
  cameraAngle: string;
  overallScore: number;
  confidence: ConfidenceLevel;
  components: Array<{
    id: DeadliftTechniqueComponentId | string;
    label: string;
    score: number;
  }>;
  href: string;
};

export type TechniqueScorePoint = {
  analysisId: string;
  createdAtIso: string;
  score: number;
  href: string;
};

export type ComponentTrend = {
  id: string;
  label: string;
  status: MetricTrendStatus;
  /** Chronological scores for samples where this component was observed. */
  scores: number[];
  delta: number;
  firstScore: number;
  latestScore: number;
};

export type TechniqueTrendHighlight = {
  id: string;
  label: string;
  detail: string;
  scores: number[];
  delta: number | null;
};

export type TechniqueTrendSeries = {
  id: string;
  exerciseSlug: string;
  exerciseName: string;
  cameraAngle: string;
  /** e.g. Deadlift Technique Score: 72 76 79 83 */
  overallScores: TechniqueScorePoint[];
  direction: TechniqueTrendDirection;
  overallDelta: number | null;
  confidence: ConfidenceLevel;
  improved: ComponentTrend[];
  stable: ComponentTrend[];
  regressed: ComponentTrend[];
  mostImproved: TechniqueTrendHighlight | null;
  persistentIssue: TechniqueTrendHighlight | null;
  excludedIncompatibleCount: number;
  missingInformation: string[];
};

export type TechniqueTrendResult = {
  engineVersion: string;
  series: TechniqueTrendSeries[];
  honesty: readonly string[];
  emptyReason: string | null;
  /** Analyses skipped because angle was ineligible or lacked a score. */
  skippedSummary: string | null;
};
