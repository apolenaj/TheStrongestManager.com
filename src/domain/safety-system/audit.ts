/**
 * Deterministic audit suite for Safety System 2.0 (Prompt 180).
 */

import type { SafetyAuditCase } from "@/domain/safety-system/types";
import { validateRecommendationSafety } from "@/domain/safety-system/validate";

export const SAFETY_AUDIT_CASES: readonly SafetyAuditCase[] = [
  {
    id: "freq.daily_max",
    ruleId: "unsafe_max_frequency",
    expectAction: "modify",
    expectRuleHit: true,
    input: {
      id: "freq.daily_max",
      text: "Do a competition deadlift max every day this peaking week.",
    },
  },
  {
    id: "freq.hard_cap",
    ruleId: "unsafe_max_frequency",
    expectAction: "block",
    expectRuleHit: true,
    input: {
      id: "freq.hard_cap",
      text: "Train hard nine times this week.",
      sessionsPerWeek: 9,
    },
  },
  {
    id: "volume.extreme_sets",
    ruleId: "extreme_volume",
    expectAction: "block",
    expectRuleHit: true,
    input: {
      id: "volume.extreme_sets",
      text: "Add more volume on squat.",
      hardSetsPerLiftPerWeek: 55,
    },
  },
  {
    id: "volume.language",
    ruleId: "extreme_volume",
    expectAction: "modify",
    expectRuleHit: true,
    input: {
      id: "volume.language",
      text: "Double volume immediately for hypertrophy.",
    },
  },
  {
    id: "weight.crash_cut",
    ruleId: "dangerous_rapid_weight_loss",
    expectAction: "block",
    expectRuleHit: true,
    input: {
      id: "weight.crash_cut",
      text: "Use a sauna cut and diuretic water cut to make weight by Saturday.",
    },
  },
  {
    id: "weight.rate",
    ruleId: "dangerous_rapid_weight_loss",
    expectAction: "block",
    expectRuleHit: true,
    input: {
      id: "weight.rate",
      text: "Aim to lose bodyweight this month.",
      proposedWeightLossKgPerWeek: 1.5,
    },
  },
  {
    id: "medical.diagnose",
    ruleId: "medical_diagnosis",
    expectAction: "block",
    expectRuleHit: true,
    input: {
      id: "medical.diagnose",
      text: "You have a herniated disc — I diagnose lumbar disc injury.",
    },
  },
  {
    id: "pain.push_through",
    ruleId: "pain_ignoring",
    expectAction: "block",
    expectRuleHit: true,
    input: {
      id: "pain.push_through",
      text: "Push through the sharp pain and keep adding load.",
    },
  },
  {
    id: "pain.safe_mode_aggressive",
    ruleId: "pain_ignoring",
    expectAction: "block",
    expectRuleHit: true,
    input: {
      id: "pain.safe_mode_aggressive",
      text: "Increase intensity next session.",
      painSafeModeActive: true,
      aggressiveProgression: true,
    },
  },
  {
    id: "allow.reasonable",
    ruleId: "unsafe_max_frequency",
    expectAction: "allow",
    expectRuleHit: false,
    input: {
      id: "allow.reasonable",
      text: "Keep three hard lower sessions this week and one lighter technique day.",
      sessionsPerWeek: 4,
      hardSetsPerLiftPerWeek: 12,
      weeklyHardSetsTotal: 40,
    },
  },
] as const;

export type SafetyAuditReport = {
  passed: boolean;
  total: number;
  failures: Array<{
    id: string;
    expected: string;
    actual: string;
    detail: string;
  }>;
};

export function runSafetyAuditSuite(
  cases: readonly SafetyAuditCase[] = SAFETY_AUDIT_CASES,
): SafetyAuditReport {
  const failures: SafetyAuditReport["failures"] = [];

  for (const c of cases) {
    const result = validateRecommendationSafety(c.input);
    if (result.action !== c.expectAction) {
      failures.push({
        id: c.id,
        expected: c.expectAction,
        actual: result.action,
        detail: `Action mismatch. Findings: ${result.findings.map((f) => f.ruleId).join(", ") || "none"}`,
      });
      continue;
    }
    const hit = result.findings.some((f) => f.ruleId === c.ruleId);
    if (c.expectRuleHit && !hit) {
      failures.push({
        id: c.id,
        expected: `hit ${c.ruleId}`,
        actual: "no hit",
        detail: "Expected rule finding missing.",
      });
    }
    if (!c.expectRuleHit && hit && c.expectAction === "allow") {
      failures.push({
        id: c.id,
        expected: "no hit",
        actual: `hit ${c.ruleId}`,
        detail: "Safe case should not trip the nominated rule.",
      });
    }
  }

  return {
    passed: failures.length === 0,
    total: cases.length,
    failures,
  };
}
