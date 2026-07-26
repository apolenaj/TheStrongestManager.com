import type {
  InsightConfidence,
  InsightDomain,
} from "@/domain/insights/constants";

/**
 * Frozen signal snapshot for the pure insights engine.
 * Null means unknown — never invent.
 */
export type CrossDomainSignals = {
  /** Linear kg/week estimate over recent bodyweight logs; null if insufficient. */
  bodyweightTrendKgPerWeek: number | null;
  bodyweightSampleCount: number;
  latestBodyweightKg: number | null;
  /** Recent window volume vs prior window; null if either side empty. */
  trainingVolumeTrendPct: number | null;
  recentVolumeKg: number | null;
  priorVolumeKg: number | null;
  /** Mean of recent completed-session load proxies vs prior; optional. */
  trainingPerformanceTrend: "up" | "down" | "flat" | "unknown";
  /** Mean readiness in recent half of lookback. */
  recoveryReadinessRecent: number | null;
  /** Recent mean − prior mean (negative = worsening). */
  recoveryReadinessDelta: number | null;
  recoverySampleCount: number;
  /** True when Mealnexio sync flag + provider can return live data path. */
  nutritionSyncFeatureEnabled: boolean;
  /** True when provider returned daily targets (real sync). */
  nutritionHasTargets: boolean;
  /** True when provider returned daily intake summary. */
  nutritionHasSummary: boolean;
  completedSessionsRecent: number;
  completedSessionsBaseline: number;
};

export type InsightEvidence = {
  domain: InsightDomain;
  statement: string;
};

export type InsightAction = {
  label: string;
  href: string;
  /** review | log | connect — never “set calories to X” without nutrition data. */
  kind: "review" | "log" | "connect";
};

export type InsightProposal = {
  /** Stable rule id for dedupe / tests. */
  id: string;
  title: string;
  summary: string;
  domains: InsightDomain[];
  evidence: InsightEvidence[];
  confidence: InsightConfidence;
  action: InsightAction;
  /**
   * Explicit note when nutrition data is insufficient for intake prescriptions.
   * Always set when nutrition is implicated without sync.
   */
  nutritionPrescriptionNote: string | null;
};

export type InsightsEngineResult = {
  insights: InsightProposal[];
  signals: CrossDomainSignals;
  engineVersion: string;
};
