import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { WeeklyReviewSectionId } from "@/domain/weekly-review/constants";
import type { WeekWindow } from "@/domain/weekly-review/week";

/** Compact section — summaries only, not raw series dumps. */
export type WeeklyReviewSection = {
  id: WeeklyReviewSectionId;
  label: string;
  summary: string;
  thisWeekDisplay: string | null;
  previousWeekDisplay: string | null;
  deltaDisplay: string | null;
  confidence: ConfidenceLevel;
  missingNote: string | null;
};

export type WeeklyNextWeekPlan = {
  keep: string[];
  change: string[];
  watch: string[];
};

export type WeeklyAthleteReviewPayload = {
  engineVersion: string;
  week: {
    weekKey: string;
    weekStartIso: string;
    weekEndIso: string;
    rangeLabel: string;
    /** True when the week has not fully ended yet. */
    inProgress: boolean;
  };
  previousWeekKey: string;
  sections: WeeklyReviewSection[];
  mainImprovement: { title: string; detail: string } | null;
  biggestLimitation: { title: string; detail: string } | null;
  nextWeek: WeeklyNextWeekPlan;
  honesty: readonly string[];
};

/** Raw week signals — gathered by the service, assembled in domain. */
export type WeeklyWeekSignals = {
  window: WeekWindow;
  completedSessions: number;
  skippedProgramSessions: number;
  programLinkedCompleted: number;
  /** Total tonnage kg·reps when load+reps logged. */
  volumeKg: number;
  volumeSetCount: number;
  /** Best major-lift e1RM samples in week (display kg already canonical). */
  bestE1rmByLift: Record<string, number>;
  techniqueScores: number[];
  recoveryReadiness: number[];
  bodyweightKg: number[];
  /** New all-time highs hit during this week. */
  prLabels: string[];
};

export type AssembleWeeklyReviewInput = {
  thisWeek: WeeklyWeekSignals;
  previousWeek: WeeklyWeekSignals;
  now: Date;
  unitsLabel: "kg" | "lb";
};
