import { describe, expect, it } from "vitest";
import {
  LEGENDARY_METHOD_PROFILES,
  LEGENDARY_METHODS_OG_IMAGE_PATH,
  assertLegendaryMethodRegistryIntegrity,
  canPublishLegendaryMethod,
  getPublishedLegendaryMethods,
  legendaryMethodsLibraryJsonLd,
  listLegendaryMethodCards,
} from "@/domain/legendary-methods";
import { articleJsonLd, breadcrumbJsonLd } from "@/domain/seo";
import { absoluteUrl } from "@/config/site";

describe("legendary methods SEO and publish integrity", () => {
  it("builds CollectionPage + BreadcrumbList for the library", () => {
    const graphs = legendaryMethodsLibraryJsonLd({
      name: "Legendary Training Methods",
      description: "Independent educational analyses.",
      cards: listLegendaryMethodCards(getPublishedLegendaryMethods()),
    });
    expect(graphs.some((g) => g["@type"] === "CollectionPage")).toBe(true);
    expect(graphs.some((g) => g["@type"] === "BreadcrumbList")).toBe(true);
  });

  it("builds Article schema with author, dates, and abstract image", () => {
    const json = articleJsonLd({
      headline: "Test Profile",
      description: "Independent educational analysis.",
      path: "/legendary-methods/test",
      datePublished: "2026-07-28",
      dateModified: "2026-07-29",
      image: absoluteUrl(LEGENDARY_METHODS_OG_IMAGE_PATH),
    });
    expect(json["@type"]).toBe("Article");
    expect(json.datePublished).toBe("2026-07-28");
    expect(json.dateModified).toBe("2026-07-29");
    expect(json.image).toEqual([absoluteUrl(LEGENDARY_METHODS_OG_IMAGE_PATH)]);
    expect(String(JSON.stringify(json))).toContain(
      "The Strongest editorial team",
    );
    expect(String(JSON.stringify(json))).toContain("Josef");
    expect(String(JSON.stringify(json))).not.toMatch(/athlete.*photo/i);
  });

  it("builds BreadcrumbList for profile paths", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Legendary Methods", path: "/legendary-methods" },
      { name: "Test", path: "/legendary-methods/test" },
    ]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
  });

  it("keeps SEO titles and descriptions unique across the registry", () => {
    expect(assertLegendaryMethodRegistryIntegrity(LEGENDARY_METHOD_PROFILES).ok).toBe(
      true,
    );
    const titles = new Set(
      LEGENDARY_METHOD_PROFILES.map((p) => p.seo.title.trim().toLowerCase()),
    );
    const descriptions = new Set(
      LEGENDARY_METHOD_PROFILES.map((p) =>
        p.seo.description.trim().toLowerCase(),
      ),
    );
    expect(titles.size).toBe(LEGENDARY_METHOD_PROFILES.length);
    expect(descriptions.size).toBe(LEGENDARY_METHOD_PROFILES.length);
  });

  it("meets publish gates including disclaimer, sources, and legal review for every registry profile", () => {
    for (const profile of LEGENDARY_METHOD_PROFILES) {
      expect(canPublishLegendaryMethod(profile)).toBe(true);
      expect(profile.introductoryDisclaimer.trim().length).toBeGreaterThan(40);
      expect(profile.sources.length).toBeGreaterThanOrEqual(3);
      expect(profile.evidenceQuality).toBeTruthy();
      expect(profile.legalReviewStatus).toBe("passed");
    }
  });

  it("still rejects a synthetic profile that has not cleared legal review", () => {
    const syntheticPendingReview = {
      ...LEGENDARY_METHOD_PROFILES[0]!,
      legalReviewStatus: "pending" as const,
    };
    expect(canPublishLegendaryMethod(syntheticPendingReview)).toBe(false);
  });

  it("does not put athlete photos in the OG image path", () => {
    expect(LEGENDARY_METHODS_OG_IMAGE_PATH).toBe(
      "/legendary-methods/opengraph-image",
    );
    expect(LEGENDARY_METHODS_OG_IMAGE_PATH).not.toMatch(/athlete|portrait|photo/i);
  });
});
