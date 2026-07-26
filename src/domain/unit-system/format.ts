import {
  fromCanonicalCm,
  fromCanonicalKg,
  fromCanonicalMeters,
} from "@/domain/unit-system/canonical";
import type { MassUnit, UnitPreference } from "@/domain/unit-system/constants";
import { METERS_PER_MILE } from "@/domain/unit-system/constants";
import {
  cmToFeetInches,
  lengthUnitFor,
  resolveUnitPreference,
  roundDisplay,
} from "@/domain/unit-system/math";

/** Threshold where imperial switches short (ft) → long (mi). */
const METERS_PER_TENTH_MILE = METERS_PER_MILE / 10;

export function formatMass(kg: number, displayUnit: MassUnit): string {
  const unit = displayUnit === "lb" ? "lb" : "kg";
  const value = roundDisplay(fromCanonicalKg(kg, unit), 1);
  return `${value} ${unit}`;
}

/**
 * Format height/length for display.
 * Imperial uses ft + in (e.g. 5 ft 11 in); metric uses whole cm.
 */
export function formatLength(cm: number, displayUnit: MassUnit): string {
  const pref = resolveUnitPreference(displayUnit);
  if (pref.heightStyle === "ft_in") {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet} ft ${inches} in`;
  }
  const unit = lengthUnitFor(displayUnit);
  const value = roundDisplay(
    fromCanonicalCm(cm, displayUnit),
    unit === "in" ? 1 : 0,
  );
  return `${value} ${unit}`;
}

/** Short event distances (strongman walks): m or ft. */
export function formatDistanceShort(
  meters: number,
  displayUnit: MassUnit,
): string {
  const pref = resolveUnitPreference(displayUnit);
  const unit = pref.distanceShort;
  const value = roundDisplay(fromCanonicalMeters(meters, unit), 1);
  return `${value} ${unit}`;
}

/** Longer distances where km/miles are relevant. */
export function formatDistanceLong(
  meters: number,
  displayUnit: MassUnit,
): string {
  const pref = resolveUnitPreference(displayUnit);
  const unit = pref.distanceLong;
  const value = roundDisplay(fromCanonicalMeters(meters, unit), 2);
  return `${value} ${unit}`;
}

/**
 * Auto-pick short vs long presentation.
 * ≥ 1000 m (metric) or ≥ 0.1 mi (imperial) → long units.
 */
export function formatDistance(
  meters: number,
  displayUnit: MassUnit,
): string {
  const pref = resolveUnitPreference(displayUnit);
  if (pref.system === "metric") {
    return meters >= 1000
      ? formatDistanceLong(meters, displayUnit)
      : formatDistanceShort(meters, displayUnit);
  }
  return meters >= METERS_PER_TENTH_MILE
    ? formatDistanceLong(meters, displayUnit)
    : formatDistanceShort(meters, displayUnit);
}

export function formatDistanceForPreference(
  meters: number,
  preference: UnitPreference,
): string {
  return formatDistance(meters, preference.mass);
}
