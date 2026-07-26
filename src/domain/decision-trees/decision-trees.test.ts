import { describe, expect, it } from "vitest";
import {
  DECISION_TREE_CATALOG,
  DECISION_TREE_HONESTY,
  DECISION_TREE_MEDICAL_DISCLAIMER,
  allDecisionTreeSlugs,
  getDecisionTreeBySlug,
  resolveDecisionTreePath,
  validateDecisionTreeIntegrity,
} from "@/domain/decision-trees";

describe("decision-trees", () => {
  it("ships the four example trees", () => {
    expect(allDecisionTreeSlugs()).toEqual([
      "should-i-deload",
      "should-i-increase-weight",
      "which-deadlift-variation",
      "do-i-need-more-volume",
    ]);
  });

  it("keeps every tree structurally valid with explained rules", () => {
    for (const tree of DECISION_TREE_CATALOG) {
      expect(validateDecisionTreeIntegrity(tree)).toEqual([]);
    }
  });

  it("resolves deload path and explains rules", () => {
    const tree = getDecisionTreeBySlug("should-i-deload")!;
    const resolved = resolveDecisionTreePath(tree, ["pain_no", "fat_down"]);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.result.outcome.id).toBe("out_deload_yes");
    expect(resolved.result.rulesApplied.length).toBe(2);
    expect(resolved.result.rulesApplied[0]?.ruleId).toBe(
      "deload.no_pain_continue",
    );
    expect(resolved.result.sharePath).toContain("path=pain_no.fat_down");
  });

  it("routes pain to seek-care outcome without pretending medical coverage", () => {
    const tree = getDecisionTreeBySlug("should-i-deload")!;
    const resolved = resolveDecisionTreePath(tree, ["pain_yes"]);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.result.outcome.id).toBe("out_seek_care");
    expect(resolved.result.outcome.summary).toMatch(/medical|professional/i);
  });

  it("rejects incomplete paths instead of inventing outcomes", () => {
    const tree = getDecisionTreeBySlug("should-i-increase-weight")!;
    const resolved = resolveDecisionTreePath(tree, ["tech_yes"]);
    expect(resolved.ok).toBe(false);
  });

  it("states that trees do not replace professional medical advice", () => {
    const blob = [...DECISION_TREE_HONESTY, DECISION_TREE_MEDICAL_DISCLAIMER].join(
      " ",
    );
    expect(blob).toMatch(/medical advice/i);
    expect(blob).toMatch(/not replace/i);
  });
});
