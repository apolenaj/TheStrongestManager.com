/**
 * Coach Matching Engine (Prompt 84).
 * Organic fit only — paid placement never boosts rank unless labeled Sponsored.
 */

export const MATCH_GOALS = [
  "strength",
  "hypertrophy",
  "competition_prep",
  "technique",
  "general_fitness",
  "weight_management",
] as const;
export type MatchGoal = (typeof MATCH_GOALS)[number];

export const MATCH_SPORTS = [
  "powerlifting",
  "bodybuilding",
  "strongman",
  "weightlifting",
  "general",
] as const;
export type MatchSport = (typeof MATCH_SPORTS)[number];

export const MATCH_EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
export type MatchExperienceLevel = (typeof MATCH_EXPERIENCE_LEVELS)[number];

export const MATCH_COACHING_STYLES = [
  "hands_on",
  "async_programming",
  "technique_focused",
  "accountability",
  "meet_prep",
] as const;
export type MatchCoachingStyle = (typeof MATCH_COACHING_STYLES)[number];

export const MATCH_GOAL_LABELS: Record<MatchGoal, string> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  competition_prep: "Competition prep",
  technique: "Technique",
  general_fitness: "General fitness",
  weight_management: "Weight management",
};

export const MATCH_SPORT_LABELS: Record<MatchSport, string> = {
  powerlifting: "Powerlifting",
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  weightlifting: "Weightlifting",
  general: "General",
};

export const MATCH_EXPERIENCE_LABELS: Record<MatchExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const MATCH_STYLE_LABELS: Record<MatchCoachingStyle, string> = {
  hands_on: "Hands-on / live",
  async_programming: "Async programming",
  technique_focused: "Technique-focused",
  accountability: "Accountability",
  meet_prep: "Meet prep",
};

export const COACH_MATCHING_HONESTY = [
  "Matches are ranked by fit to your inputs — not by who paid for placement.",
  "Sponsored listings are labeled Sponsored and never inflate organic match scores.",
  "Empty results mean no published coaches fit — we never invent coaches.",
  "Pricing fit uses displayed rates only; marketplace payments are not processed yet.",
] as const;

export const SPONSORED_LABEL = "Sponsored";
