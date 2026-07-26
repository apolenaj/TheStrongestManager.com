/**
 * Conventional deadlift Technique Score — named weights & thresholds (Prompt 18).
 * Image-plane heuristics only. Not joint force, spine load, or injury risk.
 */

export const DEADLIFT_TECHNIQUE_FORMULA_ID = "deadlift.technique.weighted_v1";
export const DEADLIFT_TECHNIQUE_FORMULA_VERSION = "1.0.0";

/**
 * Nominal component weights (sum = 1.0).
 * Unavailable components are dropped and remaining weights renormalized.
 */
export const DEADLIFT_TECHNIQUE_WEIGHTS = {
  setup_consistency: 0.12,
  start_position: 0.15,
  bracing_indicators: 0.08,
  bar_proximity: 0.12,
  hip_rise_pattern: 0.15,
  back_angle_consistency: 0.18,
  lockout: 0.12,
  rep_consistency: 0.08,
} as const;

export type DeadliftTechniqueComponentId =
  keyof typeof DEADLIFT_TECHNIQUE_WEIGHTS;

/** Minimum observed components required to emit a numeric score. */
export const DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_SCORE = 3;
/** Rationale: fewer than 3 observed components is too sparse to claim a technique score. */

/** Medium confidence needs at least this many observed components. */
export const DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_MEDIUM = 4;

/** High confidence needs at least this many + preferred camera. */
export const DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_HIGH = 6;

/**
 * Setup hip-y sample stddev (normalized) → score mapping.
 * Lower variance during setup = more consistent setup height in frame.
 */
export const SETUP_STDDEV_EXCELLENT = 0.012;
export const SETUP_STDDEV_POOR = 0.06;
/** Rationale: coaching review bands for still setup in a fixed camera; not 3D kinematics. */

/**
 * Start-position horizontal shoulder–hip offset (norm_x) preferred band (side view).
 * Outside band reduces score; does not claim “correct” absolute lean.
 */
export const START_HORIZ_OFFSET_IDEAL = 0.04;
export const START_HORIZ_OFFSET_POOR = 0.18;

/**
 * Start-position vertical hip−shoulder (norm_y). Positive = hip lower in frame.
 * Side-view conventional deadlift setups typically show hips below shoulders in frame.
 */
export const START_VERT_MIN = 0.08;
export const START_VERT_MAX = 0.35;

/**
 * Torso-angle consistency stddev (degrees). Lower = more consistent image-plane torso angle.
 */
export const TORSO_STDDEV_EXCELLENT = 4;
export const TORSO_STDDEV_POOR = 18;

/**
 * Lockout |hip.y − shoulder.y| (norm). Closer to 0 ≈ more stacked in frame.
 */
export const LOCKOUT_DY_EXCELLENT = 0.02;
export const LOCKOUT_DY_POOR = 0.14;

/**
 * Wrist–hip vertical proxy |wrist.y − hip.y| during pull (norm).
 * Smaller absolute gap ≈ wrists closer to hip height (bar/body proxy when wrists track implement).
 */
export const BAR_PROXY_EXCELLENT = 0.03;
export const BAR_PROXY_POOR = 0.2;

/**
 * Hip-rise monotonicity: fraction of pull-frame steps where hip y decreases (rises in frame).
 * Higher fraction → smoother upward hip path in image plane.
 */
export const HIP_RISE_MONOTONIC_EXCELLENT = 0.85;
export const HIP_RISE_MONOTONIC_POOR = 0.45;

/**
 * Rep consistency: minimum distinct pull cycles to score.
 * Single-rep clips mark this component unavailable (not invented).
 */
export const REP_CONSISTENCY_MIN_CYCLES = 2;

export const DEADLIFT_TECHNIQUE_ASSUMPTIONS = [
  "Scores use 2D image-plane landmarks only — not 3D joint angles or laboratory kinematics.",
  "Component weights are deterministic and documented in DEADLIFT_TECHNIQUE_WEIGHTS; unavailable components are omitted and weights renormalized.",
  "Bracing (IAP / breath brace) is not observable from pose landmarks alone and is marked unavailable unless a future validated signal exists.",
  "Bar proximity uses a wrist–hip proxy when wrists are visible — wrists are not the barbell.",
  "Rep consistency requires ≥2 detectable pull cycles; single-rep videos do not invent multi-rep consistency.",
  "Camera angle limits which components can be observed; unsuitable angles yield no Technique Score.",
  "This is not joint force, spine loading, or injury-risk estimation.",
] as const;
