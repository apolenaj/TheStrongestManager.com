export {
  TECHNIQUE_EVAL_ENGINE_VERSION,
  TECHNIQUE_EVAL_METRIC_IDS,
  TECHNIQUE_EVAL_METRIC_LABELS,
  TECHNIQUE_EVAL_CASE_IDS,
  TECHNIQUE_EVAL_HONESTY,
  TECHNIQUE_EVAL_LANDMARK_VIS_THRESHOLD,
  TECHNIQUE_EVAL_METRIC_EPSILON,
} from "@/domain/technique-eval/constants";
export type {
  TechniqueEvalMetricId,
  TechniqueEvalCaseId,
} from "@/domain/technique-eval/constants";

export type {
  TechniqueEvalDatasetKind,
  TechniqueEvalGroundTruth,
  TechniqueEvalCase,
  TechniqueEvalCheck,
  TechniqueEvalCaseResult,
  TechniqueEvalSuiteResult,
  AccuracyClaimResult,
} from "@/domain/technique-eval/types";

export {
  TECHNIQUE_EVAL_DATASET,
  getTechniqueEvalCase,
  buildMissingKneeWristFrames,
} from "@/domain/technique-eval/dataset";

export {
  formatPublicAccuracyClaim,
  formatInternalFixtureRate,
  NO_PUBLIC_ACCURACY_CLAIM,
} from "@/domain/technique-eval/accuracy-claims";

export {
  runTechniqueEvalSuite,
  evaluateTechniqueEvalCaseById,
} from "@/domain/technique-eval/runBenchmark";

export {
  buildTechniqueEvalDashboardSnapshot,
  type TechniqueEvalDashboardSnapshot,
} from "@/domain/technique-eval/dashboard";
