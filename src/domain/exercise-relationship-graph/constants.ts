/**
 * Exercise Relationship Graph (Prompt 109).
 * Typed edges only — never invent arbitrary similarity links.
 */

export const EXERCISE_RELATIONSHIP_GRAPH_VERSION =
  "exercise_relationship_graph.v1" as const;

/** Allowed relation kinds — the only edges the graph may emit. */
export const EXERCISE_GRAPH_RELATION_KINDS = [
  "variation",
  "muscle",
  "weak_point",
  "sport",
  "method",
  "technique_issue",
] as const;

export type ExerciseGraphRelationKind =
  (typeof EXERCISE_GRAPH_RELATION_KINDS)[number];

/** Variation subtypes from curated catalog relations / related refs. */
export const EXERCISE_GRAPH_VARIATION_SUBTYPES = [
  "variation",
  "regression",
  "progression",
] as const;

export type ExerciseGraphVariationSubtype =
  (typeof EXERCISE_GRAPH_VARIATION_SUBTYPES)[number];

export const EXERCISE_GRAPH_HONESTY = [
  "Edges come only from curated catalog fields, prescription rules, technique maps, and method-by-pattern tables.",
  "The graph never invents similarity, embedding, or arbitrary “related” links.",
  "Missing a page or slug means no edge — not a stub URL.",
] as const;

/** Provenance tags for auditability. */
export const EXERCISE_GRAPH_SOURCES = [
  "priority_exercise_relations",
  "seed_related_ref",
  "seed_muscles",
  "seed_sport_relevance",
  "prescription_rules",
  "methods_by_pattern",
  "technique_component_drills",
  "technique_feedback_rules",
] as const;

export type ExerciseGraphSource = (typeof EXERCISE_GRAPH_SOURCES)[number];
