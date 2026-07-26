/**
 * Goal progress / trajectory thresholds (Prompt 69).
 * Qualitative status only — no precise probability claims.
 */

/** Weeks of history for slope (trajectory). */
export const GOAL_TRAJECTORY_LOOKBACK_DAYS = 56;

/** Minimum samples to trust a slope. */
export const GOAL_MIN_TRAJECTORY_SAMPLES = 3;

/**
 * Soft ceiling for “possible” e1RM gain (kg/week).
 * Above this without matching history → below target, not a probability.
 */
export const GOAL_REASONABLE_KG_PER_WEEK = 1.25;

/**
 * If required rate exceeds recent rate by this factor → aggressive
 * (even when still under the soft ceiling).
 */
export const GOAL_AGGRESSIVE_RATE_FACTOR = 1.4;

/** Projection within this fraction of target counts as on track. */
export const GOAL_ON_TRACK_PROJECTION_RATIO = 0.98;

/** Round display kg. */
export const GOAL_ROUND_KG = 0.5;
