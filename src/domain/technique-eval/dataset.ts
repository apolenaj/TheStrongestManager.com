/**
 * Technique eval test dataset — synthetic fixtures with ground truth.
 * Architecture is shared with future human-labeled rows (same case shape).
 */

import { buildDeadliftFixtureFrames } from "@/domain/movement/fixture";
import type { LandmarkName, PoseFrame } from "@/domain/movement/types";
import type { TechniqueEvalCase } from "@/domain/technique-eval/types";

const CORE_LANDMARKS: LandmarkName[] = [
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_shoulder",
  "right_shoulder",
  "left_wrist",
  "right_wrist",
];

function withVisibility(
  frames: PoseFrame[],
  visibility: number,
): PoseFrame[] {
  return frames.map((f) => ({
    ...f,
    landmarks: f.landmarks.map((lm) => ({ ...lm, visibility })),
  }));
}

function dropLandmarks(
  frames: PoseFrame[],
  names: LandmarkName[],
): PoseFrame[] {
  const drop = new Set(names);
  return frames.map((f) => ({
    ...f,
    landmarks: f.landmarks.filter((lm) => !drop.has(lm.name)),
  }));
}

const clean = buildDeadliftFixtureFrames(3);

export const TECHNIQUE_EVAL_DATASET: TechniqueEvalCase[] = [
  {
    id: "side_clean_fixture",
    title: "Side view — clean fixture",
    description:
      "High-visibility side deadlift trajectory; phases and landmarks should be recoverable.",
    datasetKind: "synthetic_fixture",
    exerciseSlug: "deadlift",
    cameraAngle: "side",
    frames: clean,
    groundTruth: {
      requiredLandmarks: CORE_LANDMARKS,
      minCoverageByLandmark: Object.fromEntries(
        CORE_LANDMARKS.map((n) => [n, 0.9]),
      ) as Partial<Record<LandmarkName, number>>,
      expectedPhases: ["setup", "lockout"],
      expectedObservableMetricKeys: [
        "torso_angle_consistency_deg",
        "shoulder_hip_horizontal_offset",
      ],
      cameraSuitable: true,
    },
    focuses: [
      "landmark_detection_quality",
      "phase_detection",
      "metric_consistency",
    ],
  },
  {
    id: "side_low_visibility",
    title: "Side view — low landmark visibility",
    description:
      "Same trajectory with visibility below detection threshold — coverage must reflect poor detection.",
    datasetKind: "synthetic_fixture",
    exerciseSlug: "deadlift",
    cameraAngle: "side",
    frames: withVisibility(clean, 0.1),
    groundTruth: {
      requiredLandmarks: CORE_LANDMARKS,
      // Visibility 0.1 < detection threshold → coverage must stay near zero
      maxCoverageByLandmark: Object.fromEntries(
        CORE_LANDMARKS.map((n) => [n, 0.05]),
      ) as Partial<Record<LandmarkName, number>>,
      expectedPhases: ["unknown"],
      forbiddenPhases: ["knee_level"],
      cameraSuitable: true,
      withholdTechniqueScore: true,
    },
    focuses: ["landmark_detection_quality", "phase_detection"],
  },
  {
    id: "front_partial_sagittal",
    title: "Front view — sagittal metrics limited",
    description:
      "Front angle remains suitable for symmetry; sagittal torso metrics should be limited/suppressed.",
    datasetKind: "synthetic_fixture",
    exerciseSlug: "deadlift",
    cameraAngle: "front",
    frames: clean,
    groundTruth: {
      requiredLandmarks: CORE_LANDMARKS,
      expectedPhases: ["setup", "lockout"],
      expectedLimitedMetricKeys: [
        "torso_angle_consistency_deg",
        "shoulder_hip_horizontal_offset",
      ],
      cameraSuitable: true,
    },
    focuses: ["camera_angle_robustness", "metric_consistency"],
  },
  {
    id: "overhead_unsuitable",
    title: "Overhead — unsuitable",
    description:
      "Overhead must be unsuitable; Technique Score withheld; limited metrics suppressed.",
    datasetKind: "synthetic_fixture",
    exerciseSlug: "deadlift",
    cameraAngle: "overhead",
    frames: clean,
    groundTruth: {
      requiredLandmarks: CORE_LANDMARKS,
      expectedPhases: [],
      expectedLimitedMetricKeys: [
        "torso_angle_consistency_deg",
        "shoulder_hip_horizontal_offset",
        "left_right_hip_symmetry",
      ],
      cameraSuitable: false,
      withholdTechniqueScore: true,
    },
    focuses: ["camera_angle_robustness"],
  },
  {
    id: "metric_repeatability",
    title: "Metric repeatability",
    description:
      "Identical frames must yield identical metric values (determinism / consistency).",
    datasetKind: "synthetic_fixture",
    exerciseSlug: "deadlift",
    cameraAngle: "side",
    frames: clean,
    groundTruth: {
      requiredLandmarks: CORE_LANDMARKS,
      expectedPhases: ["setup", "lockout"],
      cameraSuitable: true,
    },
    focuses: ["metric_consistency"],
  },
  {
    id: "forty_five_foreshorten",
    title: "45° — foreshortened sagittal",
    description:
      "45° remains usable with medium confidence; sagittal keys limited.",
    datasetKind: "synthetic_fixture",
    exerciseSlug: "deadlift",
    cameraAngle: "forty_five",
    frames: clean,
    groundTruth: {
      requiredLandmarks: CORE_LANDMARKS,
      expectedPhases: ["setup", "lockout"],
      expectedLimitedMetricKeys: [
        "left_right_hip_symmetry",
        "torso_angle_consistency_deg",
      ],
      cameraSuitable: true,
    },
    focuses: ["camera_angle_robustness"],
  },
];

/** Sparse wrists/knees — used for optional phase honesty checks in tests. */
export function buildMissingKneeWristFrames(): PoseFrame[] {
  return dropLandmarks(clean, [
    "left_knee",
    "right_knee",
    "left_wrist",
    "right_wrist",
  ]);
}

export function getTechniqueEvalCase(
  id: string,
): TechniqueEvalCase | undefined {
  return TECHNIQUE_EVAL_DATASET.find((c) => c.id === id);
}
