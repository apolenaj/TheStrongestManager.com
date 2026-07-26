import type {
  ExerciseGraphRelationKind,
  ExerciseGraphSource,
  ExerciseGraphVariationSubtype,
} from "@/domain/exercise-relationship-graph/constants";

/** Target kinds for non-exercise nodes. */
export type ExerciseGraphTargetKind =
  | "exercise"
  | "muscle"
  | "weak_point"
  | "sport"
  | "method"
  | "technique_issue";

export type ExerciseGraphEdge = {
  /** Source exercise catalog slug. */
  fromExerciseSlug: string;
  relation: ExerciseGraphRelationKind;
  targetKind: ExerciseGraphTargetKind;
  /** Exercise slug, muscle key, weak-point id, sport key, method slug, or technique issue id. */
  targetId: string;
  label: string;
  note: string | null;
  source: ExerciseGraphSource;
  /** Only for relation === "variation". */
  variationSubtype?: ExerciseGraphVariationSubtype;
  /** Sport relevance level when relation === "sport". */
  sportLevel?: "high" | "moderate";
  /** Muscle role when relation === "muscle". */
  muscleRole?: "primary" | "secondary";
};

export type ExerciseGraphNodeSummary = {
  exerciseSlug: string;
  edgeCount: number;
  byRelation: Record<ExerciseGraphRelationKind, number>;
};

export type ExerciseRelationshipGraph = {
  engineVersion: string;
  honesty: readonly string[];
  edges: ExerciseGraphEdge[];
  nodes: ExerciseGraphNodeSummary[];
};

export type ExerciseGraphNeighborGroup = {
  relation: ExerciseGraphRelationKind;
  edges: ExerciseGraphEdge[];
};

export type ExerciseGraphRelatedContentLink = {
  href: string;
  title: string;
  reason: string;
  relation: ExerciseGraphRelationKind;
};

export type ExerciseGraphRecommendationHint = {
  exerciseSlug: string;
  weakPointId: string;
  label: string;
  note: string | null;
  source: ExerciseGraphSource;
};
