/**
 * Conversion Funnel (Prompt 162).
 * Homepage → Signup → Onboarding → First value → Pricing → Checkout → Paid.
 */

export const CONVERSION_FUNNEL_ENGINE_VERSION = "conversion_funnel.v1" as const;

export const CONVERSION_FUNNEL_HONESTY = [
  "Ordered product path for analysis — individuals may view pricing before first value.",
  "Homepage / pricing / checkout counts are process-local event volumes until a warehouse is wired.",
  "Signup / onboarding / first value / paid prefer durable DB unique-user counts in the cohort window.",
  "Drop-offs identify where the largest absolute and relative losses occur — not automatic root causes.",
] as const;

export const CONVERSION_FUNNEL_DEFAULT_COHORT_DAYS = 30;
export const CONVERSION_FUNNEL_MIN_TOP_FOR_RATES = 20;

/**
 * Canonical funnel stages (Prompt 162).
 */
export const CONVERSION_FUNNEL_STAGES = [
  {
    id: "homepage",
    label: "Homepage",
    description: "Marketing homepage viewed (`homepage_viewed`).",
    evidence: "live_event" as const,
    events: ["homepage_viewed"] as const,
  },
  {
    id: "signup",
    label: "Signup",
    description: "Account created (`signup_completed` / User.createdAt).",
    evidence: "durable_user" as const,
    events: ["signup_completed"] as const,
  },
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Onboarding finished (`onboarding_completed`).",
    evidence: "durable_user" as const,
    events: ["onboarding_completed"] as const,
  },
  {
    id: "first_value",
    label: "First value",
    description:
      "First completed workout or technique upload — first useful product action.",
    evidence: "durable_user" as const,
    events: ["workout_completed", "technique_analysis_uploaded"] as const,
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Pricing page viewed (`pricing_viewed`).",
    evidence: "live_event" as const,
    events: ["pricing_viewed"] as const,
  },
  {
    id: "checkout",
    label: "Checkout",
    description: "Checkout session started (`checkout_started`).",
    evidence: "live_event" as const,
    events: ["checkout_started"] as const,
  },
  {
    id: "paid",
    label: "Paid",
    description:
      "Paid plan activated (`subscription_activated` / paid Subscription).",
    evidence: "durable_user" as const,
    events: ["subscription_activated"] as const,
  },
] as const;

export type ConversionFunnelStageId =
  (typeof CONVERSION_FUNNEL_STAGES)[number]["id"];
