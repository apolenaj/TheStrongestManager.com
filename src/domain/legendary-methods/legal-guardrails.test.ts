import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LEGENDARY_ASSET_LICENCE_REGISTRY,
  LEGENDARY_EDITORIAL_LABEL_IDS,
  LEGENDARY_METHOD_PROFILES,
  LEGENDARY_PROHIBITED_IMAGE_CATEGORIES,
  LEGENDARY_PROHIBITED_PHRASES,
  allPublishedLegendaryMethodSlugs,
  assertNonOriginalAssetIsLicensed,
  canServeLegendaryMethodProfile,
  findAthleteNamesInPaidProgrammeCatalog,
  findProhibitedWordingHits,
  getPublishedLegendaryMethods,
  listLegendaryMethodCards,
  paidProgrammeCatalogUsesAthleteNames,
  publicTextContainsProhibitedWording,
  searchLegendaryMethods,
} from "@/domain/legendary-methods";
import { buildPublicSitemapEntries } from "@/domain/seo/sitemap-entries";

describe("editorial labels", () => {
  it("defines the six required visible label ids", () => {
    expect([...LEGENDARY_EDITORIAL_LABEL_IDS]).toEqual([
      "documented",
      "reconstructed",
      "analysis",
      "modernised-example",
      "limited-evidence",
      "conflicting-information",
    ]);
  });
});

describe("prohibited wording lint", () => {
  it("flags affirmative risky phrases", () => {
    const hits = findProhibitedWordingHits({
      slug: "test-profile",
      summary: "This is the official programme endorsed by the athlete.",
      seo: { title: "Test", description: "guaranteed results for everyone" },
      sections: [],
      whatLiftersGetWrong: [],
      keyCharacteristics: [],
      bestFor: [],
      notRecommendedFor: [],
    });
    const phrases = hits.map((h) => h.phrase);
    expect(phrases).toContain("official programme");
    expect(phrases).toContain("endorsed by");
    expect(phrases).toContain("guaranteed results");
  });

  it("allows negated educational disclaimers and ignores longer-word false positives", () => {
    const hits = findProhibitedWordingHits({
      slug: "test-profile",
      summary:
        "Never treat any reconstructed week as the athlete’s permanent exact programme. One YouTube clip is not official programming.",
      seo: { title: "Test", description: "Not the exact diet." },
      sections: [
        {
          id: "verdict",
          body: "Do not claim this reconstructed week is Eddie Hall’s exact programme.",
        },
      ],
      whatLiftersGetWrong: [],
      keyCharacteristics: [],
      bestFor: [],
      notRecommendedFor: [],
    });
    expect(hits).toEqual([]);
  });

  it("registry draft profiles pass the wording scan", () => {
    for (const profile of LEGENDARY_METHOD_PROFILES) {
      expect(publicTextContainsProhibitedWording(profile)).toBe(false);
    }
  });

  it("lists the required prohibited phrase families", () => {
    expect(LEGENDARY_PROHIBITED_PHRASES).toEqual(
      expect.arrayContaining([
        "official programme",
        "official plan",
        "endorsed by",
        "approved by",
        "exact programme",
        "exact diet",
        "guaranteed results",
        "athlete-created programme",
      ]),
    );
  });
});

describe("paid-product separation", () => {
  it("keeps commercial catalog names free of athlete name tokens", () => {
    expect(paidProgrammeCatalogUsesAthleteNames()).toBe(false);
    expect(findAthleteNamesInPaidProgrammeCatalog()).toEqual([]);
  });

  it("detects athlete names in product titles when present", () => {
    const hits = findAthleteNamesInPaidProgrammeCatalog([
      {
        slug: "eddie-hall-deadlift-programme",
        name: "Eddie Hall Deadlift Programme",
      },
    ]);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.token === "eddie" || h.token === "hall")).toBe(
      true,
    );
  });
});

describe("asset licence registry", () => {
  it("ships prohibited image category rules and an empty registry for original-only art", () => {
    expect(LEGENDARY_PROHIBITED_IMAGE_CATEGORIES).toEqual(
      expect.arrayContaining([
        "celebrity photographs",
        "athlete social-media images",
        "AI-generated celebrity likenesses",
      ]),
    );
    expect(LEGENDARY_ASSET_LICENCE_REGISTRY).toEqual([]);
  });

  it("rejects unregistered non-original assets", () => {
    expect(() =>
      assertNonOriginalAssetIsLicensed("athlete-portrait.jpg"),
    ).toThrow(/licence registry/i);
  });
});

describe("draft access control", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not serve drafts unless preview env is enabled", () => {
    vi.stubEnv("ALLOW_LEGENDARY_DRAFT_PREVIEW", "");
    expect(canServeLegendaryMethodProfile("draft")).toBe(false);
    expect(canServeLegendaryMethodProfile("published")).toBe(true);

    vi.stubEnv("ALLOW_LEGENDARY_DRAFT_PREVIEW", "true");
    expect(canServeLegendaryMethodProfile("draft")).toBe(true);
  });

  it("publishes all ten registry profiles into the sitemap, cards, search, and published slug lists", () => {
    expect(allPublishedLegendaryMethodSlugs().length).toBe(10);
    expect(getPublishedLegendaryMethods().length).toBe(10);
    expect(searchLegendaryMethods().length).toBe(10);
    expect(listLegendaryMethodCards(getPublishedLegendaryMethods())).toHaveLength(
      10,
    );

    const sitemapPaths = buildPublicSitemapEntries().map((e) => e.url);
    for (const profile of LEGENDARY_METHOD_PROFILES) {
      expect(profile.status).toBe("published");
      expect(
        sitemapPaths.some((url) =>
          url.includes(`/legendary-methods/${profile.slug}`),
        ),
      ).toBe(true);
    }
  });

  it("excludes a synthetic draft profile from sitemap-eligible, search, and card listings", () => {
    const syntheticDraft = {
      ...LEGENDARY_METHOD_PROFILES[0]!,
      slug: "synthetic-unpublished-profile",
      status: "draft" as const,
    };
    expect(canServeLegendaryMethodProfile(syntheticDraft.status)).toBe(false);
    expect(
      searchLegendaryMethods().some((item) => item.slug === syntheticDraft.slug),
    ).toBe(false);
    expect(
      getPublishedLegendaryMethods().some(
        (profile) => profile.slug === syntheticDraft.slug,
      ),
    ).toBe(false);
  });
});
