import { describe, expect, it } from "vitest";
import {
  SEO_TOPIC_CLUSTERS,
  allSeoClusterSlugs,
  buildPublicSitemapEntries,
  courseJsonLd,
  faqPageJsonLd,
  getSeoClusterBySlug,
  isIndexableSupportingHref,
  pillarPageJsonLd,
  videoObjectJsonLd,
} from "@/domain/seo";

describe("SEO content engine", () => {
  it("covers the nine core topic clusters", () => {
    const slugs = allSeoClusterSlugs();
    expect(slugs).toEqual(
      expect.arrayContaining([
        "exercise-technique",
        "exercise-variations",
        "training-methods",
        "powerlifting",
        "bodybuilding",
        "strongman",
        "programming",
        "technique-errors",
        "performance",
      ]),
    );
    expect(SEO_TOPIC_CLUSTERS).toHaveLength(9);
  });

  it("gives every pillar meaningful body content and real supporting links", () => {
    for (const cluster of SEO_TOPIC_CLUSTERS) {
      expect(cluster.overview.length).toBeGreaterThan(120);
      expect(cluster.sections.length).toBeGreaterThan(0);
      expect(cluster.supportingPages.length).toBeGreaterThan(0);
      for (const page of cluster.supportingPages) {
        expect(isIndexableSupportingHref(page.href)).toBe(true);
        expect(page.href.includes("?")).toBe(false);
      }
    }
  });

  it("emits FAQ / Video schema only when valid", () => {
    expect(faqPageJsonLd([])).toBeNull();
    expect(videoObjectJsonLd({ name: "x", description: "y", contentUrl: "" })).toBeNull();
    const faq = faqPageJsonLd([
      { question: "Q?", answer: "A." },
    ]);
    expect(faq?.["@type"]).toBe("FAQPage");
  });

  it("builds pillar JSON-LD with Article, BreadcrumbList, and FAQ when present", () => {
    const cluster = getSeoClusterBySlug("exercise-technique");
    expect(cluster).not.toBeNull();
    const graphs = pillarPageJsonLd(cluster!);
    const types = graphs.map((g) => g["@type"]);
    expect(types).toContain("Article");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");
  });

  it("labels Course schema as Certificate of Completion", () => {
    const course = courseJsonLd({
      name: "Deadlift Specialist",
      description: "Technique course",
      path: "/academy/deadlift-specialist",
    });
    expect(course["@type"]).toBe("Course");
    expect(course.educationalCredentialAwarded).toBe(
      "Certificate of Completion",
    );
  });

  it("includes learn pillars and curated catalogs in the sitemap", () => {
    const urls = buildPublicSitemapEntries().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/learn"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/learn/powerlifting"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/methods"))).toBe(true);
    expect(urls.some((u) => u.includes("/app/"))).toBe(false);
  });
});
