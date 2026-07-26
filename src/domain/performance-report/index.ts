export {
  PERFORMANCE_REPORT_ENGINE_VERSION,
  PERFORMANCE_REPORT_SECTION_IDS,
  PERFORMANCE_REPORT_SECTION_LABELS,
  PERFORMANCE_REPORT_METRIC_KINDS,
  PERFORMANCE_REPORT_METRIC_KIND_LABELS,
  PERFORMANCE_REPORT_HONESTY,
  DEFAULT_PERFORMANCE_REPORT_DAYS,
} from "@/domain/performance-report/constants";
export type {
  PerformanceReportSectionId,
  PerformanceReportMetricKind,
} from "@/domain/performance-report/constants";

export type {
  PerformanceReportPeriod,
  PerformanceReportMetric,
  PerformanceReportSection,
  PerformanceReportBranding,
  PerformanceReportPayload,
  PerformanceReportSignals,
} from "@/domain/performance-report/types";

export {
  assemblePerformanceReport,
  buildPerformanceReportPeriod,
  defaultPerformanceReportWindow,
} from "@/domain/performance-report/assemble";
