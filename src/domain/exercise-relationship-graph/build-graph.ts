/**
 * Build the Exercise Relationship Graph from explicit curated sources only.
 */

import {
  EXERCISE_GRAPH_HONESTY,
  EXERCISE_GRAPH_RELATION_KINDS,
  EXERCISE_RELATIONSHIP_GRAPH_VERSION,
  type ExerciseGraphRelationKind,
  type ExerciseGraphVariationSubtype,
} from "@/domain/exercise-relationship-graph/constants";
import type {
  ExerciseGraphEdge,
  ExerciseGraphNeighborGroup,
  ExerciseGraphNodeSummary,
  ExerciseGraphRecommendationHint,
  ExerciseGraphRelatedContentLink,
  ExerciseRelationshipGraph,
} from "@/domain/exercise-relationship-graph/types";
import {
  WEAK_POINT_LABELS,
  type WeakPointId,
} from "@/domain/exercise-prescription/constants";
import { PRESCRIPTION_RULES } from "@/domain/exercise-prescription/rules";
import { relatedMethodsForPattern } from "@/domain/exercises/detail-presentation";
import {
  PRIORITY_EXERCISES,
  PRIORITY_EXERCISE_RELATIONS,
} from "@/domain/exercises/priority-seed";
import type { MuscleKey, SportKey } from "@/domain/exercises/types";
import { DEADLIFT_FEEDBACK_RULES } from "@/domain/technique/feedback/rules";
import { explicitTechniqueExerciseLinks } from "@/domain/technique/report-presentation";

const MUSCLE_LABELS: Partial<Record<MuscleKey, string>> = {
  quads: "Quads",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  adductors: "Adductors",
  abductors: "Abductors",
  calves: "Calves",
  erectors: "Erectors",
  abs: "Abs",
  obliques: "Obliques",
  chest: "Chest",
  upper_back: "Upper back",
  lats: "Lats",
  traps: "Traps",
  rear_delts: "Rear delts",
  side_delts: "Side delts",
  front_delts: "Front delts",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  hip_flexors: "Hip flexors",
};

const SPORT_LABELS: Record<SportKey, string> = {
  powerlifting: "Powerlifting",
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  weightlifting: "Weightlifting",
  general_strength: "General strength",
  hybrid: "Hybrid",
};

const EXERCISE_NAME_BY_SLUG = Object.fromEntries(
  PRIORITY_EXERCISES.map((e) => [e.slug, e.name]),
) as Record<string, string>;

function edgeKey(edge: ExerciseGraphEdge): string {
  return [
    edge.fromExerciseSlug,
    edge.relation,
    edge.targetKind,
    edge.targetId,
    edge.variationSubtype ?? "",
    edge.muscleRole ?? "",
  ].join("|");
}

function dedupeEdges(edges: ExerciseGraphEdge[]): ExerciseGraphEdge[] {
  const seen = new Set<string>();
  const out: ExerciseGraphEdge[] = [];
  for (const edge of edges) {
    const key = edgeKey(edge);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(edge);
  }
  return out;
}

function variationEdges(): ExerciseGraphEdge[] {
  const edges: ExerciseGraphEdge[] = [];

  for (const rel of PRIORITY_EXERCISE_RELATIONS) {
    const subtype = rel.relationType as ExerciseGraphVariationSubtype;
    if (
      subtype !== "variation" &&
      subtype !== "regression" &&
      subtype !== "progression"
    ) {
      continue;
    }
    edges.push({
      fromExerciseSlug: rel.fromSlug,
      relation: "variation",
      targetKind: "exercise",
      targetId: rel.toSlug,
      label: EXERCISE_NAME_BY_SLUG[rel.toSlug] ?? rel.toSlug,
      note: rel.note,
      source: "priority_exercise_relations",
      variationSubtype: subtype,
    });
  }

  for (const exercise of PRIORITY_EXERCISES) {
    const packs: Array<{
      refs: typeof exercise.variations;
      subtype: ExerciseGraphVariationSubtype;
    }> = [
      { refs: exercise.variations, subtype: "variation" },
      { refs: exercise.regressions, subtype: "regression" },
      { refs: exercise.progressions, subtype: "progression" },
    ];
    for (const pack of packs) {
      for (const ref of pack.refs) {
        // Only explicit catalog slugs — never invent pages from labels alone.
        if (!ref.relatedSlug) continue;
        edges.push({
          fromExerciseSlug: exercise.slug,
          relation: "variation",
          targetKind: "exercise",
          targetId: ref.relatedSlug,
          label: ref.label,
          note: ref.note,
          source: "seed_related_ref",
          variationSubtype: pack.subtype,
        });
      }
    }
  }

  return edges;
}

function muscleEdges(): ExerciseGraphEdge[] {
  const edges: ExerciseGraphEdge[] = [];
  for (const exercise of PRIORITY_EXERCISES) {
    for (const muscle of exercise.primaryMuscles) {
      edges.push({
        fromExerciseSlug: exercise.slug,
        relation: "muscle",
        targetKind: "muscle",
        targetId: muscle,
        label: MUSCLE_LABELS[muscle] ?? muscle,
        note: "Primary muscle from exercise seed",
        source: "seed_muscles",
        muscleRole: "primary",
      });
    }
    for (const muscle of exercise.secondaryMuscles) {
      edges.push({
        fromExerciseSlug: exercise.slug,
        relation: "muscle",
        targetKind: "muscle",
        targetId: muscle,
        label: MUSCLE_LABELS[muscle] ?? muscle,
        note: "Secondary muscle from exercise seed",
        source: "seed_muscles",
        muscleRole: "secondary",
      });
    }
  }
  return edges;
}

function sportEdges(): ExerciseGraphEdge[] {
  const edges: ExerciseGraphEdge[] = [];
  for (const exercise of PRIORITY_EXERCISES) {
    for (const [sport, level] of Object.entries(exercise.sportRelevance) as Array<
      [SportKey, string]
    >) {
      if (level !== "high" && level !== "moderate") continue;
      edges.push({
        fromExerciseSlug: exercise.slug,
        relation: "sport",
        targetKind: "sport",
        targetId: sport,
        label: SPORT_LABELS[sport] ?? sport,
        note: `${level} relevance in catalog tagging`,
        source: "seed_sport_relevance",
        sportLevel: level,
      });
    }
  }
  return edges;
}

function methodEdges(): ExerciseGraphEdge[] {
  const edges: ExerciseGraphEdge[] = [];
  for (const exercise of PRIORITY_EXERCISES) {
    for (const method of relatedMethodsForPattern(exercise.movementPattern)) {
      edges.push({
        fromExerciseSlug: exercise.slug,
        relation: "method",
        targetKind: "method",
        targetId: method.slug,
        label: method.name,
        note: method.note,
        source: "methods_by_pattern",
      });
    }
  }
  return edges;
}

function prescriptionProbe(weakPoint: WeakPointId): import("@/domain/exercise-prescription/types").ExercisePrescriptionInputs {
  return {
    goal: "strength",
    sport: null,
    weakPoint,
    equipment: [],
    experience: null,
    techniqueLimitations: null,
    painFlags: false,
    currentProgramExerciseSlugs: [],
    currentProgramPatterns: [],
  };
}

function weakPointEdges(): ExerciseGraphEdge[] {
  const edges: ExerciseGraphEdge[] = [];
  const weakPoints = (Object.keys(WEAK_POINT_LABELS) as WeakPointId[]).filter(
    (id) => id !== "none",
  );

  for (const rule of PRESCRIPTION_RULES) {
    // Only rules that bind exactly one weak point — skip equipment/fatigue-only rules.
    const matched = weakPoints.filter((wp) => rule.when(prescriptionProbe(wp)));
    if (matched.length !== 1) continue;
    const weakPoint = matched[0]!;
    if (rule.when(prescriptionProbe("none"))) continue;

    for (const effect of rule.effects) {
      edges.push({
        fromExerciseSlug: effect.slug,
        relation: "weak_point",
        targetKind: "weak_point",
        targetId: weakPoint,
        label: WEAK_POINT_LABELS[weakPoint],
        note: effect.reason,
        source: "prescription_rules",
      });
    }
  }
  return edges;
}

function techniqueIssueEdges(): ExerciseGraphEdge[] {
  const edges: ExerciseGraphEdge[] = [];

  for (const link of explicitTechniqueExerciseLinks()) {
    edges.push({
      fromExerciseSlug: link.exerciseSlug,
      relation: "technique_issue",
      targetKind: "technique_issue",
      targetId: link.techniqueIssueId,
      label: link.techniqueIssueId.replaceAll("_", " "),
      note: link.note,
      source: "technique_component_drills",
    });
  }

  for (const rule of DEADLIFT_FEEDBACK_RULES) {
    for (const template of rule.templates) {
      if (!template.exerciseSlug) continue;
      edges.push({
        fromExerciseSlug: template.exerciseSlug,
        relation: "technique_issue",
        targetKind: "technique_issue",
        targetId: rule.componentId,
        label: rule.issueLabel,
        note: template.title,
        source: "technique_feedback_rules",
      });
    }
  }

  return edges;
}

function summarizeNodes(edges: ExerciseGraphEdge[]): ExerciseGraphNodeSummary[] {
  const bySlug = new Map<string, ExerciseGraphEdge[]>();
  for (const edge of edges) {
    const list = bySlug.get(edge.fromExerciseSlug) ?? [];
    list.push(edge);
    bySlug.set(edge.fromExerciseSlug, list);
  }

  return [...bySlug.entries()]
    .map(([exerciseSlug, list]) => {
      const byRelation = Object.fromEntries(
        EXERCISE_GRAPH_RELATION_KINDS.map((k) => [k, 0]),
      ) as Record<ExerciseGraphRelationKind, number>;
      for (const edge of list) {
        byRelation[edge.relation] += 1;
      }
      return {
        exerciseSlug,
        edgeCount: list.length,
        byRelation,
      };
    })
    .sort((a, b) => a.exerciseSlug.localeCompare(b.exerciseSlug));
}

/** Build the full immutable graph from curated sources. */
export function buildExerciseRelationshipGraph(): ExerciseRelationshipGraph {
  const edges = dedupeEdges([
    ...variationEdges(),
    ...muscleEdges(),
    ...sportEdges(),
    ...methodEdges(),
    ...weakPointEdges(),
    ...techniqueIssueEdges(),
  ]);

  return {
    engineVersion: EXERCISE_RELATIONSHIP_GRAPH_VERSION,
    honesty: EXERCISE_GRAPH_HONESTY,
    edges,
    nodes: summarizeNodes(edges),
  };
}

let cachedGraph: ExerciseRelationshipGraph | null = null;

export function getExerciseRelationshipGraph(): ExerciseRelationshipGraph {
  if (!cachedGraph) cachedGraph = buildExerciseRelationshipGraph();
  return cachedGraph;
}

/** Test helper — clear memoized graph after source mutations (none in prod). */
export function resetExerciseRelationshipGraphCache(): void {
  cachedGraph = null;
}

export function edgesForExercise(
  exerciseSlug: string,
  relation?: ExerciseGraphRelationKind,
): ExerciseGraphEdge[] {
  const graph = getExerciseRelationshipGraph();
  return graph.edges.filter(
    (e) =>
      e.fromExerciseSlug === exerciseSlug &&
      (relation == null || e.relation === relation),
  );
}

export function neighborGroupsForExercise(
  exerciseSlug: string,
): ExerciseGraphNeighborGroup[] {
  return EXERCISE_GRAPH_RELATION_KINDS.map((relation) => ({
    relation,
    edges: edgesForExercise(exerciseSlug, relation),
  })).filter((g) => g.edges.length > 0);
}

/**
 * Related content links for SEO / detail rails.
 * Only real deep URLs — never stubs.
 */
export function relatedContentFromGraph(
  exerciseSlug: string,
): ExerciseGraphRelatedContentLink[] {
  const links: ExerciseGraphRelatedContentLink[] = [];
  const seen = new Set<string>();

  for (const edge of edgesForExercise(exerciseSlug)) {
    let href: string | null = null;
    let title = edge.label;
    let reason = edge.note ?? `${edge.relation} link from exercise graph`;

    if (edge.relation === "variation" && edge.targetKind === "exercise") {
      href = `/exercises/${edge.targetId}`;
      title = edge.label;
      reason = edge.note ?? `Curated ${edge.variationSubtype ?? "variation"}`;
    } else if (edge.relation === "method" && edge.targetKind === "method") {
      href = `/methods/${edge.targetId}`;
    } else if (edge.relation === "muscle" && edge.targetKind === "muscle") {
      href = `/exercises?muscle=${edge.targetId}`;
      reason = `${edge.muscleRole ?? "listed"} muscle tag`;
    } else if (edge.relation === "sport" && edge.targetKind === "sport") {
      href = `/exercises?sport=${edge.targetId}`;
      reason = edge.note ?? "Catalog sport relevance";
    } else if (
      edge.relation === "technique_issue" &&
      edge.targetKind === "technique_issue"
    ) {
      href = "/learn/technique-errors";
      reason = edge.note ?? "Technique issue linked from curated drills";
    } else if (
      edge.relation === "weak_point" &&
      edge.targetKind === "weak_point"
    ) {
      href = `/app/exercise-prescription?weakPoint=${edge.targetId}`;
      reason = edge.note ?? "Prescription weak-point mapping";
    }

    if (!href || seen.has(href)) continue;
    seen.add(href);
    links.push({
      href,
      title,
      reason,
      relation: edge.relation,
    });
  }

  return links;
}

/** Recommendation hints: exercises mapped to a weak point via prescription rules. */
export function recommendationHintsForWeakPoint(
  weakPointId: string,
): ExerciseGraphRecommendationHint[] {
  return getExerciseRelationshipGraph()
    .edges.filter(
      (e) =>
        e.relation === "weak_point" &&
        e.targetId === weakPointId &&
        e.targetKind === "weak_point",
    )
    .map((e) => ({
      exerciseSlug: e.fromExerciseSlug,
      weakPointId: e.targetId,
      label: EXERCISE_NAME_BY_SLUG[e.fromExerciseSlug] ?? e.fromExerciseSlug,
      note: e.note,
      source: e.source,
    }));
}

/** Variation neighbor slugs for related rails (explicit only). */
export function variationNeighborSlugs(exerciseSlug: string): string[] {
  return edgesForExercise(exerciseSlug, "variation").map((e) => e.targetId);
}
