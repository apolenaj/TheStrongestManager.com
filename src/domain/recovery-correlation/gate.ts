/**
 * Sample-size gates for recovery ↔ performance associations.
 */

import {
  RECOVERY_CORR_MIN_WEEKS_PER_ARM,
  RECOVERY_CORR_MIN_WEEKS_TOTAL,
} from "@/domain/recovery-correlation/constants";

export function canPublishRecoveryCorrelation(input: {
  conditionWeekCount: number;
  comparisonWeekCount: number;
  weeksWithBothSignals: number;
}): boolean {
  if (input.weeksWithBothSignals < RECOVERY_CORR_MIN_WEEKS_TOTAL) {
    return false;
  }
  return (
    input.conditionWeekCount >= RECOVERY_CORR_MIN_WEEKS_PER_ARM &&
    input.comparisonWeekCount >= RECOVERY_CORR_MIN_WEEKS_PER_ARM
  );
}

export function insufficientSampleReason(input: {
  conditionWeekCount: number;
  comparisonWeekCount: number;
  weeksWithBothSignals: number;
}): string {
  if (input.weeksWithBothSignals < RECOVERY_CORR_MIN_WEEKS_TOTAL) {
    return `Need at least ${RECOVERY_CORR_MIN_WEEKS_TOTAL} weeks with both recovery and performance data (have ${input.weeksWithBothSignals}).`;
  }
  return `Need at least ${RECOVERY_CORR_MIN_WEEKS_PER_ARM} weeks in each group (condition ${input.conditionWeekCount}, comparison ${input.comparisonWeekCount}).`;
}
