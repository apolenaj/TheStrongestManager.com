import type {
  SessionCheckInField,
  SessionReadinessRecommendation,
} from "@/domain/session-readiness-adjuster/constants";

export type SessionReadinessCheckIn = {
  /** Hours slept — null when skipped. */
  sleepHours: number | null;
  /** 1–10 higher = more fatigued. */
  fatigue: number | null;
  /** 1–10 higher = more sore. */
  soreness: number | null;
  /** 1–10 higher = more motivated. */
  motivation: number | null;
};

export type SessionConcernFlag = {
  field: SessionCheckInField;
  label: string;
  detail: string;
};

export type SessionReadinessAdjustment = {
  recommendation: SessionReadinessRecommendation;
  recommendationLabel: string;
  headline: string;
  detail: string;
  concerns: SessionConcernFlag[];
  concernCount: number;
  signalsLogged: number;
  /** Always false — product never recommends cancel. */
  cancelsWorkout: false;
  /** True when a single concern was present but escalation was capped. */
  singleMetricEscalationBlocked: boolean;
  notes: string[];
  honesty: readonly string[];
  engineVersion: string;
};

export type SessionReadinessAdjusterSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  recommendations: Array<{
    id: SessionReadinessRecommendation;
    label: string;
    detail: string;
  }>;
  checkInFields: Array<{ id: SessionCheckInField; label: string }>;
  forbidden: readonly string[];
  reviewLoadMinConcerns: number;
  docPath: "docs/SESSION_READINESS_ADJUSTER.md";
  generatedAt: string;
};
