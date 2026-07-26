import { describe, expect, it } from "vitest";
import {
  EXPERIMENT_MODE_HONESTY,
  EXPERIMENT_MODE_PRODUCT_NAME,
  buildExperimentSnapshot,
  compareExperimentSnapshots,
  validateCreateExperimentInput,
} from "@/domain/experiment-mode";

describe("experiment-mode", () => {
  it("names the product a personal training experiment, not research", () => {
    expect(EXPERIMENT_MODE_PRODUCT_NAME).toMatch(/personal training experiment/i);
    const blob = EXPERIMENT_MODE_HONESTY.join(" ");
    expect(blob).toMatch(/not scientific research/i);
    expect(blob).not.toMatch(/randomized controlled|clinical trial/i);
  });

  it("validates the paused-deadlift style example inputs", () => {
    const result = validateCreateExperimentInput({
      title: "Paused deadlift block",
      intervention: "Paused deadlift for 6 weeks",
      hypothesis: "Improve floor strength",
      measures: ["deadlift_performance", "technique"],
      durationWeeks: 6,
    });
    expect(result.ok).toBe(true);
  });

  it("compares before / after without inventing missing data", () => {
    const baseline = buildExperimentSnapshot({
      measures: ["deadlift_performance", "technique"],
      windowStart: new Date("2026-01-01"),
      windowEnd: new Date("2026-02-12"),
      signals: {
        completedSessions: 12,
        volumeKg: 40000,
        volumeSetCount: 80,
        deadliftBestKg: 180,
        squatBestKg: null,
        benchBestKg: null,
        techniqueAvg: 7.2,
        techniqueCount: 3,
      },
    });
    const outcome = buildExperimentSnapshot({
      measures: ["deadlift_performance", "technique"],
      windowStart: new Date("2026-02-12"),
      windowEnd: new Date("2026-03-26"),
      signals: {
        completedSessions: 14,
        volumeKg: 42000,
        volumeSetCount: 84,
        deadliftBestKg: 190,
        squatBestKg: null,
        benchBestKg: null,
        techniqueAvg: null,
        techniqueCount: 0,
      },
    });

    const compare = compareExperimentSnapshots({
      measures: ["deadlift_performance", "technique"],
      baseline,
      outcome,
    });

    const dl = compare.rows.find((r) => r.measure === "deadlift_performance");
    expect(dl?.beforeDisplay).toMatch(/180/);
    expect(dl?.afterDisplay).toMatch(/190/);
    expect(dl?.deltaDisplay).toMatch(/\+10/);

    const tech = compare.rows.find((r) => r.measure === "technique");
    expect(tech?.afterDisplay).toBeNull();
    expect(tech?.missingNote).toMatch(/after/i);
    expect(compare.disclaimer).toMatch(/observational/i);
  });

  it("rejects blank intervention or research-length nonsense durations", () => {
    expect(
      validateCreateExperimentInput({
        title: "x",
        intervention: "",
        hypothesis: "y",
        measures: ["technique"],
        durationWeeks: 6,
      }).ok,
    ).toBe(false);
    expect(
      validateCreateExperimentInput({
        title: "x",
        intervention: "Paused deadlift",
        hypothesis: "Improve floor strength",
        measures: ["deadlift_performance"],
        durationWeeks: 52,
      }).ok,
    ).toBe(false);
  });
});
