/**
 * Optional Athlete Level System (Prompt 80).
 * Multi-factor — never absolute strength alone; never Elite from app usage.
 */

export const ATHLETE_LEVEL_IDS = [
  "foundation",
  "developing",
  "advanced",
  "competitive",
  "elite",
] as const;
export type AthleteLevelId = (typeof ATHLETE_LEVEL_IDS)[number];

export const ATHLETE_LEVEL_FACTORS = [
  "consistency",
  "knowledge",
  "technique",
  "training_history",
  "progress",
] as const;
export type AthleteLevelFactorId = (typeof ATHLETE_LEVEL_FACTORS)[number];

export const LEVEL_LABELS: Record<AthleteLevelId, string> = {
  foundation: "Foundation",
  developing: "Developing",
  advanced: "Advanced",
  competitive: "Competitive",
  elite: "Elite",
};

export const LEVEL_DESCRIPTIONS: Record<AthleteLevelId, string> = {
  foundation: "Building habits — early training history and basics.",
  developing: "Steady consistency and growing technique/knowledge.",
  advanced: "Strong multi-factor profile across training behaviors.",
  competitive: "High overall readiness with competition-oriented signals.",
  elite:
    "Reserved for high multi-factor scores plus real competitive evidence — never app usage alone.",
};

export const FACTOR_LABELS: Record<AthleteLevelFactorId, string> = {
  consistency: "Consistency",
  knowledge: "Knowledge",
  technique: "Technique",
  training_history: "Training history",
  progress: "Progress",
};

/**
 * Inputs we refuse to use for leveling (especially Elite).
 * Documented so product never quietly scores “engagement.”
 */
export const ATHLETE_LEVEL_EXCLUDED_SIGNALS = [
  "app_open_days",
  "login_streak",
  "screens_visited",
  "feature_clicks",
  "absolute_1rm_alone",
  "bodyweight_alone",
] as const;

export const ATHLETE_LEVEL_HONESTY = [
  "Athlete Level is optional and multi-factor: consistency, knowledge, technique, training history, and progress.",
  "Level is never based solely on absolute strength. Sport-specific strength classes (e.g. Wilks/DOTS bands) are a separate concept.",
  "Elite is never awarded from app usage, logins, or clicks alone — competitive evidence is required.",
  "Empty or thin data stays at Foundation — we never invent an Advanced/Elite label.",
] as const;

export function isAthleteLevelId(value: string): value is AthleteLevelId {
  return (ATHLETE_LEVEL_IDS as readonly string[]).includes(value);
}
