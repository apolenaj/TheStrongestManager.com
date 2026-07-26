import {
  CM_PER_INCH,
  INCHES_PER_FOOT,
  LB_PER_KG,
  METERS_PER_FOOT,
  METERS_PER_KM,
  METERS_PER_MILE,
  type MassUnit,
  type UnitPreference,
  type UnitSystemId,
} from "@/domain/unit-system/constants";

export function normalizeMassUnit(value: string | null | undefined): MassUnit {
  if (
    value === "lb" ||
    value === "lbs" ||
    value === "imperial" ||
    value === "us"
  ) {
    return "lb";
  }
  return "kg";
}

export function unitSystemFromMass(mass: MassUnit): UnitSystemId {
  return mass === "lb" ? "imperial" : "metric";
}

/** Full preference derived from AthleteProfile.units (kg | lb | legacy). */
export function resolveUnitPreference(
  unitsRaw: string | null | undefined,
): UnitPreference {
  const mass = normalizeMassUnit(unitsRaw);
  const system = unitSystemFromMass(mass);
  if (system === "imperial") {
    return {
      system,
      mass: "lb",
      length: "in",
      distanceLong: "mi",
      distanceShort: "ft",
      heightStyle: "ft_in",
    };
  }
  return {
    system: "metric",
    mass: "kg",
    length: "cm",
    distanceLong: "km",
    distanceShort: "m",
    heightStyle: "cm",
  };
}

export function lengthUnitFor(massUnit: MassUnit): "cm" | "in" {
  return resolveUnitPreference(massUnit).length;
}

export function roundDisplay(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function cmToIn(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function metersToKm(m: number): number {
  return m / METERS_PER_KM;
}

export function kmToMeters(km: number): number {
  return km * METERS_PER_KM;
}

export function metersToMiles(m: number): number {
  return m / METERS_PER_MILE;
}

export function milesToMeters(mi: number): number {
  return mi * METERS_PER_MILE;
}

export function metersToFeet(m: number): number {
  return m / METERS_PER_FOOT;
}

export function feetToMeters(ft: number): number {
  return ft * METERS_PER_FOOT;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalIn = cmToIn(cm);
  let feet = Math.floor(totalIn / INCHES_PER_FOOT);
  let inches = roundDisplay(totalIn - feet * INCHES_PER_FOOT, 1);
  if (inches >= INCHES_PER_FOOT - 1e-9) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return inToCm(feet * INCHES_PER_FOOT + inches);
}
