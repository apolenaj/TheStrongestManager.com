export {
  SPORT_GOAL_LANDING_ENGINE_VERSION,
  SPORT_GOAL_LANDING_HONESTY,
  SPORT_GOAL_LANDING_MIN_OVERVIEW,
  SPORT_GOAL_LANDING_MIN_SECTION_BODY,
  SPORT_GOAL_LANDING_MIN_SECTIONS,
  SPORT_GOAL_LANDING_MIN_PRODUCT_LINKS,
  SPORT_GOAL_FILLER_PHRASES,
} from "@/domain/sport-goal-landings/constants";
export type {
  SportGoalProductLink,
  SportGoalSection,
  SportGoalFaq,
  SportGoalLanding,
} from "@/domain/sport-goal-landings/constants";

export {
  SPORT_GOAL_LANDINGS,
  getSportGoalLanding,
  allSportGoalLandingSlugs,
} from "@/domain/sport-goal-landings/catalog";

export {
  evaluateSportGoalLandingQuality,
} from "@/domain/sport-goal-landings/quality";
export type {
  SportGoalQualityCheck,
  SportGoalQualityResult,
} from "@/domain/sport-goal-landings/quality";

export {
  buildSportGoalLandingSnapshot,
  listIndexableSportGoalPaths,
  type SportGoalLandingSnapshot,
} from "@/domain/sport-goal-landings/snapshot";
