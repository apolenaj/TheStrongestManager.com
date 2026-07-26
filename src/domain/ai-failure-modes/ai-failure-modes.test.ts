import { describe, expect, it } from "vitest";
import {
  AI_FAILURE_MODES_HONESTY,
  CORE_APP_LINKS,
  buildAiCapabilityRegistrySnapshot,
  buildAiFailure,
  coachBrainCapabilityStatus,
  shouldSuppressAiOutput,
  techniqueBackendCapabilityStatus,
} from "@/domain/ai-failure-modes";

describe("ai failure modes", () => {
  it("keeps core app links for graceful degradation", () => {
    expect(CORE_APP_LINKS.map((l) => l.href)).toEqual([
      "/app/training",
      "/app/programs",
      "/app/exercises",
      "/app/progress",
    ]);
    expect(AI_FAILURE_MODES_HONESTY.join(" ")).toMatch(/Never show fabricated/i);
  });

  it("never marks fabricated output as ok when hard-unavailable", () => {
    const status = techniqueBackendCapabilityStatus("unavailable");
    expect(status.status).toBe("unavailable");
    expect(status.failure?.coreStillAvailable).toBe(true);
    expect(shouldSuppressAiOutput(status)).toBe(true);
    expect(status.failure?.message).not.toMatch(/score is \d/i);
  });

  it("allows labelled deterministic coach brain fallback", () => {
    const status = coachBrainCapabilityStatus();
    expect(status.status).toBe("degraded");
    expect(status.usingDeterministicFallback).toBe(true);
    expect(shouldSuppressAiOutput(status)).toBe(false);
    expect(status.failure?.kind).toBe("degraded");
  });

  it("builds structured failures with coreStillAvailable", () => {
    const failure = buildAiFailure({
      kind: "timeout",
      capabilityId: "coach_brain",
      message: "The AI request timed out.",
    });
    expect(failure.coreStillAvailable).toBe(true);
    expect(failure.kind).toBe("timeout");
  });

  it("maps development stub technique to degraded without scores", () => {
    const status = techniqueBackendCapabilityStatus("development_stub");
    expect(status.status).toBe("degraded");
    expect(status.failure?.message).toMatch(/No technique score/i);
  });

  it("builds a registry snapshot without inventing LLM readiness", () => {
    const snap = buildAiCapabilityRegistrySnapshot({
      techniqueBackend: "unavailable",
      coachBrainLlmConfigured: false,
      coachAiCopilotEnabled: true,
      insightsEnabled: true,
      researchSummarizerEnabled: false,
    });
    expect(snap.anyHardFailure).toBe(true);
    expect(snap.anyDegraded).toBe(true);
    expect(
      snap.capabilities.find((c) => c.id === "research_summarizer")?.status,
    ).toBe("unavailable");
    expect(
      snap.capabilities.find((c) => c.id === "coach_brain")?.mode,
    ).toBe("deterministic_stub");
  });
});
