import { formatDistance, formatLength, formatMass } from "@/domain/unit-system/format";
import {
  UNIT_SYSTEM_ENGINE_VERSION,
  UNIT_SYSTEM_HONESTY,
} from "@/domain/unit-system/constants";
import {
  cmToFeetInches,
  resolveUnitPreference,
} from "@/domain/unit-system/math";

export type UnitSystemSnapshot = {
  engineVersion: typeof UNIT_SYSTEM_ENGINE_VERSION;
  canonical: {
    mass: "kg";
    length: "cm";
    distance: "m";
  };
  systems: {
    metric: ReturnType<typeof resolveUnitPreference>;
    imperial: ReturnType<typeof resolveUnitPreference>;
  };
  /** Sample presentation conversions for admin verification. */
  samples: {
    mass100kg: { metric: string; imperial: string };
    height180cm: { metric: string; imperial: string; ftInParts: { feet: number; inches: number } };
    walk40m: { metric: string; imperial: string };
    run5km: { metric: string; imperial: string };
  };
  honesty: readonly string[];
  generatedAt: string;
};

export function buildUnitSystemSnapshot(
  generatedAt: string = new Date().toISOString(),
): UnitSystemSnapshot {
  return {
    engineVersion: UNIT_SYSTEM_ENGINE_VERSION,
    canonical: { mass: "kg", length: "cm", distance: "m" },
    systems: {
      metric: resolveUnitPreference("kg"),
      imperial: resolveUnitPreference("lb"),
    },
    samples: {
      mass100kg: {
        metric: formatMass(100, "kg"),
        imperial: formatMass(100, "lb"),
      },
      height180cm: {
        metric: formatLength(180, "kg"),
        imperial: formatLength(180, "lb"),
        ftInParts: cmToFeetInches(180),
      },
      walk40m: {
        metric: formatDistance(40, "kg"),
        imperial: formatDistance(40, "lb"),
      },
      run5km: {
        metric: formatDistance(5000, "kg"),
        imperial: formatDistance(5000, "lb"),
      },
    },
    honesty: UNIT_SYSTEM_HONESTY,
    generatedAt,
  };
}
