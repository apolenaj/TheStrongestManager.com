/**
 * Automatic monthly performance report (Prompt 98).
 */

export const MONTHLY_REPORT_ENGINE_VERSION = "monthly_report.v1" as const;

export const MONTHLY_REPORT_SECTION_IDS = [
  "month_summary",
  "progress",
  "best_performance",
  "technique_changes",
  "training_volume",
  "consistency",
  "goal_progress",
  "next_priorities",
] as const;
export type MonthlyReportSectionId =
  (typeof MONTHLY_REPORT_SECTION_IDS)[number];

export const MONTHLY_REPORT_SECTION_LABELS: Record<
  MonthlyReportSectionId,
  string
> = {
  month_summary: "Month summary",
  progress: "Progress",
  best_performance: "Best performance",
  technique_changes: "Technique changes",
  training_volume: "Training volume",
  consistency: "Consistency",
  goal_progress: "Goal progress",
  next_priorities: "Next priorities",
};

export const MONTHLY_REPORT_HONESTY = [
  "Monthly reports summarize logged data for a calendar month — values are never invented.",
  "Estimated 1RM figures are labeled as estimated, not tested maxes.",
  "Missing sections state what data was absent.",
  "Shared cards expose only a public-safe summary — not private recovery notes or full session dumps.",
  "Next priorities are coaching-practice suggestions, not medical advice.",
] as const;
