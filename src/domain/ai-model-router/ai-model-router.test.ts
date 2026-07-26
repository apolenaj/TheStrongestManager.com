import { describe, expect, it } from "vitest";
import {
  AI_MODEL_ROUTER_HONESTY,
  buildAiRouterDashboardSnapshot,
  registerAiModelProvider,
  resetAiModelProvidersForTests,
  resolveProvidersForTask,
  runProviderFallbackChain,
  setAiModelProviderChain,
  stubAiModelProvider,
  taskKindToCostTaskClass,
  type AiModelCompleteInput,
  type AiModelCompleteResult,
  type AiModelProvider,
} from "@/domain/ai-model-router";

describe("ai model router", () => {
  it("is not hard-wired to one provider and documents honesty", () => {
    expect(AI_MODEL_ROUTER_HONESTY.join(" ")).toMatch(/not hard-wired/i);
    expect(resolveProvidersForTask("text_reasoning").map((p) => p.id)).toContain(
      "stub",
    );
    expect(resolveProvidersForTask("vision").map((p) => p.id)).toContain("none");
  });

  it("maps task kinds to cost-control classes that deny pose/intent by default", () => {
    expect(taskKindToCostTaskClass("vision")).toBe("pose");
    expect(taskKindToCostTaskClass("classification")).toBe("intent_route");
    expect(taskKindToCostTaskClass("summarization")).toBe("nl_summarize");
    expect(taskKindToCostTaskClass("text_reasoning")).toBe("nl_draft");
  });

  it("falls back when the first provider fails", async () => {
    resetAiModelProvidersForTests();

    const failing: AiModelProvider = {
      id: "failing-test",
      label: "Failing",
      status: "ready",
      supportedTaskKinds: ["summarization"],
      async complete() {
        throw new Error("upstream timeout");
      },
    };
    const succeeding: AiModelProvider = {
      id: "ok-test",
      label: "OK",
      status: "ready",
      supportedTaskKinds: ["summarization"],
      async complete(
        input: AiModelCompleteInput,
      ): Promise<AiModelCompleteResult> {
        return {
          providerId: "ok-test",
          modelId: "test-small",
          content: { echo: input.featureId },
          promptTokens: 10,
          completionTokens: 5,
          latencyMs: 1,
        };
      },
    };

    registerAiModelProvider(failing);
    registerAiModelProvider(succeeding);
    setAiModelProviderChain("summarization", ["failing-test", "ok-test"]);

    const run = await runProviderFallbackChain({
      taskKind: "summarization",
      featureId: "research_summarizer",
      providers: resolveProvidersForTask("summarization"),
      completeInput: {
        taskKind: "summarization",
        featureId: "research_summarizer",
        modelTier: "small",
        payload: { title: "x" },
      },
    });

    expect(run.success).toBe(true);
    expect(run.fallbackUsed).toBe(true);
    expect(run.attempts[0]?.outcome).toBe("error");
    expect(run.attempts[0]?.errorMessage).toMatch(/timeout/i);
    expect(run.attempts[1]?.outcome).toBe("success");
    expect(run.result?.providerId).toBe("ok-test");
    expect(run.totalLatencyMs).toBeGreaterThanOrEqual(0);

    resetAiModelProvidersForTests();
  });

  it("stub provider never invents a completion", async () => {
    const result = await stubAiModelProvider.complete({
      taskKind: "text_reasoning",
      featureId: "coach_brain",
      modelTier: "small",
      payload: {},
    });
    expect(result).toBeNull();
  });

  it("builds a dashboard snapshot with chains and providers", () => {
    resetAiModelProvidersForTests();
    const snap = buildAiRouterDashboardSnapshot();
    expect(snap.taskKinds).toHaveLength(4);
    expect(snap.providers.some((p) => p.id === "stub")).toBe(true);
    expect(snap.honesty[0]).toMatch(/provider/i);
  });
});
