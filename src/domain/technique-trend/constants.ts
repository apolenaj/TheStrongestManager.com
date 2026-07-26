/** Technique Trend Engine — Prompt 63 */

export const TECHNIQUE_TREND_ENGINE_VERSION = "technique_trend.v1" as const;

/** Minimum scored analyses in a comparable series before emitting a trend. */
export const TECHNIQUE_TREND_MIN_SAMPLES = 2;

/** Preferred sample count for medium confidence (matches the prompt example length). */
export const TECHNIQUE_TREND_PREFERRED_SAMPLES = 4;

/**
 * Absolute component / overall score delta (points) to call improved vs regressed.
 * Smaller moves stay “stable” — avoids over-claiming noise.
 */
export const TECHNIQUE_TREND_DELTA_THRESHOLD = 5;

/** Component score ≤ this counts as a persistent issue band (aligned with feedback). */
export const TECHNIQUE_TREND_ISSUE_MAX = 55;

/**
 * Camera angles that may enter a longitudinal series.
 * Incompatible pairs are never compared unless listed as a supported pair below.
 */
export const TECHNIQUE_TREND_ELIGIBLE_ANGLES = [
  "side",
  "forty_five",
  "front",
  "rear",
] as const;

/**
 * Explicitly supported cross-angle comparisons.
 * Empty by default — side vs 45° / front vs rear stay separated until validated.
 */
export const TECHNIQUE_TREND_SUPPORTED_ANGLE_PAIRS: ReadonlyArray<
  readonly [string, string]
> = [];

export const TECHNIQUE_TREND_HONESTY = [
  "Trends only compare analyses with the same exercise and a compatible camera angle.",
  "Incompatible camera angles are never mixed unless an explicit supported pair is configured.",
  "Improved / stable / regressed labels use score deltas — they do not invent a cause.",
  "Persistent issues cite repeated low component scores; this is not a medical diagnosis.",
] as const;
