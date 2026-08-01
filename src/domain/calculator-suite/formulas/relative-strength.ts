/**
 * Relative strength — DOTS (OpenPowerlifting) + IPF GL Points (Classic/Raw).
 */

import {
  DOTS_BODYWEIGHT_CLAMP_KG,
  DOTS_CITATION,
  DOTS_COEFFICIENTS,
  computeDots,
  type DotsSex,
} from "@/domain/calculator-suite/formulas/dots";

export const RELATIVE_STRENGTH_FORMULAS = ["ipf_gl", "dots"] as const;

export type RelativeStrengthFormula =
  (typeof RELATIVE_STRENGTH_FORMULAS)[number];

/**
 * IPF Good Lift (GL) Points — Classic / Raw coefficients.
 * GL = total × (100 / (A − B × e^(−C × bodyweight)))
 */
export const IPF_GL_CLASSIC_COEFFICIENTS: Record<
  DotsSex,
  { a: number; b: number; c: number }
> = {
  male: { a: 1199.72839, b: 1025.18162, c: 0.00921 },
  female: { a: 610.32796, b: 1045.59282, c: 0.03048 },
};

export const IPF_GL_CITATION =
  "IPF GL Points (Classic/Raw): score = total × (100 / (A − B × e^(−C × bw))), sex-specific IPF coefficients.";

export type RelativeStrengthInput = {
  formula: RelativeStrengthFormula;
  sex: DotsSex;
  bodyweightKg: number;
  totalKg: number;
};

export type RelativeStrengthResult = {
  formula: RelativeStrengthFormula;
  score: number;
  displayScore: number;
  /** Unit label for UI (localized via i18n keys). */
  unitKey: "unit_dots" | "unit_ipf_gl";
  bodyweightUsedKg: number;
  bodyweightClamped: boolean;
  totalKg: number;
  sex: DotsSex;
  citation: string;
};

export function computeIpfGlClassic(input: {
  sex: DotsSex;
  bodyweightKg: number;
  totalKg: number;
}): RelativeStrengthResult | null {
  if (input.sex !== "male" && input.sex !== "female") return null;
  if (!(input.bodyweightKg > 0) || !Number.isFinite(input.bodyweightKg)) {
    return null;
  }
  if (!(input.totalKg > 0) || !Number.isFinite(input.totalKg)) return null;

  const { a, b, c } = IPF_GL_CLASSIC_COEFFICIENTS[input.sex];
  const denom = a - b * Math.exp(-c * input.bodyweightKg);
  if (!(denom > 0) || !Number.isFinite(denom)) return null;

  const score = input.totalKg * (100 / denom);
  if (!Number.isFinite(score) || score <= 0) return null;

  return {
    formula: "ipf_gl",
    score,
    displayScore: Math.round(score * 100) / 100,
    unitKey: "unit_ipf_gl",
    bodyweightUsedKg: input.bodyweightKg,
    bodyweightClamped: false,
    totalKg: input.totalKg,
    sex: input.sex,
    citation: IPF_GL_CITATION,
  };
}

export function computeRelativeStrength(
  input: RelativeStrengthInput,
): RelativeStrengthResult | null {
  if (input.formula === "ipf_gl") {
    return computeIpfGlClassic(input);
  }

  const dots = computeDots({
    sex: input.sex,
    bodyweightKg: input.bodyweightKg,
    totalKg: input.totalKg,
  });
  if (!dots) return null;

  return {
    formula: "dots",
    score: dots.dots,
    displayScore: dots.displayDots,
    unitKey: "unit_dots",
    bodyweightUsedKg: dots.bodyweightUsedKg,
    bodyweightClamped: dots.bodyweightClamped,
    totalKg: dots.totalKg,
    sex: dots.sex,
    citation: DOTS_CITATION,
  };
}

export function relativeStrengthRefusalReason(
  input: RelativeStrengthInput,
): "refuse_sex" | "refuse_bw" | "refuse_total" | null {
  if (input.sex !== "male" && input.sex !== "female") return "refuse_sex";
  if (!(input.bodyweightKg > 0) || !Number.isFinite(input.bodyweightKg)) {
    return "refuse_bw";
  }
  if (!(input.totalKg > 0) || !Number.isFinite(input.totalKg)) {
    return "refuse_total";
  }
  return null;
}

/** Re-export clamps/coeffs for tests and docs. */
export { DOTS_BODYWEIGHT_CLAMP_KG, DOTS_COEFFICIENTS };
