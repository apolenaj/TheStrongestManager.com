/**
 * Academy 2.0 learning paths (Prompt 174).
 */

import type { AcademyLearningPath } from "@/domain/academy/types";

export const ACADEMY_LEARNING_PATHS: readonly AcademyLearningPath[] = [
  {
    slug: "athlete-strength-foundations",
    title: "Athlete strength foundations",
    summary:
      "Start with programming basics, then specialize on the deadlift. Prerequisites unlock honestly from Certificates of Completion.",
    audience: "athlete",
    courseSlugs: ["programming-fundamentals", "deadlift-specialist"],
    estimatedHours: 9,
  },
  {
    slug: "powerlifting-competitor-path",
    title: "Powerlifting competitor path",
    summary:
      "Programming fundamentals → powerlifting programming → deadlift specialist. Built for athletes chasing SBD specificity.",
    audience: "athlete",
    courseSlugs: [
      "programming-fundamentals",
      "powerlifting-programming",
      "deadlift-specialist",
    ],
    estimatedHours: 14,
  },
  {
    slug: "coach-curriculum",
    title: "Coach curriculum",
    summary:
      "Strength coaching ethics and cueing, then programming fundamentals and powerlifting programming — a coach-oriented learning path, not an accredited credential.",
    audience: "coach",
    courseSlugs: [
      "strength-coaching",
      "programming-fundamentals",
      "powerlifting-programming",
    ],
    estimatedHours: 14,
  },
] as const;

export function listAcademyPaths(): AcademyLearningPath[] {
  return [...ACADEMY_LEARNING_PATHS];
}

export function getAcademyPathBySlug(
  slug: string,
): AcademyLearningPath | null {
  return ACADEMY_LEARNING_PATHS.find((p) => p.slug === slug) ?? null;
}

export function allAcademyPathSlugs(): string[] {
  return ACADEMY_LEARNING_PATHS.map((p) => p.slug);
}
