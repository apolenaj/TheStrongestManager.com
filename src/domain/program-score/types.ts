import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { ProgramScoreComponentId } from "@/domain/program-score/thresholds";
import {
  PROGRAM_SCORE_COMPONENT_LABELS,
  PROGRAM_SCORE_WEIGHTS,
} from "@/domain/program-score/thresholds";

export type ProgramScoreComponent = {
  id: ProgramScoreComponentId;
  label: string;
  /** 0–100 when observed; null when unavailable. */
  score: number | null;
  weight: number;
  /** Weight after dropping unavailable components (0 if unavailable). */
  effectiveWeight: number;
  status: "observed" | "unavailable";
  unavailableReason?: string;
  confidence: ConfidenceLevel;
  evidence: string;
};

export type ProgramScoreSubscore = {
  id: ProgramScoreComponentId;
  label: string;
  score: number | null;
  weight: number;
  effectiveWeight: number;
  status: "observed" | "unavailable";
};

/**
 * Transparent Training Program Score result (Prompt 57).
 * Matches the required contract: overallScore, subscores, confidence, reasoning, missingInformation.
 */
export type ProgramScoreResult = {
  formulaId: string;
  formulaVersion: string;
  /** 0–100 weighted mean of observed components, or null if minima unmet. */
  overallScore: number | null;
  /** Alias of overallScore for callers that expect `score`. */
  score: number | null;
  confidence: ConfidenceLevel;
  components: ProgramScoreComponent[];
  /** Compact subscore list (same components). */
  subscores: ProgramScoreSubscore[];
  missingInformation: string[];
  explanation: string;
  reasoning: {
    formulaId: string;
    formulaVersion: string;
    formulaDescription: string;
    minimumData: readonly string[];
    notes: string[];
    assumptions: readonly string[];
  };
};

export function nominalWeight(id: ProgramScoreComponentId): number {
  return PROGRAM_SCORE_WEIGHTS[id];
}

export function componentLabel(id: ProgramScoreComponentId): string {
  return PROGRAM_SCORE_COMPONENT_LABELS[id];
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
