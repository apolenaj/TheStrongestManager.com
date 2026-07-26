/**
 * Global unit system (Prompt 149).
 * Store canonical SI-ish values; convert for presentation only.
 */

export const UNIT_SYSTEM_ENGINE_VERSION = "unit_system.v1" as const;

/** Athlete preference — drives presentation; never changes stored rows. */
export type MassUnit = "kg" | "lb";
export type LengthUnit = "cm" | "in";
/** Composite height display for imperial. */
export type HeightDisplayStyle = "cm" | "in" | "ft_in";
export type DistanceUnit = "m" | "km" | "ft" | "mi";

export type UnitSystemId = "metric" | "imperial";

export type UnitPreference = {
  system: UnitSystemId;
  mass: MassUnit;
  length: LengthUnit;
  /** Long-distance presentation (cardio / maps). */
  distanceLong: "km" | "mi";
  /** Short-distance presentation (strongman walks, carries). */
  distanceShort: "m" | "ft";
  heightStyle: HeightDisplayStyle;
};

export const UNIT_SYSTEM_HONESTY = [
  "Canonical storage is kg (mass), cm (length), and m (distance) — preferences only change presentation.",
  "kg/lb, cm/ft/in, and km/miles convert at the display boundary; calculations use canonical values.",
  "Switching units never rewrites historical ProgressMetric or BodyMetric rows.",
] as const;

/** Exact international avoirdupois pound. */
export const LB_PER_KG = 2.2046226218;
/** Exact inch definition (1 in = 2.54 cm). */
export const CM_PER_INCH = 2.54;
export const INCHES_PER_FOOT = 12;
/** Exact statute mile. */
export const METERS_PER_MILE = 1609.344;
export const METERS_PER_KM = 1000;
export const METERS_PER_FOOT = 0.3048;
