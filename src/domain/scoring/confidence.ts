import type { ConfidenceLevel, ScoreResult } from "@/domain/scoring/types";

/**
 * Display gate — product rule: never show a numeric score when confidence is too low.
 * `none` and `low` are hidden; `medium` and `high` may be shown.
 */
export const DISPLAYABLE_CONFIDENCE: readonly ConfidenceLevel[] = [
  "medium",
  "high",
] as const;

export function isConfidenceDisplayable(
  confidence: ConfidenceLevel,
): boolean {
  return confidence === "medium" || confidence === "high";
}

/**
 * Value safe for athlete-facing UI. Returns null when missing or confidence too low.
 */
export function displayableScore(result: ScoreResult): number | null {
  if (result.score == null) return null;
  if (!isConfidenceDisplayable(result.confidence)) return null;
  return result.score;
}

export function confidenceRank(level: ConfidenceLevel): number {
  switch (level) {
    case "none":
      return 0;
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
  }
}

export function minConfidence(
  levels: ConfidenceLevel[],
): ConfidenceLevel {
  if (levels.length === 0) return "none";
  return levels.reduce((min, level) =>
    confidenceRank(level) < confidenceRank(min) ? level : min,
  );
}
