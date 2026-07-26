/**
 * Powerlifting Attempt Selector thresholds (Prompt 71).
 * Sketches only — never a guarantee.
 */

/** Round attempts to this plate step (kg). */
export const ATTEMPT_ROUND_KG = 2.5;

/**
 * Fractions of the planning ceiling (day-max estimate) by risk preference.
 * Opener stays relatively safe even on aggressive.
 */
export const ATTEMPT_FRACTIONS = {
  conservative: {
    opener: 0.9,
    second: 0.95,
    thirdLow: 0.97,
    thirdHigh: 0.99,
  },
  balanced: {
    opener: 0.915,
    second: 0.965,
    thirdLow: 0.985,
    thirdHigh: 1.01,
  },
  aggressive: {
    opener: 0.93,
    second: 0.98,
    thirdLow: 1.0,
    thirdHigh: 1.03,
  },
} as const;

/** Cap how far a goal can pull the planning ceiling above recent strength high. */
export const ATTEMPT_GOAL_UPLIFT_CAP = 0.04;

/** When confidence is low, weight the estimate low more heavily for the ceiling. */
export const ATTEMPT_LOW_CONFIDENCE_LOW_WEIGHT = 0.65;

export const ATTEMPT_HONESTY =
  "Attempt sketches are planning aids only — never a guarantee that any lift will be made.";
