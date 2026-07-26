/**
 * Exercise Relationship Graph service — Prompt 109.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  getExerciseRelationshipGraph,
  neighborGroupsForExercise,
  recommendationHintsForWeakPoint,
  relatedContentFromGraph,
  variationNeighborSlugs,
  type ExerciseGraphNeighborGroup,
  type ExerciseGraphRecommendationHint,
  type ExerciseGraphRelatedContentLink,
  type ExerciseRelationshipGraph,
} from "@/domain/exercise-relationship-graph";

export async function getExerciseGraphOverview(): Promise<
  | { ok: true; graph: ExerciseRelationshipGraph }
  | { ok: false; error: string }
> {
  if (!featureFlags.exerciseRelationshipGraph) {
    return {
      ok: false,
      error: "Exercise Relationship Graph is not enabled.",
    };
  }
  return { ok: true, graph: getExerciseRelationshipGraph() };
}

export async function getExerciseGraphNeighbors(input: {
  exerciseSlug: string;
}): Promise<
  | {
      ok: true;
      groups: ExerciseGraphNeighborGroup[];
      relatedContent: ExerciseGraphRelatedContentLink[];
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.exerciseRelationshipGraph) {
    return {
      ok: false,
      error: "Exercise Relationship Graph is not enabled.",
    };
  }
  const slug = input.exerciseSlug.trim();
  if (!slug) {
    return { ok: false, error: "Exercise slug required." };
  }
  return {
    ok: true,
    groups: neighborGroupsForExercise(slug),
    relatedContent: relatedContentFromGraph(slug),
  };
}

export function graphRecommendationHintsForWeakPoint(
  weakPointId: string,
): ExerciseGraphRecommendationHint[] {
  if (!featureFlags.exerciseRelationshipGraph) return [];
  return recommendationHintsForWeakPoint(weakPointId);
}

export function graphVariationNeighborSlugs(exerciseSlug: string): string[] {
  if (!featureFlags.exerciseRelationshipGraph) return [];
  return variationNeighborSlugs(exerciseSlug);
}

export function graphRelatedContent(
  exerciseSlug: string,
): ExerciseGraphRelatedContentLink[] {
  if (!featureFlags.exerciseRelationshipGraph) return [];
  return relatedContentFromGraph(exerciseSlug);
}
