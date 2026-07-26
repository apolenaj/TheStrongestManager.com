export type RecoveryWeekBucket = {
  weekKey: string;
  /** Mean sleep hours from recovery entries that week. */
  sleepHoursMean: number | null;
  sleepSampleCount: number;
  stressMean: number | null;
  stressSampleCount: number;
  sorenessMean: number | null;
  sorenessSampleCount: number;
  /** Mean session perceivedEffort that week. */
  sessionRpeMean: number | null;
  sessionsWithRpe: number;
  completedSessions: number;
};

export type RecoveryCorrelationInsight = {
  id: string;
  /** Always "Observed association". */
  associationLabel: typeof import("@/domain/recovery-correlation/constants").RECOVERY_CORR_OBSERVED_LABEL;
  /** Always "Not causal proof." */
  causalityLabel: typeof import("@/domain/recovery-correlation/constants").RECOVERY_CORR_NOT_CAUSAL;
  headline: string;
  detail: string;
  publishable: boolean;
  /** Weeks in the “condition” arm (e.g. sleep < 6h). */
  conditionWeekCount: number;
  /** Weeks in the comparison arm. */
  comparisonWeekCount: number;
  conditionMetricDisplay: string | null;
  comparisonMetricDisplay: string | null;
  suppressedReason: string | null;
};

export type RecoveryCorrelationAnalysis = {
  engineVersion: string;
  weekCount: number;
  weeksWithBothSignals: number;
  insights: RecoveryCorrelationInsight[];
  suppressedCount: number;
  missingNotes: string[];
  honesty: readonly string[];
};
