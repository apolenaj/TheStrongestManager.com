/**
 * Unit helpers — re-export domain unit system (Prompt 149).
 * Prefer `@/domain/unit-system` for new code.
 * Canonical storage: mass kg, length cm, distance m.
 * Display respects athlete kg/lb preference (ft/in, km/mi where relevant).
 */

export type {
  MassUnit,
  LengthUnit,
  DistanceUnit,
  UnitPreference,
  UnitSystemId,
} from "@/domain/unit-system";

export {
  normalizeMassUnit,
  lengthUnitFor,
  resolveUnitPreference,
  kgToLb,
  lbToKg,
  cmToIn,
  inToCm,
  cmToFeetInches,
  feetInchesToCm,
  toCanonicalKg,
  toCanonicalCm,
  toCanonicalMeters,
  fromCanonicalKg,
  fromCanonicalCm,
  fromCanonicalMeters,
  roundDisplay,
  formatMass,
  formatLength,
  formatDistance,
  formatDistanceShort,
  formatDistanceLong,
  parseMassInput,
  parseLengthInput,
  parseFeetInchesInput,
  parseDistanceInput,
} from "@/domain/unit-system";
