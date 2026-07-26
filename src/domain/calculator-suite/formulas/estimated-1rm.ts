/**
 * Estimated 1RM — Epley (1985). Reuses scoring domain; refuses unreliable reps.
 */

import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";
import {
  EPLEY_MAX_REPS,
  EPLEY_REP_DIVISOR,
} from "@/domain/scoring/strength/thresholds";

export type Estimated1rmInput = {
  weightKg: number;
  reps: number;
};

export type Estimated1rmResult = {
  estimated1rmKg: number;
  formula: "epley";
  formulaLabel: string;
  precisionNote: string;
  /** Rounded display helper (0.5 kg). */
  displayKg: number;
};

export function computeEstimated1rm(
  input: Estimated1rmInput,
): Estimated1rmResult | null {
  const raw = estimate1rmKg(input.weightKg, input.reps);
  if (raw == null) return null;
  return {
    estimated1rmKg: raw,
    formula: "epley",
    formulaLabel: `Epley (1985): w × (1 + r/${EPLEY_REP_DIVISOR})`,
    precisionNote: `Estimate only — valid for ${2}–${EPLEY_MAX_REPS} reps. Far from a single, error grows. Never treat as a verified PR.`,
    displayKg: Math.round(raw * 2) / 2,
  };
}

export function estimated1rmRefusalReason(input: Estimated1rmInput): string | null {
  if (!(input.weightKg > 0) || !Number.isFinite(input.weightKg)) {
    return "Enter a positive load in kilograms.";
  }
  if (!Number.isInteger(input.reps) || input.reps < 2) {
    return "Use 2 or more reps. A true single is already a 1RM — no estimate needed.";
  }
  if (input.reps > EPLEY_MAX_REPS) {
    return `Refuse beyond ${EPLEY_MAX_REPS} reps — Epley is unreliable that far from a single.`;
  }
  return null;
}
