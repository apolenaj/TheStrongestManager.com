export {
  CHALLENGE_REWARD_PILLARS,
  CHALLENGE_METRIC_KINDS,
  CHALLENGE_ENROLLMENT_STATUSES,
  CHALLENGE_FORBIDDEN_KINDS,
  CHALLENGE_HONESTY,
  PILLAR_LABELS,
  isChallengeRewardPillar,
  isChallengeMetricKind,
  isForbiddenChallengeKind,
} from "@/domain/challenge/constants";
export type {
  ChallengeRewardPillar,
  ChallengeMetricKind,
  ChallengeEnrollmentStatus,
} from "@/domain/challenge/constants";

export {
  CHALLENGE_CATALOG,
  getChallengeById,
  getChallengeBySlug,
  assertCatalogSafety,
} from "@/domain/challenge/catalog";
export type { ChallengeDefinition } from "@/domain/challenge/catalog";

export {
  CHALLENGE_BADGE_CATALOG,
  getChallengeBadge,
  resolveCompletionBadge,
} from "@/domain/challenge/badges";
export type {
  ChallengeBadgeId,
  ChallengeCompletionBadge,
} from "@/domain/challenge/badges";

export {
  computeChallengeProgress,
  buildOptionalChallengeLeaderboard,
  isWithinDuration,
} from "@/domain/challenge/progress";
export type {
  ChallengeProgressInput,
  ChallengeProgressResult,
  ChallengeLeaderboardRow,
} from "@/domain/challenge/progress";
