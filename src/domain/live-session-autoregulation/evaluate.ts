import {
  LIVE_AUTOREG_LARGE_OVERSHOOT,
  LIVE_AUTOREG_LOAD_STEP_KG,
  LIVE_AUTOREG_SIGNIFICANT_RPE_DELTA,
  LIVE_AUTOREG_SUGGESTION_LABELS,
} from "@/domain/live-session-autoregulation/constants";
import type {
  LiveAutoregEvaluation,
  LiveAutoregSetSignal,
  LiveAutoregSuggestion,
} from "@/domain/live-session-autoregulation/types";

function formatSetLine(parts: {
  loadKg: number | null;
  reps: number | null;
  rpe: number | null;
}): string {
  const bits: string[] = [];
  if (parts.loadKg != null) bits.push(`${parts.loadKg} kg`);
  if (parts.reps != null) bits.push(`× ${parts.reps}`);
  if (parts.rpe != null) bits.push(`@${parts.rpe}`);
  return bits.join(" ") || "—";
}

export function roundAutoregLoadKg(kg: number): number {
  return (
    Math.round(kg / LIVE_AUTOREG_LOAD_STEP_KG) * LIVE_AUTOREG_LOAD_STEP_KG
  );
}

/**
 * Propose a reduced load for the next set from the current next prescription.
 * Conservative: one plate step, or two when overshoot is large.
 */
export function proposeReducedNextLoadKg(input: {
  currentNextLoadKg: number | null;
  rpeDelta: number;
  /** Fallback: last performed load when next prescription is empty. */
  lastPerformedLoadKg: number | null;
}): number | null {
  const baseline = input.currentNextLoadKg ?? input.lastPerformedLoadKg;
  if (baseline == null || !(baseline > 0)) return null;

  const steps =
    input.rpeDelta >= LIVE_AUTOREG_LARGE_OVERSHOOT ? 2 : 1;
  const reduced = roundAutoregLoadKg(
    baseline - steps * LIVE_AUTOREG_LOAD_STEP_KG,
  );
  if (reduced <= 0) return LIVE_AUTOREG_LOAD_STEP_KG;
  if (reduced >= baseline) {
    return roundAutoregLoadKg(baseline - LIVE_AUTOREG_LOAD_STEP_KG);
  }
  return reduced;
}

/**
 * Compare actual vs planned RPE. Suggest reduce-next-set when significantly harder.
 * Never marks suggestion as auto-applied.
 */
export function evaluateLiveAutoregulation(input: {
  completed: LiveAutoregSetSignal;
  nextSetLoadKg: number | null;
}): LiveAutoregEvaluation {
  const { completed } = input;
  const planned = completed.plannedRpe;
  const actual = completed.actualRpe;

  if (planned == null || !Number.isFinite(planned)) {
    return {
      ok: false,
      reason: "No planned RPE on this set — cannot compare.",
      suggestion: null,
    };
  }
  if (actual == null || !Number.isFinite(actual)) {
    return {
      ok: false,
      reason: "No actual RPE logged — cannot compare.",
      suggestion: null,
    };
  }

  const rpeDelta = actual - planned;
  if (rpeDelta < LIVE_AUTOREG_SIGNIFICANT_RPE_DELTA) {
    return {
      ok: false,
      reason: `Actual RPE is not significantly harder than planned (Δ ${rpeDelta.toFixed(1)}; need ≥ ${LIVE_AUTOREG_SIGNIFICANT_RPE_DELTA}).`,
      suggestion: null,
    };
  }

  const proposedNextLoadKg = proposeReducedNextLoadKg({
    currentNextLoadKg: input.nextSetLoadKg,
    rpeDelta,
    lastPerformedLoadKg: completed.actualLoadKg,
  });

  const suggestion: LiveAutoregSuggestion = {
    kind: "reduce_next_set",
    label: LIVE_AUTOREG_SUGGESTION_LABELS.reduce_next_set,
    headline: "This set felt significantly harder than planned",
    detail:
      proposedNextLoadKg != null
        ? `Consider reducing the next set toward ${proposedNextLoadKg} kg. Nothing changes until you confirm.`
        : "Consider reducing the next set’s load. Nothing changes until you confirm.",
    rpeDelta,
    plannedSummary: formatSetLine({
      loadKg: completed.plannedLoadKg,
      reps: completed.plannedReps,
      rpe: planned,
    }),
    actualSummary: formatSetLine({
      loadKg: completed.actualLoadKg,
      reps: completed.actualReps,
      rpe: actual,
    }),
    proposedNextLoadKg,
    currentNextLoadKg: input.nextSetLoadKg,
    requiresUserConfirmation: true,
    autoApplied: false,
  };

  return { ok: true, suggestion };
}

/** Guard used by services — suggestions must never apply silently. */
export function mayAutoApplyAutoregulation(): false {
  return false;
}
