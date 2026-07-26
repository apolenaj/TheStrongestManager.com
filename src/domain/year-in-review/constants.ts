/**
 * Year in Review (Prompt 193).
 * Annual athlete report — sessions, PRs, technique, top exercises,
 * most consistent month, competition results — shareable cards.
 * High energy, original design language (not a streaming-app clone).
 * Never invents stats or competition results.
 */

export const YEAR_IN_REVIEW_ENGINE_VERSION = "year_in_review.v1" as const;

export const YEAR_IN_REVIEW_HONESTY = [
  "Year in Review summarizes logged training for a calendar year — counts and deltas are never invented.",
  "Empty cards mean missing data that year, not fabricated zeros dressed as achievements.",
  "Competition results come only from Competition Prep records you created — not invented placings.",
  "Shareable cards are public-safe highlights — no private coach notes or full session dumps.",
  "Technique “improvement” is a score delta from completed analyses, not a medical claim.",
] as const;

export const YEAR_IN_REVIEW_CARD_KINDS = [
  "intro",
  "sessions",
  "prs",
  "technique",
  "top_exercises",
  "most_consistent_month",
  "competition",
  "closer",
] as const;

export type YearInReviewCardKind =
  (typeof YEAR_IN_REVIEW_CARD_KINDS)[number];

export const YEAR_IN_REVIEW_CARD_LABELS: Record<
  YearInReviewCardKind,
  string
> = {
  intro: "Your year",
  sessions: "Training sessions",
  prs: "PRs",
  technique: "Technique",
  top_exercises: "Top exercises",
  most_consistent_month: "Most consistent month",
  competition: "Competition",
  closer: "The ledger",
};

export const MONTH_LABELS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
