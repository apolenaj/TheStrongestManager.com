/**
 * Advanced Onboarding Personalization (Prompt 103).
 * Path-specific questions — never ask irrelevant fields.
 */

export const ONBOARDING_PATH_ENGINE_VERSION = "onboarding_paths.v1" as const;

export const ONBOARDING_PATH_IDS = [
  "beginner",
  "experienced",
  "powerlifter",
  "bodybuilder",
  "strongman",
  "coach",
] as const;
export type OnboardingPathId = (typeof ONBOARDING_PATH_IDS)[number];

export const ONBOARDING_PATH_OPTIONS: ReadonlyArray<{
  id: OnboardingPathId;
  label: string;
  hint: string;
}> = [
  {
    id: "beginner",
    label: "Beginner",
    hint: "Keep it simple — goal, schedule, and equipment only.",
  },
  {
    id: "experienced",
    label: "Experienced athlete",
    hint: "Optional PRs, competition date, and current program.",
  },
  {
    id: "powerlifter",
    label: "Powerlifter",
    hint: "SBD focus, meet date, and current program when relevant.",
  },
  {
    id: "bodybuilder",
    label: "Bodybuilder",
    hint: "Physique goal, volume schedule, and current program.",
  },
  {
    id: "strongman",
    label: "Strongman",
    hint: "Event sport, specialty equipment, meet date, program.",
  },
  {
    id: "coach",
    label: "Coach",
    hint: "Enable Coach Mode — skip athlete PR and meet questions.",
  },
];

export const ONBOARDING_DETAIL_SECTIONS = [
  "sports",
  "frequency",
  "equipment",
  "body_metrics",
  "lifts",
  "competition_date",
  "current_program",
  "history",
  "recovery",
] as const;
export type OnboardingDetailSection =
  (typeof ONBOARDING_DETAIL_SECTIONS)[number];

export const ONBOARDING_PATH_HONESTY = [
  "Onboarding asks only questions relevant to the path you pick.",
  "Beginners stay on a short path. Advanced athletes may add PRs, competition date, and current program — all optional.",
  "Skipped fields are never invented.",
] as const;

export function isOnboardingPathId(value: string): value is OnboardingPathId {
  return (ONBOARDING_PATH_IDS as readonly string[]).includes(value);
}
