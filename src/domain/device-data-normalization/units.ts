/**
 * Unit conversion helpers for device normalization.
 * Fail closed: unknown units → null (caller rejects or keeps raw with caveat).
 */

import type { HrvMethod } from "@/domain/device-data-normalization/constants";

function n(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, "");
}

/** Sleep duration → hours. */
export function toSleepHours(value: number, unit: string): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const u = n(unit);
  if (u === "h" || u === "hr" || u === "hrs" || u === "hour" || u === "hours") {
    return round(value, 3);
  }
  if (u === "min" || u === "mins" || u === "minute" || u === "minutes") {
    return round(value / 60, 3);
  }
  if (u === "s" || u === "sec" || u === "secs" || u === "second" || u === "seconds") {
    return round(value / 3600, 3);
  }
  if (u === "ms" || u === "millisecond" || u === "milliseconds") {
    return round(value / 3_600_000, 3);
  }
  return null;
}

/** Heart rate → bpm. */
export function toHeartRateBpm(value: number, unit: string): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const u = n(unit);
  if (u === "bpm" || u === "beats/min" || u === "beatsperminute") {
    return round(value, 1);
  }
  return null;
}

/**
 * HRV → milliseconds.
 * Returns method caveat when converting loosely between methods is attempted —
 * we only accept ms/s and label method separately (no silent SDNN↔RMSSD math).
 */
export function toHrvMs(value: number, unit: string): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const u = n(unit);
  if (u === "ms" || u === "millisecond" || u === "milliseconds") {
    return round(value, 2);
  }
  if (u === "s" || u === "sec" || u === "second" || u === "seconds") {
    return round(value * 1000, 2);
  }
  return null;
}

export function normalizeHrvMethod(raw: string | null | undefined): HrvMethod {
  if (!raw) return "unknown";
  const u = raw.trim().toLowerCase();
  if (u.includes("rmssd")) return "rmssd";
  if (u.includes("sdnn")) return "sdnn";
  return "unknown";
}

export function toStepCount(value: number, unit: string): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const u = n(unit);
  if (
    u === "" ||
    u === "count" ||
    u === "steps" ||
    u === "step" ||
    u === "n"
  ) {
    return Math.round(value);
  }
  return null;
}

export function toDurationSeconds(
  value: number,
  unit: string,
): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const u = n(unit);
  if (u === "s" || u === "sec" || u === "secs" || u === "second" || u === "seconds") {
    return Math.round(value);
  }
  if (u === "min" || u === "mins" || u === "minute" || u === "minutes") {
    return Math.round(value * 60);
  }
  if (u === "h" || u === "hr" || u === "hour" || u === "hours") {
    return Math.round(value * 3600);
  }
  if (u === "ms") return Math.round(value / 1000);
  return null;
}

export function toEnergyKcal(value: number, unit: string): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const u = n(unit);
  if (u === "kcal" || u === "cal" || u === "calories") return round(value, 1);
  if (u === "kj" || u === "kilojoule" || u === "kilojoules") {
    return round(value / 4.184, 1);
  }
  return null;
}

function round(value: number, places: number): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

export function toIso(input: Date | string): string {
  if (input instanceof Date) return input.toISOString();
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    return new Date(0).toISOString();
  }
  return d.toISOString();
}
