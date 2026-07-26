export {
  ACHIEVEMENT_BEHAVIOR_PILLARS,
  ACHIEVEMENT_FORBIDDEN_PATTERNS,
  ACHIEVEMENT_HONESTY,
  PILLAR_LABELS,
  isForbiddenAchievementPattern,
} from "@/domain/achievement/constants";
export type { AchievementBehaviorPillar } from "@/domain/achievement/constants";

export {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_CATALOG_MAX,
  getAchievementById,
  assertCatalogSize,
} from "@/domain/achievement/catalog";
export type {
  AchievementId,
  AchievementDefinition,
} from "@/domain/achievement/catalog";

export {
  evaluateAchievement,
  evaluateAllAchievements,
  countDistinctTrainingWeeks,
  techniqueImprovementDelta,
} from "@/domain/achievement/evaluate";
export type {
  AchievementEvidence,
  AchievementEvaluation,
} from "@/domain/achievement/evaluate";
