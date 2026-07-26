/**
 * Personalization Engine (Prompt 100).
 * Central ranking for product surfaces from goal / sport / history / behavior / preferences.
 * Never personalizes pricing from sensitive characteristics.
 */

export const PERSONALIZATION_ENGINE_VERSION = "personalization.v1" as const;

export const PERSONALIZATION_SURFACES = [
  "dashboard",
  "recommendations",
  "program_suggestions",
  "exercise_alternatives",
  "content",
  "notifications",
] as const;
export type PersonalizationSurface =
  (typeof PERSONALIZATION_SURFACES)[number];

export const PERSONALIZATION_SURFACE_LABELS: Record<
  PersonalizationSurface,
  string
> = {
  dashboard: "Dashboard",
  recommendations: "Recommendations",
  program_suggestions: "Program suggestions",
  exercise_alternatives: "Exercise alternatives",
  content: "Content",
  notifications: "Notifications",
};

/**
 * Characteristics that must never drive pricing (or any paywall amount).
 * Also excluded from personalization ranking inputs.
 */
export const PERSONALIZATION_SENSITIVE_CHARACTERISTICS = [
  "sex",
  "birth_year",
  "birthYear",
  "age",
  "gender",
  "gender_identity",
  "race",
  "ethnicity",
  "disability",
  "health_condition",
] as const;

/** Surfaces / uses that are explicitly out of scope for this engine. */
export const PERSONALIZATION_FORBIDDEN_USES = [
  "pricing",
  "plan_price",
  "subscription_price",
  "discount",
  "promotional_price",
  "paywall_amount",
] as const;

export const PERSONALIZATION_HONESTY = [
  "Personalization ranks coaching surfaces from goal, sport, training history, behavior, and stated preferences.",
  "Sensitive characteristics (sex, age/birth year, and similar) are never used as ranking inputs.",
  "Pricing, plan amounts, and discounts are never personalized from sensitive characteristics — or from this engine at all.",
  "Thin data stays labeled missing; items are never invented to fill a surface.",
] as const;

export const DEFAULT_PERSONALIZATION_LOOKBACK_DAYS = 28;

export const PERSONALIZATION_INPUT_KINDS = [
  "goal",
  "sport",
  "training_history",
  "behavior",
  "preferences",
] as const;
export type PersonalizationInputKind =
  (typeof PERSONALIZATION_INPUT_KINDS)[number];
