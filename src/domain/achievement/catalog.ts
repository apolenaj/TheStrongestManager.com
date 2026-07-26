/**
 * Small meaningful achievement catalog (Prompt 79).
 */

import type { BadgeVariant } from "@/design-system/components/Badge";
import type { AchievementBehaviorPillar } from "@/domain/achievement/constants";

export type AchievementId =
  | "first_workout"
  | "first_technique_analysis"
  | "workouts_10"
  | "technique_plus_10"
  | "first_pr"
  | "consistency_12_weeks"
  | "competition_completed";

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  pillar: AchievementBehaviorPillar;
  /** What positive behavior this reinforces. */
  reinforces: string;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
};

export const ACHIEVEMENT_CATALOG: readonly AchievementDefinition[] = [
  {
    id: "first_workout",
    title: "First Workout",
    description: "Complete your first training session.",
    pillar: "getting_started",
    reinforces: "Showing up and finishing a session.",
    badgeLabel: "First Workout",
    badgeVariant: "accent",
  },
  {
    id: "first_technique_analysis",
    title: "First Technique Analysis",
    description:
      "Complete a technique analysis with a real score — not just an upload.",
    pillar: "technique",
    reinforces: "Filming and reviewing technique.",
    badgeLabel: "First Technique",
    badgeVariant: "info",
  },
  {
    id: "workouts_10",
    title: "10 Workouts",
    description: "Complete 10 training sessions.",
    pillar: "consistency",
    reinforces: "Building a repeatable training habit.",
    badgeLabel: "10 Workouts",
    badgeVariant: "accent",
  },
  {
    id: "technique_plus_10",
    title: "Technique +10 Improvement",
    description:
      "Improve a technique score by at least 10 points across analyses.",
    pillar: "technique",
    reinforces: "Iterating on movement quality over time.",
    badgeLabel: "Technique +10",
    badgeVariant: "success",
  },
  {
    id: "first_pr",
    title: "First PR",
    description:
      "Log your first personal record from training data (not an invented score).",
    pillar: "strength_logging",
    reinforces: "Honest logging of strength progress.",
    badgeLabel: "First PR",
    badgeVariant: "accent",
  },
  {
    id: "consistency_12_weeks",
    title: "12-Week Consistency",
    description:
      "Train in 12 distinct calendar weeks — sustainability over intensity spikes.",
    pillar: "consistency",
    reinforces: "Long-horizon consistency.",
    badgeLabel: "12-Week Consistency",
    badgeVariant: "success",
  },
  {
    id: "competition_completed",
    title: "Competition Completed",
    description: "Mark a Competition Mode prep as completed.",
    pillar: "competition_prep",
    reinforces: "Following through on a meet plan.",
    badgeLabel: "Competition Done",
    badgeVariant: "info",
  },
] as const;

export function getAchievementById(
  id: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENT_CATALOG.find((a) => a.id === id);
}

/** Soft cap — product rule against catalog bloat. */
export const ACHIEVEMENT_CATALOG_MAX = 12;

export function assertCatalogSize(): void {
  if (ACHIEVEMENT_CATALOG.length > ACHIEVEMENT_CATALOG_MAX) {
    throw new Error(
      `Achievement catalog exceeds max ${ACHIEVEMENT_CATALOG_MAX} — avoid excessive gamification.`,
    );
  }
}
