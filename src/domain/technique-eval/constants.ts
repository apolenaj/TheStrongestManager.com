/**
 * Technique model evaluation — offline benchmarks (Prompt 94).
 * Synthetic fixtures power regression; never publish production accuracy %
 * without a human-labeled dataset.
 */

export const TECHNIQUE_EVAL_ENGINE_VERSION = "technique_eval.v1" as const;

export const TECHNIQUE_EVAL_METRIC_IDS = [
  "landmark_detection_quality",
  "phase_detection",
  "metric_consistency",
  "camera_angle_robustness",
] as const;
export type TechniqueEvalMetricId = (typeof TECHNIQUE_EVAL_METRIC_IDS)[number];

export const TECHNIQUE_EVAL_METRIC_LABELS: Record<
  TechniqueEvalMetricId,
  string
> = {
  landmark_detection_quality: "Landmark detection quality",
  phase_detection: "Phase detection",
  metric_consistency: "Metric consistency",
  camera_angle_robustness: "Camera angle robustness",
};

export const TECHNIQUE_EVAL_CASE_IDS = [
  "side_clean_fixture",
  "side_low_visibility",
  "front_partial_sagittal",
  "overhead_unsuitable",
  "metric_repeatability",
  "forty_five_foreshorten",
] as const;
export type TechniqueEvalCaseId = (typeof TECHNIQUE_EVAL_CASE_IDS)[number];

export const TECHNIQUE_EVAL_HONESTY = [
  "Internal fixture rates are regression signals — not published product accuracy.",
  "Never publicly claim accuracy percentages without a human-labeled benchmark dataset.",
  "Synthetic deadlift trajectories are labeled fixture, not athlete video.",
  "Unsuitable camera angles must withhold metrics rather than invent biomechanics.",
] as const;

/** Minimum mean landmark visibility to count a frame as “detected” in fixtures. */
export const TECHNIQUE_EVAL_LANDMARK_VIS_THRESHOLD = 0.35;

/** Max absolute drift allowed for metric values across identical re-runs. */
export const TECHNIQUE_EVAL_METRIC_EPSILON = 1e-9;
