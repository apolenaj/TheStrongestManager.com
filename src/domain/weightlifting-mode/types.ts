import type {
  WeightliftingDashboardPriority,
  WeightliftingLiftId,
  WeightliftingTrackingArea,
} from "@/domain/weightlifting-mode/constants";

export type WeightliftingLiftCard = {
  liftId: WeightliftingLiftId;
  label: string;
  loadKg: number | null;
  metricKey: string;
  recordedAtIso: string | null;
  source: "reported_pr" | "missing";
};

export type WeightliftingPriorityCard = {
  id: WeightliftingDashboardPriority;
  label: string;
  headline: string;
  detail: string;
  href: string | null;
  metricValue: number | null;
  metricUnit: string | null;
  available: boolean;
  missingNote: string | null;
};

export type WeightliftingPositionCue = {
  id: string;
  label: string;
  lifts: readonly string[];
};

export type WeightliftingModePayload = {
  engineVersion: string;
  generatedAtIso: string;
  lifts: WeightliftingLiftCard[];
  /** Snatch best + C&J best when both present. */
  competitionTotalKg: number | null;
  competitionTotalSource: "complete" | "partial" | "missing";
  priorities: WeightliftingPriorityCard[];
  tracking: Record<
    WeightliftingTrackingArea,
    {
      label: string;
      status: "ready" | "checklist" | "deferred" | "link";
      detail: string;
    }
  >;
  positions: WeightliftingPositionCue[];
  techniqueAnalysis: {
    implemented: false;
    advancedVideoAnalysisEnabled: boolean;
    reason: string;
  };
  attempts: {
    /** Structural WL attempt slots — not a make/miss oracle. */
    snatchAttempts: 3;
    cleanAndJerkAttempts: 3;
    detail: string;
    href: string;
  };
  competition: {
    hasPrep: boolean;
    name: string | null;
    dateIso: string | null;
    daysUntil: number | null;
  };
  honesty: readonly string[];
};

export type WeightliftingModeSignals = {
  now: Date;
  lifts: Partial<
    Record<
      WeightliftingLiftId,
      { loadKg: number; recordedAt: Date | null }
    >
  >;
  /** From product flag — advanced video analysis (default off). */
  advancedVideoAnalysisEnabled: boolean;
  competition: {
    hasPrep: boolean;
    name: string | null;
    dateIso: string | null;
    daysUntil: number | null;
  };
};
