/**
 * Cross-domain insights constants (Prompt 32).
 * Insights suggest reviews — they never auto-apply program or calorie changes.
 */

export const INSIGHTS_ENGINE_VERSION = "insights.v1" as const;

export const INSIGHT_DOMAINS = [
  "training",
  "recovery",
  "nutrition",
  "body_metrics",
] as const;
export type InsightDomain = (typeof INSIGHT_DOMAINS)[number];

export const INSIGHT_DOMAIN_LABELS: Record<InsightDomain, string> = {
  training: "Training",
  recovery: "Recovery",
  nutrition: "Nutrition",
  body_metrics: "Body metrics",
};

export const INSIGHT_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type InsightConfidence = (typeof INSIGHT_CONFIDENCE_LEVELS)[number];

/** Lookbacks for signal gathering (days). */
export const INSIGHT_BODYWEIGHT_LOOKBACK_DAYS = 28;
export const INSIGHT_RECOVERY_LOOKBACK_DAYS = 14;
export const INSIGHT_TRAINING_RECENT_DAYS = 7;
export const INSIGHT_TRAINING_BASELINE_DAYS = 21;

/** Heuristic: rapid bodyweight loss rate (kg / week). Coaching flag, not clinical. */
export const RAPID_BW_LOSS_KG_PER_WEEK = -0.4;

/** Volume drop vs prior window (percent points from volumeTrendPct). */
export const TRAINING_VOLUME_DECLINE_PCT = -20;

/** Readiness drop (points) recent vs prior half-window. */
export const RECOVERY_WORSENING_DELTA = -8;

export const INSIGHT_HONESTY = [
  "Cross-domain insights combine training, recovery, nutrition, and body metrics when enough data exists.",
  "They never invent missing nutrition numbers or prescribe exact calorie changes without sufficient synced nutrition data.",
  "Insights are coaching-practice suggestions — not medical diagnoses or automatic program changes.",
] as const;
