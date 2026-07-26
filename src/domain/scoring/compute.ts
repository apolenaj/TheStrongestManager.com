import { computeConsistencyScore } from "@/domain/scoring/engines/consistency";
import { computeOverallScore } from "@/domain/scoring/engines/overall";
import { computeProgrammingScore } from "@/domain/scoring/engines/programming";
import { computeRecoveryScore } from "@/domain/scoring/engines/recovery";
import { computeStrengthScore } from "@/domain/scoring/engines/strength";
import { computeTechniqueScore } from "@/domain/scoring/engines/technique";
import type { ScoreKey, ScoreResult, ScoringSnapshot } from "@/domain/scoring/types";

export type AthleteScoreSet = Record<ScoreKey, ScoreResult>;

/**
 * Run all conceptual score engines against a signal snapshot.
 * Pure domain entrypoint — no DB access.
 */
export function computeAthleteScores(
  snapshot: ScoringSnapshot,
): AthleteScoreSet {
  const strength = computeStrengthScore(snapshot);
  const technique = computeTechniqueScore(snapshot);
  const programming = computeProgrammingScore(snapshot);
  const recovery = computeRecoveryScore(snapshot);
  const consistency = computeConsistencyScore(snapshot);
  const overall = computeOverallScore(
    [strength, technique, programming, recovery, consistency],
    snapshot.now,
  );

  return {
    strength,
    technique,
    programming,
    recovery,
    consistency,
    overall,
  };
}
