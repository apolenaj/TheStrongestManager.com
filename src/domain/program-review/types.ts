import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { ProgramReviewDimensionId } from "@/domain/program-review/constants";

/**
 * Dimension status — never use a standalone “bad” verdict.
 * Context mismatches are called out against athlete constraints.
 */
export type ProgramReviewDimensionStatus =
  | "strong"
  | "adequate"
  | "needs_attention"
  | "context_mismatch"
  | "insufficient_data";

export type ProgramReviewDimension = {
  id: ProgramReviewDimensionId;
  label: string;
  status: ProgramReviewDimensionStatus;
  finding: string;
  /** Explicit tie to goal / experience / schedule / equipment / recovery. */
  contextNote: string | null;
  confidence: ConfidenceLevel;
};

export type WeeklyStressDay = {
  dayIndex: number;
  label: string;
  /** Relative stress band from prescription density — not injury risk. */
  stressBand: "low" | "moderate" | "high" | "rest" | "unknown";
  exerciseCount: number;
  estimatedSets: number;
  detail: string;
};

export type ProgramAiReviewPayload = {
  engineVersion: string;
  program: {
    id: string;
    name: string;
    kind: string;
    status: string;
    description: string | null;
  };
  overview: string;
  strengths: string[];
  potentialIssues: string[];
  goalAlignment: {
    summary: string;
    aligned: boolean | null;
    confidence: ConfidenceLevel;
  };
  weeklyStressDistribution: WeeklyStressDay[];
  recommendedImprovements: string[];
  dimensions: ProgramReviewDimension[];
  athleteContextUsed: {
    goalTitle: string | null;
    experienceLevel: string | null;
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    equipmentCount: number;
    recoveryCapacityLabel: string;
  };
  honesty: readonly string[];
  missingInformation: string[];
  /** Transparent Training Program Score (Prompt 57) — null overall when sparse. */
  programScore: import("@/domain/program-score").ProgramScoreResult;
};

/** Athlete context that frames every finding. */
export type ProgramReviewAthleteContext = {
  goalTitle: string | null;
  goalCategory: string | null;
  experienceLevel: string | null;
  daysPerWeek: number | null;
  sessionLengthMinutes: number | null;
  availableEquipment: string[];
  /** limited | moderate | high | unknown — from habits + recent readiness. */
  recoveryCapacity: "limited" | "moderate" | "high" | "unknown";
  primaryDiscipline: string | null;
};

/** Structural signals extracted from the program graph. */
export type ProgramStructureSignals = {
  programId: string;
  name: string;
  kind: string;
  status: string;
  description: string | null;
  weekCount: number;
  /** Distinct training days in a representative week (dayIndex with workout). */
  trainingDaysPerWeek: number;
  totalWorkoutSlots: number;
  exerciseLines: Array<{
    name: string;
    movementPattern: string;
    category: string;
    difficulty: string;
    equipment: string[];
    targetSets: number | null;
    targetReps: string | null;
    targetRpe: number | null;
    targetPercent: number | null;
    targetLoadKg: number | null;
    dayIndex: number | null;
    weekNumber: number | null;
  }>;
  progressionRuleKinds: string[];
  /** Per dayIndex aggregated across first week with days (or all days averaged). */
  dayLoads: Array<{
    dayIndex: number;
    label: string;
    exerciseCount: number;
    estimatedSets: number;
    avgRpe: number | null;
    avgPercent: number | null;
  }>;
  estimatedWeeklySets: number;
  hasPercentPrescription: boolean;
  hasRpePrescription: boolean;
  hasLoadPrescription: boolean;
};
