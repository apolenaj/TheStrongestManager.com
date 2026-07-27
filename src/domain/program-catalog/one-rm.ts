import type { UnitSystem } from "@/types/programs";

/** Absolute caps — reject joke / impossible entries, not elite-but-real lifts. */
const MAX_KG = {
  squat: 480,
  bench: 360,
  deadlift: 520,
} as const;

const MIN_KG = {
  squat: 20,
  bench: 15,
  deadlift: 20,
} as const;

export type OneRmLift = keyof typeof MAX_KG;

export type OneRmInput = {
  squat?: number | null;
  bench?: number | null;
  deadlift?: number | null;
};

export type OneRmValidationResult =
  | { ok: true; valuesKg: Partial<Record<OneRmLift, number>> }
  | { ok: false; error: string };

function toKg(value: number, unit: UnitSystem): number {
  return unit === "lb" ? value / 2.2046226218 : value;
}

function isProvided(value: number | null | undefined): value is number {
  return value != null && !(typeof value === "number" && Number.isNaN(value));
}

/**
 * Validate optional S/B/D 1RMs. Empty fields are allowed.
 * Rejects non-finite, below floor, above ceiling, and absurd ratio combinations.
 */
export function validateOptionalOneRms(
  input: OneRmInput,
  unit: UnitSystem,
): OneRmValidationResult {
  const valuesKg: Partial<Record<OneRmLift, number>> = {};

  for (const lift of ["squat", "bench", "deadlift"] as const) {
    const raw = input[lift];
    if (!isProvided(raw)) continue;

    if (!Number.isFinite(raw)) {
      return { ok: false, error: `Enter a valid ${lift} 1RM.` };
    }
    if (raw <= 0) {
      return { ok: false, error: `${lift} 1RM must be greater than zero.` };
    }
    if (!Number.isInteger(raw) && String(raw).split(".")[1]?.length > 2) {
      return {
        ok: false,
        error: `Use at most 2 decimal places for ${lift} 1RM.`,
      };
    }

    const kg = toKg(raw, unit);
    if (kg < MIN_KG[lift]) {
      return {
        ok: false,
        error: `${lift} 1RM looks unrealistically low for a working max.`,
      };
    }
    if (kg > MAX_KG[lift]) {
      return {
        ok: false,
        error: `${lift} 1RM exceeds a realistic ceiling — check units (${unit}) and the number.`,
      };
    }
    valuesKg[lift] = Math.round(kg * 10) / 10;
  }

  const { squat, bench, deadlift } = valuesKg;
  if (squat != null && bench != null && bench > squat * 1.35) {
    return {
      ok: false,
      error:
        "Bench is unrealistically high relative to squat — check units or values.",
    };
  }
  if (deadlift != null && squat != null && deadlift > squat * 1.85) {
    return {
      ok: false,
      error:
        "Deadlift is unrealistically high relative to squat — check units or values.",
    };
  }
  if (bench != null && deadlift != null && bench > deadlift * 1.25) {
    return {
      ok: false,
      error:
        "Bench is unrealistically high relative to deadlift — check units or values.",
    };
  }

  return { ok: true, valuesKg };
}

/** Convert validated 1RMs to training maxes (~90%). */
export function trainingMaxesFromOneRmsKg(
  valuesKg: Partial<Record<OneRmLift, number>>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [lift, oneRm] of Object.entries(valuesKg)) {
    if (oneRm == null) continue;
    out[lift] = Math.round(oneRm * 0.9 * 10) / 10;
  }
  return out;
}
