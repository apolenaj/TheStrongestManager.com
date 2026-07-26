/**
 * Retention Analytics (Prompt 161).
 * D1/D7/D30, subscription & feature retention, action correlations — never auto-causation.
 */

export const RETENTION_ENGINE_VERSION = "retention_analytics.v1" as const;

export const RETENTION_HONESTY = [
  "D1/D7/D30 measure product activity return after signup — completed workouts and technique uploads — not login counters (auth Session has no createdAt).",
  "Correlations between early actions and later retention are associative only. Never treat correlation as causation automatically.",
  "Subscription retention is among users who held a paid plan — free-tier signup churn is not billed retention.",
  "Feature retention asks whether a feature used early was used again later — not whether the feature caused retention.",
  "Demo accounts are excluded. Under-sampled cells stay estimate-only / insufficient_sample.",
] as const;

export const RETENTION_DEFAULT_COHORT_DAYS = 60;
export const RETENTION_MIN_COHORT_FOR_RATES = 20;
export const RETENTION_MIN_CELL_FOR_CORRELATION = 10;

/** Classic product return windows (days from User.createdAt). */
export const RETENTION_WINDOWS = [
  {
    id: "d1",
    label: "D1",
    days: 1,
    description:
      "Product activity on a UTC day after signup day, within 1 day of User.createdAt.",
  },
  {
    id: "d7",
    label: "D7",
    days: 7,
    description:
      "Product activity on a UTC day after signup day, within 7 days of User.createdAt.",
  },
  {
    id: "d30",
    label: "D30",
    days: 30,
    description:
      "Product activity on a UTC day after signup day, within 30 days of User.createdAt.",
  },
] as const;

export type RetentionWindowId = (typeof RETENTION_WINDOWS)[number]["id"];

/** Early actions tested for association with D30 retention. */
export const RETENTION_CORRELATION_ACTIONS = [
  {
    id: "onboarding_completed",
    label: "Completed onboarding",
    description: "Onboarding finished within the early window (days 0–7).",
  },
  {
    id: "first_workout",
    label: "Logged a workout",
    description: "At least one completed training session in days 0–7.",
  },
  {
    id: "first_technique",
    label: "Uploaded technique",
    description: "At least one technique analysis in days 0–7.",
  },
  {
    id: "two_plus_workouts",
    label: "2+ workouts",
    description: "Two or more completed sessions in days 0–7.",
  },
  {
    id: "workout_and_technique",
    label: "Workout + technique",
    description: "Both a completed workout and a technique upload in days 0–7.",
  },
] as const;

export type RetentionCorrelationActionId =
  (typeof RETENTION_CORRELATION_ACTIONS)[number]["id"];

/** Features measured for reuse retention. */
export const RETENTION_FEATURES = [
  {
    id: "workouts",
    label: "Workouts",
    description: "Completed TrainingSession activity.",
  },
  {
    id: "technique",
    label: "Technique analysis",
    description: "Non-deleted TechniqueAnalysis uploads.",
  },
] as const;

export type RetentionFeatureId = (typeof RETENTION_FEATURES)[number]["id"];

export const RETENTION_FEATURE_EARLY_DAYS = 7;
export const RETENTION_FEATURE_LATE_START_DAY = 8;
export const RETENTION_FEATURE_LATE_END_DAY = 30;

/** Paid plans counted for subscription retention. */
export const RETENTION_PAID_PLANS = [
  "pro",
  "performance",
  "elite_coaching",
] as const;
