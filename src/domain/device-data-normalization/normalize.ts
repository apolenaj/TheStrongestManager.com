/**
 * Normalize raw device observations into canonical records.
 */

import {
  CROSS_DEVICE_COMPARISON_CAVEAT,
  DEVICE_CANONICAL_UNITS,
  HRV_METHOD_CAVEAT,
  SAME_SOURCE_TREND_CAVEAT,
  type HeartRateKind,
} from "@/domain/device-data-normalization/constants";
import type {
  CanonicalDevicePayload,
  DeviceComparisonResult,
  DeviceSourceMetadata,
  NormalizedDeviceRecord,
  RawDeviceObservation,
} from "@/domain/device-data-normalization/types";
import {
  normalizeHrvMethod,
  toDurationSeconds,
  toEnergyKcal,
  toHeartRateBpm,
  toHrvMs,
  toIso,
  toSleepHours,
  toStepCount,
} from "@/domain/device-data-normalization/units";
import {
  WEARABLE_PROVIDER_LABELS,
  type WearableProviderId,
} from "@/domain/wearable-integration";

function providerLabel(
  id: RawDeviceObservation["providerId"],
  override?: string,
): string {
  if (override?.trim()) return override.trim();
  if (id === "manual") return "Manual entry";
  if (id === "unknown") return "Unknown source";
  return WEARABLE_PROVIDER_LABELS[id as WearableProviderId] ?? String(id);
}

function buildSource(
  raw: RawDeviceObservation,
  caveats: string[],
  ingestedAt: string,
): DeviceSourceMetadata {
  return {
    providerId: raw.providerId,
    providerLabel: providerLabel(raw.providerId, raw.providerLabel),
    recordedAt: toIso(raw.recordedAt),
    ingestedAt,
    originalUnit: raw.unit,
    originalValue: raw.value,
    deviceLabel: raw.deviceLabel?.trim() || null,
    vendorMetricId: raw.vendorMetricId?.trim() || null,
    caveats: [...new Set(caveats)],
  };
}

function normalizeHeartRateKind(
  raw: string | null | undefined,
): HeartRateKind {
  if (!raw) return "unknown";
  const u = raw.trim().toLowerCase();
  if (u.includes("rest")) return "resting";
  if (u.includes("workout") || u.includes("avg")) return "workout_avg";
  if (u.includes("sample") || u === "hr") return "sample";
  return "unknown";
}

export type NormalizeDeviceResult =
  | { ok: true; record: NormalizedDeviceRecord }
  | { ok: false; error: string };

/**
 * Normalize one observation. Returns error when units cannot be mapped —
 * does not invent canonical values.
 */
export function normalizeDeviceObservation(
  raw: RawDeviceObservation,
  opts?: { id?: string; ingestedAt?: string },
): NormalizeDeviceResult {
  const ingestedAt = opts?.ingestedAt ?? new Date().toISOString();
  const id =
    opts?.id ??
    `dev_${raw.family}_${toIso(raw.recordedAt)}_${raw.providerId}`;
  const caveats: string[] = [CROSS_DEVICE_COMPARISON_CAVEAT];

  let payload: CanonicalDevicePayload;

  switch (raw.family) {
    case "sleep": {
      const hours = toSleepHours(raw.value, raw.unit);
      if (hours == null) {
        return {
          ok: false,
          error: `Cannot normalize sleep unit “${raw.unit}” to ${DEVICE_CANONICAL_UNITS.sleep_duration}.`,
        };
      }
      const stages = raw.sleepStages;
      payload = {
        family: "sleep",
        durationHours: hours,
        lightMinutes: stages?.lightMinutes ?? null,
        deepMinutes: stages?.deepMinutes ?? null,
        remMinutes: stages?.remMinutes ?? null,
        awakeMinutes: stages?.awakeMinutes ?? null,
      };
      if (
        !stages ||
        (stages.lightMinutes == null &&
          stages.deepMinutes == null &&
          stages.remMinutes == null)
      ) {
        caveats.push(
          "Sleep stages were not provided — duration only; stages are not invented.",
        );
      }
      break;
    }
    case "heart_rate": {
      const bpm = toHeartRateBpm(raw.value, raw.unit);
      if (bpm == null) {
        return {
          ok: false,
          error: `Cannot normalize heart rate unit “${raw.unit}” to ${DEVICE_CANONICAL_UNITS.heart_rate}.`,
        };
      }
      payload = {
        family: "heart_rate",
        bpm,
        kind: normalizeHeartRateKind(raw.heartRateKind),
      };
      break;
    }
    case "hrv": {
      const ms = toHrvMs(raw.value, raw.unit);
      if (ms == null) {
        return {
          ok: false,
          error: `Cannot normalize HRV unit “${raw.unit}” to ${DEVICE_CANONICAL_UNITS.hrv}.`,
        };
      }
      const method = normalizeHrvMethod(
        typeof raw.hrvMethod === "string" ? raw.hrvMethod : raw.hrvMethod,
      );
      payload = { family: "hrv", ms, method };
      caveats.push(HRV_METHOD_CAVEAT);
      break;
    }
    case "steps": {
      const count = toStepCount(raw.value, raw.unit);
      if (count == null) {
        return {
          ok: false,
          error: `Cannot normalize steps unit “${raw.unit}”.`,
        };
      }
      payload = {
        family: "steps",
        count,
        dayKey: raw.dayKey?.trim() || null,
      };
      break;
    }
    case "workout": {
      const w = raw.workout;
      if (!w?.startedAt) {
        return {
          ok: false,
          error: "Workout observations require workout.startedAt.",
        };
      }
      let durationSeconds = w.durationSeconds ?? null;
      if (durationSeconds == null && Number.isFinite(raw.value)) {
        durationSeconds = toDurationSeconds(raw.value, raw.unit);
      }
      let energyKcal = w.energyKcal ?? null;
      if (energyKcal != null && energyKcal < 0) energyKcal = null;
      payload = {
        family: "workout",
        startedAt: toIso(w.startedAt),
        endedAt: w.endedAt != null ? toIso(w.endedAt) : null,
        durationSeconds,
        activityLabel: w.activityLabel?.trim() || null,
        energyKcal,
      };
      if (durationSeconds == null) {
        caveats.push(
          "Workout duration unknown — not inferred from incomplete timestamps alone.",
        );
      }
      break;
    }
    default:
      return { ok: false, error: "Unknown device metric family." };
  }

  return {
    ok: true,
    record: {
      id,
      family: raw.family,
      source: buildSource(raw, caveats, ingestedAt),
      payload,
    },
  };
}

export function normalizeDeviceObservationBatch(
  raws: RawDeviceObservation[],
): {
  records: NormalizedDeviceRecord[];
  errors: Array<{ index: number; error: string }>;
} {
  const records: NormalizedDeviceRecord[] = [];
  const errors: Array<{ index: number; error: string }> = [];
  raws.forEach((raw, index) => {
    const result = normalizeDeviceObservation(raw);
    if (result.ok) records.push(result.record);
    else errors.push({ index, error: result.error });
  });
  return { records, errors };
}

/**
 * Compare two normalized metrics.
 * Never claims identicalAcrossDevices — always false by contract.
 */
export function compareDeviceMetrics(
  a: NormalizedDeviceRecord,
  b: NormalizedDeviceRecord,
): DeviceComparisonResult {
  const caveats: string[] = [
    CROSS_DEVICE_COMPARISON_CAVEAT,
    SAME_SOURCE_TREND_CAVEAT,
  ];

  if (a.family !== b.family) {
    return {
      sameSourceComparable: false,
      identicalAcrossDevices: false,
      caveats,
      detail: `Different families (${a.family} vs ${b.family}) — not comparable as the same metric.`,
    };
  }

  if (a.source.providerId !== b.source.providerId) {
    return {
      sameSourceComparable: false,
      identicalAcrossDevices: false,
      caveats,
      detail: `Different sources (${a.source.providerLabel} vs ${b.source.providerLabel}). Do not treat values as identical.`,
    };
  }

  if (a.family === "hrv" && b.family === "hrv") {
    const am = a.payload.family === "hrv" ? a.payload.method : "unknown";
    const bm = b.payload.family === "hrv" ? b.payload.method : "unknown";
    if (am !== bm) {
      caveats.push(HRV_METHOD_CAVEAT);
      return {
        sameSourceComparable: false,
        identicalAcrossDevices: false,
        caveats,
        detail: `Same provider but different HRV methods (${am} vs ${bm}).`,
      };
    }
  }

  if (a.family === "heart_rate" && b.family === "heart_rate") {
    const ak = a.payload.family === "heart_rate" ? a.payload.kind : "unknown";
    const bk = b.payload.family === "heart_rate" ? b.payload.kind : "unknown";
    if (ak !== bk) {
      return {
        sameSourceComparable: false,
        identicalAcrossDevices: false,
        caveats,
        detail: `Same provider but different heart-rate kinds (${ak} vs ${bk}).`,
      };
    }
  }

  return {
    sameSourceComparable: true,
    identicalAcrossDevices: false,
    caveats,
    detail:
      "Same provider and compatible metric shape — useful for trends; still not absolute identity across firmware revisions.",
  };
}
