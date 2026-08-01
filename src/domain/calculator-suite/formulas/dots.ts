/**
 * DOTS relative strength score — OpenPowerlifting coefficients (cited).
 * Source: OpenPowerlifting / Tim Rohr DOTS (2020) polynomial form.
 * Bodyweight is clamped to the published usable ranges.
 *
 * IPF GL Classic lives in relative-strength.ts. Wilks is not implemented here.
 */

export type DotsSex = "male" | "female";

export type DotsCoefficients = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
};

/**
 * Coefficient order matches: coeff = 500 / (A + B·bw + C·bw² + D·bw³ + E·bw⁴)
 * Values published via OpenPowerlifting documentation / common federation use.
 */
export const DOTS_COEFFICIENTS: Record<DotsSex, DotsCoefficients> = {
  male: {
    a: -307.75076,
    b: 24.0900756,
    c: -0.1918759221,
    d: 0.0007391293,
    e: -0.000001093,
  },
  female: {
    a: -57.96288,
    b: 13.6175032,
    c: -0.1126655495,
    d: 0.0005158568,
    e: -0.0000010706,
  },
};

/** Published clamp ranges (kg) used by OpenPowerlifting-style DOTS calculators. */
export const DOTS_BODYWEIGHT_CLAMP_KG: Record<
  DotsSex,
  { min: number; max: number }
> = {
  male: { min: 40, max: 210 },
  female: { min: 40, max: 150 },
};

export const DOTS_CITATION =
  "DOTS (OpenPowerlifting / Tim Rohr, 2020): score = total × 500 / (A + B·bw + C·bw² + D·bw³ + E·bw⁴), sex-specific coefficients.";

export type DotsInput = {
  sex: DotsSex;
  bodyweightKg: number;
  totalKg: number;
};

export type DotsResult = {
  dots: number;
  displayDots: number;
  bodyweightUsedKg: number;
  bodyweightClamped: boolean;
  totalKg: number;
  sex: DotsSex;
  citation: string;
  precisionNote: string;
};

function clampBw(sex: DotsSex, bw: number): { used: number; clamped: boolean } {
  const { min, max } = DOTS_BODYWEIGHT_CLAMP_KG[sex];
  if (bw < min) return { used: min, clamped: true };
  if (bw > max) return { used: max, clamped: true };
  return { used: bw, clamped: false };
}

function polynomial(sex: DotsSex, bw: number): number {
  const { a, b, c, d, e } = DOTS_COEFFICIENTS[sex];
  return a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4;
}

/**
 * Compute DOTS. Returns null on invalid inputs or non-positive denominator.
 */
export function computeDots(input: DotsInput): DotsResult | null {
  if (input.sex !== "male" && input.sex !== "female") return null;
  if (!(input.bodyweightKg > 0) || !Number.isFinite(input.bodyweightKg)) {
    return null;
  }
  if (!(input.totalKg > 0) || !Number.isFinite(input.totalKg)) return null;

  const { used, clamped } = clampBw(input.sex, input.bodyweightKg);
  const denom = polynomial(input.sex, used);
  if (!(denom > 0) || !Number.isFinite(denom)) return null;

  const dots = (input.totalKg * 500) / denom;
  if (!Number.isFinite(dots) || dots <= 0) return null;

  return {
    dots,
    displayDots: Math.round(dots * 100) / 100,
    bodyweightUsedKg: used,
    bodyweightClamped: clamped,
    totalKg: input.totalKg,
    sex: input.sex,
    citation: DOTS_CITATION,
    precisionNote:
      "DOTS compares totals across bodyweights using a published curve — not a placing, not IPF GL Points, and not a guarantee of meet ranking. Federation rulebooks may use a different formula.",
  };
}

export function dotsRefusalReason(input: DotsInput): string | null {
  if (input.sex !== "male" && input.sex !== "female") {
    return "Select male or female coefficients — DOTS is sex-specific.";
  }
  if (!(input.bodyweightKg > 0) || !Number.isFinite(input.bodyweightKg)) {
    return "Enter a positive bodyweight in kilograms.";
  }
  if (!(input.totalKg > 0) || !Number.isFinite(input.totalKg)) {
    return "Enter a positive total (squat + bench + deadlift) in kilograms.";
  }
  return null;
}
