/**
 * Safety System 2.0 — admin snapshot + gate helpers.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  buildSafetySystemSnapshot,
  validateRecommendationSafety,
  validateRecommendationSafetyBatch,
  type RecommendationSafetyInput,
  type SafetySystemSnapshot,
  type SafetyValidationResult,
} from "@/domain/safety-system";

export function isSafetySystem20Enabled(): boolean {
  return featureFlags.safetySystem20;
}

export function getSafetySystemSnapshot(): SafetySystemSnapshot {
  return buildSafetySystemSnapshot();
}

/**
 * Central gate for any recommendation pipeline.
 * When the flag is off, returns allow passthrough (legacy callers keep working).
 */
export function gateRecommendation(
  input: RecommendationSafetyInput,
): SafetyValidationResult {
  if (!featureFlags.safetySystem20) {
    return {
      action: "allow",
      findings: [],
      input,
      outputText: input.text,
      engineVersion: "safety_system.bypass",
    };
  }
  return validateRecommendationSafety(input);
}

export function gateRecommendationBatch(inputs: RecommendationSafetyInput[]) {
  if (!featureFlags.safetySystem20) {
    return {
      results: inputs.map((input) => gateRecommendation(input)),
      allowed: inputs,
      blockedCount: 0,
      modifiedCount: 0,
    };
  }
  return validateRecommendationSafetyBatch(inputs);
}
