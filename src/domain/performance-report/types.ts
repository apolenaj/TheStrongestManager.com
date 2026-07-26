import type {
  PerformanceReportMetricKind,
  PerformanceReportSectionId,
} from "@/domain/performance-report/constants";

export type PerformanceReportPeriod = {
  fromIso: string;
  toIso: string;
  label: string;
  dayCount: number;
};

export type PerformanceReportMetric = {
  label: string;
  value: string | null;
  kind: PerformanceReportMetricKind;
  note?: string | null;
};

export type PerformanceReportSection = {
  id: PerformanceReportSectionId;
  title: string;
  summary: string;
  metrics: PerformanceReportMetric[];
  /** Explicit missing-data callout when the section is thin or empty. */
  missingData: string | null;
  bullets: string[];
};

export type PerformanceReportBranding = {
  displayName: string;
  /** Hex accent when available — PDF may fall back to grayscale. */
  accentHex: string | null;
};

export type PerformanceReportPayload = {
  engineVersion: string;
  branding: PerformanceReportBranding;
  athleteDisplayName: string;
  period: PerformanceReportPeriod;
  generatedAtIso: string;
  sections: PerformanceReportSection[];
  /** Flattened list of estimated metric labels for the cover / footer. */
  estimatedMetricLabels: string[];
  /** Flattened missing-data notes across sections. */
  missingDataNotes: string[];
  honesty: readonly string[];
};

/** Raw signals gathered by the service — assembled into the PDF payload. */
export type PerformanceReportSignals = {
  athleteDisplayName: string;
  period: PerformanceReportPeriod;
  unitsLabel: "kg" | "lb";
  branding: PerformanceReportBranding;
  now: Date;
  overview: {
    primaryDiscipline: string | null;
    activeGoals: string[];
    experienceLevel: string | null;
  };
  strength: {
    /** Lift → best estimated 1RM kg in period. */
    bestE1rmByLiftKg: Record<string, number>;
    setCountWithLoad: number;
  };
  technique: {
    scoredAnalyses: number[];
    analysisCount: number;
  };
  training: {
    completedSessions: number;
    skippedSessions: number;
    volumeKg: number;
    volumeSetCount: number;
  };
  recovery: {
    checkInCount: number;
    readinessScores: number[];
  };
  progress: {
    /** Recent progress metric labels logged in period. */
    metricLabels: string[];
    bodyweightKgSamples: number[];
  };
  recommendations: {
    titles: string[];
    sources: string[];
  };
};
