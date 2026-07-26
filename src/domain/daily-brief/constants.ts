/** Daily Coaching Brief — Prompt 54 */

export const DAILY_BRIEF_ENGINE_VERSION = "daily_brief.v1" as const;

/** Hard cap — never dump every possible section as equal insights. */
export const DAILY_BRIEF_MAX_INSIGHTS = 3;

export const DAILY_BRIEF_HONESTY = [
  "Today shows only high-value coaching lines from your logs — not a full data dump.",
  "At most three prioritized insights appear; missing signals stay explicit.",
  "Recovery language is coaching-practice only — never a diagnosis.",
] as const;

export const DAILY_BRIEF_SECTION_KINDS = [
  "primary_focus",
  "why",
  "training",
  "recovery",
  "technique_focus",
  "goal_progress",
  "warning",
  "action",
] as const;

export type DailyBriefSectionKind = (typeof DAILY_BRIEF_SECTION_KINDS)[number];
