/**
 * Helpers for mobile workout steppers / focus navigation.
 */

import {
  MOBILE_WORKOUT_LOAD_STEP,
  MOBILE_WORKOUT_REP_STEP,
  MOBILE_WORKOUT_RPE_STEP,
} from "@/domain/mobile-workout/constants";
import type { MassUnit } from "@/services/units/convert";

export function loadStepForUnit(units: MassUnit): number {
  return units === "lb" ? MOBILE_WORKOUT_LOAD_STEP.lb : MOBILE_WORKOUT_LOAD_STEP.kg;
}

export function nudgeNumeric(
  current: string,
  delta: number,
  opts?: { min?: number; max?: number; decimals?: number },
): string {
  const min = opts?.min ?? 0;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  const decimals = opts?.decimals ?? 1;
  const parsed = Number.parseFloat(current);
  const base = Number.isFinite(parsed) ? parsed : 0;
  const next = Math.min(max, Math.max(min, base + delta));
  const factor = 10 ** decimals;
  const rounded = Math.round(next * factor) / factor;
  if (decimals === 0) return String(Math.round(rounded));
  return String(rounded);
}

export function nudgeLoad(current: string, units: MassUnit, direction: 1 | -1): string {
  return nudgeNumeric(current, direction * loadStepForUnit(units), {
    min: 0,
    decimals: units === "lb" ? 0 : 1,
  });
}

export function nudgeReps(current: string, direction: 1 | -1): string {
  return nudgeNumeric(current, direction * MOBILE_WORKOUT_REP_STEP, {
    min: 0,
    max: 100,
    decimals: 0,
  });
}

export function nudgeRpe(current: string, direction: 1 | -1): string {
  return nudgeNumeric(current, direction * MOBILE_WORKOUT_RPE_STEP, {
    min: 0,
    max: 10,
    decimals: 1,
  });
}

/** Index of first incomplete exercise, else last. */
export function initialFocusedExerciseIndex(exercises: { sets: { isComplete: boolean }[] }[]): number {
  if (exercises.length === 0) return 0;
  const idx = exercises.findIndex((ex) =>
    ex.sets.some((s) => !s.isComplete),
  );
  return idx >= 0 ? idx : Math.max(0, exercises.length - 1);
}
