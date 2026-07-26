import {
  CROSS_DEVICE_COMPARISON_CAVEAT,
  DEVICE_CANONICAL_UNITS,
  DEVICE_DATA_NORMALIZATION_ENGINE_VERSION,
  DEVICE_DATA_NORMALIZATION_HONESTY,
  DEVICE_METRIC_FAMILIES,
  DEVICE_METRIC_FAMILY_LABELS,
  HRV_METHOD_CAVEAT,
  SAME_SOURCE_TREND_CAVEAT,
} from "@/domain/device-data-normalization/constants";

export type DeviceDataNormalizationSnapshot = {
  engineVersion: typeof DEVICE_DATA_NORMALIZATION_ENGINE_VERSION;
  honesty: typeof DEVICE_DATA_NORMALIZATION_HONESTY;
  families: Array<{ id: string; label: string }>;
  canonicalUnits: typeof DEVICE_CANONICAL_UNITS;
  caveats: {
    crossDevice: typeof CROSS_DEVICE_COMPARISON_CAVEAT;
    sameSourceTrend: typeof SAME_SOURCE_TREND_CAVEAT;
    hrvMethod: typeof HRV_METHOD_CAVEAT;
  };
  docPath: "docs/DEVICE_DATA_NORMALIZATION.md";
  generatedAt: string;
};

export function buildDeviceDataNormalizationSnapshot(
  generatedAt: string = new Date().toISOString(),
): DeviceDataNormalizationSnapshot {
  return {
    engineVersion: DEVICE_DATA_NORMALIZATION_ENGINE_VERSION,
    honesty: DEVICE_DATA_NORMALIZATION_HONESTY,
    families: DEVICE_METRIC_FAMILIES.map((id) => ({
      id,
      label: DEVICE_METRIC_FAMILY_LABELS[id],
    })),
    canonicalUnits: DEVICE_CANONICAL_UNITS,
    caveats: {
      crossDevice: CROSS_DEVICE_COMPARISON_CAVEAT,
      sameSourceTrend: SAME_SOURCE_TREND_CAVEAT,
      hrvMethod: HRV_METHOD_CAVEAT,
    },
    docPath: "docs/DEVICE_DATA_NORMALIZATION.md",
    generatedAt,
  };
}
