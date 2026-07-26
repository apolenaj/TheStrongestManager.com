import type {
  TciContextKind,
  TciDayOutcome,
} from "@/domain/training-consistency-intelligence/constants";

export type PlanDayExpectation = "training" | "rest" | "none";

export type ConsistencyContextWindow = {
  kind: TciContextKind;
  startDayKey: string;
  endDayKey: string;
  label: string;
};

export type ConsistencySessionPoint = {
  dayKey: string;
  status: "planned" | "in_progress" | "completed" | "skipped";
  programLinked: boolean;
};

export type ConsistencyPlanDay = {
  dayKey: string;
  /** From active program template for that weekday / week slot. */
  expectation: PlanDayExpectation;
  dayName: string | null;
};

export type ConsistencyDayResult = {
  dayKey: string;
  expectation: PlanDayExpectation;
  outcome: TciDayOutcome;
  contexts: TciContextKind[];
  explanation: string;
};

export type TrainingConsistencyAnalysis = {
  engineVersion: string;
  windowLabel: string;
  /** Plan adherence 0–100, or null when under sample gate. */
  adherencePct: number | null;
  publishable: boolean;
  suppressedReason: string | null;
  resolvedPlanDays: number;
  adheredDays: number;
  missedDays: number;
  contextAdjustedDays: number;
  plannedRestHonored: number;
  /** Unscheduled completed sessions — not part of adherence. */
  extraGymSessions: number;
  /** Blind full-completion on rest-heavy weeks is flagged, not praised. */
  blindCompletionNote: string | null;
  days: ConsistencyDayResult[];
  activeContexts: ConsistencyContextWindow[];
  narrativeLines: string[];
  honesty: readonly string[];
};
