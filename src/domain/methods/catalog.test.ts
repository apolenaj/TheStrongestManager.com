import { describe, expect, it } from "vitest";
import {
  allMethodSlugs,
  getMethodDetail,
  getRelatedMethods,
  searchMethods,
} from "@/domain/methods";
import { METHOD_DETAIL_SECTIONS } from "@/domain/methods/types";

describe("training methods catalog", () => {
  it("publishes the required method examples", () => {
    const slugs = allMethodSlugs();
    expect(slugs).toEqual(
      expect.arrayContaining([
        "linear-periodization",
        "block-periodization",
        "daily-undulating-periodization",
        "conjugate",
        "high-frequency-training",
        "high-intensity-training",
        "rest-pause",
        "myo-reps",
        "cluster-sets",
        "german-volume-training",
      ]),
    );
    expect(slugs).toHaveLength(10);
  });

  it("keeps historical and modern layers distinct on each method", () => {
    const method = getMethodDetail("conjugate");
    expect(method).not.toBeNull();
    expect(method!.origins.length).toBeGreaterThan(80);
    expect(method!.modernInterpretation.length).toBeGreaterThan(80);
    expect(method!.origins).not.toEqual(method!.modernInterpretation);
    expect(method!.evidenceHonesty.toLowerCase()).toMatch(/evidence|historical|practice/);
  });

  it("filters by category and search query", () => {
    const pl = searchMethods({ category: "powerlifting" });
    expect(pl.length).toBeGreaterThan(0);
    expect(pl.every((m) => m.categories.includes("powerlifting"))).toBe(true);

    const dup = searchMethods({ q: "undulating" });
    expect(dup.some((m) => m.slug === "daily-undulating-periodization")).toBe(
      true,
    );
  });

  it("resolves related methods and detail sections", () => {
    const gvt = getMethodDetail("german-volume-training")!;
    const related = getRelatedMethods(gvt);
    expect(related.length).toBeGreaterThan(0);
    expect(METHOD_DETAIL_SECTIONS.map((s) => s.id)).toContain("modern");
    expect(METHOD_DETAIL_SECTIONS.map((s) => s.id)).toContain("origins");
  });
});
