import { describe, expect, it } from "vitest";
import {
  AI_OBSERVABILITY_FORBIDDEN_FIELDS,
  AI_OBSERVABILITY_HONESTY,
  assertNoForbiddenObservabilityKeys,
  buildAiObservabilitySnapshot,
  scrubObservabilityRecord,
} from "@/domain/ai-observability";

describe("ai observability", () => {
  it("forbids private raw input fields", () => {
    expect(AI_OBSERVABILITY_FORBIDDEN_FIELDS).toContain("prompt");
    expect(AI_OBSERVABILITY_FORBIDDEN_FIELDS).toContain("payload");
    expect(AI_OBSERVABILITY_FORBIDDEN_FIELDS).toContain("reason");
    expect(AI_OBSERVABILITY_HONESTY.join(" ")).toMatch(/raw inputs/i);
  });

  it("scrubs forbidden keys from records", () => {
    const scrubbed = scrubObservabilityRecord({
      featureId: "coach_brain",
      prompt: "secret athlete note",
      reason: "should not appear",
      outcome: "llm_ok",
    });
    expect(scrubbed).toEqual({
      featureId: "coach_brain",
      outcome: "llm_ok",
    });
    expect(
      assertNoForbiddenObservabilityKeys(scrubbed as Record<string, unknown>),
    ).toEqual([]);
  });

  it("aggregates requests, success rate, latency, cost, failures, feedback, hallucination proxy", () => {
    const snap = buildAiObservabilitySnapshot({
      meters: [
        {
          outcome: "llm_ok",
          totalTokens: 100,
          estimatedUsd: null,
          latencyMs: 40,
          featureId: "coach_brain",
        },
        {
          outcome: "llm_failed",
          totalTokens: null,
          estimatedUsd: null,
          latencyMs: 80,
          featureId: "coach_brain",
        },
        {
          outcome: "skipped_deterministic",
          totalTokens: null,
          estimatedUsd: null,
          latencyMs: null,
          featureId: "insights",
        },
      ],
      attempts: [
        { outcome: "error", latencyMs: 12 },
        { outcome: "null_response", latencyMs: 5 },
      ],
      feedbackCounts: [
        { verdict: "helpful", relatedType: "insight", count: 3 },
        { verdict: "not_helpful", relatedType: "insight", count: 1 },
        { verdict: "accepted", relatedType: "coach_ai_suggestion", count: 2 },
        { verdict: "rejected", relatedType: "coach_ai_suggestion", count: 1 },
        { verdict: "corrected", relatedType: "technique_analysis", count: 1 },
      ],
      costByFeature: [
        {
          featureId: "coach_brain",
          label: "AI Coach Brain",
          eventCount: 2,
          estimatedUsdSum: null,
        },
      ],
    });

    expect(snap.requests.total).toBe(3);
    expect(snap.requests.llmOk).toBe(1);
    expect(snap.requests.llmFailed).toBe(1);
    expect(snap.requests.successRate).toBe(0.5);
    expect(snap.latency.avgMs).not.toBeNull();
    expect(snap.cost.estimatedUsdSum).toBeNull();
    expect(snap.failures.routerErrors).toBe(1);
    expect(snap.failures.nullResponses).toBe(1);
    expect(snap.feedback.total).toBe(8);
    expect(snap.feedback.helpfulRate).toBe(0.75);
    expect(snap.hallucination.userQualityFlags).toBe(3); // 1+1+1
    expect(snap.hallucination.offlineEvalDimension).toBe("hallucination");
    const json = JSON.stringify(snap);
    expect(json).not.toMatch(/secret athlete/i);
    expect(json).not.toMatch(/"prompt"\s*:/);
    expect(json).not.toMatch(/"reason"\s*:/);
  });
});
