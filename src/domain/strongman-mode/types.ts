import type {
  StrongmanDashboardPriority,
  StrongmanEventId,
  StrongmanMetricKind,
} from "@/domain/strongman-mode/constants";

export type StrongmanEventPr = {
  eventId: StrongmanEventId;
  eventLabel: string;
  metric: StrongmanMetricKind;
  metricLabel: string;
  value: number;
  unit: string;
  /** ProgressMetric key when persisted. */
  metricKey: string;
  recordedAtIso: string | null;
};

export type StrongmanEventCard = {
  eventId: StrongmanEventId;
  label: string;
  trackedMetrics: StrongmanMetricKind[];
  /** Best PR per metric when logged. */
  prs: StrongmanEventPr[];
  missingMetrics: StrongmanMetricKind[];
};

export type StrongmanPriorityCard = {
  id: StrongmanDashboardPriority;
  label: string;
  headline: string;
  detail: string;
  href: string | null;
  metricValue: number | null;
  metricUnit: string | null;
  available: boolean;
  missingNote: string | null;
};

export type StrongmanModePayload = {
  engineVersion: string;
  generatedAtIso: string;
  events: StrongmanEventCard[];
  /** Flat list of all event PRs for overview. */
  eventPrs: StrongmanEventPr[];
  priorities: StrongmanPriorityCard[];
  competition: {
    hasPrep: boolean;
    name: string | null;
    dateIso: string | null;
    daysUntil: number | null;
  };
  /** Explicit architecture guard. */
  powerliftingMetricsForced: false;
  excludedPowerliftingMetrics: readonly string[];
  honesty: readonly string[];
};

export type StrongmanModeSignals = {
  now: Date;
  /** Logged event PRs from progress metrics (sm_* keys). */
  loggedPrs: Array<{
    eventId: StrongmanEventId;
    metric: StrongmanMetricKind;
    value: number;
    unit: string;
    recordedAt: Date | null;
  }>;
  competition: {
    hasPrep: boolean;
    name: string | null;
    dateIso: string | null;
    daysUntil: number | null;
  };
};
