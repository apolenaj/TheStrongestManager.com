import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { DailyBriefSectionKind } from "@/domain/daily-brief/constants";

/** Compact labeled line in the Today composition. */
export type DailyBriefLine = {
  kind: DailyBriefSectionKind;
  label: string;
  body: string;
  href: string | null;
};

/**
 * One prioritized insight (max three on the brief).
 * Distinct from every possible section — only high-value items.
 */
export type DailyBriefInsight = {
  id: string;
  kind: DailyBriefSectionKind;
  title: string;
  body: string;
  why: string | null;
  href: string | null;
  priority: number;
  confidence: ConfidenceLevel;
};

export type DailyCoachingBrief = {
  engineVersion: string;
  dateKey: string;
  /** Athlete-facing headline — always "Today". */
  headline: string;
  /**
   * Composed lines for the central brief (subset only).
   * Order: primary focus → why → training → recovery → goal → warning → action.
   */
  lines: DailyBriefLine[];
  /** Max three high-value insights with deep links. */
  insights: DailyBriefInsight[];
  honesty: readonly string[];
  missingSignals: string[];
};

/** Structured inputs — service gathers; domain never hits Prisma. */
export type DailyBriefWorkoutInput = {
  activeSessionId: string | null;
  prescriptionTitle: string | null;
  prescriptionGoal: string | null;
  programName: string | null;
  emptyReason: string | null;
  /** True when today’s preview includes a deadlift-like lift. */
  hasDeadliftToday: boolean;
  /** First technique cue from today’s prescription, if any. */
  techniqueCue: string | null;
};

export type DailyBriefTechniqueInput = {
  latestAnalysisId: string | null;
  latestAnalysisHref: string | null;
  sampleCount: number;
  /** Weakest / focus component label when known from assessments. */
  focusLabel: string | null;
  /** Honest why grounded in last analyses — never invented. */
  why: string | null;
  /** Camera angle of latest analysis (e.g. forty_five). */
  cameraAngle: string | null;
  /** Component scores worsening across last two analyses. */
  variationIncreasing: boolean;
};

export type DailyBriefAthleteSignals = {
  loadSpikeFlagged: boolean;
  recoveryStatusLabel: string | null;
  latestReadiness: number | null;
  recoveryCheckInsLast7Days: number;
  techniqueTrendDirection: string | null;
  techniqueSampleCount: number;
  goalTitle: string | null;
  goalStatusLabel: string | null;
  goalSummary: string | null;
  dataConfidence: string | null;
};
