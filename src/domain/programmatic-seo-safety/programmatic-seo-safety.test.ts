import { describe, expect, it } from "vitest";
import {
  PROGRAMMATIC_SEO_HONESTY,
  PROGRAMMATIC_SEO_PAGES,
  PROGRAMMATIC_SEO_REFUSED,
  PROGRAMMATIC_SEO_TEMPLATES,
  buildProgrammaticSeoSafetySnapshot,
  evaluateProgrammaticSeoQuality,
  listIndexableProgrammaticSeoPaths,
} from "@/domain/programmatic-seo-safety";

describe("programmatic SEO safety", () => {
  it("allowlists useful templates and refuses thin factories", () => {
    expect(PROGRAMMATIC_SEO_TEMPLATES.map((t) => t.id)).toEqual([
      "deadlift_variations",
      "exercise_comparison",
      "method_comparison",
    ]);
    expect(PROGRAMMATIC_SEO_REFUSED.map((r) => r.id)).toEqual(
      expect.arrayContaining([
        "cartesian_facets",
        "variation_slug_factory",
        "all_compare_canonicals",
        "ai_stub_bulk",
      ]),
    );
    expect(PROGRAMMATIC_SEO_HONESTY.join(" ")).toMatch(/thin/i);
  });

  it("requires unique value, depth, links, and structured-data readiness", () => {
    for (const page of PROGRAMMATIC_SEO_PAGES) {
      const result = evaluateProgrammaticSeoQuality(page);
      expect(result.passed, page.slug).toBe(true);
      expect(result.structuredDataReady, page.slug).toBe(true);
    }

    const thin = evaluateProgrammaticSeoQuality({
      slug: "thin-stub",
      templateId: "exercise_comparison",
      title: "A vs B",
      description: "Short",
      overview: "Too short.",
      uniqueValueKey: "x",
      sections: [{ heading: "One", body: "Tiny." }],
      internalLinks: [{ href: "/exercises/deadlift", title: "D", reason: "r" }],
      faqs: [],
    });
    expect(thin.passed).toBe(false);
    expect(thin.checks.some((c) => !c.ok)).toBe(true);
  });

  it("lists only quality-passed paths for the sitemap", () => {
    const paths = listIndexableProgrammaticSeoPaths();
    expect(paths.length).toBe(PROGRAMMATIC_SEO_PAGES.length);
    expect(paths.every((p) => p.startsWith("/guides/"))).toBe(true);

    const snap = buildProgrammaticSeoSafetySnapshot(
      "2026-07-22T00:00:00.000Z",
    );
    expect(snap.indexableCount).toBe(PROGRAMMATIC_SEO_PAGES.length);
    expect(snap.rejectedCount).toBe(0);
    expect(snap.duplicateKeys).toEqual([]);
  });
});
