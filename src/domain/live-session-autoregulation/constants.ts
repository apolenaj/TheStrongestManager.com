/**
 * Live Session Autoregulation (Prompt 199).
 * Compare actual RPE vs planned during a workout.
 * If significantly harder → suggest adjustment.
 * Never automatically alter without user confirmation.
 */

export const LIVE_AUTOREG_ENGINE_VERSION =
  "live_session_autoregulation.v1" as const;

export const LIVE_AUTOREG_HONESTY = [
  "Autoregulation suggestions compare the RPE you logged to the planned RPE — missing planned or actual RPE means no suggestion (never invented).",
  "Suggestions never change the next set until you confirm — dismiss leaves the prescription unchanged.",
  "Harder-than-planned is a planning aid, not a medical fatigue diagnosis.",
] as const;

/** Actual RPE must exceed planned by at least this much to count as “significantly harder.” */
export const LIVE_AUTOREG_SIGNIFICANT_RPE_DELTA = 1.5;

/** Example from the product brief — documented for tests / admin. */
export const LIVE_AUTOREG_EXAMPLE = {
  plannedLoadKg: 250,
  plannedReps: 3,
  plannedRpe: 7,
  actualLoadKg: 250,
  actualReps: 3,
  actualRpe: 9,
  expectedSuggestion: "reduce_next_set" as const,
} as const;

export const LIVE_AUTOREG_SUGGESTION_KINDS = [
  "reduce_next_set",
  "none",
] as const;
export type LiveAutoregSuggestionKind =
  (typeof LIVE_AUTOREG_SUGGESTION_KINDS)[number];

export const LIVE_AUTOREG_SUGGESTION_LABELS: Record<
  Exclude<LiveAutoregSuggestionKind, "none">,
  string
> = {
  reduce_next_set: "Reduce next set",
};

/** Conservative load trim when reducing the next set (kg plate step). */
export const LIVE_AUTOREG_LOAD_STEP_KG = 2.5;

/** Prefer trimming at least this many steps when RPE overshoot is ≥ 2. */
export const LIVE_AUTOREG_LARGE_OVERSHOOT = 2;

export const LIVE_AUTOREG_FORBIDDEN = [
  "auto_apply_without_confirmation",
  "invent_planned_or_actual_rpe",
  "silent_prescription_rewrite",
] as const;
