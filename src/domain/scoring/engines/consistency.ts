import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import {
  buildResult,
  daysAgo,
  sessionAnchor,
} from "@/domain/scoring/result";
import {
  CONSISTENCY_MIN_RESOLVED_FOR_HIGH,
  CONSISTENCY_MIN_RESOLVED_FOR_MEDIUM,
  SESSION_WINDOW_DAYS,
} from "@/domain/scoring/thresholds";
import type { ScoreResult, ScoringSnapshot } from "@/domain/scoring/types";

const def = SCORE_DEFINITIONS.consistency;

export function computeConsistencyScore(
  snapshot: ScoringSnapshot,
): ScoreResult {
  const windowStart = daysAgo(snapshot.now, SESSION_WINDOW_DAYS);
  const inWindow = snapshot.sessions.filter((s) => {
    const when = sessionAnchor(s);
    return when != null && when >= windowStart;
  });

  const completed = inWindow.filter((s) => s.status === "completed");
  const skipped = inWindow.filter((s) => s.status === "skipped");
  const resolved = completed.length + skipped.length;

  const inputs = [
    {
      key: "completedSessions",
      label: "Completed sessions in window",
      value: completed.length,
      source: "observed" as const,
    },
    {
      key: "skippedSessions",
      label: "Skipped sessions in window",
      value: skipped.length,
      source: "observed" as const,
    },
    {
      key: "resolvedSessions",
      label: "Resolved sessions in window",
      value: resolved,
      source: "observed" as const,
    },
  ];

  if (resolved < CONSISTENCY_MIN_RESOLVED_FOR_MEDIUM) {
    return buildResult({
      scoreKey: "consistency",
      score: null,
      confidence: "none",
      inputs,
      missingInputs: [
        `≥ ${CONSISTENCY_MIN_RESOLVED_FOR_MEDIUM} completed|skipped sessions in ${SESSION_WINDOW_DAYS}d (have ${resolved})`,
      ],
      explanation:
        "Consistency Score not computed — not enough resolved sessions.",
      formulaId: "consistency.completion_ratio.v1",
      formulaDescription: def.formula,
      minimumData: def.requiredMinimumData,
      timestamp: snapshot.now,
    });
  }

  const score = (100 * completed.length) / resolved;
  const confidence: ScoreResult["confidence"] =
    resolved >= CONSISTENCY_MIN_RESOLVED_FOR_HIGH ? "high" : "medium";

  return buildResult({
    scoreKey: "consistency",
    score,
    confidence,
    inputs,
    missingInputs: [],
    explanation: `Consistency Score = ${completed.length}/${resolved} sessions completed in ${SESSION_WINDOW_DAYS}d (planned sessions excluded).`,
    formulaId: "consistency.completion_ratio.v1",
    formulaDescription: def.formula,
    minimumData: def.requiredMinimumData,
    notes: [`highResolvedThreshold=${CONSISTENCY_MIN_RESOLVED_FOR_HIGH}`],
    timestamp: snapshot.now,
  });
}
