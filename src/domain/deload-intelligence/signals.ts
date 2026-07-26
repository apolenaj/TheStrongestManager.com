/**
 * Evaluate individual deload stress signals (pure).
 */

import {
  DELOAD_MISSED_REP_RATE,
  DELOAD_READINESS_DROP,
  DELOAD_READINESS_LOW,
  DELOAD_RPE_HIGH,
  DELOAD_SIGNAL_LABELS,
  type DeloadSignalKey,
} from "@/domain/deload-intelligence/constants";
import type { DeloadSignalEvaluation } from "@/domain/deload-intelligence/types";

export type DeloadSignalInputs = {
  /** Strength / performance trend direction when available. */
  performanceDirection: "up" | "down" | "flat" | null;
  performanceDetail: string | null;
  /** Mean session RPE in window. */
  sessionRpeMean: number | null;
  /** Optional mean target RPE. */
  targetRpeMean: number | null;
  /** Sessions with RPE logged. */
  sessionsWithRpe: number;
  /** Mean readiness 0–100 (recent). */
  readinessRecentMean: number | null;
  /** Mean readiness prior period (for decline). */
  readinessPriorMean: number | null;
  readinessSampleCount: number;
  /** Fraction of sets that missed prescribed reps (0–1). */
  missedRepRate: number | null;
  setsWithRepComparison: number;
  /** Training load spike flagged by existing heuristic. */
  loadSpikeFlagged: boolean;
  loadSpikeDetail: string | null;
  /** Volume trending up sharply with thin recovery — optional soft load signal. */
  volumeTrendUp: boolean;
};

function evalSignal(
  key: DeloadSignalKey,
  available: boolean,
  fired: boolean,
  detail: string,
): DeloadSignalEvaluation {
  return {
    key,
    label: DELOAD_SIGNAL_LABELS[key],
    available,
    fired: available && fired,
    detail,
  };
}

export function evaluateDeloadSignals(
  input: DeloadSignalInputs,
): DeloadSignalEvaluation[] {
  const perfAvailable = input.performanceDirection != null;
  const perfFired = input.performanceDirection === "down";

  const rpeAvailable =
    input.sessionRpeMean != null && input.sessionsWithRpe >= 2;
  let rpeFired = false;
  let rpeDetail = "Not enough session RPE logs.";
  if (rpeAvailable && input.sessionRpeMean != null) {
    if (input.targetRpeMean != null) {
      rpeFired = input.sessionRpeMean >= input.targetRpeMean + 0.75;
      rpeDetail = rpeFired
        ? `Session RPE mean ${input.sessionRpeMean.toFixed(1)} ran ≥0.75 above target ${input.targetRpeMean.toFixed(1)} across ${input.sessionsWithRpe} sessions.`
        : `Session RPE mean ${input.sessionRpeMean.toFixed(1)} vs target ${input.targetRpeMean.toFixed(1)} — not elevated enough across the window.`;
    } else {
      rpeFired = input.sessionRpeMean >= DELOAD_RPE_HIGH;
      rpeDetail = rpeFired
        ? `Session RPE mean ${input.sessionRpeMean.toFixed(1)} ≥ ${DELOAD_RPE_HIGH} across ${input.sessionsWithRpe} sessions.`
        : `Session RPE mean ${input.sessionRpeMean.toFixed(1)} — not elevated across the window.`;
    }
  }

  const recoveryAvailable =
    input.readinessRecentMean != null && input.readinessSampleCount >= 2;
  let recoveryFired = false;
  let recoveryDetail = "Not enough recovery readiness logs.";
  if (recoveryAvailable && input.readinessRecentMean != null) {
    const low = input.readinessRecentMean < DELOAD_READINESS_LOW;
    const drop =
      input.readinessPriorMean != null &&
      input.readinessPriorMean - input.readinessRecentMean >=
        DELOAD_READINESS_DROP;
    recoveryFired = low || drop;
    if (recoveryFired) {
      recoveryDetail = low
        ? `Readiness averaged ${input.readinessRecentMean.toFixed(0)} (below ${DELOAD_READINESS_LOW}).`
        : `Readiness dropped ≥${DELOAD_READINESS_DROP} pts vs prior period (${input.readinessPriorMean!.toFixed(0)} → ${input.readinessRecentMean.toFixed(0)}).`;
    } else {
      recoveryDetail = `Readiness averaged ${input.readinessRecentMean.toFixed(0)} — not a recovery stress signal.`;
    }
  }

  const missedAvailable =
    input.missedRepRate != null && input.setsWithRepComparison >= 6;
  let missedFired = false;
  let missedDetail = "Not enough prescribed-vs-performed rep comparisons.";
  if (missedAvailable && input.missedRepRate != null) {
    missedFired = input.missedRepRate >= DELOAD_MISSED_REP_RATE;
    missedDetail = missedFired
      ? `Missed-rep rate ${(input.missedRepRate * 100).toFixed(0)}% across ${input.setsWithRepComparison} sets (≥${(DELOAD_MISSED_REP_RATE * 100).toFixed(0)}%).`
      : `Missed-rep rate ${(input.missedRepRate * 100).toFixed(0)}% — below sustained threshold.`;
  }

  const loadAvailable = true; // spike assessment always returns a boolean
  const loadFired =
    input.loadSpikeFlagged ||
    (input.volumeTrendUp && recoveryFired);
  let loadDetail =
    input.loadSpikeDetail ??
    (input.loadSpikeFlagged
      ? "Recent volume spike vs baseline."
      : "No training-load spike flagged.");
  if (!input.loadSpikeFlagged && input.volumeTrendUp && recoveryFired) {
    loadDetail =
      "Volume trending up while recovery is stressed — load context supports a lighter week.";
  }

  return [
    evalSignal(
      "performance_trend",
      perfAvailable,
      perfFired,
      perfAvailable
        ? (input.performanceDetail ??
            `Performance trend: ${input.performanceDirection}.`)
        : "Performance trend unavailable.",
    ),
    evalSignal("rpe", rpeAvailable, rpeFired, rpeDetail),
    evalSignal("recovery", recoveryAvailable, recoveryFired, recoveryDetail),
    evalSignal("missed_reps", missedAvailable, missedFired, missedDetail),
    evalSignal("training_load", loadAvailable, loadFired, loadDetail),
  ];
}
