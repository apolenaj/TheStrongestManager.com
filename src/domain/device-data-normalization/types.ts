import type {
  DeviceMetricFamily,
  HeartRateKind,
  HrvMethod,
} from "@/domain/device-data-normalization/constants";
import type { WearableProviderId } from "@/domain/wearable-integration";

/**
 * Provenance attached to every normalized device record.
 */
export type DeviceSourceMetadata = {
  providerId: WearableProviderId | "manual" | "unknown";
  providerLabel: string;
  /** Instant the device/vendor associates with the observation. */
  recordedAt: string;
  /** When we ingested/normalized (ISO). */
  ingestedAt: string;
  /** Vendor unit before normalization. */
  originalUnit: string;
  /** Vendor numeric value before normalization. */
  originalValue: number;
  /** Optional hardware / app label from the vendor. */
  deviceLabel: string | null;
  /** Vendor metric / type id when known. */
  vendorMetricId: string | null;
  /** Honest caveats (always includes cross-device note when relevant). */
  caveats: string[];
};

export type CanonicalSleep = {
  family: "sleep";
  /** Total sleep duration in hours. */
  durationHours: number;
  lightMinutes: number | null;
  deepMinutes: number | null;
  remMinutes: number | null;
  awakeMinutes: number | null;
};

export type CanonicalHeartRate = {
  family: "heart_rate";
  bpm: number;
  kind: HeartRateKind;
};

export type CanonicalHrv = {
  family: "hrv";
  /** Milliseconds. */
  ms: number;
  method: HrvMethod;
};

export type CanonicalSteps = {
  family: "steps";
  count: number;
  /** Local calendar day (YYYY-MM-DD) when known. */
  dayKey: string | null;
};

export type CanonicalWorkout = {
  family: "workout";
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  /** Soft sport / activity label from vendor — not a taxonomy claim. */
  activityLabel: string | null;
  energyKcal: number | null;
};

export type CanonicalDevicePayload =
  | CanonicalSleep
  | CanonicalHeartRate
  | CanonicalHrv
  | CanonicalSteps
  | CanonicalWorkout;

export type NormalizedDeviceRecord = {
  id: string;
  family: DeviceMetricFamily;
  source: DeviceSourceMetadata;
  payload: CanonicalDevicePayload;
};

/** Vendor-agnostic inbound observation before normalization. */
export type RawDeviceObservation = {
  providerId: WearableProviderId | "manual" | "unknown";
  providerLabel?: string;
  family: DeviceMetricFamily;
  value: number;
  unit: string;
  recordedAt: Date | string;
  deviceLabel?: string | null;
  vendorMetricId?: string | null;
  /** Sleep stages in minutes when the vendor supplies them. */
  sleepStages?: {
    lightMinutes?: number | null;
    deepMinutes?: number | null;
    remMinutes?: number | null;
    awakeMinutes?: number | null;
  };
  hrvMethod?: HrvMethod | string | null;
  heartRateKind?: HeartRateKind | string | null;
  dayKey?: string | null;
  workout?: {
    startedAt: Date | string;
    endedAt?: Date | string | null;
    durationSeconds?: number | null;
    activityLabel?: string | null;
    energyKcal?: number | null;
  };
};

export type DeviceComparisonResult = {
  /** True only when same provider + family + compatible method — still not “identical physics”. */
  sameSourceComparable: boolean;
  /** Always false for different providers — do not treat as identical. */
  identicalAcrossDevices: false;
  caveats: string[];
  detail: string;
};
