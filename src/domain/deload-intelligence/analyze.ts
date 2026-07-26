/**
 * Assemble deload recommendation from multi-signal evaluation.
 */

import {
  DELOAD_HOLD_LABEL,
  DELOAD_INSUFFICIENT_LABEL,
  DELOAD_INTELLIGENCE_ENGINE_VERSION,
  DELOAD_INTELLIGENCE_HONESTY,
  DELOAD_MIN_SESSIONS,
  DELOAD_MIN_SIGNALS_FIRED,
  DELOAD_RECOMMENDATION_LABEL,
} from "@/domain/deload-intelligence/constants";
import {
  canPublishDeloadRecommendation,
  deloadGateReason,
} from "@/domain/deload-intelligence/gate";
import {
  evaluateDeloadSignals,
  type DeloadSignalInputs,
} from "@/domain/deload-intelligence/signals";
import type { DeloadIntelligenceAnalysis } from "@/domain/deload-intelligence/types";

function confidenceFrom(input: {
  signalsAvailable: number;
  signalsFired: number;
  sessionCount: number;
  publishable: boolean;
}): DeloadIntelligenceAnalysis["confidence"] {
  if (!input.publishable) return "none";
  if (input.signalsFired >= 4 && input.signalsAvailable >= 4) return "high";
  if (input.signalsFired >= 3 || input.sessionCount >= 6) return "medium";
  return "low";
}

/**
 * Pure deload recommendation — never mutates a program.
 */
export function analyzeDeloadIntelligence(input: {
  windowLabel: string;
  sessionCount: number;
  recentDeload: boolean;
  signals: DeloadSignalInputs;
}): DeloadIntelligenceAnalysis {
  const signals = evaluateDeloadSignals(input.signals);
  const signalsFired = signals.filter((s) => s.fired).length;
  const signalsAvailable = signals.filter((s) => s.available).length;

  const publishable = canPublishDeloadRecommendation({
    sessionCount: input.sessionCount,
    signalsFired,
    recentDeload: input.recentDeload,
  });
  const suppressedReason = deloadGateReason({
    sessionCount: input.sessionCount,
    signalsFired,
    recentDeload: input.recentDeload,
  });

  let status: DeloadIntelligenceAnalysis["status"] = "hold";
  let recommendationLabel: string = DELOAD_HOLD_LABEL;

  if (input.recentDeload) {
    status = "suppressed_recent_deload";
    recommendationLabel = DELOAD_HOLD_LABEL;
  } else if (
    input.sessionCount < DELOAD_MIN_SESSIONS ||
    signalsAvailable < 2
  ) {
    status = "insufficient";
    recommendationLabel = DELOAD_INSUFFICIENT_LABEL;
  } else if (publishable) {
    status = "consider";
    recommendationLabel = DELOAD_RECOMMENDATION_LABEL;
  } else {
    status = "hold";
    recommendationLabel = DELOAD_HOLD_LABEL;
  }

  const explanation: string[] = [];
  if (status === "consider") {
    explanation.push(
      `${DELOAD_RECOMMENDATION_LABEL} — ${signalsFired} stress signals aligned over ${input.windowLabel}. This is a coaching cue; you choose whether to run an easier week.`,
    );
    for (const s of signals.filter((x) => x.fired)) {
      explanation.push(`${s.label}: ${s.detail}`);
    }
    explanation.push(
      "Not applied automatically. Review the deload decision tree or adaptations if you want to act.",
    );
  } else if (status === "suppressed_recent_deload") {
    explanation.push(
      suppressedReason ??
        "Recent deload already accepted — another cue is held.",
    );
  } else if (status === "insufficient") {
    explanation.push(
      suppressedReason ??
        "Log more sessions, RPE, recovery, and sets before a deload cue can be considered.",
    );
    explanation.push(
      "One bad workout will never trigger a recommendation on its own.",
    );
  } else {
    explanation.push(
      `${DELOAD_HOLD_LABEL}. ${signalsFired} of ${DELOAD_MIN_SIGNALS_FIRED} required stress signals fired across ${input.sessionCount} sessions.`,
    );
    for (const s of signals) {
      explanation.push(
        `${s.label}: ${s.available ? s.detail : "Unavailable — not counted."}`,
      );
    }
  }

  return {
    engineVersion: DELOAD_INTELLIGENCE_ENGINE_VERSION,
    windowLabel: input.windowLabel,
    status,
    recommendationLabel,
    explanation,
    signals,
    signalsFired,
    signalsAvailable,
    sessionCount: input.sessionCount,
    publishable,
    suppressedReason,
    confidence: confidenceFrom({
      signalsAvailable,
      signalsFired,
      sessionCount: input.sessionCount,
      publishable,
    }),
    honesty: DELOAD_INTELLIGENCE_HONESTY,
    userDecides: true,
  };
}
