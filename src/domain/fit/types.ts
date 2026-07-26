/**
 * Fit questionnaire inputs — Prompt 30.
 * All options are explicit enums so rules stay transparent and shareable via URL.
 */

export const FIT_GOALS = [
  "strength",
  "hypertrophy",
  "powerlifting",
  "weightlifting",
  "athletic",
  "general",
] as const;

export type FitGoal = (typeof FIT_GOALS)[number];

export const FIT_GOAL_LABELS: Record<FitGoal, string> = {
  strength: "General strength",
  hypertrophy: "Muscle / physique",
  powerlifting: "Powerlifting (squat, bench, deadlift)",
  weightlifting: "Olympic weightlifting",
  athletic: "Sport performance",
  general: "General fitness & capability",
};

export const FIT_EXPERIENCE = ["beginner", "intermediate", "advanced"] as const;
export type FitExperience = (typeof FIT_EXPERIENCE)[number];

export const FIT_EXPERIENCE_LABELS: Record<FitExperience, string> = {
  beginner: "Beginner (under ~1–2 years consistent training)",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const FIT_DAYS = ["2", "3", "4", "5", "6"] as const;
export type FitDays = (typeof FIT_DAYS)[number];

export const FIT_SESSION = ["short", "medium", "long"] as const;
export type FitSession = (typeof FIT_SESSION)[number];

export const FIT_SESSION_LABELS: Record<FitSession, string> = {
  short: "Short (~30–45 min)",
  medium: "Medium (~45–75 min)",
  long: "Long (75+ min)",
};

export const FIT_RECOVERY = ["limited", "moderate", "high"] as const;
export type FitRecovery = (typeof FIT_RECOVERY)[number];

export const FIT_RECOVERY_LABELS: Record<FitRecovery, string> = {
  limited: "Limited (sleep/stress often constrained)",
  moderate: "Moderate / typical",
  high: "High (sleep, stress, and recovery usually solid)",
};

export const FIT_EQUIPMENT = ["full_gym", "home_barbell", "minimal"] as const;
export type FitEquipment = (typeof FIT_EQUIPMENT)[number];

export const FIT_EQUIPMENT_LABELS: Record<FitEquipment, string> = {
  full_gym: "Full gym (bars, racks, machines)",
  home_barbell: "Home barbell / rack basics",
  minimal: "Minimal (dumbbells, bands, bodyweight)",
};

export const FIT_SPORT = [
  "none",
  "powerlifting",
  "weightlifting",
  "strongman",
  "team_sport",
  "other",
] as const;
export type FitSport = (typeof FIT_SPORT)[number];

export const FIT_SPORT_LABELS: Record<FitSport, string> = {
  none: "No competitive sport focus",
  powerlifting: "Powerlifting",
  weightlifting: "Weightlifting",
  strongman: "Strongman",
  team_sport: "Team / field / court sport",
  other: "Other sport",
};

export const FIT_PREFERENCES = [
  "simplicity",
  "variety",
  "high_effort_low_volume",
  "high_frequency",
  "periodized",
] as const;
export type FitPreference = (typeof FIT_PREFERENCES)[number];

export const FIT_PREFERENCE_LABELS: Record<FitPreference, string> = {
  simplicity: "Simple plan I can follow consistently",
  variety: "Weekly variety / different session roles",
  high_effort_low_volume: "Harder, shorter sessions (lower volume)",
  high_frequency: "Practice main lifts often",
  periodized: "Clear phases toward a peak or test",
};

export type FitInputs = {
  goal: FitGoal;
  experience: FitExperience;
  days: FitDays;
  session: FitSession;
  recovery: FitRecovery;
  equipment: FitEquipment;
  sport: FitSport;
  preference: FitPreference;
};

export const FIT_INPUT_DEFAULTS: FitInputs = {
  goal: "strength",
  experience: "intermediate",
  days: "4",
  session: "medium",
  recovery: "moderate",
  equipment: "full_gym",
  sport: "none",
  preference: "variety",
};

export const FIT_DISCLAIMERS = [
  "This is a coaching-practice recommendation from transparent rules — not a medical diagnosis, injury screen, or claim of one perfect method.",
  "Primary and alternative approaches can both be reasonable. Context, coaching, and how you dose the plan matter more than the label.",
] as const;
