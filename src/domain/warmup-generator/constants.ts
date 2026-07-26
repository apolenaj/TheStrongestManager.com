/**
 * Warm-up Generator (Prompt 197).
 * Progressive warm-ups from target working weight, exercise, and recent history.
 * Conservative defaults; user can modify; avoid excessive fatigue.
 */

export const WARMUP_ENGINE_VERSION = "warmup_generator.v1" as const;

export const WARMUP_HONESTY = [
  "Warm-up plans are planning aids — not medical advice and not a guarantee you are ready for the working weight.",
  "Defaults are conservative and capped to limit warm-up fatigue — you can edit every set.",
  "Empty or thin recent history means fewer history adjustments, not invented past sessions.",
  "Never treat warm-ups as working sets: top warm-up stays below the target working weight.",
] as const;

/** Plate round (kg) — same spirit as attempt selector. */
export const WARMUP_ROUND_KG = 2.5;

/** Empty bar assumption when building early sets (kg). */
export const WARMUP_BAR_KG = 20;

/** Hard cap on warm-up sets — prevents marathon warm-ups. */
export const WARMUP_MAX_SETS = 5;

/** Minimal plan set count when history suggests high recent fatigue. */
export const WARMUP_MIN_SETS_WHEN_FATIGUED = 3;

/**
 * Conservative default ladder as fractions of target working weight.
 * Last rung stays clearly below work sets.
 */
export const WARMUP_DEFAULT_LADDER = [
  { fractionOfTarget: 0.4, reps: 8, label: "Light" },
  { fractionOfTarget: 0.55, reps: 5, label: "Build" },
  { fractionOfTarget: 0.7, reps: 3, label: "Build" },
  { fractionOfTarget: 0.8, reps: 2, label: "Heavy warm-up" },
  { fractionOfTarget: 0.875, reps: 1, label: "Top warm-up" },
] as const;

/** Shorter ladder when recent volume is high. */
export const WARMUP_FATIGUE_LADDER = [
  { fractionOfTarget: 0.45, reps: 5, label: "Light" },
  { fractionOfTarget: 0.65, reps: 3, label: "Build" },
  { fractionOfTarget: 0.8, reps: 1, label: "Top warm-up" },
] as const;

/** Top warm-up must stay at or below this fraction of target. */
export const WARMUP_TOP_FRACTION_CAP = 0.9;

/**
 * If recent working-set volume (kg×reps) for the exercise in the lookback
 * exceeds this × (target × expected work reps), prefer the fatigue ladder.
 */
export const WARMUP_FATIGUE_VOLUME_RATIO = 8;

/** Lookback days for recent history signals. */
export const WARMUP_HISTORY_LOOKBACK_DAYS = 14;

/** Known lift keys with display labels (service may map exercise slugs). */
export const WARMUP_KNOWN_EXERCISES = [
  { id: "back-squat", label: "Back squat" },
  { id: "bench-press", label: "Bench press" },
  { id: "deadlift", label: "Deadlift" },
  { id: "overhead-press", label: "Overhead press" },
  { id: "front-squat", label: "Front squat" },
  { id: "custom", label: "Custom / other" },
] as const;

export type WarmupExerciseId = (typeof WARMUP_KNOWN_EXERCISES)[number]["id"];
