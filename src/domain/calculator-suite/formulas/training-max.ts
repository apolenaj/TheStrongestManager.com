/**
 * Training max — programming construct (often ~90% of 1RM).
 * Not a measured max; percentage is user-chosen with a common default.
 */

import { computeEstimated1rm } from "@/domain/calculator-suite/formulas/estimated-1rm";

/** Common Wendler-style default — a convention, not a law of physiology. */
export const DEFAULT_TRAINING_MAX_FRACTION = 0.9;

export type TrainingMaxInput = {
  /**
   * Known or estimated 1RM in kg.
   * If omitted, weightKg + reps may be used via Epley.
   */
  oneRmKg?: number | null;
  weightKg?: number | null;
  reps?: number | null;
  /** Fraction of 1RM used as TM (default 0.9). */
  fraction?: number;
};

export type TrainingMaxResult = {
  trainingMaxKg: number;
  displayKg: number;
  oneRmUsedKg: number;
  oneRmSource: "entered" | "epley";
  fraction: number;
  precisionNote: string;
};

export function computeTrainingMax(
  input: TrainingMaxInput,
): TrainingMaxResult | null {
  const fraction =
    input.fraction != null && Number.isFinite(input.fraction)
      ? input.fraction
      : DEFAULT_TRAINING_MAX_FRACTION;

  if (!(fraction > 0) || fraction > 1) return null;

  let oneRmUsedKg: number | null = null;
  let oneRmSource: "entered" | "epley" = "entered";

  if (input.oneRmKg != null && input.oneRmKg > 0) {
    oneRmUsedKg = input.oneRmKg;
    oneRmSource = "entered";
  } else if (
    input.weightKg != null &&
    input.reps != null &&
    input.weightKg > 0 &&
    input.reps >= 2
  ) {
    const e = computeEstimated1rm({
      weightKg: input.weightKg,
      reps: input.reps,
    });
    if (!e) return null;
    oneRmUsedKg = e.estimated1rmKg;
    oneRmSource = "epley";
  }

  if (oneRmUsedKg == null || !(oneRmUsedKg > 0)) return null;

  const trainingMaxKg = oneRmUsedKg * fraction;
  return {
    trainingMaxKg,
    displayKg: Math.round(trainingMaxKg * 2) / 2,
    oneRmUsedKg: Math.round(oneRmUsedKg * 2) / 2,
    oneRmSource,
    fraction,
    precisionNote:
      "Training max is a programming number (often ~90% of a 1RM or e1RM). It is not a tested max and should be adjusted when sessions feel mismatched.",
  };
}

export function trainingMaxRefusalReason(
  input: TrainingMaxInput,
): string | null {
  const fraction =
    input.fraction != null && Number.isFinite(input.fraction)
      ? input.fraction
      : DEFAULT_TRAINING_MAX_FRACTION;
  if (!(fraction > 0) || fraction > 1) {
    return "Training-max fraction must be between 0 and 1 (e.g. 0.9).";
  }
  const hasOneRm = input.oneRmKg != null && input.oneRmKg > 0;
  const hasSet =
    input.weightKg != null &&
    input.reps != null &&
    input.weightKg > 0 &&
    input.reps >= 2;
  if (!hasOneRm && !hasSet) {
    return "Enter a 1RM, or a multi-rep set to estimate one (Epley, 2–12 reps).";
  }
  return null;
}
