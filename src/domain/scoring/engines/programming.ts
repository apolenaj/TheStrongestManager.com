import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import {
  buildResult,
  daysAgo,
  sessionAnchor,
} from "@/domain/scoring/result";
import {
  PROGRAMMING_MIN_RESOLVED_FOR_MEDIUM,
  SESSION_WINDOW_DAYS,
} from "@/domain/scoring/thresholds";
import type {
  ScoreInputRecord,
  ScoreResult,
  ScoringSnapshot,
} from "@/domain/scoring/types";

const def = SCORE_DEFINITIONS.programming;

export function computeProgrammingScore(
  snapshot: ScoringSnapshot,
): ScoreResult {
  const inputs: ScoreInputRecord[] = [
    {
      key: "activeProgramId",
      label: "Active program",
      value: snapshot.activeProgramName ?? snapshot.activeProgramId,
      source: "observed",
    },
  ];

  if (!snapshot.activeProgramId) {
    return buildResult({
      scoreKey: "programming",
      score: null,
      confidence: "none",
      inputs,
      missingInputs: ["Active program assigned"],
      explanation: "Programming Score not computed — no active program.",
      formulaId: "programming.adherence_ratio.v1",
      formulaDescription: def.formula,
      minimumData: def.requiredMinimumData,
      timestamp: snapshot.now,
    });
  }

  const windowStart = daysAgo(snapshot.now, SESSION_WINDOW_DAYS);
  const linked = snapshot.sessions.filter((s) => {
    if (s.programId !== snapshot.activeProgramId) return false;
    const when = sessionAnchor(s);
    return when != null && when >= windowStart;
  });

  const completed = linked.filter((s) => s.status === "completed");
  const skipped = linked.filter((s) => s.status === "skipped");
  const resolved = completed.length + skipped.length;

  inputs.push(
    {
      key: "completedProgramSessions",
      label: "Completed program sessions in window",
      value: completed.length,
      source: "observed",
    },
    {
      key: "skippedProgramSessions",
      label: "Skipped program sessions in window",
      value: skipped.length,
      source: "observed",
    },
    {
      key: "resolvedProgramSessions",
      label: "Resolved program sessions in window",
      value: resolved,
      source: "observed",
    },
  );

  if (resolved < PROGRAMMING_MIN_RESOLVED_FOR_MEDIUM) {
    return buildResult({
      scoreKey: "programming",
      score: null,
      confidence: "none",
      inputs,
      missingInputs: [
        `≥ ${PROGRAMMING_MIN_RESOLVED_FOR_MEDIUM} completed|skipped sessions linked to active program in ${SESSION_WINDOW_DAYS}d (have ${resolved})`,
      ],
      explanation:
        "Programming Score not computed — not enough resolved program-linked sessions.",
      formulaId: "programming.adherence_ratio.v1",
      formulaDescription: def.formula,
      minimumData: def.requiredMinimumData,
      notes: [`activeProgram=${snapshot.activeProgramName ?? snapshot.activeProgramId}`],
      timestamp: snapshot.now,
    });
  }

  const score = (100 * completed.length) / resolved;
  const confidence: ScoreResult["confidence"] =
    completed.length >= 1 ? "high" : "medium";

  return buildResult({
    scoreKey: "programming",
    score,
    confidence,
    inputs,
    missingInputs: [],
    explanation: `Programming Score = ${completed.length}/${resolved} program sessions completed in ${SESSION_WINDOW_DAYS}d.`,
    formulaId: "programming.adherence_ratio.v1",
    formulaDescription: def.formula,
    minimumData: def.requiredMinimumData,
    timestamp: snapshot.now,
  });
}
