/**
 * Recovery system constants (Prompt 26).
 * Estimates are athlete-signal heuristics — not medical accuracy.
 */

export const RECOVERY_ENGINE_VERSION = "recovery.readiness.v1" as const;

/** Subjective scales on the daily check-in (1–10). */
export const CHECKIN_SCALE_MIN = 1;
export const CHECKIN_SCALE_MAX = 10;

export const RECOVERY_DISCLAIMERS = [
  "Recovery Readiness is an estimate from the signals you log — not a medical assessment, diagnosis, or clearance to train.",
  "Sleep duration and quality are never invented. If you skip sleep fields, the estimate excludes them and confidence drops.",
  "Wearable integrations are reserved in architecture only; no device data is connected in this build.",
] as const;

/** Soft thresholds for potential-issue flags (conservative wording). */
export const ISSUE_SLEEP_HOURS_LOW = 6;
export const ISSUE_STRESS_HIGH = 8;
export const ISSUE_SORENESS_HIGH = 8;
export const ISSUE_FATIGUE_HIGH = 8;
export const ISSUE_MOTIVATION_LOW = 3;
