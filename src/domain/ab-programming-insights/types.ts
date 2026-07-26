import type { AbProgrammingDimension } from "@/domain/ab-programming-insights/constants";

export type AbInsightArmObservation = {
  armKey: string;
  armLabel: string;
  /** Metric key e.g. median_e1rm_delta_pct */
  metricKey: string;
  metricLabel: string;
  /** Aggregate value — never per-athlete. */
  value: number;
  unit: string | null;
  /** Arm sample size (must still meet global publish gate). */
  armSampleSize: number;
};

export type AbProgrammingInsight = {
  id: string;
  dimension: AbProgrammingDimension;
  title: string;
  /** Total anonymized outcomes in the compared cohort. */
  cohortSize: number;
  publishable: boolean;
  /** Empty when suppressed. */
  observations: AbInsightArmObservation[];
  /** Always present — forces anti-causation framing. */
  correlationNotCausation: true;
  disclaimer: string;
  suppressedReason: string | null;
};

export type AbProgrammingInsightsOverview = {
  engineVersion: string;
  dimensions: AbProgrammingDimension[];
  /** Architecture catalog entries (may be empty until real jobs exist). */
  insights: AbProgrammingInsight[];
  /** Cohorts examined but suppressed for n. */
  suppressedCohortCount: number;
  honesty: readonly string[];
  pipelineStatus: "architecture_ready" | "aggregating" | "published";
};
