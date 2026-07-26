import { describe, expect, it } from "vitest";
import {
  STRONGMAN_EVENT_IDS,
  STRONGMAN_EXCLUDED_POWERLIFTING_METRICS,
  STRONGMAN_MODE_HONESTY,
  assembleStrongmanMode,
  parseStrongmanPrMetricKey,
  strongmanModeText,
  strongmanPrMetricKey,
  type StrongmanModeSignals,
} from "@/domain/strongman-mode";

function base(
  overrides: Partial<StrongmanModeSignals> = {},
): StrongmanModeSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    loggedPrs: [
      {
        eventId: "log_press",
        metric: "weight",
        value: 120,
        unit: "kg",
        recordedAt: new Date("2026-07-01T12:00:00Z"),
      },
      {
        eventId: "farmers_walk",
        metric: "distance",
        value: 40,
        unit: "m",
        recordedAt: new Date("2026-07-10T12:00:00Z"),
      },
      {
        eventId: "farmers_walk",
        metric: "time",
        value: 18.5,
        unit: "s",
        recordedAt: new Date("2026-07-10T12:00:00Z"),
      },
      {
        eventId: "yoke",
        metric: "weight",
        value: 300,
        unit: "kg",
        recordedAt: new Date("2026-07-05T12:00:00Z"),
      },
    ],
    competition: {
      hasPrep: true,
      name: "Local show",
      dateIso: "2026-08-15T12:00:00.000Z",
      daysUntil: 25,
    },
    ...overrides,
  };
}

describe("strongman mode", () => {
  it("defines all event types and tracks weight/distance/time/reps", () => {
    expect(STRONGMAN_EVENT_IDS).toEqual([
      "log_press",
      "axle",
      "farmers_walk",
      "yoke",
      "stones",
      "deadlift_variations",
    ]);
    const mode = assembleStrongmanMode(base());
    expect(mode.events).toHaveLength(6);
    expect(mode.events.find((e) => e.eventId === "farmers_walk")?.trackedMetrics).toEqual(
      ["weight", "distance", "time"],
    );
    expect(mode.eventPrs.some((p) => p.metric === "distance")).toBe(true);
    expect(mode.eventPrs.some((p) => p.metric === "time")).toBe(true);
    expect(mode.eventPrs.some((p) => p.metric === "weight")).toBe(true);
  });

  it("supports event-specific PR metric keys", () => {
    const key = strongmanPrMetricKey("stones", "reps");
    expect(key).toBe("sm_stones_reps");
    expect(parseStrongmanPrMetricKey(key)).toEqual({
      eventId: "stones",
      metric: "reps",
    });
    expect(parseStrongmanPrMetricKey("lift_squat")).toBeNull();
  });

  it("never forces powerlifting metrics onto strongman", () => {
    const mode = assembleStrongmanMode(base());
    expect(mode.powerliftingMetricsForced).toBe(false);
    expect(mode.priorities.map((p) => p.id)).not.toContain("squat");
    expect(mode.priorities.map((p) => p.id)).not.toContain("total");
    expect(mode.priorities.map((p) => p.id)).not.toContain("relative_score");

    const claimText = mode.priorities
      .map((p) => `${p.headline} ${p.detail}`)
      .join("\n")
      .toLowerCase();
    expect(claimText).not.toMatch(/dots\s*[:=]\s*\d/i);
    expect(claimText).not.toMatch(/your powerlifting total is/i);
    expect(claimText).not.toMatch(/sbd total\s*[:=]/i);

    for (const excluded of STRONGMAN_EXCLUDED_POWERLIFTING_METRICS) {
      expect(mode.excludedPowerliftingMetrics).toContain(excluded);
    }
    expect(STRONGMAN_MODE_HONESTY.join(" ")).toMatch(/not forced/i);
    expect(strongmanModeText(mode)).toMatch(/event/i);
  });
});
