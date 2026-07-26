import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_PERFORMANCE_HONESTY,
  analyzeBodyweightPerformance,
  formatSignedKg,
} from "@/domain/bodyweight-performance";

describe("bodyweight-performance", () => {
  it("shows BW down, estimated strength stable, relative strength up", () => {
    const analysis = analyzeBodyweightPerformance({
      windowLabel: "8 weeks",
      windowStart: new Date("2026-01-01T00:00:00.000Z"),
      windowEnd: new Date("2026-02-26T00:00:00.000Z"),
      bodyweightSamples: [
        { at: "2026-01-02T00:00:00.000Z", valueKg: 84 },
        { at: "2026-02-20T00:00:00.000Z", valueKg: 80 },
      ],
      estimatedStrengthSamples: [
        { at: "2026-01-03T00:00:00.000Z", valueKg: 180 },
        { at: "2026-02-18T00:00:00.000Z", valueKg: 181 },
      ],
    });

    expect(analysis.bodyweight.deltaDisplay).toBe(formatSignedKg(-4));
    expect(analysis.bodyweight.trend).toBe("down");
    expect(analysis.estimatedStrength.trend).toBe("stable");
    expect(analysis.relativeStrength.trend).toBe("up");
    expect(analysis.narrativeLines.join(" ")).toMatch(/relative strength improved/i);
    expect(analysis.narrativeLines.join(" ")).toMatch(/-4 kg/);
  });

  it("does not imply weight gain always improves strength", () => {
    const analysis = analyzeBodyweightPerformance({
      windowLabel: "8 weeks",
      windowStart: new Date("2026-01-01T00:00:00.000Z"),
      windowEnd: new Date("2026-02-26T00:00:00.000Z"),
      bodyweightSamples: [
        { at: "2026-01-02T00:00:00.000Z", valueKg: 80 },
        { at: "2026-02-20T00:00:00.000Z", valueKg: 86 },
      ],
      estimatedStrengthSamples: [
        { at: "2026-01-03T00:00:00.000Z", valueKg: 180 },
        { at: "2026-02-18T00:00:00.000Z", valueKg: 181 },
      ],
    });

    expect(analysis.bodyweight.trend).toBe("up");
    expect(analysis.estimatedStrength.trend).toBe("stable");
    expect(analysis.narrativeLines.join(" ")).toMatch(
      /does not prove stronger/i,
    );
    expect(BODYWEIGHT_PERFORMANCE_HONESTY.join(" ")).toMatch(
      /does not always improve strength/i,
    );
  });

  it("keeps missing data honest", () => {
    const analysis = analyzeBodyweightPerformance({
      windowLabel: "4 weeks",
      windowStart: new Date("2026-01-01T00:00:00.000Z"),
      windowEnd: new Date("2026-01-28T00:00:00.000Z"),
      bodyweightSamples: [{ at: "2026-01-05T00:00:00.000Z", valueKg: 80 }],
      estimatedStrengthSamples: [],
    });
    expect(analysis.missingNotes.length).toBeGreaterThan(0);
    expect(analysis.relativeStrength.trend).toBe("unknown");
  });
});
