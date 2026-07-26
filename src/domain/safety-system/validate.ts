/**
 * Central recommendation safety validator (Prompt 180).
 */

import {
  EXTREME_VOLUME_PATTERNS,
  MEDICAL_DIAGNOSIS_PATTERNS,
  PAIN_IGNORING_PATTERNS,
  RAPID_WEIGHT_LOSS_PATTERNS,
  SAFETY_SYSTEM_ENGINE_VERSION,
  SAFETY_THRESHOLDS,
  UNSAFE_FREQUENCY_PATTERNS,
  type SafetyAction,
} from "@/domain/safety-system/constants";
import type {
  RecommendationSafetyInput,
  SafetyFinding,
  SafetyValidationResult,
} from "@/domain/safety-system/types";

function worstAction(a: SafetyAction, b: SafetyAction): SafetyAction {
  const rank: Record<SafetyAction, number> = {
    allow: 0,
    modify: 1,
    block: 2,
  };
  return rank[a] >= rank[b] ? a : b;
}

function anyPattern(text: string, patterns: readonly RegExp[]): RegExp | null {
  for (const p of patterns) {
    if (p.test(text)) return p;
  }
  return null;
}

function checkFrequency(input: RecommendationSafetyInput): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  const text = input.text;
  const sessions = input.sessionsPerWeek;

  if (sessions != null && sessions > SAFETY_THRESHOLDS.maxSessionsPerWeekHard) {
    findings.push({
      ruleId: "unsafe_max_frequency",
      action: "block",
      message: `Blocked: ${sessions} sessions/week exceeds hard cap (${SAFETY_THRESHOLDS.maxSessionsPerWeekHard}).`,
    });
    return findings;
  }

  if (sessions != null && sessions > SAFETY_THRESHOLDS.maxSessionsPerWeekSoft) {
    findings.push({
      ruleId: "unsafe_max_frequency",
      action: "modify",
      message: `Modified: ${sessions} sessions/week exceeds soft cap (${SAFETY_THRESHOLDS.maxSessionsPerWeekSoft}).`,
      modifiedText: `Limit hard training to at most ${SAFETY_THRESHOLDS.maxSessionsPerWeekSoft} sessions/week and keep at least one easier or rest day. Reassess recovery before adding frequency.`,
    });
  }

  const hit = anyPattern(text, UNSAFE_FREQUENCY_PATTERNS);
  if (hit) {
    findings.push({
      ruleId: "unsafe_max_frequency",
      action: "modify",
      message: `Modified: unsafe frequency language matched ${hit}.`,
      modifiedText:
        "Avoid daily max-effort on the same lift. Spread hard sessions across the week with recovery days, and do not prescribe every-day peaking.",
    });
  }

  return findings;
}

function checkVolume(input: RecommendationSafetyInput): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  const perLift = input.hardSetsPerLiftPerWeek;
  const total = input.weeklyHardSetsTotal;

  if (
    perLift != null &&
    perLift > SAFETY_THRESHOLDS.maxHardSetsPerLiftHard
  ) {
    findings.push({
      ruleId: "extreme_volume",
      action: "block",
      message: `Blocked: ${perLift} hard sets/lift/week exceeds hard cap (${SAFETY_THRESHOLDS.maxHardSetsPerLiftHard}).`,
    });
    return findings;
  }

  if (total != null && total > SAFETY_THRESHOLDS.maxWeeklyHardSetsHard) {
    findings.push({
      ruleId: "extreme_volume",
      action: "block",
      message: `Blocked: ${total} weekly hard sets exceeds hard cap (${SAFETY_THRESHOLDS.maxWeeklyHardSetsHard}).`,
    });
    return findings;
  }

  if (
    perLift != null &&
    perLift > SAFETY_THRESHOLDS.maxHardSetsPerLiftSoft
  ) {
    findings.push({
      ruleId: "extreme_volume",
      action: "modify",
      message: `Modified: ${perLift} hard sets/lift/week exceeds soft cap.`,
      modifiedText: `Reduce hard sets on this lift toward ≤${SAFETY_THRESHOLDS.maxHardSetsPerLiftSoft}/week and monitor recovery before adding volume.`,
    });
  }

  if (total != null && total > SAFETY_THRESHOLDS.maxWeeklyHardSetsSoft) {
    findings.push({
      ruleId: "extreme_volume",
      action: "modify",
      message: `Modified: ${total} weekly hard sets exceeds soft cap.`,
      modifiedText: `Trim total weekly hard sets toward ≤${SAFETY_THRESHOLDS.maxWeeklyHardSetsSoft} and prioritize recovery quality over stacking volume.`,
    });
  }

  const hit = anyPattern(input.text, EXTREME_VOLUME_PATTERNS);
  if (hit) {
    findings.push({
      ruleId: "extreme_volume",
      action: "modify",
      message: `Modified: extreme volume language matched ${hit}.`,
      modifiedText:
        "Avoid extreme or open-ended volume prescriptions. Progress volume gradually and stop short of reckless set stacking.",
    });
  }

  return findings;
}

function checkWeightLoss(input: RecommendationSafetyInput): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  const rate = input.proposedWeightLossKgPerWeek;

  if (
    rate != null &&
    rate > SAFETY_THRESHOLDS.maxWeightLossKgPerWeekHard
  ) {
    findings.push({
      ruleId: "dangerous_rapid_weight_loss",
      action: "block",
      message: `Blocked: ${rate} kg/week loss exceeds hard safety cap (${SAFETY_THRESHOLDS.maxWeightLossKgPerWeekHard}).`,
    });
    return findings;
  }

  if (
    rate != null &&
    rate > SAFETY_THRESHOLDS.maxWeightLossKgPerWeekSoft
  ) {
    findings.push({
      ruleId: "dangerous_rapid_weight_loss",
      action: "block",
      message: `Blocked: ${rate} kg/week loss exceeds soft safety threshold — no crash-cut prescriptions.`,
    });
  }

  const hit = anyPattern(input.text, RAPID_WEIGHT_LOSS_PATTERNS);
  if (hit) {
    findings.push({
      ruleId: "dangerous_rapid_weight_loss",
      action: "block",
      message: `Blocked: dangerous weight-cut language matched ${hit}.`,
    });
  }

  return findings;
}

function checkMedicalDiagnosis(input: RecommendationSafetyInput): SafetyFinding[] {
  const hit = anyPattern(input.text, MEDICAL_DIAGNOSIS_PATTERNS);
  if (!hit) return [];
  return [
    {
      ruleId: "medical_diagnosis",
      action: "block",
      message: `Blocked: medical diagnosis language matched ${hit}. This product does not diagnose.`,
    },
  ];
}

function checkPainIgnoring(input: RecommendationSafetyInput): SafetyFinding[] {
  const findings: SafetyFinding[] = [];

  if (input.ignoresReportedPain) {
    findings.push({
      ruleId: "pain_ignoring",
      action: "block",
      message:
        "Blocked: recommendation explicitly ignores reported pain. Seek qualified medical evaluation — this app does not diagnose.",
    });
  }

  if (input.painSafeModeActive && input.aggressiveProgression) {
    findings.push({
      ruleId: "pain_ignoring",
      action: "block",
      message:
        "Blocked: aggressive progression while pain-safe mode is active. Seek qualified medical evaluation — this app does not diagnose.",
    });
  }

  const hit = anyPattern(input.text, PAIN_IGNORING_PATTERNS);
  if (hit) {
    findings.push({
      ruleId: "pain_ignoring",
      action: "block",
      message: `Blocked: pain-ignoring language matched ${hit}.`,
    });
  }

  return findings;
}

/**
 * Validate a single recommendation candidate.
 * Fail closed: any block → outputText null; modify uses first modify text or softened original.
 */
export function validateRecommendationSafety(
  input: RecommendationSafetyInput,
): SafetyValidationResult {
  const findings: SafetyFinding[] = [
    ...checkMedicalDiagnosis(input),
    ...checkPainIgnoring(input),
    ...checkWeightLoss(input),
    ...checkFrequency(input),
    ...checkVolume(input),
  ];

  let action: SafetyAction = "allow";
  for (const f of findings) {
    action = worstAction(action, f.action);
  }

  let outputText: string | null = input.text;
  if (action === "block") {
    outputText = null;
  } else if (action === "modify") {
    const modified = findings.find((f) => f.action === "modify" && f.modifiedText);
    outputText = modified?.modifiedText ?? input.text;
  }

  return {
    action,
    findings,
    input,
    outputText,
    engineVersion: SAFETY_SYSTEM_ENGINE_VERSION,
  };
}

export function validateRecommendationSafetyBatch(
  inputs: RecommendationSafetyInput[],
): {
  results: SafetyValidationResult[];
  allowed: RecommendationSafetyInput[];
  blockedCount: number;
  modifiedCount: number;
} {
  const results = inputs.map(validateRecommendationSafety);
  const allowed: RecommendationSafetyInput[] = [];
  let blockedCount = 0;
  let modifiedCount = 0;

  for (const r of results) {
    if (r.action === "block") {
      blockedCount += 1;
      continue;
    }
    if (r.action === "modify") {
      modifiedCount += 1;
      allowed.push({
        ...r.input,
        text: r.outputText ?? r.input.text,
      });
      continue;
    }
    allowed.push(r.input);
  }

  return { results, allowed, blockedCount, modifiedCount };
}
