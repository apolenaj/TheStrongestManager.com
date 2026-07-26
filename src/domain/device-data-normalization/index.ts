export {
  DEVICE_DATA_NORMALIZATION_ENGINE_VERSION,
  DEVICE_DATA_NORMALIZATION_HONESTY,
  DEVICE_METRIC_FAMILIES,
  DEVICE_METRIC_FAMILY_LABELS,
  DEVICE_CANONICAL_UNITS,
  CROSS_DEVICE_COMPARISON_CAVEAT,
  SAME_SOURCE_TREND_CAVEAT,
  HRV_METHOD_CAVEAT,
} from "@/domain/device-data-normalization/constants";
export type {
  DeviceMetricFamily,
  HrvMethod,
  HeartRateKind,
} from "@/domain/device-data-normalization/constants";
export type {
  DeviceSourceMetadata,
  CanonicalSleep,
  CanonicalHeartRate,
  CanonicalHrv,
  CanonicalSteps,
  CanonicalWorkout,
  CanonicalDevicePayload,
  NormalizedDeviceRecord,
  RawDeviceObservation,
  DeviceComparisonResult,
} from "@/domain/device-data-normalization/types";
export {
  normalizeDeviceObservation,
  normalizeDeviceObservationBatch,
  compareDeviceMetrics,
  type NormalizeDeviceResult,
} from "@/domain/device-data-normalization/normalize";
export {
  toSleepHours,
  toHeartRateBpm,
  toHrvMs,
  toStepCount,
  toDurationSeconds,
  normalizeHrvMethod,
} from "@/domain/device-data-normalization/units";
export {
  buildDeviceDataNormalizationSnapshot,
  type DeviceDataNormalizationSnapshot,
} from "@/domain/device-data-normalization/snapshot";
