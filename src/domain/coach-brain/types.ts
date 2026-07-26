import type { ConfidenceLevel } from "@/domain/scoring/types";
import type {
  CoachBrainAuditAction,
  CoachBrainToolName,
} from "@/domain/coach-brain/constants";

/** Supporting fact cited in an explainable recommendation (not CoT). */
export type CoachSupportingDatum = {
  tool: CoachBrainToolName | "rules" | "performance_intelligence";
  key: string;
  /** Short display value — never raw PII dumps. */
  value: string;
};

export type CoachRecommendedActionKind =
  | "review"
  | "log"
  | "confirm_adaptation"
  | "connect"
  | "none";

export type CoachRecommendedAction = {
  kind: CoachRecommendedActionKind;
  label: string;
  href: string | null;
  /**
   * True for any program/load change. The brain never applies these itself —
   * athlete must Accept/Modify/Decline via adaptive programming.
   */
  requiresExplicitConfirmation: boolean;
};

/**
 * Structured AI Coach recommendation — every emission must include all fields.
 * reasoningSummary is concise and athlete-facing; never dump hidden CoT.
 */
export type CoachBrainRecommendation = {
  id: string;
  recommendation: string;
  reasoningSummary: string;
  supportingData: CoachSupportingDatum[];
  confidence: ConfidenceLevel;
  risks: string[];
  missingInformation: string[];
  recommendedAction: CoachRecommendedAction;
  /** Deterministic rule id that produced this candidate (auditability). */
  ruleId: string;
};

export type CoachBrainToolResult<T> = {
  tool: CoachBrainToolName;
  ok: boolean;
  /** Null when tool could not gather honest data. */
  data: T | null;
  missing: string[];
  fetchedAt: Date;
};

export type CoachBrainToolBag = {
  getAthleteProfile: CoachBrainToolResult<AthleteProfileToolData>;
  getRecentTraining: CoachBrainToolResult<RecentTrainingToolData>;
  getTechniqueTrend: CoachBrainToolResult<TechniqueTrendToolData>;
  getRecoveryTrend: CoachBrainToolResult<RecoveryTrendToolData>;
  getProgramContext: CoachBrainToolResult<ProgramContextToolData>;
  getGoalProgress: CoachBrainToolResult<GoalProgressToolData>;
  getRecentPRs: CoachBrainToolResult<RecentPRsToolData>;
  getNutritionSummary: CoachBrainToolResult<NutritionSummaryToolData>;
  getAthleteState: CoachBrainToolResult<import("@/domain/performance-intelligence").AthleteState>;
};

export type AthleteProfileToolData = {
  displayName: string | null;
  discipline: string | null;
  experienceLevel: string | null;
  units: string;
};

export type RecentTrainingToolData = {
  completedLast7Days: number;
  completedLast28Days: number;
  recentSessions: {
    id: string;
    title: string;
    status: string;
    when: string | null;
    href: string;
  }[];
};

export type TechniqueTrendToolData = {
  direction: string;
  latestScore: number | null;
  sampleCount: number;
  summary: string;
  latestAnalysisId: string | null;
  latestAnalysisHref: string | null;
};

export type RecoveryTrendToolData = {
  statusLabel: string;
  latestReadiness: number | null;
  score: number | null;
  summary: string;
  /** Honest count for chat copy — never invent “poor recovery” from thin logs. */
  checkInsLast7Days: number;
};

export type ProgramContextToolData = {
  hasActiveProgram: boolean;
  activeProgramName: string | null;
  adherenceScore: number | null;
  summary: string;
};

export type GoalProgressToolData = {
  goalTitle: string | null;
  statusLabel: string;
  summary: string;
};

export type RecentPRsToolData = {
  lifts: {
    label: string;
    display: string;
    source: string;
    metricKey: string;
    valueKg: number;
  }[];
};

export type NutritionSummaryToolData = {
  connected: boolean;
  hasTargets: boolean;
  label: string;
};

/** Intermediate rule hit before AI reasoning / safety. */
export type CoachBrainRuleHit = {
  ruleId: string;
  priority: number;
  category: "training" | "technique" | "recovery" | "nutrition" | "assessment" | "programming";
  draftRecommendation: string;
  draftReasoning: string;
  supportingData: CoachSupportingDatum[];
  confidence: ConfidenceLevel;
  risks: string[];
  missingInformation: string[];
  recommendedAction: CoachRecommendedAction;
};

export type CoachBrainSafetyFlag = {
  code: string;
  message: string;
  severity: "block" | "warn";
};

export type CoachBrainReasoningResult = {
  adapterId: string;
  /** Structured recommendations only — no CoT field. */
  recommendations: CoachBrainRecommendation[];
  /** Opaque adapter notes for audit (never athlete-facing CoT). */
  adapterNotes: string[];
};

export type CoachBrainRunResult = {
  runId: string;
  engineVersion: string;
  adapterId: string;
  athleteProfileId: string;
  recommendations: CoachBrainRecommendation[];
  safetyFlags: CoachBrainSafetyFlag[];
  rejected: boolean;
  honesty: readonly string[];
  toolsUsed: CoachBrainToolName[];
};

export type CoachBrainAuditWrite = {
  athleteProfileId: string;
  actorUserId: string | null;
  runId: string;
  action: CoachBrainAuditAction;
  engineVersion: string;
  adapterId: string;
  summary: string;
  detail: Record<string, unknown>;
  safetyFlags: CoachBrainSafetyFlag[];
};
