import { describe, expect, it } from "vitest";
import {
  AI_COST_CONTROL_HONESTY,
  AI_TASK_CLASSES_DENY_LLM,
  aggregateAiCostMeterEvents,
  buildAiInferenceCacheKey,
  estimateInferenceUsd,
  meterSkippedDeterministic,
  mustStayDeterministic,
  routeAiInference,
} from "@/domain/ai-cost-control";

describe("ai cost control", () => {
  it("denies LLM for calc, filter, rules, and scoring", () => {
    for (const taskClass of AI_TASK_CLASSES_DENY_LLM) {
      expect(mustStayDeterministic(taskClass)).toBe(true);
      const decision = routeAiInference({
        featureId: "coach_brain",
        taskClass,
        adapterIsStub: false,
      });
      expect(decision.allow).toBe(false);
      if (!decision.allow) {
        expect(decision.reason).toBe("task_class_denied");
      }
    }
    expect(AI_COST_CONTROL_HONESTY.join(" ")).toMatch(/calculations/i);
  });

  it("allows structured small-model LLM only for allowlisted nl tasks with a real adapter", () => {
    const stub = routeAiInference({
      featureId: "research_summarizer",
      taskClass: "nl_summarize",
      adapterIsStub: true,
    });
    expect(stub.allow).toBe(false);
    if (!stub.allow) expect(stub.reason).toBe("adapter_stub_only");

    const live = routeAiInference({
      featureId: "research_summarizer",
      taskClass: "nl_summarize",
      adapterIsStub: false,
    });
    expect(live.allow).toBe(true);
    if (live.allow) {
      expect(live.requireStructuredOutput).toBe(true);
      expect(live.preferSmallModel).toBe(true);
      expect(live.modelTier).toBe("small");
    }
  });

  it("never invents USD estimates without pricing", () => {
    expect(
      estimateInferenceUsd({ modelTier: "small", totalTokens: 1200 }),
    ).toBeNull();
  });

  it("builds stable cache keys from structured payloads", () => {
    const a = buildAiInferenceCacheKey({
      featureId: "coach_brain",
      adapterId: "stub.deterministic",
      modelTier: "none",
      payload: { ruleId: "maintain_course", b: 2, a: 1 },
    });
    const b = buildAiInferenceCacheKey({
      featureId: "coach_brain",
      adapterId: "stub.deterministic",
      modelTier: "none",
      payload: { a: 1, b: 2, ruleId: "maintain_course" },
    });
    expect(a).toBe(b);
    expect(a.startsWith("aiinf:v1:coach_brain:")).toBe(true);
  });

  it("aggregates per-feature cost without inventing LLM spend", () => {
    const events = [
      meterSkippedDeterministic({
        featureId: "coach_brain",
        taskClass: "rule",
        adapterId: "stub.deterministic",
      }),
      meterSkippedDeterministic({
        featureId: "insights",
        taskClass: "assemble",
        adapterId: "insights.v1",
      }),
    ];
    const snap = aggregateAiCostMeterEvents(events);
    expect(snap.totals.eventCount).toBe(2);
    expect(snap.totals.skippedDeterministic).toBe(2);
    expect(snap.totals.llmCalls).toBe(0);
    expect(snap.totals.estimatedUsdSum).toBeNull();
    expect(snap.pricingConfigured).toBe(false);
    expect(snap.byFeature.some((f) => f.featureId === "coach_brain")).toBe(
      true,
    );
  });
});
