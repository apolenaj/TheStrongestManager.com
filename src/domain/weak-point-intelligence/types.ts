import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { WeakPointCategory } from "@/domain/weak-point-intelligence/constants";
import type { WeakPointId } from "@/domain/exercise-prescription/constants";

export type WeakPointEvidenceItem = {
  label: string;
  detail: string;
};

/**
 * Evidence-backed weak-point finding.
 * Must include non-empty evidence[] to be emitted.
 */
export type WeakPointFinding = {
  id: string;
  category: WeakPointCategory;
  title: string;
  /** Athlete-facing “Potential weak point” label. */
  potentialWeakPoint: string;
  detail: string;
  confidence: ConfidenceLevel;
  evidence: WeakPointEvidenceItem[];
  recommendedValidation: string[];
  /** Bridge to exercise prescription when applicable. */
  prescriptionWeakPoint: WeakPointId | null;
  href: string | null;
  missingInformation: string[];
};

export type WeakPointIntelligenceResult = {
  engineVersion: string;
  findings: WeakPointFinding[];
  honesty: readonly string[];
  missingInformation: string[];
  emptyReason: string | null;
};

/** Inputs gathered by the service — domain stays pure. */
export type WeakPointTechniqueSample = {
  analysisId: string;
  createdAtIso: string;
  overallScore: number | null;
  components: Array<{
    id: string;
    label: string;
    score: number | null;
    status: "observed" | "unavailable";
    confidence: ConfidenceLevel;
    evidence: string;
  }>;
};

export type WeakPointLiftSample = {
  metricKey: string;
  label: string;
  valueKg: number;
  recordedAtIso: string;
};

export type WeakPointSignals = {
  techniqueSamples: WeakPointTechniqueSample[];
  lifts: WeakPointLiftSample[];
  completedSessionsLast28Days: number;
  skippedProgramSessionsLast28Days: number;
  hasActiveProgram: boolean;
  recoveryCheckInsLast7Days: number;
  latestReadiness: number | null;
  avgReadinessLast7Days: number | null;
  performanceTrendDirection: string | null;
  techniqueTrendDirection: string | null;
  loadSpikeFlagged: boolean;
};
