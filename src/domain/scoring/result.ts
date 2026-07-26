import { SCORING_FORMULA_VERSION } from "@/domain/scoring/thresholds";
import type {
  ConfidenceLevel,
  ScoreInputRecord,
  ScoreKey,
  ScoreReasoning,
  ScoreResult,
} from "@/domain/scoring/types";

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function buildResult(args: {
  scoreKey: ScoreKey;
  score: number | null;
  confidence: ConfidenceLevel;
  inputs: ScoreInputRecord[];
  missingInputs: string[];
  explanation: string;
  formulaId: string;
  formulaDescription: string;
  minimumData: string[];
  notes?: string[];
  timestamp?: Date;
}): ScoreResult {
  const reasoning: ScoreReasoning = {
    formulaId: args.formulaId,
    formulaVersion: SCORING_FORMULA_VERSION,
    formulaDescription: args.formulaDescription,
    minimumData: args.minimumData,
    notes: args.notes ?? [],
  };

  return {
    scoreKey: args.scoreKey,
    score: args.score == null ? null : clampScore(args.score),
    confidence: args.confidence,
    inputs: args.inputs,
    missingInputs: args.missingInputs,
    explanation: args.explanation,
    timestamp: args.timestamp ?? new Date(),
    reasoning,
  };
}

export function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function sessionAnchor(session: {
  completedAt: Date | null;
  startedAt: Date | null;
  scheduledAt: Date | null;
}): Date | null {
  return session.completedAt ?? session.startedAt ?? session.scheduledAt;
}
