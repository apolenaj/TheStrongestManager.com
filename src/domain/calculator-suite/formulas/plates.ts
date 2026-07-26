/**
 * Plate calculator — greedy paired loading for a target bar weight.
 * Does not invent collar weight or gym-specific plate stacks.
 */

export const DEFAULT_BAR_KG = 20;
export const DEFAULT_PLATE_DENOMINATIONS_KG = [
  25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5,
] as const;

export type PlateStackEntry = {
  plateKg: number;
  /** Count per side. */
  countPerSide: number;
};

export type PlateCalculatorInput = {
  targetKg: number;
  barKg: number;
  /** Available denominations (kg). Defaults to common metric set. */
  denominationsKg?: readonly number[];
};

export type PlateCalculatorResult = {
  targetKg: number;
  barKg: number;
  loadableKg: number;
  remainderKg: number;
  perSideKg: number;
  platesPerSide: PlateStackEntry[];
  exact: boolean;
  precisionNote: string;
};

function normalizeDenoms(raw: readonly number[] | undefined): number[] {
  const source = raw?.length ? raw : DEFAULT_PLATE_DENOMINATIONS_KG;
  return [...new Set(source.filter((d) => d > 0 && Number.isFinite(d)))].sort(
    (a, b) => b - a,
  );
}

/**
 * Load the bar as close as possible to target using paired plates.
 * Returns null when inputs are invalid.
 */
export function computePlateLoading(
  input: PlateCalculatorInput,
): PlateCalculatorResult | null {
  const { targetKg, barKg } = input;
  if (!(targetKg > 0) || !(barKg >= 0) || !Number.isFinite(targetKg) || !Number.isFinite(barKg)) {
    return null;
  }
  if (targetKg < barKg) return null;

  const denoms = normalizeDenoms(input.denominationsKg);
  if (denoms.length === 0) return null;

  let remainingPerSide = (targetKg - barKg) / 2;
  // Round to avoid float dust (0.5g)
  remainingPerSide = Math.round(remainingPerSide * 1000) / 1000;

  const platesPerSide: PlateStackEntry[] = [];
  let usedPerSide = 0;

  for (const plate of denoms) {
    const count = Math.floor((remainingPerSide + 1e-9) / plate);
    if (count <= 0) continue;
    platesPerSide.push({ plateKg: plate, countPerSide: count });
    usedPerSide += count * plate;
    remainingPerSide = Math.round((remainingPerSide - count * plate) * 1000) / 1000;
  }

  const loadableKg =
    Math.round((barKg + usedPerSide * 2) * 1000) / 1000;
  const remainderKg = Math.round((targetKg - loadableKg) * 1000) / 1000;

  return {
    targetKg,
    barKg,
    loadableKg,
    remainderKg,
    perSideKg: Math.round(usedPerSide * 1000) / 1000,
    platesPerSide,
    exact: Math.abs(remainderKg) < 0.001,
    precisionNote:
      "Assumes paired plates and the stated bar weight. Collars, bumper tolerances, and missing denominations are not modeled.",
  };
}

export function plateCalculatorRefusalReason(
  input: PlateCalculatorInput,
): string | null {
  if (!(input.targetKg > 0) || !Number.isFinite(input.targetKg)) {
    return "Enter a positive target weight in kilograms.";
  }
  if (!(input.barKg >= 0) || !Number.isFinite(input.barKg)) {
    return "Enter a valid bar weight (0 allowed for plate-only loads).";
  }
  if (input.targetKg < input.barKg) {
    return "Target must be at least the bar weight.";
  }
  return null;
}
