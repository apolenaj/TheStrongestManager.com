import { describe, expect, it } from "vitest";
import {
  detectPotentialIssues,
  estimateRecoveryReadiness,
  sleepHoursToScore,
} from "@/domain/recovery/estimate";

describe("recovery readiness estimate", () => {
  it("returns null score when no inputs (does not fabricate sleep)", () => {
    const result = estimateRecoveryReadiness({
      sleepHours: null,
      sleepQuality: null,
      stress: null,
      soreness: null,
      motivation: null,
      fatigue: null,
    });
    expect(result.score).toBeNull();
    expect(result.confidence).toBe("none");
    expect(result.sleepIncluded).toBe(false);
  });

  it("excludes missing sleep from the estimate", () => {
    const result = estimateRecoveryReadiness({
      sleepHours: null,
      sleepQuality: null,
      stress: 3,
      soreness: 3,
      motivation: 8,
      fatigue: 3,
    });
    expect(result.score).not.toBeNull();
    expect(result.sleepIncluded).toBe(false);
    expect(result.explanation.toLowerCase()).toContain("sleep was not logged");
    expect(sleepHoursToScore(null)).toBeNull();
  });

  it("includes sleep when logged and raises confidence with more signals", () => {
    const result = estimateRecoveryReadiness({
      sleepHours: 8,
      sleepQuality: 8,
      stress: 3,
      soreness: 3,
      motivation: 8,
      fatigue: 3,
    });
    expect(result.score).toBeGreaterThan(70);
    expect(result.sleepIncluded).toBe(true);
    expect(result.confidence).toBe("high");
  });

  it("flags potential issues without medical claims", () => {
    const issues = detectPotentialIssues({
      sleepHours: 4.5,
      sleepQuality: null,
      stress: 9,
      soreness: 2,
      motivation: 7,
      fatigue: 4,
      readinessScore: 35,
    });
    expect(issues.some((i) => i.id === "sleep_short")).toBe(true);
    expect(issues.some((i) => i.id === "stress_high")).toBe(true);
    expect(
      issues.every((i) => !/diagnos/i.test(i.detail) || /not.*diagnos/i.test(i.detail)),
    ).toBe(true);
  });
});
