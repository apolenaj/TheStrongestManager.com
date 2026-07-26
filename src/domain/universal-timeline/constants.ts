/**
 * Universal Timeline (Prompt 191).
 * Athlete history across workouts, PRs, technique, programs, competition,
 * bodyweight milestones, and coach notes — never invent events.
 */

export const UNIVERSAL_TIMELINE_ENGINE_VERSION =
  "universal_timeline.v1" as const;

export const UNIVERSAL_TIMELINE_HONESTY = [
  "The timeline only shows events backed by logged records — empty filters mean no matching history, not invented placeholders.",
  "Bodyweight milestones are derived from consecutive logged weights (first log or meaningful change) — not medical body-comp claims.",
  "Private coach notes never appear. AI coach-note summaries are not listed as coach notes.",
  "Competition entries come from Competition Prep records you created — not fabricated meet results.",
] as const;

export const TIMELINE_EVENT_KINDS = [
  "workout",
  "pr",
  "technique_analysis",
  "program_change",
  "competition",
  "bodyweight_milestone",
  "coach_note",
] as const;

export type TimelineEventKind = (typeof TIMELINE_EVENT_KINDS)[number];

export const TIMELINE_EVENT_KIND_LABELS: Record<TimelineEventKind, string> = {
  workout: "Workout",
  pr: "PR",
  technique_analysis: "Technique analysis",
  program_change: "Program change",
  competition: "Competition",
  bodyweight_milestone: "Bodyweight milestone",
  coach_note: "Coach note",
};

/** Minimum absolute kg change to count as a bodyweight milestone after the first log. */
export const BODYWEIGHT_MILESTONE_MIN_DELTA_KG = 2.5;

export const TIMELINE_DEFAULT_LIMIT = 100;
export const TIMELINE_MAX_LIMIT = 250;
