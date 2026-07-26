import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { MonthlyReportSectionId } from "@/domain/monthly-report/constants";
import type { MonthWindow } from "@/domain/monthly-report/month";

export type MonthlyReportSection = {
  id: MonthlyReportSectionId;
  label: string;
  summary: string;
  thisMonthDisplay: string | null;
  previousMonthDisplay: string | null;
  deltaDisplay: string | null;
  confidence: ConfidenceLevel;
  missingNote: string | null;
};

export type MonthlyNextPriorities = {
  keep: string[];
  change: string[];
  watch: string[];
};

export type MonthlyAthleteReportPayload = {
  engineVersion: string;
  month: {
    monthKey: string;
    monthStartIso: string;
    monthEndIso: string;
    rangeLabel: string;
    label: string;
    inProgress: boolean;
  };
  previousMonthKey: string;
  sections: MonthlyReportSection[];
  headline: string | null;
  nextPriorities: MonthlyNextPriorities;
  honesty: readonly string[];
};

/** Public-safe share card — no recovery notes or private dumps. */
export type MonthlyReportSharePayload = {
  athleteDisplayName: string;
  monthLabel: string;
  monthKey: string;
  headline: string | null;
  highlights: string[];
  honestyNote: string;
  engineVersion: string;
};

export type MonthlyMonthSignals = {
  window: MonthWindow;
  completedSessions: number;
  skippedSessions: number;
  volumeKg: number;
  volumeSetCount: number;
  bestE1rmByLift: Record<string, number>;
  techniqueScores: number[];
  recoveryCheckIns: number;
  bodyweightKg: number[];
  prLabels: string[];
  /** Active goals with optional qualitative progress note. */
  goals: Array<{ title: string; category: string | null }>;
  trainingDaysWithSession: number;
};

export type AssembleMonthlyReportInput = {
  thisMonth: MonthlyMonthSignals;
  previousMonth: MonthlyMonthSignals;
  athleteDisplayName: string;
  now: Date;
  unitsLabel: "kg" | "lb";
};
