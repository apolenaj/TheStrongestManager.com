import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import { buildResult, daysAgo, mean } from "@/domain/scoring/result";
import {
  RECOVERY_MIN_ENTRIES_FOR_HIGH,
  RECOVERY_MIN_ENTRIES_FOR_MEDIUM,
  RECOVERY_WINDOW_DAYS,
} from "@/domain/scoring/thresholds";
import type { ScoreResult, ScoringSnapshot } from "@/domain/scoring/types";

const def = SCORE_DEFINITIONS.recovery;

export function computeRecoveryScore(snapshot: ScoringSnapshot): ScoreResult {
  const windowStart = daysAgo(snapshot.now, RECOVERY_WINDOW_DAYS);
  const inWindow = snapshot.recoveryEntries.filter(
    (e) => e.recordedAt >= windowStart,
  );

  const inputs = inWindow.map((e, index) => ({
    key: `readiness[${index}]`,
    label: "Readiness",
    value: e.readiness,
    unit: "points",
    source: e.source,
  }));

  if (inWindow.length < RECOVERY_MIN_ENTRIES_FOR_MEDIUM) {
    return buildResult({
      scoreKey: "recovery",
      score: null,
      confidence: "none",
      inputs,
      missingInputs: [
        `≥ ${RECOVERY_MIN_ENTRIES_FOR_MEDIUM} readiness logs in ${RECOVERY_WINDOW_DAYS}d (have ${inWindow.length})`,
      ],
      explanation:
        "Recovery Score not computed — not enough readiness logs in window.",
      formulaId: "recovery.mean_readiness.v1",
      formulaDescription: def.formula,
      minimumData: def.requiredMinimumData,
      timestamp: snapshot.now,
    });
  }

  const score = mean(inWindow.map((e) => e.readiness));
  const confidence: ScoreResult["confidence"] =
    inWindow.length >= RECOVERY_MIN_ENTRIES_FOR_HIGH ? "high" : "medium";

  return buildResult({
    scoreKey: "recovery",
    score,
    confidence,
    inputs,
    missingInputs: [],
    explanation: `Recovery Score is the mean of ${inWindow.length} readiness log(s) in ${RECOVERY_WINDOW_DAYS}d.`,
    formulaId: "recovery.mean_readiness.v1",
    formulaDescription: def.formula,
    minimumData: def.requiredMinimumData,
    timestamp: snapshot.now,
  });
}
