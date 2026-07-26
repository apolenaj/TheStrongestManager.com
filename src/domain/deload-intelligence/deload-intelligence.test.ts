import { describe, expect, it } from "vitest";
import {
  DELOAD_INTELLIGENCE_HONESTY,
  DELOAD_RECOMMENDATION_LABEL,
  analyzeDeloadIntelligence,
  canPublishDeloadRecommendation,
} from "@/domain/deload-intelligence";

const baseSignals = {
  performanceDirection: null as "up" | "down" | "flat" | null,
  performanceDetail: null as string | null,
  sessionRpeMean: null as number | null,
  targetRpeMean: null as number | null,
  sessionsWithRpe: 0,
  readinessRecentMean: null as number | null,
  readinessPriorMean: null as number | null,
  readinessSampleCount: 0,
  missedRepRate: null as number | null,
  setsWithRepComparison: 0,
  loadSpikeFlagged: false,
  loadSpikeDetail: null as string | null,
  volumeTrendUp: false,
};

describe("deload-intelligence", () => {
  it("labels recommendation as Consider deload and user decides", () => {
    expect(DELOAD_RECOMMENDATION_LABEL).toBe("Consider deload");
    expect(DELOAD_INTELLIGENCE_HONESTY.join(" ")).toMatch(/you decide/i);
    expect(DELOAD_INTELLIGENCE_HONESTY.join(" ")).toMatch(/one bad workout/i);
  });

  it("does not publish from one bad workout / single signal", () => {
    expect(
      canPublishDeloadRecommendation({
        sessionCount: 1,
        signalsFired: 3,
        recentDeload: false,
      }),
    ).toBe(false);

    const oneSignal = analyzeDeloadIntelligence({
      windowLabel: "14 days",
      sessionCount: 5,
      recentDeload: false,
      signals: {
        ...baseSignals,
        performanceDirection: "down",
        performanceDetail: "Strength trend down.",
        sessionsWithRpe: 5,
        sessionRpeMean: 7,
      },
    });
    expect(oneSignal.publishable).toBe(false);
    expect(oneSignal.status).toBe("hold");
    expect(oneSignal.userDecides).toBe(true);
  });

  it("publishes Consider deload when multiple signals align", () => {
    const analysis = analyzeDeloadIntelligence({
      windowLabel: "14 days",
      sessionCount: 5,
      recentDeload: false,
      signals: {
        ...baseSignals,
        performanceDirection: "down",
        performanceDetail: "Strength trend down over recent vs prior window.",
        sessionRpeMean: 9,
        sessionsWithRpe: 4,
        readinessRecentMean: 40,
        readinessSampleCount: 5,
        missedRepRate: 0.2,
        setsWithRepComparison: 20,
        loadSpikeFlagged: true,
        loadSpikeDetail: "Volume spike vs 28d baseline.",
      },
    });

    expect(analysis.publishable).toBe(true);
    expect(analysis.status).toBe("consider");
    expect(analysis.recommendationLabel).toBe("Consider deload");
    expect(analysis.userDecides).toBe(true);
    expect(analysis.explanation.some((e) => /you choose|not applied/i.test(e))).toBe(
      true,
    );
    expect(analysis.signalsFired).toBeGreaterThanOrEqual(2);
  });

  it("suppresses after a recent deload", () => {
    const analysis = analyzeDeloadIntelligence({
      windowLabel: "14 days",
      sessionCount: 6,
      recentDeload: true,
      signals: {
        ...baseSignals,
        performanceDirection: "down",
        performanceDetail: "down",
        sessionRpeMean: 9,
        sessionsWithRpe: 4,
        readinessRecentMean: 35,
        readinessSampleCount: 4,
      },
    });
    expect(analysis.publishable).toBe(false);
    expect(analysis.status).toBe("suppressed_recent_deload");
  });
});
