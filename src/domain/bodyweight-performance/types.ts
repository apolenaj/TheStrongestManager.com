export type BwPerfTrendDirection = "up" | "down" | "stable" | "unknown";

export type BwPerfSample = {
  at: string;
  valueKg: number;
};

export type BwPerfWindowSummary = {
  startKg: number | null;
  endKg: number | null;
  deltaKg: number | null;
  deltaDisplay: string | null;
  trend: BwPerfTrendDirection;
  sampleCount: number;
};

export type BodyweightPerformanceAnalysis = {
  engineVersion: string;
  windowLabel: string;
  windowStart: string;
  windowEnd: string;
  bodyweight: BwPerfWindowSummary;
  estimatedStrength: BwPerfWindowSummary;
  relativeStrength: {
    startRatio: number | null;
    endRatio: number | null;
    deltaRatio: number | null;
    deltaDisplay: string | null;
    trend: BwPerfTrendDirection;
  };
  /** Human-readable trend lines (e.g. the Prompt 121 example). */
  narrativeLines: string[];
  missingNotes: string[];
  disclaimers: readonly string[];
};
