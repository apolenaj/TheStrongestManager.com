import {
  SAFETY_RULES,
  SAFETY_SYSTEM_ENGINE_VERSION,
  SAFETY_SYSTEM_HONESTY,
  SAFETY_THRESHOLDS,
} from "@/domain/safety-system/constants";
import { runSafetyAuditSuite } from "@/domain/safety-system/audit";

export type SafetySystemSnapshot = {
  engineVersion: typeof SAFETY_SYSTEM_ENGINE_VERSION;
  honesty: typeof SAFETY_SYSTEM_HONESTY;
  rules: typeof SAFETY_RULES;
  thresholds: typeof SAFETY_THRESHOLDS;
  docPath: "docs/SAFETY_SYSTEM.md";
  audit: ReturnType<typeof runSafetyAuditSuite>;
  generatedAt: string;
};

export function buildSafetySystemSnapshot(
  generatedAt: string = new Date().toISOString(),
): SafetySystemSnapshot {
  return {
    engineVersion: SAFETY_SYSTEM_ENGINE_VERSION,
    honesty: SAFETY_SYSTEM_HONESTY,
    rules: SAFETY_RULES,
    thresholds: SAFETY_THRESHOLDS,
    docPath: "docs/SAFETY_SYSTEM.md",
    audit: runSafetyAuditSuite(),
    generatedAt,
  };
}
