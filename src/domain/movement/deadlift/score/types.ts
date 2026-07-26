import type { ConfidenceLevel } from "@/domain/movement/types";
import type { DeadliftTechniqueComponentId } from "@/domain/movement/deadlift/score/thresholds";
import { DEADLIFT_TECHNIQUE_WEIGHTS } from "@/domain/movement/deadlift/score/thresholds";

export type DeadliftComponentResult = {
  id: DeadliftTechniqueComponentId;
  label: string;
  /** 0–100 when observed; null when unavailable. */
  score: number | null;
  /** Nominal catalog weight. */
  weight: number;
  /** Weight after dropping unavailable components (0 if unavailable). */
  effectiveWeight: number;
  status: "observed" | "unavailable";
  unavailableReason?: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  evidence: string;
  /** Underlying movement metric keys used, if any. */
  sourceMetricKeys: string[];
};

export type DeadliftTechniqueAssessment = {
  formulaId: string;
  formulaVersion: string;
  /** 0–100 when enough components observed; otherwise null. */
  score: number | null;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  components: DeadliftComponentResult[];
  metricsObserved: string[];
  metricsUnavailable: string[];
  keyIssue: string | null;
  positiveFindings: string[];
  recommendations: string[];
  assumptions: string[];
};

export function nominalWeight(id: DeadliftTechniqueComponentId): number {
  return DEADLIFT_TECHNIQUE_WEIGHTS[id];
}

/** Map a “lower is better” raw value into 0–100 between excellent and poor caps. */
export function scoreLowerIsBetter(
  value: number,
  excellent: number,
  poor: number,
): number {
  if (value <= excellent) return 100;
  if (value >= poor) return 0;
  return Math.round(100 * (1 - (value - excellent) / (poor - excellent)));
}

/** Map a “higher is better” raw value into 0–100. */
export function scoreHigherIsBetter(
  value: number,
  excellent: number,
  poor: number,
): number {
  if (value >= excellent) return 100;
  if (value <= poor) return 0;
  return Math.round(100 * ((value - poor) / (excellent - poor)));
}

export function scoreInBand(
  value: number,
  min: number,
  max: number,
): number {
  if (value >= min && value <= max) return 100;
  if (value < min) {
    return scoreHigherIsBetter(value, min, 0);
  }
  const over = value - max;
  return scoreLowerIsBetter(over, 0, Math.max(max, 0.2));
}
