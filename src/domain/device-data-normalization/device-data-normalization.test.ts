import { describe, expect, it } from "vitest";
import {
  CROSS_DEVICE_COMPARISON_CAVEAT,
  DEVICE_METRIC_FAMILIES,
  buildDeviceDataNormalizationSnapshot,
  compareDeviceMetrics,
  normalizeDeviceObservation,
  toHrvMs,
  toSleepHours,
} from "@/domain/device-data-normalization";

describe("device data normalization", () => {
  it("covers sleep, heart rate, HRV, steps, and workouts", () => {
    expect([...DEVICE_METRIC_FAMILIES]).toEqual([
      "sleep",
      "heart_rate",
      "hrv",
      "steps",
      "workout",
    ]);
  });

  it("normalizes sleep minutes to hours and keeps stages nullable", () => {
    const result = normalizeDeviceObservation({
      providerId: "oura",
      family: "sleep",
      value: 450,
      unit: "minutes",
      recordedAt: "2026-07-21T06:00:00.000Z",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.payload).toMatchObject({
      family: "sleep",
      durationHours: 7.5,
      deepMinutes: null,
    });
    expect(result.record.source.originalValue).toBe(450);
    expect(result.record.source.caveats.join(" ")).toMatch(/stages/i);
  });

  it("normalizes HRV and heart rate to canonical units", () => {
    expect(toHrvMs(0.05, "s")).toBe(50);
    expect(toSleepHours(90, "min")).toBe(1.5);

    const hrv = normalizeDeviceObservation({
      providerId: "whoop",
      family: "hrv",
      value: 62,
      unit: "ms",
      recordedAt: new Date("2026-07-21T07:00:00.000Z"),
      hrvMethod: "rmssd",
    });
    expect(hrv.ok).toBe(true);
    if (hrv.ok) {
      expect(hrv.record.payload).toMatchObject({
        family: "hrv",
        ms: 62,
        method: "rmssd",
      });
    }

    const hr = normalizeDeviceObservation({
      providerId: "garmin",
      family: "heart_rate",
      value: 52,
      unit: "bpm",
      recordedAt: "2026-07-21T07:00:00.000Z",
      heartRateKind: "resting",
    });
    expect(hr.ok).toBe(true);
  });

  it("normalizes steps and workouts with source metadata", () => {
    const steps = normalizeDeviceObservation({
      providerId: "apple_health",
      family: "steps",
      value: 8432.4,
      unit: "steps",
      recordedAt: "2026-07-21T23:00:00.000Z",
      dayKey: "2026-07-21",
      deviceLabel: "Apple Watch",
    });
    expect(steps.ok).toBe(true);
    if (steps.ok) {
      expect(steps.record.payload).toMatchObject({
        family: "steps",
        count: 8432,
        dayKey: "2026-07-21",
      });
      expect(steps.record.source.deviceLabel).toBe("Apple Watch");
    }

    const workout = normalizeDeviceObservation({
      providerId: "garmin",
      family: "workout",
      value: 45,
      unit: "min",
      recordedAt: "2026-07-21T18:00:00.000Z",
      workout: {
        startedAt: "2026-07-21T17:00:00.000Z",
        endedAt: "2026-07-21T17:45:00.000Z",
        activityLabel: "Strength",
        energyKcal: 220,
      },
    });
    expect(workout.ok).toBe(true);
    if (workout.ok) {
      expect(workout.record.payload).toMatchObject({
        family: "workout",
        durationSeconds: 2700,
        activityLabel: "Strength",
        energyKcal: 220,
      });
    }
  });

  it("never treats different-device metrics as identical", () => {
    const a = normalizeDeviceObservation({
      providerId: "oura",
      family: "hrv",
      value: 60,
      unit: "ms",
      recordedAt: "2026-07-21T07:00:00.000Z",
      hrvMethod: "rmssd",
    });
    const b = normalizeDeviceObservation({
      providerId: "whoop",
      family: "hrv",
      value: 60,
      unit: "ms",
      recordedAt: "2026-07-21T07:00:00.000Z",
      hrvMethod: "rmssd",
    });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;

    const cmp = compareDeviceMetrics(a.record, b.record);
    expect(cmp.identicalAcrossDevices).toBe(false);
    expect(cmp.sameSourceComparable).toBe(false);
    expect(cmp.caveats).toContain(CROSS_DEVICE_COMPARISON_CAVEAT);
    expect(cmp.detail).toMatch(/Different sources/i);
  });

  it("allows same-source trend comparison with caveats still denying identical", () => {
    const a = normalizeDeviceObservation({
      providerId: "oura",
      family: "steps",
      value: 5000,
      unit: "count",
      recordedAt: "2026-07-20T23:00:00.000Z",
    });
    const b = normalizeDeviceObservation({
      providerId: "oura",
      family: "steps",
      value: 6000,
      unit: "count",
      recordedAt: "2026-07-21T23:00:00.000Z",
    });
    if (!a.ok || !b.ok) throw new Error("normalize failed");
    const cmp = compareDeviceMetrics(a.record, b.record);
    expect(cmp.sameSourceComparable).toBe(true);
    expect(cmp.identicalAcrossDevices).toBe(false);
  });

  it("snapshot documents honesty", () => {
    const snap = buildDeviceDataNormalizationSnapshot(
      "2026-07-22T00:00:00.000Z",
    );
    expect(snap.docPath).toBe("docs/DEVICE_DATA_NORMALIZATION.md");
    expect(snap.families).toHaveLength(5);
    expect(snap.caveats.crossDevice).toMatch(/not interchangeable/i);
  });
});
