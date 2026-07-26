import type { ConfidenceLevel } from "@/domain/scoring/types";

/**
 * Honesty label for a Performance Intelligence field.
 * Aligns with dashboard MetricSource — insufficient when the field cannot be shown.
 */
export type IntelligenceSource =
  | "observed"
  | "heuristic"
  | "reported"
  | "recommended"
  | "insufficient";

export type TrendDirection = "up" | "down" | "flat" | "unknown";

/**
 * Every AthleteState field carries provenance — UI must not invent missing pieces.
 */
export type StateField<T> = {
  /** Null when the field cannot be derived honestly. */
  value: T | null;
  source: IntelligenceSource;
  confidence: ConfidenceLevel;
  lastUpdated: Date | null;
  /** Human-readable dependencies still needed for a stronger reading. */
  missingDependencies: string[];
  /** Short athlete-facing explanation — never a medical claim. */
  summary: string;
};

export type PerformanceTrendValue = {
  direction: TrendDirection;
  /** Displayable strength score 0–100 when confidence allows. */
  strengthScore: number | null;
  /** Percent change from strength trend windows when known. */
  percentChange: number | null;
};

export type FatigueTrendValue = {
  /** up = rising load pressure / recovery stress; not a diagnosis. */
  direction: TrendDirection;
  loadSpikeFlagged: boolean;
  volumeTrendPct: number | null;
  readinessDelta: number | null;
};

export type TechniqueTrendValue = {
  direction: TrendDirection;
  /** Displayable technique score when confidence allows. */
  techniqueScore: number | null;
  sampleCount: number;
  latestScore: number | null;
};

export type BodyweightTrendValue = {
  direction: TrendDirection;
  /** kg per week slope when estimable. */
  kgPerWeek: number | null;
  latestKg: number | null;
};

export type TrainingConsistencyValue = {
  /** Displayable consistency score 0–100. */
  score: number | null;
  completedInWindow: number;
  resolvedInWindow: number;
};

export type ProgramProgressValue = {
  /** Displayable programming/adherence score 0–100. */
  score: number | null;
  activeProgramName: string | null;
  hasActiveProgram: boolean;
};

export type RecoveryStatusValue = {
  /** Displayable recovery score 0–100. */
  score: number | null;
  latestReadiness: number | null;
  statusLabel: "insufficient" | "low" | "moderate" | "high";
};

export type GoalProgressValue = {
  goalTitle: string | null;
  goalCategory: string | null;
  /** Qualitative only — never invents % complete without a measurable target. */
  statusLabel:
    | "no_goal"
    | "on_file"
    | "aligned_with_strength_trend"
    | "needs_attention"
    | "insufficient_signals";
};

export type DataConfidenceValue = {
  /** Aggregate confidence across pillars that have any signal. */
  overall: ConfidenceLevel;
  fieldCountWithSignal: number;
  fieldCountTotal: number;
};

export type DataFreshnessValue = {
  /** Age in hours of the newest training/recovery/technique/body signal. */
  newestSignalAgeHours: number | null;
  /** stale when newest signal older than threshold; unknown when no signals. */
  freshnessLabel: "fresh" | "aging" | "stale" | "unknown";
  newestSignalAt: Date | null;
  newestSignalKind: string | null;
  /**
   * Prompt 143 — per-pillar relative freshness for Technique / Recovery / Strength.
   * Athlete-facing lines (e.g. “Technique data: 42 days old.”).
   */
  pillars: {
    technique: {
      band: "fresh" | "aging" | "stale" | "missing";
      relativeLabel: string;
      displayLine: string;
      lastAt: Date | null;
      ageDays: number | null;
    };
    recovery: {
      band: "fresh" | "aging" | "stale" | "missing";
      relativeLabel: string;
      displayLine: string;
      lastAt: Date | null;
      ageDays: number | null;
    };
    strength: {
      band: "fresh" | "aging" | "stale" | "missing";
      relativeLabel: string;
      displayLine: string;
      lastAt: Date | null;
      ageDays: number | null;
    };
  };
  displayLines: string[];
};

/**
 * Structured athlete-state model — single coherent reasoning snapshot.
 * Assembled only by Performance Intelligence (domain assemble + service).
 */
export type AthleteState = {
  athleteProfileId: string;
  computedAt: Date;
  engineVersion: string;
  performanceTrend: StateField<PerformanceTrendValue>;
  fatigueTrend: StateField<FatigueTrendValue>;
  techniqueTrend: StateField<TechniqueTrendValue>;
  bodyweightTrend: StateField<BodyweightTrendValue>;
  trainingConsistency: StateField<TrainingConsistencyValue>;
  programProgress: StateField<ProgramProgressValue>;
  recoveryStatus: StateField<RecoveryStatusValue>;
  goalProgress: StateField<GoalProgressValue>;
  dataConfidence: StateField<DataConfidenceValue>;
  dataFreshness: StateField<DataFreshnessValue>;
  /**
   * Nutrition remains optional — status only when a real connection exists.
   * Never invents macros.
   */
  nutritionAvailability: StateField<{
    connected: boolean;
    hasTargets: boolean;
    label: string;
  }>;
};
