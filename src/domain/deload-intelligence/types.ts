import type { DeloadSignalKey } from "@/domain/deload-intelligence/constants";

export type DeloadSignalEvaluation = {
  key: DeloadSignalKey;
  label: string;
  fired: boolean;
  available: boolean;
  detail: string;
};

export type DeloadRecommendationStatus =
  | "consider"
  | "hold"
  | "insufficient"
  | "suppressed_recent_deload";

export type DeloadIntelligenceAnalysis = {
  engineVersion: string;
  windowLabel: string;
  status: DeloadRecommendationStatus;
  /** Always "Consider deload" when status === consider; otherwise hold/insufficient copy. */
  recommendationLabel: string;
  explanation: string[];
  signals: DeloadSignalEvaluation[];
  signalsFired: number;
  signalsAvailable: number;
  sessionCount: number;
  publishable: boolean;
  suppressedReason: string | null;
  confidence: "none" | "low" | "medium" | "high";
  honesty: readonly string[];
  /** Explicit: never auto-applied. */
  userDecides: true;
};
