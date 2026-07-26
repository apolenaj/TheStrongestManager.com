/**
 * Evaluate training load, performance, and recovery stress signals (pure).
 */

import {
  FATIGUE_ALERT_MIN_RECOVERY_SAMPLES,
  FATIGUE_ALERT_READINESS_DROP,
  FATIGUE_ALERT_READINESS_LOW,
  FATIGUE_ALERT_SIGNAL_LABELS,
  type FatigueAlertSignalKey,
} from "@/domain/fatigue-alert-system/constants";
import type { FatigueAlertSignalEvaluation } from "@/domain/fatigue-alert-system/types";

export type FatigueAlertSignalInputs = {
  loadSpikeFlagged: boolean;
  loadSpikeDetail: string | null;
  volumeTrendUp: boolean;
  performanceDirection: "up" | "down" | "flat" | null;
  performanceDetail: string | null;
  readinessRecentMean: number | null;
  readinessPriorMean: number | null;
  readinessSampleCount: number;
};

function evalSignal(
  key: FatigueAlertSignalKey,
  available: boolean,
  fired: boolean,
  detail: string,
): FatigueAlertSignalEvaluation {
  return {
    key,
    label: FATIGUE_ALERT_SIGNAL_LABELS[key],
    available,
    fired: available && fired,
    detail,
  };
}

export function evaluateFatigueAlertSignals(
  input: FatigueAlertSignalInputs,
): FatigueAlertSignalEvaluation[] {
  const recoveryAvailable =
    input.readinessRecentMean != null &&
    input.readinessSampleCount >= FATIGUE_ALERT_MIN_RECOVERY_SAMPLES;
  let recoveryFired = false;
  let recoveryDetail = "Not enough recovery readiness logs yet.";
  if (recoveryAvailable && input.readinessRecentMean != null) {
    const low = input.readinessRecentMean < FATIGUE_ALERT_READINESS_LOW;
    const drop =
      input.readinessPriorMean != null &&
      input.readinessPriorMean - input.readinessRecentMean >=
        FATIGUE_ALERT_READINESS_DROP;
    recoveryFired = low || drop;
    if (recoveryFired) {
      recoveryDetail = low
        ? `Readiness averaged ${input.readinessRecentMean.toFixed(0)} (below ${FATIGUE_ALERT_READINESS_LOW}).`
        : `Readiness eased ≥${FATIGUE_ALERT_READINESS_DROP} pts vs prior check-ins (${input.readinessPriorMean!.toFixed(0)} → ${input.readinessRecentMean.toFixed(0)}).`;
    } else {
      recoveryDetail = `Readiness averaged ${input.readinessRecentMean.toFixed(0)} — within a usual range for your recent logs.`;
    }
  }

  const loadAvailable = true;
  const loadFired =
    input.loadSpikeFlagged || (input.volumeTrendUp && recoveryFired);
  let loadDetail =
    input.loadSpikeDetail ??
    (input.loadSpikeFlagged
      ? "Estimated volume rose vs your recent baseline — a conservative load note, not an injury prediction."
      : "No sudden volume spike flagged in the recent window.");
  if (!input.loadSpikeFlagged && input.volumeTrendUp && recoveryFired) {
    loadDetail =
      "Volume trending up while recovery is softer — load context is worth a glance.";
  }

  const perfAvailable = input.performanceDirection != null;
  const perfFired = input.performanceDirection === "down";

  return [
    evalSignal("training_load", loadAvailable, loadFired, loadDetail),
    evalSignal(
      "performance",
      perfAvailable,
      perfFired,
      perfAvailable
        ? (input.performanceDetail ??
            `Performance trend: ${input.performanceDirection}.`)
        : "Performance trend not available yet.",
    ),
    evalSignal("recovery", recoveryAvailable, recoveryFired, recoveryDetail),
  ];
}
