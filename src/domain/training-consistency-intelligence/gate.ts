/**
 * Sample gate for plan-adherence score.
 */

import { TCI_MIN_RESOLVED_PLAN_DAYS } from "@/domain/training-consistency-intelligence/constants";

export function canPublishTrainingConsistency(resolvedPlanDays: number): boolean {
  return resolvedPlanDays >= TCI_MIN_RESOLVED_PLAN_DAYS;
}

export function insufficientPlanHistoryReason(resolvedPlanDays: number): string {
  return `Need at least ${TCI_MIN_RESOLVED_PLAN_DAYS} resolvable plan days (have ${resolvedPlanDays}).`;
}
