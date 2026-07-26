/**
 * Fatigue Alert System (Prompt 125).
 * Conservative coaching awareness levels — not medical claims.
 */

export const FATIGUE_ALERT_ENGINE_VERSION = "fatigue_alert_system.v1" as const;

export const FATIGUE_ALERT_HONESTY = [
  "Fatigue alert levels combine logged training load, performance trend, and recovery signals — not a medical assessment.",
  "One off day or thin data stays at Normal (or insufficient); levels rise only when signals align.",
  "This is a coaching awareness cue — not overtraining proof, injury prediction, or clearance to train.",
  "You decide how to respond; nothing here auto-changes your program.",
] as const;

export const FATIGUE_ALERT_LEVELS = [
  "normal",
  "watch",
  "elevated",
  "high_concern",
] as const;

export type FatigueAlertLevel = (typeof FATIGUE_ALERT_LEVELS)[number];

export const FATIGUE_ALERT_LEVEL_LABELS: Record<FatigueAlertLevel, string> = {
  normal: "Normal",
  watch: "Watch",
  elevated: "Elevated",
  high_concern: "High concern",
};

/** Calm titles — avoid alarming language. */
export const FATIGUE_ALERT_LEVEL_TITLES: Record<FatigueAlertLevel, string> = {
  normal: "Patterns look steady",
  watch: "Worth monitoring",
  elevated: "Multiple signals aligned",
  high_concern: "Converging stress pattern",
};

export const FATIGUE_ALERT_MIN_SESSIONS = 4;
export const FATIGUE_ALERT_MIN_RECOVERY_SAMPLES = 2;
export const FATIGUE_ALERT_LOOKBACK_DAYS = 14;

/** Readiness mean below this counts as recovery pressure. */
export const FATIGUE_ALERT_READINESS_LOW = 45;

/** Readiness drop (prior − recent) that counts as declining recovery. */
export const FATIGUE_ALERT_READINESS_DROP = 8;

export const FATIGUE_ALERT_SIGNAL_KEYS = [
  "training_load",
  "performance",
  "recovery",
] as const;

export type FatigueAlertSignalKey = (typeof FATIGUE_ALERT_SIGNAL_KEYS)[number];

export const FATIGUE_ALERT_SIGNAL_LABELS: Record<
  FatigueAlertSignalKey,
  string
> = {
  training_load: "Training load",
  performance: "Performance",
  recovery: "Recovery",
};

/** Forbidden alarmist phrases in product copy (tests guard these). */
export const FATIGUE_ALERT_FORBIDDEN_PHRASES = [
  "overtraining syndrome",
  "you are injured",
  "medical emergency",
  "danger",
  "critical failure",
  "collapse",
] as const;
