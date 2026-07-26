import { describe, expect, it } from "vitest";
import {
  FEATURED_METHOD_GRAPH_PATH,
  METHOD_GRAPH_NODE_KINDS,
  buildTrainingMethodKnowledgeGraph,
  neighborsForMethodGraphNode,
  walkFeaturedMethodGraphPath,
} from "@/domain/training-method-knowledge-graph";

describe("training-method-knowledge-graph", () => {
  const graph = buildTrainingMethodKnowledgeGraph();

  it("includes all required node kinds", () => {
    for (const kind of METHOD_GRAPH_NODE_KINDS) {
      expect(graph.nodes.some((n) => n.kind === kind)).toBe(true);
    }
  });

  it("walks the featured Conjugate → Westside → Max effort → Dynamic effort → Powerlifting path", () => {
    const walked = walkFeaturedMethodGraphPath();
    expect(walked).not.toBeNull();
    expect(walked!.map((s) => s.id)).toEqual(
      FEATURED_METHOD_GRAPH_PATH.map((s) => s.id),
    );
    expect(walked!.map((s) => s.label).join(" → ")).toMatch(
      /Conjugate.*Westside.*Max effort.*Dynamic effort.*Powerlifting/i,
    );
  });

  it("exposes neighbors for conjugate including Westside and intensity strategies", () => {
    const neighbors = neighborsForMethodGraphNode("method", "conjugate");
    const ids = neighbors.map((n) => n.node.id);
    expect(ids).toContain("westside-barbell");
    expect(ids).toContain("max-effort");
    expect(ids).toContain("dynamic-effort");
    expect(ids).toContain("powerlifting");
  });

  it("only keeps edges whose endpoints exist", () => {
    const keys = new Set(graph.nodes.map((n) => `${n.kind}:${n.id}`));
    for (const e of graph.edges) {
      expect(keys.has(`${e.fromKind}:${e.fromId}`)).toBe(true);
      expect(keys.has(`${e.toKind}:${e.toId}`)).toBe(true);
    }
  });

  it("stays educational — honesty layers present", () => {
    expect(graph.honesty.length).toBeGreaterThanOrEqual(2);
    expect(graph.honesty.join(" ")).toMatch(/Westside|Louie|Soviet/i);
  });
});
