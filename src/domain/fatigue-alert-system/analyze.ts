/**
 * Map multi-signal inputs to conservative fatigue alert levels.
 */

import {
  FATIGUE_ALERT_ENGINE_VERSION,
  FATIGUE_ALERT_HONESTY,
  FATIGUE_ALERT_LEVEL_LABELS,
  FATIGUE_ALERT_LEVEL_TITLES,
  type FatigueAlertLevel,
} from "@/domain/fatigue-alert-system/constants";
import {
  canEscalateFatigueAlert,
  fatigueAlertGateReason,
} from "@/domain/fatigue-alert-system/gate";
import {
  evaluateFatigueAlertSignals,
  type FatigueAlertSignalInputs,
} from "@/domain/fatigue-alert-system/signals";
import type { FatigueAlertAnalysis } from "@/domain/fatigue-alert-system/types";

function mapLevel(input: {
  canEscalate: boolean;
  signalsFired: number;
  loadFired: boolean;
  performanceFired: boolean;
  recoveryFired: boolean;
}): FatigueAlertLevel {
  if (!input.canEscalate || input.signalsFired === 0) {
    return "normal";
  }
  if (input.signalsFired === 1) {
    return "watch";
  }
  if (
    input.signalsFired >= 3 ||
    (input.loadFired && input.performanceFired && input.recoveryFired)
  ) {
    return "high_concern";
  }
  // Exactly 2 signals
  return "elevated";
}

function summaryFor(
  level: FatigueAlertLevel,
  windowLabel: string,
  firedLabels: string[],
): string {
  switch (level) {
    case "normal":
      return "Training load, performance, and recovery signals are within usual ranges for your recent logs.";
    case "watch":
      return `One area shifted recently (${firedLabels.join(", ") || "signal"}). Patterns can fluctuate — keep logging and review if it persists.`;
    case "elevated":
      return `${firedLabels.length} areas moved together over ${windowLabel}: ${firedLabels.join(", ")}. Consider easing intensity or prioritizing recovery — your call.`;
    case "high_concern":
      return "Load, performance, and recovery signals all suggest elevated training stress in your logs. Review recovery habits and upcoming sessions — this is not a medical diagnosis.";
  }
}

function confidenceFrom(input: {
  canEscalate: boolean;
  signalsAvailable: number;
  signalsFired: number;
}): FatigueAlertAnalysis["confidence"] {
  if (!input.canEscalate) return "none";
  if (input.signalsFired >= 3 && input.signalsAvailable >= 3) return "high";
  if (input.signalsFired >= 2) return "medium";
  if (input.signalsFired === 1) return "low";
  return "low";
}

/**
 * Pure fatigue alert analysis — never mutates a program, never medical.
 */
export function analyzeFatigueAlert(input: {
  windowLabel: string;
  sessionCount: number;
  signals: FatigueAlertSignalInputs;
}): FatigueAlertAnalysis {
  const signals = evaluateFatigueAlertSignals(input.signals);
  const signalsFired = signals.filter((s) => s.fired).length;
  const signalsAvailable = signals.filter((s) => s.available).length;
  const canEscalate = canEscalateFatigueAlert({
    sessionCount: input.sessionCount,
    signalsAvailable,
  });
  const suppressedReason = canEscalate
    ? null
    : fatigueAlertGateReason({
        sessionCount: input.sessionCount,
        signalsAvailable,
      });

  const level = mapLevel({
    canEscalate,
    signalsFired,
    loadFired: signals.find((s) => s.key === "training_load")?.fired ?? false,
    performanceFired:
      signals.find((s) => s.key === "performance")?.fired ?? false,
    recoveryFired: signals.find((s) => s.key === "recovery")?.fired ?? false,
  });

  const firedLabels = signals.filter((s) => s.fired).map((s) => s.label);
  const explanation: string[] = [];

  if (!canEscalate) {
    explanation.push(
      suppressedReason ??
        "Not enough logged sessions and recovery check-ins for a fatigue level yet.",
    );
    explanation.push(
      "Showing Normal awareness until more signals are available — one workout is never enough.",
    );
  } else {
    explanation.push(summaryFor(level, input.windowLabel, firedLabels));
    for (const s of signals) {
      explanation.push(`${s.label}: ${s.detail}`);
    }
  }

  return {
    engineVersion: FATIGUE_ALERT_ENGINE_VERSION,
    windowLabel: input.windowLabel,
    level,
    levelLabel: FATIGUE_ALERT_LEVEL_LABELS[level],
    title: FATIGUE_ALERT_LEVEL_TITLES[level],
    summary: summaryFor(level, input.windowLabel, firedLabels),
    explanation,
    signals,
    signalsFired: canEscalate ? signalsFired : 0,
    signalsAvailable,
    sessionCount: input.sessionCount,
    publishable: canEscalate,
    suppressedReason,
    confidence: confidenceFrom({
      canEscalate,
      signalsAvailable,
      signalsFired: canEscalate ? signalsFired : 0,
    }),
    honesty: FATIGUE_ALERT_HONESTY,
  };
}
