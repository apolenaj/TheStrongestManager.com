/**
 * PR Prediction Engine thresholds (Prompt 68).
 * Conservative ranges only — never invent a point 1RM.
 */

/** Lookback for recent working sets. */
export const PR_LOOKBACK_DAYS = 28;
/** Rationale: aligns with strength scoring recent window. */

/** Minimum qualifying working sets to emit a range. */
export const PR_MIN_QUALIFYING_SETS = 2;
/** Rationale: one set is too thin for an honest range. */

/**
 * Single hard set exception: RPE at/above this and low reps may still
 * produce a low-confidence range when a second set is missing.
 */
export const PR_SINGLE_SET_MIN_RPE = 8.5;
export const PR_SINGLE_SET_MAX_REPS = 5;

/** Sets at/above this RPE count as hard working sets. */
export const PR_HARD_SET_RPE_MIN = 7;

/** Prefer multi-rep e1RM at/below this rep count when RPE is missing. */
export const PR_MAX_REPS_WITHOUT_RPE = 8;

/** Half-range width (% of center) by confidence — conservative. */
export const PR_RANGE_HALF_WIDTH_PCT = {
  high: 0.015,
  moderate: 0.025,
  low: 0.04,
} as const;

/** Fatigue 1–10 at/above this pulls both bounds down. */
export const PR_HIGH_FATIGUE = 7.5;

/** Readiness 0–100 at/below this treats session capacity as reduced. */
export const PR_LOW_READINESS = 45;

/** Cap optimistic uplift from improving trend / RIR (fraction of center). */
export const PR_MAX_OPTIMISTIC_UPLIFT = 0.03;

/** Round predicted kg to this step for display honesty. */
export const PR_ROUND_KG = 2.5;
