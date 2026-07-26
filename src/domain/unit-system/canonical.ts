import {
  cmToIn,
  feetInchesToCm,
  feetToMeters,
  inToCm,
  kgToLb,
  kmToMeters,
  lbToKg,
  metersToFeet,
  metersToKm,
  metersToMiles,
  milesToMeters,
  normalizeMassUnit,
} from "@/domain/unit-system/math";
import type { MassUnit } from "@/domain/unit-system/constants";

/** Convert a mass value (any known unit label) into canonical kilograms. */
export function toCanonicalKg(value: number, unit: string): number {
  const normalized = unit.toLowerCase().trim();
  if (
    normalized === "lb" ||
    normalized === "lbs" ||
    normalized === "pound" ||
    normalized === "pounds"
  ) {
    return lbToKg(value);
  }
  return value;
}

/** Convert a length value into canonical centimeters. */
export function toCanonicalCm(value: number, unit: string): number {
  const normalized = unit.toLowerCase().trim();
  if (
    normalized === "in" ||
    normalized === "inch" ||
    normalized === "inches" ||
    normalized === '"'
  ) {
    return inToCm(value);
  }
  if (normalized === "ft" || normalized === "foot" || normalized === "feet") {
    return feetInchesToCm(value, 0);
  }
  return value;
}

/** Convert a distance value into canonical meters. */
export function toCanonicalMeters(value: number, unit: string): number {
  const normalized = unit.toLowerCase().trim();
  if (normalized === "km" || normalized === "kilometer" || normalized === "kilometres" || normalized === "kilometers") {
    return kmToMeters(value);
  }
  if (
    normalized === "mi" ||
    normalized === "mile" ||
    normalized === "miles"
  ) {
    return milesToMeters(value);
  }
  if (normalized === "ft" || normalized === "foot" || normalized === "feet") {
    return feetToMeters(value);
  }
  // m | meter | metres | meters | default
  return value;
}

export function fromCanonicalKg(kg: number, displayUnit: MassUnit): number {
  return displayUnit === "lb" ? kgToLb(kg) : kg;
}

/** Length presentation number (cm or total inches) from preference mass unit. */
export function fromCanonicalCm(cm: number, displayUnit: MassUnit): number {
  return normalizeMassUnit(displayUnit) === "lb" ? cmToIn(cm) : cm;
}

export function fromCanonicalMeters(
  meters: number,
  display: "m" | "km" | "ft" | "mi",
): number {
  switch (display) {
    case "km":
      return metersToKm(meters);
    case "mi":
      return metersToMiles(meters);
    case "ft":
      return metersToFeet(meters);
    default:
      return meters;
  }
}
