/**
 * Estimated 1RM — multiple published formulas (Epley, Brzycki, Lombardi, O'Conner).
 * Refuses unreliable reps; never presented as a verified PR.
 */

import {
  EPLEY_MAX_REPS,
  EPLEY_REP_DIVISOR,
} from "@/domain/scoring/strength/thresholds";

export const ESTIMATED_1RM_FORMULAS = [
  "epley",
  "brzycki",
  "lombardi",
  "oconner",
] as const;

export type Estimated1rmFormula = (typeof ESTIMATED_1RM_FORMULAS)[number];

export type Estimated1rmInput = {
  weightKg: number;
  reps: number;
  formula?: Estimated1rmFormula;
};

export type Estimated1rmResult = {
  estimated1rmKg: number;
  formula: Estimated1rmFormula;
  formulaLabel: string;
  precisionNote: string;
  /** Rounded display helper (0.5 kg). */
  displayKg: number;
};

const FORMULA_LABELS: Record<Estimated1rmFormula, string> = {
  epley: `Epley (1985): w × (1 + r/${EPLEY_REP_DIVISOR})`,
  brzycki: "Brzycki (1993): w × (36 / (37 − r))",
  lombardi: "Lombardi (1989): w × r^0.10",
  oconner: "O'Conner et al.: w × (1 + 0.025 × r)",
};

/**
 * Raw e1RM for a chosen formula. Returns null when inputs are out of range.
 */
export function estimate1rmKgWithFormula(
  weightKg: number,
  reps: number,
  formula: Estimated1rmFormula = "epley",
): number | null {
  if (!(weightKg > 0) || !Number.isFinite(weightKg)) return null;
  if (!Number.isInteger(reps) || reps < 2 || reps > EPLEY_MAX_REPS) return null;

  switch (formula) {
    case "epley":
      return weightKg * (1 + reps / EPLEY_REP_DIVISOR);
    case "brzycki":
      // Undefined / explosive as reps → 37; we already cap at 12.
      if (reps >= 37) return null;
      return weightKg * (36 / (37 - reps));
    case "lombardi":
      return weightKg * Math.pow(reps, 0.1);
    case "oconner":
      return weightKg * (1 + 0.025 * reps);
    default:
      return null;
  }
}

export function computeEstimated1rm(
  input: Estimated1rmInput,
): Estimated1rmResult | null {
  const formula = input.formula ?? "epley";
  const raw = estimate1rmKgWithFormula(input.weightKg, input.reps, formula);
  if (raw == null) return null;
  return {
    estimated1rmKg: raw,
    formula,
    formulaLabel: FORMULA_LABELS[formula],
    precisionNote: `Estimate only — valid for ${2}–${EPLEY_MAX_REPS} reps. Far from a single, error grows. Never treat as a verified PR.`,
    displayKg: Math.round(raw * 2) / 2,
  };
}

export function estimated1rmRefusalReason(
  input: Estimated1rmInput,
): string | null {
  if (!(input.weightKg > 0) || !Number.isFinite(input.weightKg)) {
    return "Enter a positive load in kilograms.";
  }
  if (!Number.isInteger(input.reps) || input.reps < 2) {
    return "Use 2 or more reps. A true single is already a 1RM — no estimate needed.";
  }
  if (input.reps > EPLEY_MAX_REPS) {
    return `Refuse beyond ${EPLEY_MAX_REPS} reps — estimates are unreliable that far from a single.`;
  }
  return null;
}
