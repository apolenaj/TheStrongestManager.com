/**
 * Activation Metrics (Prompt 160).
 * Product activation is a multi-step athlete outcome — not vanity traffic.
 */

export const ACTIVATION_ENGINE_VERSION = "activation_metrics.v1" as const;

export const ACTIVATION_HONESTY = [
  "An activated athlete completed onboarding, logged a first workout, uploaded a first technique analysis, and returned with product activity within seven days.",
  "Vanity metrics (pageviews, signup_started alone, pricing_viewed, experiment exposures) are never treated as activation.",
  "D7 return uses completed workouts / technique uploads after the signup UTC day — auth Session has no createdAt, so this is an activity proxy, not a login counter.",
  "Demo accounts are excluded from cohorts. Rates need meaningful cohort size before product decisions.",
] as const;

/** Days after signup for the return window. */
export const ACTIVATION_RETURN_WINDOW_DAYS = 7;

/** Default cohort lookback for the admin dashboard. */
export const ACTIVATION_DEFAULT_COHORT_DAYS = 30;

/** Minimum cohort size before rates are treated as decision-ready. */
export const ACTIVATION_MIN_COHORT_FOR_RATES = 20;

/**
 * Required criteria — all must be true for full activation.
 */
export const ACTIVATION_CRITERIA = [
  {
    id: "onboarding_completed",
    label: "Completed onboarding",
    description:
      "AthleteProfile.onboardingCompletedAt is set after progressive onboarding finishes.",
  },
  {
    id: "first_workout_logged",
    label: "Logged first workout",
    description:
      "At least one TrainingSession with status completed (completedAt).",
  },
  {
    id: "first_technique_uploaded",
    label: "Uploaded first technique analysis",
    description:
      "At least one TechniqueAnalysis with deletedAt null (createdAt).",
  },
  {
    id: "returned_within_seven_days",
    label: "Returned within seven days",
    description:
      "Product activity (completed workout or technique upload) on a UTC day after signup day, within seven days of User.createdAt.",
  },
] as const;

export type ActivationCriterionId = (typeof ACTIVATION_CRITERIA)[number]["id"];

/**
 * Supporting funnel steps — useful context, not substitutes for activation.
 */
export const ACTIVATION_FUNNEL_STEPS = [
  {
    id: "signed_up",
    label: "Signed up",
    description: "Non-demo User.createdAt in cohort window.",
  },
  {
    id: "onboarding_completed",
    label: "Onboarding completed",
    description: "Subset who finished onboarding.",
  },
  {
    id: "first_workout_logged",
    label: "First workout logged",
    description: "Subset with a completed training session.",
  },
  {
    id: "first_technique_uploaded",
    label: "First technique uploaded",
    description: "Subset with a technique analysis.",
  },
  {
    id: "returned_within_seven_days",
    label: "Returned within 7 days",
    description: "Subset with post-signup-day activity in the D7 window.",
  },
  {
    id: "fully_activated",
    label: "Fully activated",
    description: "All four activation criteria true.",
  },
] as const;

export type ActivationFunnelStepId =
  (typeof ACTIVATION_FUNNEL_STEPS)[number]["id"];

/**
 * Explicit vanity / anti-patterns — may appear as context only, never as primary KPIs.
 */
export const ACTIVATION_VANITY_METRICS = [
  {
    id: "pageviews",
    label: "Pageviews",
    reason: "Traffic without product action is not activation.",
  },
  {
    id: "signup_started_only",
    label: "Signup started (without completed account)",
    reason: "Intent ≠ activated athlete.",
  },
  {
    id: "pricing_viewed",
    label: "Pricing viewed",
    reason: "Marketing surface views are not product activation.",
  },
  {
    id: "growth_experiment_exposure",
    label: "Growth experiment exposure",
    reason: "Assignment/exposure is instrumentation, not an outcome.",
  },
  {
    id: "account_created_only",
    label: "Account created without onboarding",
    reason: "Signup alone does not meet the activation definition.",
  },
] as const;
