/**
 * Sample and multi-signal gates — one bad workout cannot publish a deload cue.
 */

import {
  DELOAD_MIN_SESSIONS,
  DELOAD_MIN_SIGNALS_FIRED,
} from "@/domain/deload-intelligence/constants";

export function canPublishDeloadRecommendation(input: {
  sessionCount: number;
  signalsFired: number;
  recentDeload: boolean;
}): boolean {
  if (input.recentDeload) return false;
  if (input.sessionCount < DELOAD_MIN_SESSIONS) return false;
  return input.signalsFired >= DELOAD_MIN_SIGNALS_FIRED;
}

export function deloadGateReason(input: {
  sessionCount: number;
  signalsFired: number;
  recentDeload: boolean;
}): string | null {
  if (input.recentDeload) {
    return "A deload was already accepted recently — hold off on another cue.";
  }
  if (input.sessionCount < DELOAD_MIN_SESSIONS) {
    return `Need at least ${DELOAD_MIN_SESSIONS} completed sessions in the window (have ${input.sessionCount}). One workout is never enough.`;
  }
  if (input.signalsFired < DELOAD_MIN_SIGNALS_FIRED) {
    return `Need at least ${DELOAD_MIN_SIGNALS_FIRED} independent stress signals (have ${input.signalsFired}).`;
  }
  return null;
}
