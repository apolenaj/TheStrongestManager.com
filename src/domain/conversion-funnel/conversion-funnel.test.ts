import { describe, expect, it } from "vitest";
import {
  CONVERSION_FUNNEL_HONESTY,
  CONVERSION_FUNNEL_STAGES,
  buildConversionFunnelSnapshot,
  funnelStageForEvent,
  summarizeConversionFunnel,
} from "@/domain/conversion-funnel";

describe("conversion funnel", () => {
  it("defines the Prompt 162 path through paid", () => {
    expect(CONVERSION_FUNNEL_STAGES.map((s) => s.id)).toEqual([
      "homepage",
      "signup",
      "onboarding",
      "first_value",
      "pricing",
      "checkout",
      "paid",
    ]);
    expect(CONVERSION_FUNNEL_HONESTY.join(" ")).toMatch(/[Dd]rop-off/);
    expect(funnelStageForEvent("homepage_viewed")).toBe("homepage");
    expect(funnelStageForEvent("technique_analysis_uploaded")).toBe(
      "first_value",
    );
    expect(funnelStageForEvent("subscription_activated")).toBe("paid");
  });

  it("computes conversion rates and ranks drop-offs by absolute loss", () => {
    const summary = summarizeConversionFunnel([
      { stageId: "homepage", count: 1000, source: "live_event" },
      { stageId: "signup", count: 400, source: "durable_user" },
      { stageId: "onboarding", count: 300, source: "durable_user" },
      { stageId: "first_value", count: 150, source: "durable_user" },
      { stageId: "pricing", count: 120, source: "live_event" },
      { stageId: "checkout", count: 40, source: "live_event" },
      { stageId: "paid", count: 25, source: "durable_user" },
    ]);

    expect(summary.decisionReady).toBe(true);
    expect(summary.stages[0]?.barWidthPct).toBe(100);
    expect(summary.stages[1]?.pctOfPrevious).toBe(0.4);
    expect(summary.stages[1]?.dropOffCount).toBe(600);

    const largest = summary.largestDropOff;
    expect(largest?.fromStageId).toBe("homepage");
    expect(largest?.toStageId).toBe("signup");
    expect(largest?.lost).toBe(600);
    expect(largest?.rankByAbsolute).toBe(1);

    const pricingToCheckout = summary.dropOffs.find(
      (d) => d.fromStageId === "pricing" && d.toStageId === "checkout",
    );
    expect(pricingToCheckout?.lost).toBe(80);
    expect(pricingToCheckout?.dropOffRate).toBeCloseTo(80 / 120);

    const snap = buildConversionFunnelSnapshot({
      stageCounts: [
        { stageId: "homepage", count: 10, source: "live_event" },
        { stageId: "signup", count: 5, source: "durable_user" },
        { stageId: "onboarding", count: 4, source: "durable_user" },
        { stageId: "first_value", count: 2, source: "durable_user" },
        { stageId: "pricing", count: 2, source: "live_event" },
        { stageId: "checkout", count: 1, source: "live_event" },
        { stageId: "paid", count: 0, source: "durable_user" },
      ],
      generatedAt: "2026-07-22T00:00:00.000Z",
    });
    expect(snap.funnel.decisionReady).toBe(false);
    expect(snap.engineVersion).toBe("conversion_funnel.v1");
  });
});
