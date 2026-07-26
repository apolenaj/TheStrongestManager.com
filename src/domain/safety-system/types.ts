import type { SafetyAction, SafetyRuleId } from "@/domain/safety-system/constants";

/**
 * Structured candidate for the central recommendation safety validator.
 * Free-text plus optional numeric signals — validators use both.
 */
export type RecommendationSafetyInput = {
  id: string;
  /** Primary recommendation / coaching text. */
  text: string;
  /** Optional product kind (e.g. increase_volume, weight_cut). */
  kind?: string | null;
  sessionsPerWeek?: number | null;
  hardSetsPerLiftPerWeek?: number | null;
  weeklyHardSetsTotal?: number | null;
  proposedWeightLossKgPerWeek?: number | null;
  /** From Pain-Safe Response System when known. */
  painSafeModeActive?: boolean;
  /** True when recommendation increases load/volume/aggression. */
  aggressiveProgression?: boolean;
  /** Explicit flag that advice ignores reported pain. */
  ignoresReportedPain?: boolean;
};

export type SafetyFinding = {
  ruleId: SafetyRuleId;
  action: SafetyAction;
  message: string;
  /** Suggested replacement text when action is modify. */
  modifiedText?: string;
};

export type SafetyValidationResult = {
  /** Worst action across findings (block > modify > allow). */
  action: SafetyAction;
  findings: SafetyFinding[];
  input: RecommendationSafetyInput;
  /** Text to surface; null when blocked. */
  outputText: string | null;
  engineVersion: string;
};

export type SafetyAuditCase = {
  id: string;
  ruleId: SafetyRuleId;
  input: RecommendationSafetyInput;
  /** Expected final action after validation. */
  expectAction: SafetyAction;
  /** At least one finding must match this rule. */
  expectRuleHit: boolean;
};
