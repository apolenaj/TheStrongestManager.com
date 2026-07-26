/**
 * Sport Goal Landing Pages service (Prompt 167).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  buildSportGoalLandingSnapshot,
  evaluateSportGoalLandingQuality,
  getSportGoalLanding,
  listIndexableSportGoalPaths,
  type SportGoalLanding,
  type SportGoalLandingSnapshot,
} from "@/domain/sport-goal-landings";

export function getSportGoalLandingSnapshot(): SportGoalLandingSnapshot {
  return buildSportGoalLandingSnapshot();
}

export function getIndexableSportGoalPaths(): string[] {
  if (!featureFlags.sportGoalLandings) return [];
  return listIndexableSportGoalPaths();
}

export function resolveIndexableSportGoalLanding(
  slug: string,
): SportGoalLanding | null {
  if (!featureFlags.sportGoalLandings) return null;
  const page = getSportGoalLanding(slug);
  if (!page) return null;
  return evaluateSportGoalLandingQuality(page).passed ? page : null;
}
