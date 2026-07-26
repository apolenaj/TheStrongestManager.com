import { describe, expect, it } from "vitest";
import {
  RECOVERY_CORR_NOT_CAUSAL,
  RECOVERY_CORR_OBSERVED_LABEL,
  RECOVERY_CORRELATION_HONESTY,
  analyzeRecoveryCorrelations,
  bucketRecoveryPerformanceWeeks,
  canPublishRecoveryCorrelation,
} from "@/domain/recovery-correlation";

describe("recovery-correlation", () => {
  it("labels insights as observed association, not causal proof", () => {
    expect(RECOVERY_CORR_OBSERVED_LABEL).toBe("Observed association");
    expect(RECOVERY_CORR_NOT_CAUSAL).toBe("Not causal proof.");
    expect(RECOVERY_CORRELATION_HONESTY.join(" ")).toMatch(/not causal/i);
  });

  it("publishes the sleep <6h → higher RPE example when sample is sufficient", () => {
    const recovery = [];
    const sessions = [];
    // 3 low-sleep weeks + 3 ok-sleep weeks with RPE
    for (let i = 0; i < 3; i++) {
      const monday = `2026-0${1 + i}-05`;
      recovery.push({
        at: `${monday}T12:00:00.000Z`,
        sleepHours: 5.5,
        stress: 5,
        soreness: 4,
      });
      sessions.push({
        at: `${monday}T18:00:00.000Z`,
        perceivedEffort: 8.5,
        completed: true,
      });
    }
    for (let i = 0; i < 3; i++) {
      const monday = `2026-0${4 + i}-06`;
      recovery.push({
        at: `${monday}T12:00:00.000Z`,
        sleepHours: 7.5,
        stress: 4,
        soreness: 3,
      });
      sessions.push({
        at: `${monday}T18:00:00.000Z`,
        perceivedEffort: 7.0,
        completed: true,
      });
    }

    const weeks = bucketRecoveryPerformanceWeeks({ recovery, sessions });
    const analysis = analyzeRecoveryCorrelations(weeks);
    const sleep = analysis.insights.find((i) => i.id === "sleep_low_vs_rpe");
    expect(sleep?.publishable).toBe(true);
    expect(sleep?.associationLabel).toBe("Observed association");
    expect(sleep?.causalityLabel).toBe("Not causal proof.");
    expect(sleep?.headline).toMatch(/<6 hours sleep/i);
    expect(sleep?.headline).toMatch(/average session RPE was higher/i);
  });

  it("suppresses correlations without sufficient data", () => {
    expect(
      canPublishRecoveryCorrelation({
        conditionWeekCount: 1,
        comparisonWeekCount: 1,
        weeksWithBothSignals: 2,
      }),
    ).toBe(false);

    const weeks = bucketRecoveryPerformanceWeeks({
      recovery: [
        {
          at: "2026-01-05T12:00:00.000Z",
          sleepHours: 5,
          stress: null,
          soreness: null,
        },
      ],
      sessions: [
        {
          at: "2026-01-05T18:00:00.000Z",
          perceivedEffort: 9,
          completed: true,
        },
      ],
    });
    const analysis = analyzeRecoveryCorrelations(weeks);
    expect(analysis.insights.every((i) => !i.publishable)).toBe(true);
    expect(analysis.suppressedCount).toBe(3);
  });
});
