/**
 * Training load tracking constants (Prompt 24).
 * These are operational heuristics for estimation — not validated fatigue science.
 */

/** Rolling windows for trends. */
export const LOAD_WINDOW_7_DAYS = 7;
export const LOAD_WINDOW_28_DAYS = 28;

/**
 * Hard-set heuristic (documented, not physiological truth):
 * count a completed set as “hard” when RPE ≥ this or RIR ≤ this.
 */
export const HARD_SET_RPE_MIN = 8;
export const HARD_SET_RIR_MAX = 2;

/**
 * Conservative spike detection vs prior baseline.
 * Require both ratio and absolute lift so small baselines don’t false-alarm.
 */
export const SPIKE_VOLUME_RATIO_MIN = 1.8;
export const SPIKE_MIN_BASELINE_TRAINING_DAYS = 5;
export const SPIKE_MIN_ABSOLUTE_VOLUME_KG = 500;

export const TRAINING_LOAD_ENGINE_VERSION = "training_load.v1" as const;

export const LOAD_DISCLAIMERS = [
  "Estimated training load is derived from logged sets (volume = load × reps when both exist). Missing loads or reps are excluded — not invented.",
  "Hard sets use a simple RPE/RIR heuristic for tracking, not a lab measure of fatigue.",
  "Recovery indicators are athlete-reported readiness signals, not a medical or overreaching diagnosis.",
  "Sudden load spike flags compare recent estimated volume to a recent baseline. They are conservative volume alerts — not injury predictions or acute fatigue scores.",
] as const;
