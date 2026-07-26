/**
 * Premium Coaching Sales Flow (Prompt 134).
 * Application funnel — never promises acceptance.
 */

export const PREMIUM_COACHING_ENGINE_VERSION =
  "premium_coaching_sales.v1" as const;

export const PREMIUM_COACHING_HONESTY = [
  "Submitting an application does not promise acceptance, a coach match, or a coaching spot.",
  "Applications are reviewed by staff or coaches — outcomes may be decline, consultation, or an offer.",
  "A consultation is a conversation opportunity, not enrollment.",
  "An offer is a proposed engagement — acceptance is optional and payments may still be unavailable.",
] as const;

export const PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE =
  "Application received. This does not mean you have been accepted." as const;

/** Funnel stages: Apply → Review → Consultation → Offer */
export const PREMIUM_COACHING_STAGES = [
  "applied",
  "in_review",
  "consultation",
  "offer",
] as const;

export type PremiumCoachingStage = (typeof PREMIUM_COACHING_STAGES)[number];

export const PREMIUM_COACHING_STAGE_LABELS: Record<PremiumCoachingStage, string> =
  {
    applied: "Applied",
    in_review: "Review",
    consultation: "Consultation",
    offer: "Offer",
  };

/** Terminal statuses outside the happy path. */
export const PREMIUM_COACHING_TERMINAL_STATUSES = [
  "declined",
  "withdrawn",
  "expired",
] as const;

export type PremiumCoachingTerminalStatus =
  (typeof PREMIUM_COACHING_TERMINAL_STATUSES)[number];

export const PREMIUM_COACHING_STATUSES = [
  ...PREMIUM_COACHING_STAGES,
  ...PREMIUM_COACHING_TERMINAL_STATUSES,
] as const;

export type PremiumCoachingStatus = (typeof PREMIUM_COACHING_STATUSES)[number];

export const PREMIUM_COACHING_STATUS_LABELS: Record<
  PremiumCoachingStatus,
  string
> = {
  applied: "Applied",
  in_review: "In review",
  consultation: "Consultation",
  offer: "Offer presented",
  declined: "Declined",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

/** Goals for the application (reuse matching vocabulary). */
export const PREMIUM_COACHING_GOALS = [
  "strength",
  "hypertrophy",
  "competition_prep",
  "technique",
  "general_fitness",
  "weight_management",
] as const;

export type PremiumCoachingGoal = (typeof PREMIUM_COACHING_GOALS)[number];

export const PREMIUM_COACHING_GOAL_LABELS: Record<PremiumCoachingGoal, string> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  competition_prep: "Competition prep",
  technique: "Technique",
  general_fitness: "General fitness",
  weight_management: "Weight management",
};

export const PREMIUM_COACHING_EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type PremiumCoachingExperience =
  (typeof PREMIUM_COACHING_EXPERIENCE_LEVELS)[number];

export const PREMIUM_COACHING_EXPERIENCE_LABELS: Record<
  PremiumCoachingExperience,
  string
> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Coarse budget bands for UI + analytics (not free-text amounts). */
export const PREMIUM_COACHING_BUDGET_RANGES = [
  "under_150",
  "150_300",
  "300_500",
  "500_plus",
  "undecided",
] as const;

export type PremiumCoachingBudgetRange =
  (typeof PREMIUM_COACHING_BUDGET_RANGES)[number];

export const PREMIUM_COACHING_BUDGET_LABELS: Record<
  PremiumCoachingBudgetRange,
  string
> = {
  under_150: "Under $150 / month",
  "150_300": "$150–$300 / month",
  "300_500": "$300–$500 / month",
  "500_plus": "$500+ / month",
  undecided: "Not sure yet",
};

export const PREMIUM_COACHING_AVAILABILITY = [
  "weekdays",
  "evenings",
  "weekends",
  "flexible",
  "limited",
] as const;

export type PremiumCoachingAvailability =
  (typeof PREMIUM_COACHING_AVAILABILITY)[number];

export const PREMIUM_COACHING_AVAILABILITY_LABELS: Record<
  PremiumCoachingAvailability,
  string
> = {
  weekdays: "Weekdays",
  evenings: "Evenings",
  weekends: "Weekends",
  flexible: "Flexible",
  limited: "Limited availability",
};

export function isPremiumCoachingStage(
  value: string,
): value is PremiumCoachingStage {
  return (PREMIUM_COACHING_STAGES as readonly string[]).includes(value);
}

export function isPremiumCoachingStatus(
  value: string,
): value is PremiumCoachingStatus {
  return (PREMIUM_COACHING_STATUSES as readonly string[]).includes(value);
}

export function isPremiumCoachingGoal(
  value: string,
): value is PremiumCoachingGoal {
  return (PREMIUM_COACHING_GOALS as readonly string[]).includes(value);
}

export function isPremiumCoachingExperience(
  value: string,
): value is PremiumCoachingExperience {
  return (PREMIUM_COACHING_EXPERIENCE_LEVELS as readonly string[]).includes(
    value,
  );
}

export function isPremiumCoachingBudgetRange(
  value: string,
): value is PremiumCoachingBudgetRange {
  return (PREMIUM_COACHING_BUDGET_RANGES as readonly string[]).includes(value);
}

export function isPremiumCoachingAvailability(
  value: string,
): value is PremiumCoachingAvailability {
  return (PREMIUM_COACHING_AVAILABILITY as readonly string[]).includes(value);
}
