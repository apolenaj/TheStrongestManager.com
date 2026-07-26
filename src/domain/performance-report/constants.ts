/**
 * Premium Performance Report PDF (Prompt 97).
 * Assembles period-scoped athlete reports — never invents scores or claims.
 */

export const PERFORMANCE_REPORT_ENGINE_VERSION =
  "performance_report.v1" as const;

export const PERFORMANCE_REPORT_SECTION_IDS = [
  "athlete_overview",
  "strength",
  "technique",
  "training",
  "recovery",
  "progress",
  "key_recommendations",
] as const;
export type PerformanceReportSectionId =
  (typeof PERFORMANCE_REPORT_SECTION_IDS)[number];

export const PERFORMANCE_REPORT_SECTION_LABELS: Record<
  PerformanceReportSectionId,
  string
> = {
  athlete_overview: "Athlete overview",
  strength: "Strength",
  technique: "Technique",
  training: "Training",
  recovery: "Recovery",
  progress: "Progress",
  key_recommendations: "Key recommendations",
};

/** How a displayed value was derived — always labeled on the report. */
export const PERFORMANCE_REPORT_METRIC_KINDS = [
  "observed",
  "estimated",
  "reported",
  "missing",
] as const;
export type PerformanceReportMetricKind =
  (typeof PERFORMANCE_REPORT_METRIC_KINDS)[number];

export const PERFORMANCE_REPORT_METRIC_KIND_LABELS: Record<
  PerformanceReportMetricKind,
  string
> = {
  observed: "Observed",
  estimated: "Estimated",
  reported: "Reported",
  missing: "Missing",
};

export const PERFORMANCE_REPORT_HONESTY = [
  "This report only includes metrics supported by logged data in the stated period.",
  "Estimated metrics (e.g. e1RM) are labeled — they are not measured maxes.",
  "Missing sections state what data was absent — values are never invented.",
  "No injury risk, medical diagnosis, or unsupported performance claims.",
] as const;

export const DEFAULT_PERFORMANCE_REPORT_DAYS = 28;
