/**
 * Movement analysis MVP — named constants with rationale.
 * Image-plane geometry only. Not biomechanical force or injury models.
 */

/** Pipeline contract version — bump when report shape changes. */
export const MOVEMENT_PIPELINE_VERSION = "movement.v1.2";

/** Exercises with a dedicated phase/metric module. */
export const MOVEMENT_MVP_EXERCISE_SLUGS = ["deadlift"] as const;

export type MovementMvpExerciseSlug =
  (typeof MOVEMENT_MVP_EXERCISE_SLUGS)[number];

/**
 * Minimum frames with usable mid-hip visibility to attempt phase detection.
 * Below this we report insufficient landmark coverage — not a fabricated phase map.
 */
export const MOVEMENT_MIN_FRAMES_FOR_PHASES = 8;

/**
 * Landmark visibility floor (0–1). Below this a point is treated as missing.
 * Matches common pose-estimator practice of ignoring low-confidence joints.
 */
export const LANDMARK_VISIBILITY_MIN = 0.35;

/**
 * Sample stride when building diagnostic fixture trajectories (Hz).
 * Dense enough for phase detection tests without huge payloads.
 */
export const FIXTURE_SAMPLE_HZ = 12;

/**
 * Max frames accepted from a client pose run (abuse / payload guard).
 * ~90s video × 10 Hz = 900; keep headroom under that for MVP.
 */
export const MOVEMENT_MAX_POSE_FRAMES = 600;

export const MOVEMENT_DISCLAIMERS = [
  "All angles and positions are image-plane observations from 2D landmarks — not 3D joint kinematics.",
  "This pipeline does not estimate joint forces, moments, or injury risk.",
  "No overall Technique Score is invented without the documented deadlift scorer and enough observable components.",
  "Replaceable pose adapters may change landmark quality; confidence reflects visibility and camera suitability.",
] as const;
