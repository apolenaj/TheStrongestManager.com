export type {
  MassUnit,
  LengthUnit,
  HeightDisplayStyle,
  DistanceUnit,
  UnitSystemId,
  UnitPreference,
} from "@/domain/unit-system/constants";
export {
  UNIT_SYSTEM_ENGINE_VERSION,
  UNIT_SYSTEM_HONESTY,
  LB_PER_KG,
  CM_PER_INCH,
  INCHES_PER_FOOT,
  METERS_PER_MILE,
  METERS_PER_KM,
  METERS_PER_FOOT,
} from "@/domain/unit-system/constants";

export {
  normalizeMassUnit,
  unitSystemFromMass,
  resolveUnitPreference,
  lengthUnitFor,
  roundDisplay,
  kgToLb,
  lbToKg,
  cmToIn,
  inToCm,
  metersToKm,
  kmToMeters,
  metersToMiles,
  milesToMeters,
  metersToFeet,
  feetToMeters,
  cmToFeetInches,
  feetInchesToCm,
} from "@/domain/unit-system/math";

export {
  toCanonicalKg,
  toCanonicalCm,
  toCanonicalMeters,
  fromCanonicalKg,
  fromCanonicalCm,
  fromCanonicalMeters,
} from "@/domain/unit-system/canonical";

export {
  formatMass,
  formatLength,
  formatDistanceShort,
  formatDistanceLong,
  formatDistance,
  formatDistanceForPreference,
} from "@/domain/unit-system/format";

export {
  parseMassInput,
  parseLengthInput,
  parseFeetInchesInput,
  parseDistanceInput,
  parseMassWithUnitLabel,
} from "@/domain/unit-system/parse";

export {
  buildUnitSystemSnapshot,
  type UnitSystemSnapshot,
} from "@/domain/unit-system/snapshot";
