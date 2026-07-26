/**
 * Central AI capability registry (Prompt 144).
 * Pure — callers pass env/flag/adapter facts; never invents status.
 */

import {
  AI_CAPABILITY_IDS,
  AI_CAPABILITY_LABELS,
  AI_FAILURE_MODES_ENGINE_VERSION,
  coachBrainCapabilityStatus,
  flagGatedCapabilityStatus,
  techniqueBackendCapabilityStatus,
  type AiCapabilityId,
  type AiCapabilityStatus,
} from "@/domain/ai-failure-modes/constants";

export type AiCapabilityRegistryInput = {
  techniqueBackend: string;
  coachBrainSafetyRejected?: boolean;
  coachBrainLlmConfigured?: boolean;
  coachAiCopilotEnabled?: boolean;
  insightsEnabled?: boolean;
  researchSummarizerEnabled?: boolean;
  now?: Date;
};

export type AiCapabilityRegistrySnapshot = {
  engineVersion: string;
  assessedAt: Date;
  capabilities: AiCapabilityStatus[];
  /** True when any capability is unavailable / not configured / rejected / failed. */
  anyHardFailure: boolean;
  /** True when at least one capability is using deterministic fallback. */
  anyDegraded: boolean;
};

/**
 * Build a snapshot of AI capability health from known facts.
 */
export function buildAiCapabilityRegistrySnapshot(
  input: AiCapabilityRegistryInput,
): AiCapabilityRegistrySnapshot {
  const capabilities: AiCapabilityStatus[] = [
    techniqueBackendCapabilityStatus(input.techniqueBackend),
    coachBrainCapabilityStatus({
      safetyRejected: input.coachBrainSafetyRejected,
      llmConfigured: input.coachBrainLlmConfigured,
    }),
    flagGatedCapabilityStatus("coach_chat", true, "deterministic_stub"),
    flagGatedCapabilityStatus(
      "coach_ai_copilot",
      input.coachAiCopilotEnabled ?? true,
      "deterministic_stub",
    ),
    flagGatedCapabilityStatus("program_review", true, "rules"),
    flagGatedCapabilityStatus("daily_brief", true, "rules"),
    flagGatedCapabilityStatus(
      "insights",
      input.insightsEnabled ?? true,
      "rules",
    ),
    flagGatedCapabilityStatus(
      "research_summarizer",
      input.researchSummarizerEnabled ?? true,
      "deterministic_stub",
    ),
  ];

  return {
    engineVersion: AI_FAILURE_MODES_ENGINE_VERSION,
    assessedAt: input.now ?? new Date(),
    capabilities,
    anyHardFailure: capabilities.some(
      (c) =>
        c.status === "unavailable" ||
        c.status === "not_configured" ||
        c.failure?.kind === "rejected" ||
        c.failure?.kind === "failed",
    ),
    anyDegraded: capabilities.some((c) => c.usingDeterministicFallback),
  };
}

export function getAiCapabilityStatus(
  id: AiCapabilityId,
  snapshot: AiCapabilityRegistrySnapshot,
): AiCapabilityStatus {
  return (
    snapshot.capabilities.find((c) => c.id === id) ?? {
      id,
      label: AI_CAPABILITY_LABELS[id],
      status: "unavailable",
      mode: "none",
      failure: null,
      usingDeterministicFallback: false,
    }
  );
}

export function listAiCapabilityIds(): readonly AiCapabilityId[] {
  return AI_CAPABILITY_IDS;
}
