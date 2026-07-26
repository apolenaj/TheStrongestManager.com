import type {
  PainSafeAggressiveKind,
  PainSafeCategory,
  PainSafeSurface,
} from "@/domain/pain-safe-response-system/constants";

export type PainSafeReportInput = {
  category: PainSafeCategory;
  notes: string | null;
  /** user_report | inferred */
  source: "user_report" | "inferred";
  reportedAt: string;
  active: boolean;
};

export type PainSafeDetection = {
  category: PainSafeCategory;
  label: string;
  matched: boolean;
  evidence: string;
  source: "user_report" | "inferred";
};

export type PainSafeAnalysis = {
  engineVersion: string;
  active: boolean;
  categoriesActive: PainSafeCategory[];
  detections: PainSafeDetection[];
  seekCareMessage: string;
  suppressedAggressiveKinds: readonly PainSafeAggressiveKind[];
  explanation: string[];
  honesty: readonly string[];
  /** Explicit: never diagnose. */
  neverDiagnose: true;
};

export type PainSafeGuardResult<T> = {
  recommendation: T | null;
  suppressed: boolean;
  painSafeModeActive: boolean;
  seekCareMessage: string | null;
  surface: PainSafeSurface;
  reason: string | null;
};
