/**
 * Multi-model router service — gates via cost control, runs fallbacks, meters attempts.
 */

import {
  buildAiCostMeterEvent,
  routeAiInference,
  type AiCostFeatureId,
  type AiCostMeterOutcome,
} from "@/domain/ai-cost-control";
import {
  buildAiRouterDashboardSnapshot,
  resolveProvidersForTask,
  runProviderFallbackChain,
  type AiModelCompleteInput,
  type AiRouterAttemptLog,
  type AiRouterDashboardSnapshot,
  type AiRouterRunResult,
  type AiRouterTaskKind,
} from "@/domain/ai-model-router";
import { taskKindToCostTaskClass } from "@/domain/ai-model-router/map-task-class";
import { recordAiCostMeterEvent } from "@/services/ai-cost-control";

const MAX_ATTEMPT_LOGS = 200;
const attemptLog: AiRouterAttemptLog[] = [];

export function resetAiModelRouterServiceForTests(): void {
  attemptLog.length = 0;
}

export function listAiRouterAttemptLogs(): readonly AiRouterAttemptLog[] {
  return attemptLog;
}

function pushAttempt(attempt: AiRouterAttemptLog): void {
  attemptLog.push(attempt);
  if (attemptLog.length > MAX_ATTEMPT_LOGS) {
    attemptLog.splice(0, attemptLog.length - MAX_ATTEMPT_LOGS);
  }
}

function outcomeToCostMeter(
  attempt: AiRouterAttemptLog,
): AiCostMeterOutcome {
  switch (attempt.outcome) {
    case "success":
      return "llm_ok";
    case "error":
      return "llm_failed";
    case "null_response":
    case "skipped_unavailable":
    case "skipped_unsupported":
      return "skipped_deterministic";
  }
}

function meterAttempt(attempt: AiRouterAttemptLog, runId: string | null): void {
  try {
    recordAiCostMeterEvent(
      buildAiCostMeterEvent({
        featureId: attempt.featureId,
        taskClass: taskKindToCostTaskClass(attempt.taskKind),
        modelTier: attempt.outcome === "success" ? "small" : "none",
        adapterId: `${attempt.providerId}`,
        outcome: outcomeToCostMeter(attempt),
        cached: false,
        promptTokens: attempt.promptTokens,
        completionTokens: attempt.completionTokens,
        latencyMs: attempt.latencyMs,
        runId,
      }),
    );
  } catch {
    // Metering must never break routing.
  }
}

/**
 * Route a model request through the multi-provider chain.
 * Consults Prompt 145 cost policy first — denied tasks never hit live providers.
 */
export async function routeAiModelRequest(input: {
  taskKind: AiRouterTaskKind;
  featureId: AiCostFeatureId | string;
  payload: unknown;
  modelTier?: "small" | "standard" | "large";
  maxTokens?: number;
  runId?: string | null;
  featureEnabled?: boolean;
  /** When true, treat as stub-only for cost gate (default). */
  adapterIsStub?: boolean;
}): Promise<AiRouterRunResult> {
  const taskClass = taskKindToCostTaskClass(input.taskKind);
  const decision = routeAiInference({
    featureId: input.featureId,
    taskClass,
    featureEnabled: input.featureEnabled,
    adapterIsStub: input.adapterIsStub ?? true,
  });

  if (!decision.allow) {
    // Policy denied — log a synthetic skipped attempt for dashboard visibility.
    const skipped: AiRouterAttemptLog = {
      attemptIndex: 0,
      providerId: "policy",
      providerStatus: "unavailable",
      taskKind: input.taskKind,
      featureId: input.featureId,
      outcome: "skipped_unavailable",
      latencyMs: 0,
      errorMessage: decision.message,
      promptTokens: null,
      completionTokens: null,
      estimatedUsd: null,
    };
    pushAttempt(skipped);
    meterAttempt(skipped, input.runId ?? null);

    return {
      engineVersion: "ai_model_router.v1",
      taskKind: input.taskKind,
      featureId: input.featureId,
      success: false,
      result: null,
      attempts: [skipped],
      chain: [],
      fallbackUsed: false,
      totalLatencyMs: 0,
    };
  }

  const modelTier = input.modelTier ?? decision.modelTier;
  const completeInput: AiModelCompleteInput = {
    taskKind: input.taskKind,
    featureId: input.featureId,
    modelTier,
    payload: input.payload,
    maxTokens: input.maxTokens ?? decision.maxTokens,
    runId: input.runId,
  };

  const providers = resolveProvidersForTask(input.taskKind);

  return runProviderFallbackChain({
    taskKind: input.taskKind,
    featureId: input.featureId,
    providers,
    completeInput,
    onAttempt: (attempt) => {
      pushAttempt(attempt);
      meterAttempt(attempt, input.runId ?? null);
    },
  });
}

export function getAiModelRouterDashboardSnapshot(): AiRouterDashboardSnapshot {
  return buildAiRouterDashboardSnapshot({
    recentAttempts: attemptLog,
  });
}
