/**
 * Training Style Profiler (Prompt 99).
 * Practical training preferences only — never psychological personality claims.
 */

export const TRAINING_STYLE_ENGINE_VERSION = "training_style.v1" as const;

export const TRAINING_STYLE_DIMENSION_IDS = [
  "intensity_preference",
  "frequency_preference",
  "volume_tolerance",
] as const;
export type TrainingStyleDimensionId =
  (typeof TRAINING_STYLE_DIMENSION_IDS)[number];

export const TRAINING_STYLE_DIMENSION_LABELS: Record<
  TrainingStyleDimensionId,
  string
> = {
  intensity_preference: "Intensity preference",
  frequency_preference: "Frequency preference",
  volume_tolerance: "Volume tolerance",
};

/** Practical bands — not personality types. */
export const INTENSITY_BANDS = [
  "prefer_lower",
  "balanced",
  "prefer_higher",
] as const;
export type IntensityBand = (typeof INTENSITY_BANDS)[number];

export const FREQUENCY_BANDS = ["low", "moderate", "high"] as const;
export type FrequencyBand = (typeof FREQUENCY_BANDS)[number];

export const VOLUME_TOLERANCE_BANDS = ["low", "moderate", "high"] as const;
export type VolumeToleranceBand = (typeof VOLUME_TOLERANCE_BANDS)[number];

export const TRAINING_STYLE_BAND_LABELS = {
  prefer_lower: "Lower-intensity preference",
  balanced: "Balanced intensity preference",
  prefer_higher: "High-intensity preference",
  low: "Low",
  moderate: "Moderate",
  high: "High",
} as const;

export const TRAINING_STYLE_SOURCE_KINDS = [
  "stated",
  "observed",
  "mixed",
  "insufficient",
] as const;
export type TrainingStyleSourceKind =
  (typeof TRAINING_STYLE_SOURCE_KINDS)[number];

export const TRAINING_STYLE_HONESTY = [
  "This profiler describes practical training preferences from your choices and logged training — not psychological personality.",
  "Bands are coaching heuristics (intensity, frequency, volume tolerance), not temperament or Big Five traits.",
  "Insufficient data stays labeled missing — preferences are never invented.",
  "Use results to inform programming discussions; they do not auto-change your plan.",
] as const;

/**
 * Claim phrases that must never appear as athlete assertions.
 * Honesty copy may deny these topics; bare topic words are not banned.
 */
export const TRAINING_STYLE_FORBIDDEN_CLAIMS = [
  "personality type",
  "your personality",
  "big five score",
  "your temperament",
  "psychological profile",
  "you are the kind of person",
  "introvert",
  "extrovert",
  "mindset type",
] as const;

export const DEFAULT_TRAINING_STYLE_LOOKBACK_DAYS = 28;
