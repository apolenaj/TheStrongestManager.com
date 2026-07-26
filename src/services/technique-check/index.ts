/**
 * Free Technique Check service (Prompt 169).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  buildLimitedTechniqueInsight,
  buildTechniqueCheckSnapshot,
  type LimitedTechniqueInsight,
  type TechniqueCheckSnapshot,
} from "@/domain/technique-check";
import type { MovementReport } from "@/domain/movement/types";
import {
  createTechniqueCheckTicket,
  verifyTechniqueCheckTicket,
} from "@/services/technique-check/ticket";

export function getTechniqueCheckSnapshot(): TechniqueCheckSnapshot {
  return buildTechniqueCheckSnapshot();
}

export function isTechniqueCheckEnabled(): boolean {
  return featureFlags.techniqueCheck;
}

export function claimTechniqueCheckTicket(): ReturnType<
  typeof createTechniqueCheckTicket
> {
  return createTechniqueCheckTicket();
}

export function validateTechniqueCheckTicket(token: string) {
  return verifyTechniqueCheckTicket(token);
}

export function limitedInsightFromReport(
  report: MovementReport,
): LimitedTechniqueInsight {
  return buildLimitedTechniqueInsight(report);
}

export {
  createTechniqueCheckTicket,
  verifyTechniqueCheckTicket,
} from "@/services/technique-check/ticket";
