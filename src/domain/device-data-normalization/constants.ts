/**
 * Device Data Normalization (Prompt 186).
 * Canonical shapes for sleep, HR, HRV, steps, workouts + source metadata.
 * Never treat multi-vendor metrics as identical without caveats.
 */

export const DEVICE_DATA_NORMALIZATION_ENGINE_VERSION =
  "device_data_normalization.v1" as const;

export const DEVICE_DATA_NORMALIZATION_HONESTY = [
  "Normalization maps vendor observations into canonical units for storage and display — it does not make devices medically equivalent.",
  "Metrics from different devices or vendors must not be compared as identical without an explicit cross-device caveat.",
  "Missing stages, HRV methods, or workout energy are left null — never invented to fill a schema.",
  "Source metadata (provider, original unit/value, recorded time) stays attached to every normalized record.",
] as const;

export const DEVICE_METRIC_FAMILIES = [
  "sleep",
  "heart_rate",
  "hrv",
  "steps",
  "workout",
] as const;

export type DeviceMetricFamily = (typeof DEVICE_METRIC_FAMILIES)[number];

export const DEVICE_METRIC_FAMILY_LABELS: Record<DeviceMetricFamily, string> = {
  sleep: "Sleep",
  heart_rate: "Heart rate",
  hrv: "HRV",
  steps: "Steps",
  workout: "Workouts",
};

/** Canonical units after normalization. */
export const DEVICE_CANONICAL_UNITS = {
  sleep_duration: "hours",
  sleep_stage: "minutes",
  heart_rate: "bpm",
  hrv: "ms",
  steps: "count",
  workout_duration: "seconds",
  workout_energy: "kcal",
} as const;

export const CROSS_DEVICE_COMPARISON_CAVEAT =
  "Values from different devices or vendors are not interchangeable. Algorithms, wear position, firmware, and definitions differ — compare only within the same source unless you accept this caveat." as const;

export const SAME_SOURCE_TREND_CAVEAT =
  "Same-source trends are more meaningful than cross-device absolute equality, but firmware updates can still shift baselines." as const;

export const HRV_METHOD_CAVEAT =
  "HRV methods (e.g. RMSSD vs SDNN) are not identical. Cross-method or cross-device HRV must carry a caveat." as const;

export type HrvMethod = "rmssd" | "sdnn" | "unknown";

export type HeartRateKind = "resting" | "sample" | "workout_avg" | "unknown";
