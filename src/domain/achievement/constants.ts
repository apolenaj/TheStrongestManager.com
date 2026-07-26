/**
 * Achievement System (Prompt 79).
 * Meaningful milestones only — reinforce positive behavior, not vanity grind.
 */

export const ACHIEVEMENT_BEHAVIOR_PILLARS = [
  "getting_started",
  "consistency",
  "technique",
  "strength_logging",
  "competition_prep",
] as const;
export type AchievementBehaviorPillar =
  (typeof ACHIEVEMENT_BEHAVIOR_PILLARS)[number];

/** Vanity / unsafe patterns we refuse to ship. */
export const ACHIEVEMENT_FORBIDDEN_PATTERNS = [
  "daily_login_streak_points",
  "max_load_today",
  "open_every_screen",
  "share_spam",
  "bodyweight_cut",
  "skip_recovery",
] as const;

export const ACHIEVEMENT_HONESTY = [
  "Achievements mark real training behaviors — not invented points or ranks.",
  "The catalog stays small on purpose. We avoid empty gamification.",
  "Estimated 1RM is never treated as a competition-verified PR achievement.",
  "Achievements reinforce showing up, filming technique, logging honestly, and finishing prep — not chasing unsafe loads.",
] as const;

export const PILLAR_LABELS: Record<AchievementBehaviorPillar, string> = {
  getting_started: "Getting started",
  consistency: "Consistency",
  technique: "Technique",
  strength_logging: "Strength logging",
  competition_prep: "Competition prep",
};

export function isForbiddenAchievementPattern(id: string): boolean {
  const k = id.toLowerCase().replace(/\s+/g, "_");
  return (ACHIEVEMENT_FORBIDDEN_PATTERNS as readonly string[]).some(
    (f) => k === f || k.includes(f),
  );
}
