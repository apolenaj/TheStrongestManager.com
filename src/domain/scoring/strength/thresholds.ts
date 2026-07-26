/**
 * Strength-specific thresholds (Prompt 12).
 * Named constants with rationale — no buried coefficients.
 */

/** Recent window for “current” best efforts / trend numerator. */
export const STRENGTH_RECENT_WINDOW_DAYS = 28;
/** Rationale: aligns with session scoring window; captures current training form. */

/** Prior window length compared against recent for trend. */
export const STRENGTH_PRIOR_WINDOW_DAYS = 28;
/** Rationale: equal-length prior window for an apples-to-apples trend. */

/**
 * Epley coefficient: e1RM = weight × (1 + reps / EPLEY_REP_DIVISOR).
 * Published estimation model (Epley, 1985) — cited, not invented.
 */
export const EPLEY_REP_DIVISOR = 30;

/** Max reps accepted for e1RM estimation (higher reps → unreliable for 1RM). */
export const EPLEY_MAX_REPS = 12;
/** Rationale: beyond ~12 reps, Epley error grows; refuse rather than invent. */

/** Blend weights when both context and trend components exist (must sum to 1). */
export const STRENGTH_WEIGHT_CONTEXT = 0.7;
export const STRENGTH_WEIGHT_TREND = 0.3;
/** Rationale: level-relative performance is the primary signal; trend is secondary form. */

/** Minimum lifts with a usable bodyweight-relative context score for medium confidence. */
export const STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM = 2;

/** Minimum lifts for high confidence when observed + bodyweight present. */
export const STRENGTH_MIN_CONTEXT_LIFTS_FOR_HIGH = 3;
