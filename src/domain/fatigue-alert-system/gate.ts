/**
 * Sample gates — thin data never escalates past Normal awareness.
 */

import { FATIGUE_ALERT_MIN_SESSIONS } from "@/domain/fatigue-alert-system/constants";

export function canEscalateFatigueAlert(input: {
  sessionCount: number;
  signalsAvailable: number;
}): boolean {
  return (
    input.sessionCount >= FATIGUE_ALERT_MIN_SESSIONS &&
    input.signalsAvailable >= 2
  );
}

export function fatigueAlertGateReason(input: {
  sessionCount: number;
  signalsAvailable: number;
}): string | null {
  if (input.sessionCount < FATIGUE_ALERT_MIN_SESSIONS) {
    return `Need at least ${FATIGUE_ALERT_MIN_SESSIONS} completed sessions in the window (have ${input.sessionCount}). One workout is never enough.`;
  }
  if (input.signalsAvailable < 2) {
    return `Need signals from at least 2 of training load, performance, and recovery (have ${input.signalsAvailable}).`;
  }
  return null;
}
