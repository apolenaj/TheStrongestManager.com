import { describe, expect, it } from "vitest";
import {
  EXERCISE_GRAPH_RELATION_KINDS,
  buildExerciseRelationshipGraph,
  edgesForExercise,
  recommendationHintsForWeakPoint,
  relatedContentFromGraph,
  variationNeighborSlugs,
} from "@/domain/exercise-relationship-graph";

describe("exercise-relationship-graph", () => {
  const graph = buildExerciseRelationshipGraph();

  it("only emits the six allowed relation kinds", () => {
    const allowed = new Set<string>(EXERCISE_GRAPH_RELATION_KINDS);
    for (const edge of graph.edges) {
      expect(allowed.has(edge.relation)).toBe(true);
    }
    expect(graph.edges.length).toBeGreaterThan(20);
  });

  it("builds variation edges from curated relations only (with slugs)", () => {
    const deadliftVariations = variationNeighborSlugs("deadlift");
    expect(deadliftVariations).toContain("romanian-deadlift");

    // Label-only variations without relatedSlug must not invent targets
    const squatVariations = edgesForExercise("back-squat", "variation");
    expect(
      squatVariations.every((e) => Boolean(e.targetId) && e.targetKind === "exercise"),
    ).toBe(true);
    expect(squatVariations.some((e) => e.targetId === "front-squat")).toBe(true);
    expect(squatVariations.some((e) => e.targetId === "leg-press")).toBe(true);
  });

  it("maps exercises to muscles and sports from seed tags", () => {
    const muscles = edgesForExercise("back-squat", "muscle");
    expect(muscles.some((e) => e.targetId === "quads" && e.muscleRole === "primary")).toBe(
      true,
    );

    const sports = edgesForExercise("back-squat", "sport");
    expect(sports.some((e) => e.targetId === "powerlifting" && e.sportLevel === "high")).toBe(
      true,
    );
  });

  it("links weak points only via prescription rules (not invented)", () => {
    const hints = recommendationHintsForWeakPoint("deadlift_lockout");
    expect(hints.map((h) => h.exerciseSlug)).toEqual(
      expect.arrayContaining(["romanian-deadlift", "hip-thrust", "deadlift"]),
    );
    expect(hints.every((h) => h.source === "prescription_rules")).toBe(true);
  });

  it("links technique issues from curated drills/feedback only", () => {
    const issues = edgesForExercise("romanian-deadlift", "technique_issue");
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((e) => e.targetKind === "technique_issue")).toBe(true);
  });

  it("related content only uses real deep URLs", () => {
    const links = relatedContentFromGraph("deadlift");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.href.startsWith("/")).toBe(true);
      expect(link.href.includes("undefined")).toBe(false);
    }
    expect(links.some((l) => l.href === "/exercises/romanian-deadlift")).toBe(
      true,
    );
  });

  it("does not create arbitrary cross-sport similarity edges", () => {
    // No "related because same equipment" style edges — equipment is not a relation kind
    expect(
      graph.edges.every((e) =>
        (EXERCISE_GRAPH_RELATION_KINDS as readonly string[]).includes(e.relation),
      ),
    ).toBe(true);
  });
});
