/**
 * Pure metering helpers — never invent USD when pricing is unknown.
 */

import {
  AI_COST_CONTROL_ENGINE_VERSION,
  AI_COST_FEATURE_LABELS,
  type AiCostFeatureId,
  type AiCostMeterEvent,
  type AiCostMeterOutcome,
  type AiModelTier,
  type AiTaskClass,
} from "@/domain/ai-cost-control/constants";

let eventSeq = 0;

export function nextAiCostEventId(now = new Date()): string {
  eventSeq += 1;
  return `aicost_${now.getTime()}_${eventSeq}`;
}

/**
 * Provider price tables stay out of domain until calibrated.
 * Always returns null so dashboards never invent spend.
 */
export function estimateInferenceUsd(_input: {
  modelTier: AiModelTier;
  totalTokens: number | null;
  pricingConfigured?: boolean;
}): number | null {
  return null;
}

export function buildAiCostMeterEvent(input: {
  featureId: AiCostFeatureId | string;
  taskClass: AiTaskClass;
  modelTier: AiModelTier;
  adapterId: string;
  outcome: AiCostMeterOutcome;
  cached?: boolean;
  promptTokens?: number | null;
  completionTokens?: number | null;
  latencyMs?: number | null;
  runId?: string | null;
  at?: Date;
  eventId?: string;
  pricingConfigured?: boolean;
}): AiCostMeterEvent {
  const at = input.at ?? new Date();
  const promptTokens = input.promptTokens ?? null;
  const completionTokens = input.completionTokens ?? null;
  const totalTokens =
    promptTokens != null || completionTokens != null
      ? (promptTokens ?? 0) + (completionTokens ?? 0)
      : null;

  return {
    engineVersion: AI_COST_CONTROL_ENGINE_VERSION,
    eventId: input.eventId ?? nextAiCostEventId(at),
    at: at.toISOString(),
    featureId: input.featureId,
    taskClass: input.taskClass,
    modelTier: input.modelTier,
    adapterId: input.adapterId,
    cached: input.cached ?? input.outcome === "cache_hit",
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedUsd: estimateInferenceUsd({
      modelTier: input.modelTier,
      totalTokens,
      pricingConfigured: input.pricingConfigured,
    }),
    latencyMs: input.latencyMs ?? null,
    outcome: input.outcome,
    runId: input.runId ?? null,
  };
}

/** Meter a path that stayed on deterministic engines (no LLM). */
export function meterSkippedDeterministic(input: {
  featureId: AiCostFeatureId | string;
  taskClass: AiTaskClass;
  adapterId: string;
  runId?: string | null;
  at?: Date;
}): AiCostMeterEvent {
  return buildAiCostMeterEvent({
    ...input,
    modelTier: "none",
    outcome: "skipped_deterministic",
    cached: false,
  });
}

export function featureLabel(featureId: string): string {
  return (
    AI_COST_FEATURE_LABELS[featureId as AiCostFeatureId] ?? featureId
  );
}
