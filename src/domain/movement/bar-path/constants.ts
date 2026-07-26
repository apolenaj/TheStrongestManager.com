/** Bar Path Intelligence — Prompt 65 */

export const BAR_PATH_ENGINE_VERSION = "bar_path.v1" as const;

/**
 * Minimum fraction of frames with a usable mid-wrist sample.
 * Below this we hide metrics — never fabricate a path.
 */
export const BAR_PATH_MIN_WRIST_COVERAGE = 0.55;

/** Minimum usable wrist samples before attempting tracking. */
export const BAR_PATH_MIN_SAMPLES = 10;

/**
 * Continuous confidence floor to mark the path displayable.
 * Below → hide metrics and visualization points.
 */
export const BAR_PATH_DISPLAY_CONFIDENCE_MIN = 0.45;

/** Max horizontal stddev (norm) treated as “tight” path for scoring context. */
export const BAR_PATH_HORIZ_STD_EXCELLENT = 0.015;
export const BAR_PATH_HORIZ_STD_POOR = 0.08;

/**
 * Lifts where wrist/bar-proxy tracking is attempted.
 * Squat/bench require side view (enforced in analyzer).
 */
export const BAR_PATH_SUPPORTED_LIFT_KINDS = [
  "deadlift",
  "squat",
  "bench",
] as const;

export type BarPathLiftKind = (typeof BAR_PATH_SUPPORTED_LIFT_KINDS)[number];

export const BAR_PATH_HONESTY = [
  "Bar path uses a mid-wrist image-plane proxy — wrists are not the barbell.",
  "Metrics and the path plot are hidden when detection confidence is poor.",
  "No computer-vision bar plate detector is claimed; we never fabricate tracking.",
  "Squat and bench bar-path attempts require a side-view camera.",
] as const;
