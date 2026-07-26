/**
 * Privacy guards — never attach private raw inputs to observability outputs.
 */

import { AI_OBSERVABILITY_FORBIDDEN_FIELDS } from "@/domain/ai-observability/constants";

const FORBIDDEN = new Set(
  AI_OBSERVABILITY_FORBIDDEN_FIELDS.map((k) => k.toLowerCase()),
);

export function isForbiddenObservabilityField(key: string): boolean {
  return FORBIDDEN.has(key.toLowerCase());
}

/**
 * Strip forbidden keys from a shallow record.
 * Used to assert snapshots never leak private payloads.
 */
export function scrubObservabilityRecord(
  record: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (isForbiddenObservabilityField(key)) continue;
    out[key] = value;
  }
  return out;
}

export function assertNoForbiddenObservabilityKeys(
  record: Record<string, unknown>,
): string[] {
  return Object.keys(record).filter(isForbiddenObservabilityField);
}
