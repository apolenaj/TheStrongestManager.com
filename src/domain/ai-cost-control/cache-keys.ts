/**
 * Inference cache keys — stable hash of structured inputs only.
 */

import { createHash } from "node:crypto";
import type { AiCostFeatureId } from "@/domain/ai-cost-control/constants";
import type { AiModelTier } from "@/domain/ai-cost-control/constants";

/**
 * Canonical JSON for cache keys — sorted keys, no volatile timestamps.
 */
export function canonicalizeForCache(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    if (key === "now" || key === "timestamp" || key === "computedAt") continue;
    out[key] = sortKeys(obj[key]);
  }
  return out;
}

export function buildAiInferenceCacheKey(input: {
  featureId: AiCostFeatureId | string;
  adapterId: string;
  modelTier: AiModelTier;
  payload: unknown;
}): string {
  const digest = createHash("sha256")
    .update(canonicalizeForCache(input.payload))
    .digest("hex")
    .slice(0, 32);
  return `aiinf:v1:${input.featureId}:${input.adapterId}:${input.modelTier}:${digest}`;
}
