/**
 * Performance Story (Prompt 192).
 * Long-term narrative from athlete history — shareable yearly review.
 * Chronological observations only; never fake causal conclusions.
 */

export const PERFORMANCE_STORY_ENGINE_VERSION =
  "performance_story.v1" as const;

export const PERFORMANCE_STORY_HONESTY = [
  "Performance Story lists chronological observations from logged data — never invents lifts, scores, or bodyweight.",
  "Lines in the same month are parallel facts, not proof that one change caused another.",
  "Shared yearly reviews are public-safe highlights only — no private coach notes or session dumps.",
  "Missing months mean not enough logged signal that month, not failure or fabricated progress.",
] as const;

export const PERFORMANCE_STORY_CAUSALITY_CAVEAT =
  "These lines are chronological observations, not proof that one change caused another." as const;

export const MONTH_LABELS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
