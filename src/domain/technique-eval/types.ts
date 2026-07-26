import type { CameraAngleId } from "@/domain/technique/constants";
import type {
  LandmarkName,
  MovementPhaseId,
  PoseFrame,
} from "@/domain/movement/types";
import type {
  TechniqueEvalCaseId,
  TechniqueEvalMetricId,
} from "@/domain/technique-eval/constants";

/** How the case was authored — gates public accuracy claims. */
export type TechniqueEvalDatasetKind =
  | "synthetic_fixture"
  | "human_labeled";

/**
 * Test-dataset architecture: each case is frames + ground truth + expectations.
 * Human-labeled rows would attach videoId / annotator / schemaVersion later —
 * the shape stays the same so fixtures and labeled sets share one harness.
 */
export type TechniqueEvalGroundTruth = {
  /** Landmark names that should meet min coverage when visibility allows. */
  requiredLandmarks: LandmarkName[];
  /** Min fraction of frames with visibility ≥ threshold per required landmark. */
  minCoverageByLandmark?: Partial<Record<LandmarkName, number>>;
  /** Max allowed coverage (e.g. intentionally low-visibility fixtures). */
  maxCoverageByLandmark?: Partial<Record<LandmarkName, number>>;
  /** Phases that should appear (order-independent). */
  expectedPhases: MovementPhaseId[];
  /** Phases that must never be invented. */
  forbiddenPhases?: MovementPhaseId[];
  /** Metric keys expected to be observable (non-null value, confidence ≠ none). */
  expectedObservableMetricKeys?: string[];
  /**
   * Keys that must be angle-limited: listed in limitedMetricKeys, and either
   * value null / confidence none (unsuitable) or confidence reduced (partial).
   */
  expectedLimitedMetricKeys?: string[];
  cameraSuitable: boolean;
  /** When true, overallTechniqueScore must be null. */
  withholdTechniqueScore?: boolean;
};

export type TechniqueEvalCase = {
  id: TechniqueEvalCaseId;
  title: string;
  description: string;
  datasetKind: TechniqueEvalDatasetKind;
  exerciseSlug: string;
  cameraAngle: CameraAngleId;
  frames: PoseFrame[];
  groundTruth: TechniqueEvalGroundTruth;
  /** Which metrics this case primarily exercises. */
  focuses: TechniqueEvalMetricId[];
};

export type TechniqueEvalCheck = {
  metricId: TechniqueEvalMetricId;
  caseId: TechniqueEvalCaseId;
  passed: boolean;
  detail: string;
  /** Internal rate in [0,1] when meaningful; null if not computable. */
  rate: number | null;
};

export type TechniqueEvalCaseResult = {
  caseId: TechniqueEvalCaseId;
  title: string;
  passed: boolean;
  checks: TechniqueEvalCheck[];
};

export type TechniqueEvalSuiteResult = {
  engineVersion: typeof import("@/domain/technique-eval/constants").TECHNIQUE_EVAL_ENGINE_VERSION;
  passed: boolean;
  results: TechniqueEvalCaseResult[];
  /** Aggregate internal rates by metric (fixture-only until labeled data exists). */
  metricRates: Record<
    TechniqueEvalMetricId,
    { rate: number | null; sampleCount: number }
  >;
  humanLabeledCaseCount: number;
  syntheticCaseCount: number;
};

export type AccuracyClaimResult = {
  claimable: boolean;
  /** Safe string for UI / marketing — never invents a % without labeled data. */
  text: string;
  rate: number | null;
  labeledSampleCount: number;
};
