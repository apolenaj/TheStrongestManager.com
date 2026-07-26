/**
 * Volume / tonnage calculator — load × reps × sets (and optional weekly sum).
 * Does not claim stimulus quality or recovery capacity.
 */

export type VolumeSetInput = {
  loadKg: number;
  reps: number;
  sets: number;
  /** Optional label for multi-row weekly totals. */
  label?: string;
};

export type VolumeRowResult = {
  label: string;
  tonnageKg: number;
  totalReps: number;
};

export type VolumeCalculatorResult = {
  rows: VolumeRowResult[];
  totalTonnageKg: number;
  totalReps: number;
  precisionNote: string;
};

export function computeSetTonnageKg(
  loadKg: number,
  reps: number,
  sets: number,
): number | null {
  if (!(loadKg > 0) || !(reps > 0) || !(sets > 0)) return null;
  if (
    !Number.isFinite(loadKg) ||
    !Number.isInteger(reps) ||
    !Number.isInteger(sets)
  ) {
    return null;
  }
  return loadKg * reps * sets;
}

export function computeVolume(
  rows: VolumeSetInput[],
): VolumeCalculatorResult | null {
  if (!rows.length) return null;

  const out: VolumeRowResult[] = [];
  let totalTonnageKg = 0;
  let totalReps = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const tonnage = computeSetTonnageKg(row.loadKg, row.reps, row.sets);
    if (tonnage == null) return null;
    const repsTotal = row.reps * row.sets;
    out.push({
      label: row.label?.trim() || `Row ${i + 1}`,
      tonnageKg: Math.round(tonnage * 10) / 10,
      totalReps: repsTotal,
    });
    totalTonnageKg += tonnage;
    totalReps += repsTotal;
  }

  return {
    rows: out,
    totalTonnageKg: Math.round(totalTonnageKg * 10) / 10,
    totalReps,
    precisionNote:
      "Tonnage is load × reps × sets. It does not measure technique quality, proximity to failure, or whether the week was productive.",
  };
}
