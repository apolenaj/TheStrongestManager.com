/**
 * Pure fallback runner — try providers in chain order.
 * Logging of latency/errors/cost is done by the service layer.
 */

import {
  AI_MODEL_ROUTER_ENGINE_VERSION,
  type AiModelCompleteInput,
  type AiModelCompleteResult,
  type AiModelProvider,
  type AiRouterAttemptLog,
  type AiRouterRunResult,
  type AiRouterTaskKind,
} from "@/domain/ai-model-router/constants";

export type RouterAttemptHook = (attempt: AiRouterAttemptLog) => void;

/**
 * Try each provider until one returns a non-null result.
 * Stub/none returning null continues the chain (fallback).
 */
export async function runProviderFallbackChain(input: {
  taskKind: AiRouterTaskKind;
  featureId: string;
  providers: readonly AiModelProvider[];
  completeInput: AiModelCompleteInput;
  onAttempt?: RouterAttemptHook;
}): Promise<AiRouterRunResult> {
  const attempts: AiRouterAttemptLog[] = [];
  const chain = input.providers.map((p) => p.id);
  let result: AiModelCompleteResult | null = null;
  let totalLatencyMs = 0;
  let attemptIndex = 0;

  for (const provider of input.providers) {
    if (
      provider.status === "unavailable" ||
      provider.status === "not_configured"
    ) {
      const attempt: AiRouterAttemptLog = {
        attemptIndex,
        providerId: provider.id,
        providerStatus: provider.status,
        taskKind: input.taskKind,
        featureId: input.featureId,
        outcome: "skipped_unavailable",
        latencyMs: 0,
        errorMessage: `Provider ${provider.id} is ${provider.status}`,
        promptTokens: null,
        completionTokens: null,
        estimatedUsd: null,
      };
      attempts.push(attempt);
      input.onAttempt?.(attempt);
      attemptIndex += 1;
      continue;
    }

    if (!provider.supportedTaskKinds.includes(input.taskKind)) {
      const attempt: AiRouterAttemptLog = {
        attemptIndex,
        providerId: provider.id,
        providerStatus: provider.status,
        taskKind: input.taskKind,
        featureId: input.featureId,
        outcome: "skipped_unsupported",
        latencyMs: 0,
        errorMessage: `Provider ${provider.id} does not support ${input.taskKind}`,
        promptTokens: null,
        completionTokens: null,
        estimatedUsd: null,
      };
      attempts.push(attempt);
      input.onAttempt?.(attempt);
      attemptIndex += 1;
      continue;
    }

    const started = Date.now();
    try {
      const completed = await provider.complete(input.completeInput);
      const latencyMs = Date.now() - started;
      totalLatencyMs += latencyMs;

      if (completed) {
        const attempt: AiRouterAttemptLog = {
          attemptIndex,
          providerId: provider.id,
          providerStatus: provider.status,
          taskKind: input.taskKind,
          featureId: input.featureId,
          outcome: "success",
          latencyMs,
          errorMessage: null,
          promptTokens: completed.promptTokens,
          completionTokens: completed.completionTokens,
          estimatedUsd: null,
        };
        attempts.push(attempt);
        input.onAttempt?.(attempt);
        result = completed;
        break;
      }

      const attempt: AiRouterAttemptLog = {
        attemptIndex,
        providerId: provider.id,
        providerStatus: provider.status,
        taskKind: input.taskKind,
        featureId: input.featureId,
        outcome: "null_response",
        latencyMs,
        errorMessage: "Provider returned null (no fabricated output)",
        promptTokens: null,
        completionTokens: null,
        estimatedUsd: null,
      };
      attempts.push(attempt);
      input.onAttempt?.(attempt);
    } catch (err) {
      const latencyMs = Date.now() - started;
      totalLatencyMs += latencyMs;
      const message =
        err instanceof Error ? err.message : "Unknown provider error";
      const attempt: AiRouterAttemptLog = {
        attemptIndex,
        providerId: provider.id,
        providerStatus: provider.status,
        taskKind: input.taskKind,
        featureId: input.featureId,
        outcome: "error",
        latencyMs,
        errorMessage: message,
        promptTokens: null,
        completionTokens: null,
        estimatedUsd: null,
      };
      attempts.push(attempt);
      input.onAttempt?.(attempt);
    }

    attemptIndex += 1;
  }

  const successCount = attempts.filter((a) => a.outcome === "success").length;

  return {
    engineVersion: AI_MODEL_ROUTER_ENGINE_VERSION,
    taskKind: input.taskKind,
    featureId: input.featureId,
    success: result != null,
    result,
    attempts,
    chain,
    fallbackUsed: attempts.length > 1 || successCount === 0,
    totalLatencyMs,
  };
}
