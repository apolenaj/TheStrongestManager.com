/**
 * Recovery Correlation Insights (Prompt 122).
 * Observed associations between sleep / stress / soreness and performance.
 */

import { ISSUE_SLEEP_HOURS_LOW } from "@/domain/recovery/constants";

export const RECOVERY_CORRELATION_ENGINE_VERSION =
  "recovery_correlation.v1" as const;

export const RECOVERY_CORRELATION_HONESTY = [
  "Insights are labelled Observed association — not causal proof.",
  "Correlations appear only when enough weeks have both recovery and performance signals.",
  "Confounders (training plan changes, illness, travel) can explain the same pattern.",
  "This is not medical advice and not a diagnosis of overtraining.",
] as const;

export const RECOVERY_CORR_OBSERVED_LABEL = "Observed association" as const;
export const RECOVERY_CORR_NOT_CAUSAL = "Not causal proof." as const;

/** Minimum weeks in each compared group (e.g. low-sleep vs other). */
export const RECOVERY_CORR_MIN_WEEKS_PER_ARM = 3;

/** Minimum weeks with both recovery + performance data to attempt analysis. */
export const RECOVERY_CORR_MIN_WEEKS_TOTAL = 6;

export const RECOVERY_CORR_SLEEP_LOW_HOURS = ISSUE_SLEEP_HOURS_LOW;

export const RECOVERY_CORR_STRESS_HIGH = 7;
export const RECOVERY_CORR_SORENESS_HIGH = 7;

export const RECOVERY_CORR_SIGNALS = [
  "sleep",
  "stress",
  "soreness",
  "performance_rpe",
] as const;

export type RecoveryCorrSignal = (typeof RECOVERY_CORR_SIGNALS)[number];
