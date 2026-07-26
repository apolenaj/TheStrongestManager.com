export {
  BEHAVIORAL_RETENTION_ENGINE_VERSION,
  RETENTION_LOOP_IDS,
  RETENTION_LOOP_LABELS,
  RETENTION_DAY_RESOLUTIONS,
  RETENTION_LOOP_STATUSES,
  RETENTION_FORBIDDEN_PATTERNS,
  BEHAVIORAL_RETENTION_HONESTY,
  DEFAULT_RETENTION_LOOKBACK_DAYS,
  RETENTION_SOFT_NUDGES,
} from "@/domain/behavioral-retention/constants";
export type {
  RetentionLoopId,
  RetentionDayResolution,
  RetentionLoopStatus,
} from "@/domain/behavioral-retention/constants";

export type {
  RetentionDaySignal,
  RetentionLoopCard,
  BehavioralRetentionPayload,
  BehavioralRetentionSignals,
} from "@/domain/behavioral-retention/types";

export {
  resolveRetentionDay,
  computeOnPlanStreak,
  assembleBehavioralRetention,
  behavioralRetentionText,
} from "@/domain/behavioral-retention/assemble";
