export {
  EXERCISE_RELATIONSHIP_GRAPH_VERSION,
  EXERCISE_GRAPH_RELATION_KINDS,
  EXERCISE_GRAPH_VARIATION_SUBTYPES,
  EXERCISE_GRAPH_HONESTY,
  EXERCISE_GRAPH_SOURCES,
} from "@/domain/exercise-relationship-graph/constants";
export type {
  ExerciseGraphRelationKind,
  ExerciseGraphVariationSubtype,
  ExerciseGraphSource,
} from "@/domain/exercise-relationship-graph/constants";

export type {
  ExerciseGraphTargetKind,
  ExerciseGraphEdge,
  ExerciseGraphNodeSummary,
  ExerciseRelationshipGraph,
  ExerciseGraphNeighborGroup,
  ExerciseGraphRelatedContentLink,
  ExerciseGraphRecommendationHint,
} from "@/domain/exercise-relationship-graph/types";

export {
  buildExerciseRelationshipGraph,
  getExerciseRelationshipGraph,
  resetExerciseRelationshipGraphCache,
  edgesForExercise,
  neighborGroupsForExercise,
  relatedContentFromGraph,
  recommendationHintsForWeakPoint,
  variationNeighborSlugs,
} from "@/domain/exercise-relationship-graph/build-graph";
