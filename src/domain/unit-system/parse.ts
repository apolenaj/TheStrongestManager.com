import { toCanonicalCm, toCanonicalKg, toCanonicalMeters } from "@/domain/unit-system/canonical";
import type { MassUnit } from "@/domain/unit-system/constants";
import { feetInchesToCm, lbToKg } from "@/domain/unit-system/math";

/**
 * Parse a user-entered mass in their preferred unit into canonical kg.
 * Presentation input only — storage must use the returned kg.
 */
export function parseMassInput(
  raw: string,
  preferredUnit: MassUnit,
): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return preferredUnit === "lb" ? lbToKg(value) : value;
}

/**
 * Parse a simple length number in preferred unit (cm or inches) → canonical cm.
 */
export function parseLengthInput(
  raw: string,
  preferredUnit: MassUnit,
): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Imperial composite: 5'10, 5'10", 5 ft 10, 5ft10in
  if (preferredUnit === "lb") {
    const composite = parseFeetInchesInput(trimmed);
    if (composite != null) return composite;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return preferredUnit === "lb" ? toCanonicalCm(value, "in") : value;
}

/** Parse feet+inches strings into canonical cm. */
export function parseFeetInchesInput(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase();
  const match =
    trimmed.match(/^(\d+)\s*(?:'|ft|feet)\s*(\d+(?:\.\d+)?)\s*(?:"|in|inch|inches)?$/) ||
    trimmed.match(/^(\d+)\s+(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const feet = Number(match[1]);
  const inches = Number(match[2]);
  if (!Number.isFinite(feet) || !Number.isFinite(inches) || feet < 0 || inches < 0) {
    return null;
  }
  const cm = feetInchesToCm(feet, inches);
  return cm > 0 ? cm : null;
}

export function parseDistanceInput(
  raw: string,
  preferredUnit: MassUnit,
  style: "short" | "long" = "short",
): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (style === "long") {
    return preferredUnit === "lb"
      ? toCanonicalMeters(value, "mi")
      : toCanonicalMeters(value, "km");
  }
  return preferredUnit === "lb"
    ? toCanonicalMeters(value, "ft")
    : toCanonicalMeters(value, "m");
}

export function parseMassWithUnitLabel(
  value: number,
  unit: string,
): number {
  return toCanonicalKg(value, unit);
}
