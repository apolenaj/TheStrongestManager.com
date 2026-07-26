/**
 * Coaching Notes Intelligence (Prompt 131).
 * Coach notes + optional AI summaries — private notes stay out of unrelated product use.
 */

export const COACHING_NOTES_INTELLIGENCE_ENGINE_VERSION =
  "coaching_notes_intelligence.v1" as const;

export const COACHING_NOTES_SOURCE = {
  coach_note: "coach_note",
  ai_summary: "ai_summary",
} as const;

export type CoachingNotesSource =
  (typeof COACHING_NOTES_SOURCE)[keyof typeof COACHING_NOTES_SOURCE];

/** Always shown as source labels in product UI. */
export const COACHING_NOTES_SOURCE_LABELS: Record<CoachingNotesSource, string> =
  {
    coach_note: "Coach note",
    ai_summary: "AI summary",
  };

export const COACHING_NOTES_INTELLIGENCE_HONESTY = [
  "Coach notes are human-authored coaching comments in the athlete workspace.",
  "AI may summarize eligible notes — summaries are always labelled AI summary, never as a coach note.",
  "Private notes are never used for AI summaries or unrelated product features (analytics, moat, public profile, consistency heuristics).",
  "Summaries stay in the coach workspace — they are not training prescriptions or medical advice.",
] as const;

export const COACHING_NOTES_AI_SUMMARY_DISCLAIMER =
  "AI summary of coach notes — not a coach note, not medical advice, and not a substitute for the original notes." as const;

/** Product classes that must never consume private coach note bodies. */
export const COACHING_NOTES_FORBIDDEN_UNRELATED_USES = [
  "data_moat_aggregates",
  "analytics_events",
  "public_athlete_profile",
  "org_leaderboards",
  "training_consistency_heuristics",
  "marketing_copy",
] as const;
