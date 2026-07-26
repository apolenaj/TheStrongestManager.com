/** Camera Quality Validation — Prompt 66 */

export const CAMERA_QUALITY_ENGINE_VERSION = "camera_quality.v1" as const;

/** Readiness score ≥ this → GOOD FOR ANALYSIS. */
export const CAMERA_QUALITY_GOOD_MIN = 70;

/** Declared angles preferred for conventional deadlift / side-plane lifts. */
export const CAMERA_QUALITY_PREFERRED_ANGLES = ["side", "forty_five"] as const;

/** Minimum estimated fps for adequate temporal sampling. */
export const CAMERA_QUALITY_MIN_FPS = 24;

/** Mean luma (0–255) below this → too dark. */
export const CAMERA_QUALITY_LUMA_DARK_MAX = 45;

/** Mean luma above this → blown / washed. */
export const CAMERA_QUALITY_LUMA_BRIGHT_MIN = 220;

/** Landmark within this fraction of the frame edge counts as clipped. */
export const CAMERA_QUALITY_EDGE_MARGIN = 0.04;

/** Minimum ankle/wrist coverage (fraction of frames) for full-movement confidence. */
export const CAMERA_QUALITY_MIN_EXTREMITY_COVERAGE = 0.4;

export const CAMERA_QUALITY_CHECK_IDS = [
  "camera_angle",
  "subject_visibility",
  "lighting",
  "occlusion",
  "frame_rate",
  "full_movement_visibility",
] as const;

export type CameraQualityCheckId = (typeof CAMERA_QUALITY_CHECK_IDS)[number];

export const CAMERA_QUALITY_CHECK_LABELS: Record<
  CameraQualityCheckId,
  string
> = {
  camera_angle: "Camera angle",
  subject_visibility: "Subject visibility",
  lighting: "Lighting",
  occlusion: "Occlusion",
  frame_rate: "Frame rate adequacy",
  full_movement_visibility: "Full movement visibility",
};

/** Equal weights — sum = 1. */
export const CAMERA_QUALITY_WEIGHTS: Record<CameraQualityCheckId, number> = {
  camera_angle: 0.2,
  subject_visibility: 0.2,
  lighting: 0.15,
  occlusion: 0.15,
  frame_rate: 0.1,
  full_movement_visibility: 0.2,
};

export const CAMERA_QUALITY_HONESTY = [
  "Readiness uses declared camera angle, video metadata, optional brightness samples, and pose landmarks when available.",
  "Checks marked unknown are not invented as passes — they lower confidence until evidence exists.",
  "RECORD AGAIN is advice to reduce inaccurate analysis — not a medical or safety claim.",
] as const;

export const DEFAULT_RECORDING_INSTRUCTIONS = [
  "Film from the side (or 45°) so the full lift is visible in the frame.",
  "Keep feet, hands, and the barbell inside the frame for the entire set.",
  "Use bright, even light — avoid strong backlight and heavy shadows on the body.",
  "Stand the phone/tripod steady; prefer ≥24 fps and at least 640×360.",
  "Capture the full movement: setup through lockout (or bottom through stand) without cropping.",
] as const;
