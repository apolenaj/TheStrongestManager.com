/**
 * Catalog program workout execution — honest safety + template adjustment rules.
 */

export const CATALOG_WORKOUT_ENGINE_VERSION = "catalog_workout.v1" as const;

/** Shown when the athlete flags pain/issue on a set. Not a diagnosis. */
export const CATALOG_WORKOUT_PAIN_FLAG_MESSAGE =
  "Consider stopping this session and seek medical assessment from a qualified professional. This app does not diagnose injury or disease." as const;

export const CATALOG_WORKOUT_HONESTY = [
  "Suggested weights come from your onboarding 1RMs / training maxes and prescribed percentages — not AI.",
  "Training-max reductions are suggestions only and never apply without your approval.",
  "A pain/issue flag is a safety prompt, not a medical diagnosis.",
] as const;

/** Actual RPE this far above prescribed counts as “significantly higher”. */
export const RPE_OVERSHOOT_THRESHOLD = 1.5 as const;

/** Default TM reduction when RPE overshoots (fraction of current TM). */
export const TM_REDUCTION_FRACTION = 0.05 as const;

export function estimatedRirFromRpe(rpe: number | null | undefined): number | null {
  if (rpe == null || !Number.isFinite(rpe)) return null;
  return Math.max(0, Math.round((10 - rpe) * 10) / 10);
}

export function liftKeyFromExerciseId(exerciseId: string): string | null {
  const id = exerciseId.toLowerCase();
  if (id.includes("squat") && !id.includes("front")) return "squat";
  if (id.includes("front-squat")) return "squat";
  if (id.includes("bench")) return "bench";
  if (id.includes("deadlift")) return "deadlift";
  return null;
}

export function suggestedWeightKg(input: {
  prescribedWeight?: number | null;
  percentOfTm?: number | null;
  trainingMaxKg?: number | null;
}): number | null {
  if (input.prescribedWeight != null && Number.isFinite(input.prescribedWeight)) {
    return Math.round(input.prescribedWeight * 2) / 2;
  }
  if (
    input.percentOfTm != null &&
    input.trainingMaxKg != null &&
    input.trainingMaxKg > 0
  ) {
    return Math.round(input.trainingMaxKg * (input.percentOfTm / 100) * 2) / 2;
  }
  return null;
}

export type TmAdjustmentProposalDraft = {
  liftKey: string;
  fromTm: number;
  toTm: number;
  reason: string;
};

/**
 * Template rule: if logged RPE is significantly above prescribed, suggest a TM cut.
 * Returns null when the rule does not fire.
 */
export function proposeTmReductionFromRpe(input: {
  liftKey: string | null;
  currentTm: number | null | undefined;
  prescribedRpe: number | null | undefined;
  actualRpe: number | null | undefined;
}): TmAdjustmentProposalDraft | null {
  if (!input.liftKey) return null;
  if (input.currentTm == null || input.currentTm <= 0) return null;
  if (input.prescribedRpe == null || input.actualRpe == null) return null;
  if (!Number.isFinite(input.prescribedRpe) || !Number.isFinite(input.actualRpe)) {
    return null;
  }

  const delta = input.actualRpe - input.prescribedRpe;
  if (delta < RPE_OVERSHOOT_THRESHOLD) return null;

  const toTm =
    Math.round(input.currentTm * (1 - TM_REDUCTION_FRACTION) * 10) / 10;
  if (toTm >= input.currentTm || toTm <= 0) return null;

  return {
    liftKey: input.liftKey,
    fromTm: input.currentTm,
    toTm,
    reason: `Logged RPE ${input.actualRpe} was ${delta.toFixed(1)} above prescribed RPE ${input.prescribedRpe} (≥ ${RPE_OVERSHOOT_THRESHOLD}). Template rule suggests lowering the ${input.liftKey} training max by ${Math.round(TM_REDUCTION_FRACTION * 100)}% for the next session. Nothing changes until you approve.`,
  };
}
