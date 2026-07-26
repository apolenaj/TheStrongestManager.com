import { describe, expect, it } from "vitest";
import {
  AB_INSIGHT_MIN_SAMPLE,
  AB_PROGRAMMING_DIMENSIONS,
  AB_PROGRAMMING_INSIGHTS_HONESTY,
  aggregateAbProgrammingInsightsStub,
  buildAbProgrammingInsight,
  canPublishAggregateInsight,
  canPublishPairwiseComparison,
} from "@/domain/ab-programming-insights";

describe("ab-programming-insights", () => {
  it("defines the three comparison dimensions", () => {
    expect([...AB_PROGRAMMING_DIMENSIONS]).toEqual([
      "program_approach",
      "exercise_choice",
      "progression_style",
    ]);
  });

  it("enforces minimum sample thresholds", () => {
    expect(canPublishAggregateInsight(0)).toBe(false);
    expect(canPublishAggregateInsight(AB_INSIGHT_MIN_SAMPLE.default - 1)).toBe(
      false,
    );
    expect(canPublishAggregateInsight(AB_INSIGHT_MIN_SAMPLE.default)).toBe(
      true,
    );
    expect(
      canPublishPairwiseComparison({ armASize: 10, armBSize: 10 }),
    ).toBe(false);
    expect(
      canPublishPairwiseComparison({
        armASize: AB_INSIGHT_MIN_SAMPLE.pairwiseComparison,
        armBSize: AB_INSIGHT_MIN_SAMPLE.pairwiseComparison,
      }),
    ).toBe(true);
  });

  it("suppresses under-threshold cohorts and never invents observations", () => {
    const insight = buildAbProgrammingInsight({
      id: "test.small",
      dimension: "program_approach",
      title: "Too small",
      cohortSize: 2,
      observations: [
        {
          armKey: "a",
          armLabel: "Approach A",
          metricKey: "delta",
          metricLabel: "Delta",
          value: 5,
          unit: "%",
          armSampleSize: 1,
        },
      ],
    });
    expect(insight.publishable).toBe(false);
    expect(insight.observations).toEqual([]);
    expect(insight.correlationNotCausation).toBe(true);
    expect(insight.disclaimer).toMatch(/not causation/i);
  });

  it("publishes only when cohort and pairwise thresholds pass", () => {
    const insight = buildAbProgrammingInsight({
      id: "test.ok",
      dimension: "exercise_choice",
      title: "Enough data",
      cohortSize: 50,
      observations: [
        {
          armKey: "pause",
          armLabel: "Paused deadlift",
          metricKey: "median_delta",
          metricLabel: "Median change",
          value: 2.5,
          unit: "%",
          armSampleSize: 25,
        },
        {
          armKey: "conventional",
          armLabel: "Conventional only",
          metricKey: "median_delta",
          metricLabel: "Median change",
          value: 1.2,
          unit: "%",
          armSampleSize: 25,
        },
      ],
    });
    expect(insight.publishable).toBe(true);
    expect(insight.observations).toHaveLength(2);
    expect(insight.disclaimer).toMatch(/correlation is not causation/i);
  });

  it("stub aggregator ships architecture placeholders without fake winners", () => {
    const stub = aggregateAbProgrammingInsightsStub();
    expect(stub.pipelineStatus).toBe("architecture_ready");
    expect(stub.insights).toHaveLength(3);
    expect(stub.insights.every((i) => !i.publishable)).toBe(true);
    expect(stub.insights.every((i) => i.observations.length === 0)).toBe(true);
  });

  it("states honesty: thresholds, correlation≠causation, not personal experiments", () => {
    const blob = AB_PROGRAMMING_INSIGHTS_HONESTY.join(" ");
    expect(blob).toMatch(/sample size|threshold/i);
    expect(blob).toMatch(/correlation is not causation/i);
    expect(blob).toMatch(/not experiment mode/i);
    expect(blob).toMatch(/anonymized/i);
  });
});
