/**
 * Dashboard snapshot builder for the multi-model router.
 */

import {
  AI_MODEL_ROUTER_ENGINE_VERSION,
  AI_MODEL_ROUTER_HONESTY,
  AI_ROUTER_TASK_KIND_LABELS,
  AI_ROUTER_TASK_KINDS,
  type AiRouterAttemptLog,
  type AiRouterDashboardSnapshot,
} from "@/domain/ai-model-router/constants";
import {
  getProviderChainForTask,
  listAiModelProviders,
} from "@/domain/ai-model-router/provider";

export function buildAiRouterDashboardSnapshot(input?: {
  recentAttempts?: readonly AiRouterAttemptLog[];
  now?: Date;
}): AiRouterDashboardSnapshot {
  const recentAttempts = [...(input?.recentAttempts ?? [])].slice(-50);
  const providers = listAiModelProviders().map((p) => ({
    id: p.id,
    label: p.label,
    status: p.status,
    supportedTaskKinds: p.supportedTaskKinds,
  }));

  let successes = 0;
  let errors = 0;
  let nullResponses = 0;
  let totalLatencyMs = 0;
  for (const a of recentAttempts) {
    if (a.outcome === "success") successes += 1;
    if (a.outcome === "error") errors += 1;
    if (a.outcome === "null_response") nullResponses += 1;
    totalLatencyMs += a.latencyMs;
  }

  return {
    engineVersion: AI_MODEL_ROUTER_ENGINE_VERSION,
    generatedAt: (input?.now ?? new Date()).toISOString(),
    honesty: AI_MODEL_ROUTER_HONESTY,
    taskKinds: AI_ROUTER_TASK_KINDS.map((kind) => ({
      kind,
      label: AI_ROUTER_TASK_KIND_LABELS[kind],
      chain: getProviderChainForTask(kind),
    })),
    providers,
    recentAttempts,
    totals: {
      attempts: recentAttempts.length,
      successes,
      errors,
      nullResponses,
      totalLatencyMs,
    },
  };
}
