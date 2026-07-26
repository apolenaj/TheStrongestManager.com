export {
  USER_SEGMENTATION_ENGINE_VERSION,
  USER_SEGMENTATION_HONESTY,
  USER_SEGMENTATION_SENSITIVE_DENYLIST,
  USER_SEGMENTATION_DEFAULT_COHORT_DAYS,
  USER_SEGMENTATION_HIGH_ENGAGEMENT_WINDOW_DAYS,
  USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_WORKOUTS,
  USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_TECHNIQUE,
  USER_SEGMENTS,
  USER_SEGMENTATION_PAID_PLANS,
} from "@/domain/user-segmentation/constants";
export type { UserSegmentId } from "@/domain/user-segmentation/constants";

export {
  parsePreferredSports,
  isHighEngagement,
  isPaidSegment,
  assertSegmentSignalAllowed,
  assignUserSegments,
  summarizeUserSegmentationCohort,
} from "@/domain/user-segmentation/evaluate";
export type {
  UserSegmentationInput,
  UserSegmentationResult,
  UserSegmentCohortRow,
  UserSegmentationCohortSummary,
} from "@/domain/user-segmentation/evaluate";

export {
  buildUserSegmentationSnapshot,
  type UserSegmentationSnapshot,
} from "@/domain/user-segmentation/snapshot";
