import type { ConfidenceLevel } from "@/domain/scoring/types";
import type {
  RetentionDayResolution,
  RetentionLoopId,
  RetentionLoopStatus,
} from "@/domain/behavioral-retention/constants";

export type RetentionDaySignal = {
  /** yyyy-mm-dd UTC */
  dayKey: string;
  resolution: RetentionDayResolution;
  sessionCount: number;
};

export type RetentionLoopCard = {
  id: RetentionLoopId;
  label: string;
  status: RetentionLoopStatus;
  headline: string;
  detail: string;
  href: string;
  /** Primary metric when honest (e.g. streak days). Null when insufficient. */
  metricValue: number | null;
  metricLabel: string | null;
  confidence: ConfidenceLevel;
  evidence: string[];
  /** Soft nudge — never guilt. */
  nudge: string | null;
};

export type BehavioralRetentionPayload = {
  engineVersion: string;
  lookbackDays: number;
  generatedAtIso: string;
  summaryLine: string | null;
  loops: RetentionLoopCard[];
  /** On-plan streak: completed + planned_rest continue; missed breaks. */
  onPlanStreakDays: number;
  plannedRestDaysInStreak: number;
  missedPlannedSessions: number;
  completedSessions: number;
  honesty: readonly string[];
};

export type BehavioralRetentionSignals = {
  now: Date;
  lookbackDays: number;
  days: RetentionDaySignal[];
  weeklyReview: {
    hasCurrentWeekReview: boolean;
    weekKey: string | null;
    summary: string | null;
  };
  goal: {
    title: string | null;
    category: string | null;
    /** Qualitative: improving | stable | declining | unknown */
    progressLabel: string | null;
    hasLoggedProgress: boolean;
  };
  technique: {
    sampleCount: number;
    delta: number | null;
    direction: "improved" | "stable" | "regressed" | null;
  };
};
