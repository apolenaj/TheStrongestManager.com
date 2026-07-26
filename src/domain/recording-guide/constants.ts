/** Smart Video Recording Guide — Prompt 67 */

export const RECORDING_GUIDE_ENGINE_VERSION = "recording_guide.v1" as const;

export const RECORDING_GUIDE_HONESTY = [
  "No single camera angle captures every technique metric.",
  "Recommendations are filming defaults for common goals — switch angles when you need a different view (e.g. symmetry vs sagittal path).",
  "Guides are schematic — they do not claim biomechanical completeness or medical safety.",
] as const;

export const RECORDING_GUIDE_LIFT_KINDS = [
  "deadlift",
  "squat",
  "bench",
  "general",
] as const;

export type RecordingGuideLiftKind =
  (typeof RECORDING_GUIDE_LIFT_KINDS)[number];
