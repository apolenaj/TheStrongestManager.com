import {
  SPORT_GOAL_LANDING_ENGINE_VERSION,
  SPORT_GOAL_LANDING_HONESTY,
  SPORT_GOAL_FILLER_PHRASES,
} from "@/domain/sport-goal-landings/constants";
import {
  SPORT_GOAL_LANDINGS,
} from "@/domain/sport-goal-landings/catalog";
import type { SportGoalLanding } from "@/domain/sport-goal-landings/constants";
import {
  evaluateSportGoalLandingQuality,
  type SportGoalQualityResult,
} from "@/domain/sport-goal-landings/quality";

export type SportGoalLandingSnapshot = {
  engineVersion: typeof SPORT_GOAL_LANDING_ENGINE_VERSION;
  honesty: typeof SPORT_GOAL_LANDING_HONESTY;
  fillerPhrases: typeof SPORT_GOAL_FILLER_PHRASES;
  pages: Array<{
    page: SportGoalLanding;
    quality: SportGoalQualityResult;
    href: string;
  }>;
  indexableCount: number;
  rejectedCount: number;
  generatedAt: string;
};

export function buildSportGoalLandingSnapshot(
  generatedAt: string = new Date().toISOString(),
): SportGoalLandingSnapshot {
  const pages = SPORT_GOAL_LANDINGS.map((page) => ({
    page,
    quality: evaluateSportGoalLandingQuality(page),
    href: `/goals/${page.slug}`,
  }));
  return {
    engineVersion: SPORT_GOAL_LANDING_ENGINE_VERSION,
    honesty: SPORT_GOAL_LANDING_HONESTY,
    fillerPhrases: SPORT_GOAL_FILLER_PHRASES,
    pages,
    indexableCount: pages.filter((p) => p.quality.passed).length,
    rejectedCount: pages.filter((p) => !p.quality.passed).length,
    generatedAt,
  };
}

export function listIndexableSportGoalPaths(): string[] {
  return SPORT_GOAL_LANDINGS.filter(
    (p) => evaluateSportGoalLandingQuality(p).passed,
  ).map((p) => `/goals/${p.slug}`);
}
