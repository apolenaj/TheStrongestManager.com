export {
  RECOVERY_CORRELATION_ENGINE_VERSION,
  RECOVERY_CORRELATION_HONESTY,
  RECOVERY_CORR_OBSERVED_LABEL,
  RECOVERY_CORR_NOT_CAUSAL,
  RECOVERY_CORR_MIN_WEEKS_PER_ARM,
  RECOVERY_CORR_MIN_WEEKS_TOTAL,
  RECOVERY_CORR_SLEEP_LOW_HOURS,
  RECOVERY_CORR_STRESS_HIGH,
  RECOVERY_CORR_SORENESS_HIGH,
  RECOVERY_CORR_SIGNALS,
  type RecoveryCorrSignal,
} from "@/domain/recovery-correlation/constants";

export type {
  RecoveryWeekBucket,
  RecoveryCorrelationInsight,
  RecoveryCorrelationAnalysis,
} from "@/domain/recovery-correlation/types";

export {
  canPublishRecoveryCorrelation,
  insufficientSampleReason,
} from "@/domain/recovery-correlation/gate";

export {
  bucketRecoveryPerformanceWeeks,
  type RecoveryLogPoint,
  type SessionPerfPoint,
} from "@/domain/recovery-correlation/buckets";

export { analyzeRecoveryCorrelations } from "@/domain/recovery-correlation/analyze";
