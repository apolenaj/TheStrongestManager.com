/**
 * Competition Preparation Mode thresholds (Prompt 70).
 */

/** Days out → phase boundaries (illustrative, not federation rules). */
export const COMP_PHASE_MEET_WEEK_DAYS = 3;
export const COMP_PHASE_TAPER_DAYS = 10;
export const COMP_PHASE_PEAKING_DAYS = 21;
export const COMP_PHASE_INTENSIFICATION_DAYS = 42;

/** RPE at/above this counts as a “heavy” session marker. */
export const COMP_HEAVY_RPE_MIN = 8;

/** Attempt planning fractions of planned third / expected max (conservative). */
export const COMP_OPENER_FRACTION = 0.9;
export const COMP_SECOND_FRACTION = 0.96;

/** Weight-class gap bands (kg above limit) for messaging — never a cut protocol. */
export const COMP_WEIGHT_GAP_NEGLIGIBLE_KG = 0.5;
export const COMP_WEIGHT_GAP_MODERATE_KG = 2.5;

export const COMP_WEIGHT_CUT_SAFETY_WARNINGS = [
  "This app never automatically prescribes dehydration, saunas, diuretics, or extreme water cuts.",
  "Aggressive weight cutting can harm health and performance. Seek a qualified coach and clinician before any cut.",
  "Prefer making weight via gradual body-composition change over weeks — not last-minute fluid manipulation.",
  "If you feel unwell, dizzy, or distressed around weigh-ins, stop and get medical help. This is not medical advice.",
] as const;

export const COMP_STRONGMAN_COMING_LATER =
  "Strongman competition mode is listed for later — event-specific prep is not fully modeled yet.";
