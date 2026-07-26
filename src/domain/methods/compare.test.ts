import { describe, expect, it } from "vitest";
import {
  buildMethodComparison,
  buildSharePath,
  parseMethodCompareParam,
} from "@/domain/methods/compare";
import { METHOD_COMPARISON_PROFILES } from "@/domain/methods/comparison-profiles";
import { allMethodSlugs } from "@/domain/methods/search";

describe("method comparison", () => {
  it("has a qualitative profile for every published method", () => {
    const slugs = allMethodSlugs();
    for (const slug of slugs) {
      expect(METHOD_COMPARISON_PROFILES.some((p) => p.slug === slug)).toBe(
        true,
      );
    }
  });

  it("parses shareable methods query and builds DUP vs Block", () => {
    const slugs = parseMethodCompareParam(
      "daily-undulating-periodization,block-periodization",
    );
    expect(slugs).toEqual([
      "daily-undulating-periodization",
      "block-periodization",
    ]);

    const view = buildMethodComparison(slugs);
    expect(view.methods).toHaveLength(2);
    expect(view.title).toContain("vs");
    expect(view.rows.some((r) => r.dimensionId === "primaryPurpose")).toBe(
      true,
    );
    expect(view.rows.some((r) => r.dimensionId === "fatigue")).toBe(true);
    expect(view.sharePath).toBe(
      "/compare?methods=daily-undulating-periodization,block-periodization",
    );

    // No numeric total / invented score fields
    const serialized = JSON.stringify(view.rows);
    expect(serialized).not.toMatch(/"score":\s*\d/);
    expect(serialized).not.toMatch(/overallScore/);
  });

  it("caps at 3 methods and builds share paths", () => {
    const view = buildMethodComparison([
      "conjugate",
      "cluster-sets",
      "rest-pause",
      "myo-reps",
    ]);
    expect(view.methods).toHaveLength(3);
    expect(view.warnings.some((w) => /first 3/i.test(w))).toBe(true);
    expect(buildSharePath(["a", "b"])).toBe("/compare?methods=a,b");
  });
});
