/**
 * Service glue for AI failure modes — gathers live facts for the pure registry.
 */

import { featureFlags } from "@/config/feature-flags";
import { COACH_BRAIN_STUB_ADAPTER_ID } from "@/domain/coach-brain/constants";
import { getCoachBrainReasoningAdapter } from "@/domain/coach-brain/reasoning-adapter";
import {
  buildAiCapabilityRegistrySnapshot,
  type AiCapabilityRegistrySnapshot,
} from "@/domain/ai-failure-modes/registry";
import { resolveAnalysisBackendStatus } from "@/services/technique/analysis-service";

export function getAiCapabilityRegistrySnapshot(input?: {
  techniqueBackend?: string;
  coachBrainSafetyRejected?: boolean;
  now?: Date;
}): AiCapabilityRegistrySnapshot {
  const adapter = getCoachBrainReasoningAdapter();
  return buildAiCapabilityRegistrySnapshot({
    techniqueBackend:
      input?.techniqueBackend ?? resolveAnalysisBackendStatus(),
    coachBrainSafetyRejected: input?.coachBrainSafetyRejected,
    coachBrainLlmConfigured: adapter.id !== COACH_BRAIN_STUB_ADAPTER_ID,
    coachAiCopilotEnabled: featureFlags.coachAiCopilot,
    insightsEnabled: featureFlags.appInsights,
    researchSummarizerEnabled: featureFlags.aiResearchSummarizer,
    now: input?.now,
  });
}
