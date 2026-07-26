/** Side-by-side Video Comparison — Prompt 64 */

export const VIDEO_COMPARISON_ENGINE_VERSION = "video_comparison.v1" as const;

export const VIDEO_COMPARE_SPEEDS = [0.25, 0.5, 1, 1.5] as const;

/** Approximate frame step when true fps is unknown (1/30 s). */
export const VIDEO_COMPARE_FRAME_STEP_SECONDS = 1 / 30;

export const VIDEO_COMPARISON_HONESTY = [
  "Videos play side by side with shared transport — pause, frame step, and speed stay synchronized.",
  "Technique metric comparison only runs when exercise and camera angle are compatible.",
  "Landmark overlay requires stored pose landmarks; when missing, the toggle stays honest rather than inventing a skeleton.",
  "Overlay mode stacks clips visually — it does not invent biomechanical alignment.",
] as const;

/** Components highlighted for start-position comparison. */
export const VIDEO_COMPARE_START_COMPONENT_IDS = [
  "start_position",
  "setup_consistency",
] as const;

/** Metric keys treated as movement-path proxies. */
export const VIDEO_COMPARE_PATH_METRIC_KEYS = [
  "approx_hip_y_pull_mean",
  "wrist_hip_vertical_proxy",
  "shoulder_hip_horizontal_offset",
  "shoulder_hip_vertical_relation",
] as const;
