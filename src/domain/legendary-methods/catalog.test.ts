import { describe, expect, it } from "vitest";
import {
  LEGENDARY_METHOD_PROFILES,
  REQUIRED_LEGENDARY_SECTION_DEFINITIONS,
  allLegendaryMethodSlugs,
  allPublishedLegendaryMethodSlugs,
  assertLegendaryMethodRegistryIntegrity,
  canPublishLegendaryMethod,
  createEmptyRequiredSections,
  emptyScores,
  getLegendaryMethodBySlug,
  getLegendaryMethodDetail,
  getPublishedLegendaryMethods,
  relatedProgrammeUsesAthleteName,
  searchLegendaryMethods,
  validateLegendaryMethodForPublish,
  type LegendaryMethodProfile,
} from "@/domain/legendary-methods";

const REQUIRED_SLUGS = [
  "arnold-schwarzenegger-golden-era-volume",
  "tom-platz-extreme-leg-training",
  "ronnie-coleman-heavy-high-volume-training",
  "eddie-hall-500kg-deadlift",
  "hafthor-bjornsson-strongman-strength",
  "colton-engelbrecht-superheavyweight-powerlifting",
  "john-haack-relative-strength",
  "jamal-browner-sumo-deadlift",
  "boris-sheiko-russian-powerlifting",
  "louie-simmons-conjugate-method",
] as const;

const REQUIRED_TITLES = [
  "Arnold Schwarzenegger — Analysis of Golden Era Volume",
  "Tom Platz — Analysis of Extreme Leg Training",
  "Ronnie Coleman — Heavy High-Volume Training Analysis",
  "Eddie Hall — Building a 500 kg Deadlift: Training Analysis",
  "Hafþór Björnsson — Strongman Strength and Athleticism Analysis",
  "Colton Engelbrecht — Elite Superheavyweight Powerlifting Analysis",
  "John Haack — Elite Strength at a Lower Bodyweight",
  "Jamal Browner — Sumo Deadlift Specialisation Analysis",
  "Boris Sheiko — Understanding Russian Powerlifting Systems",
  "Louie Simmons — Understanding the Conjugate Method",
] as const;

function scored(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, justification: string) {
  return { value, justification };
}

function basePublishable(
  overrides: Partial<LegendaryMethodProfile> = {},
): LegendaryMethodProfile {
  const draft = getLegendaryMethodBySlug(
    "louie-simmons-conjugate-method",
  )!;
  const sections = createEmptyRequiredSections().map((section) => ({
    ...section,
    body:
      section.id === "sources"
        ? ""
        : `Documented placeholder body for ${section.id}.`,
  }));

  return {
    ...draft,
    status: "draft",
    summary: "A complete summary for publish validation tests.",
    keyCharacteristics: ["Max effort rotation", "Dynamic effort practice"],
    bestFor: ["Intermediate+ powerlifters with coaching support"],
    notRecommendedFor: ["Absolute beginners without recovery capacity"],
    scores: {
      strengthPotential: scored(9, "High specificity to competition lifts."),
      hypertrophyPotential: scored(5, "Secondary to strength outcomes."),
      recoveryDemand: scored(8, "High neural and joint stress when dosed hard."),
      technicalDifficulty: scored(8, "Requires competent variation selection."),
      beginnerSuitability: scored(2, "Too complex for early-stage lifters."),
      advancedSuitability: scored(9, "Fits experienced lifters with coaching."),
    },
    evidenceQuality: "mixed",
    evidenceQualityNote: undefined,
    legalReviewStatus: "passed",
    publishedAt: "2026-07-28",
    sections,
    sources: [
      {
        title: "Example archival coaching text",
        publisher: "Example Publisher",
        url: "https://example.com/source",
        accessDate: "2026-07-28",
        sourceType: "reputable-publication",
        supports: ["documented-training-method"],
      },
      {
        title: "Competition results archive",
        publisher: "Example Meet Database",
        url: "https://example.com/meets",
        accessDate: "2026-07-28",
        sourceType: "competition-database",
        supports: ["athlete-and-era"],
      },
      {
        title: "Interview transcript excerpts",
        publisher: "Example Media",
        url: "https://example.com/interview",
        accessDate: "2026-07-28",
        sourceType: "interview",
        supports: ["why-it-worked"],
      },
    ],
    relatedProgrammes: [
      {
        slug: "conjugate-strength-system",
        title: "Conjugate Strength System",
        href: "/programs/conjugate-strength-system",
        relationship: "Related commercial system",
      },
    ],
    ...overrides,
  };
}

describe("legendary methods registry metadata", () => {
  it("registers ten draft profiles with required public titles", () => {
    expect(allLegendaryMethodSlugs()).toEqual([...REQUIRED_SLUGS]);
    expect(LEGENDARY_METHOD_PROFILES.map((p) => p.profileTitle)).toEqual([
      ...REQUIRED_TITLES,
    ]);
    expect(
      LEGENDARY_METHOD_PROFILES.every((p) => p.status === "draft"),
    ).toBe(true);
  });

  it("keeps bodybuilding Prompt 5A profiles as sourced drafts with 5+ sources", () => {
    const bodybuilding = [
      "arnold-schwarzenegger-golden-era-volume",
      "tom-platz-extreme-leg-training",
      "ronnie-coleman-heavy-high-volume-training",
    ].map((slug) => getLegendaryMethodBySlug(slug)!);

    for (const profile of bodybuilding) {
      expect(profile.status).toBe("draft");
      expect(profile.summary.length).toBeGreaterThan(80);
      expect(profile.sources.length).toBeGreaterThanOrEqual(5);
      expect(
        profile.sections.every((s) => s.id === "sources" || s.body.length > 0),
      ).toBe(true);
      const words = [profile.summary, ...profile.sections.map((s) => s.body)]
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(1200);
      expect(canPublishLegendaryMethod(profile)).toBe(false);
      expect(
        canPublishLegendaryMethod({
          ...profile,
          legalReviewStatus: "passed",
          publishedAt: "2026-07-28",
        }),
      ).toBe(true);
    }
  });

  it("keeps strongman Prompt 5B profiles as sourced drafts with 5+ sources", () => {
    const strongman = [
      "eddie-hall-500kg-deadlift",
      "hafthor-bjornsson-strongman-strength",
    ].map((slug) => getLegendaryMethodBySlug(slug)!);

    for (const profile of strongman) {
      expect(profile.status).toBe("draft");
      expect(profile.category).toBe("strongman");
      expect(profile.summary.length).toBeGreaterThan(80);
      expect(profile.sources.length).toBeGreaterThanOrEqual(5);
      expect(
        profile.sections.every((s) => s.id === "sources" || s.body.length > 0),
      ).toBe(true);
      const words = [profile.summary, ...profile.sections.map((s) => s.body)]
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(1200);
      expect(canPublishLegendaryMethod(profile)).toBe(false);
      expect(
        canPublishLegendaryMethod({
          ...profile,
          legalReviewStatus: "passed",
          publishedAt: "2026-07-28",
        }),
      ).toBe(true);
    }
  });

  it("keeps powerlifting Prompt 5C profiles as sourced drafts with 5+ sources", () => {
    const powerlifting = [
      "colton-engelbrecht-superheavyweight-powerlifting",
      "john-haack-relative-strength",
      "jamal-browner-sumo-deadlift",
    ].map((slug) => getLegendaryMethodBySlug(slug)!);

    for (const profile of powerlifting) {
      expect(profile.status).toBe("draft");
      expect(profile.category).toBe("powerlifting");
      expect(profile.summary.length).toBeGreaterThan(80);
      expect(profile.sources.length).toBeGreaterThanOrEqual(5);
      expect(
        profile.sections.every((s) => s.id === "sources" || s.body.length > 0),
      ).toBe(true);
      const words = [profile.summary, ...profile.sections.map((s) => s.body)]
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(1200);
      expect(canPublishLegendaryMethod(profile)).toBe(false);
      expect(
        canPublishLegendaryMethod({
          ...profile,
          legalReviewStatus: "passed",
          publishedAt: "2026-07-28",
        }),
      ).toBe(true);
    }
  });

  it("keeps system Prompt 5D profiles as sourced drafts with Sheiko vs Conjugate comparison", () => {
    const systems = [
      "boris-sheiko-russian-powerlifting",
      "louie-simmons-conjugate-method",
    ].map((slug) => getLegendaryMethodBySlug(slug)!);

    for (const profile of systems) {
      expect(profile.status).toBe("draft");
      expect(profile.category).toBe("training-system");
      expect(profile.summary.length).toBeGreaterThan(80);
      expect(profile.sources.length).toBeGreaterThanOrEqual(5);
      expect(profile.systemComparison?.title).toBe("Sheiko vs Conjugate");
      expect(profile.systemComparison?.rows.length).toBeGreaterThanOrEqual(8);
      const words = [profile.summary, ...profile.sections.map((s) => s.body)]
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(1200);
      expect(canPublishLegendaryMethod(profile)).toBe(false);
      expect(
        canPublishLegendaryMethod({
          ...profile,
          legalReviewStatus: "passed",
          publishedAt: "2026-07-28",
        }),
      ).toBe(true);
    }
  });

  it("excludes drafts from published listings and search", () => {
    expect(getPublishedLegendaryMethods()).toEqual([]);
    expect(allPublishedLegendaryMethodSlugs()).toEqual([]);
    expect(searchLegendaryMethods()).toEqual([]);
    expect(
      getLegendaryMethodDetail("louie-simmons-conjugate-method"),
    ).toBeNull();
  });

  it("ships required section shells for bodybuilding drafts with filled narrative", () => {
    const profile = getLegendaryMethodBySlug(
      "arnold-schwarzenegger-golden-era-volume",
    )!;
    expect(profile.sections.map((s) => s.id)).toEqual(
      REQUIRED_LEGENDARY_SECTION_DEFINITIONS.map((d) => d.id),
    );
    expect(profile.sections.find((s) => s.id === "athlete-and-era")?.body.length).toBeGreaterThan(
      200,
    );
    expect(assertLegendaryMethodRegistryIntegrity(LEGENDARY_METHOD_PROFILES).ok).toBe(
      true,
    );
  });
});

describe("validateLegendaryMethodForPublish", () => {
  it("rejects incomplete draft metadata", () => {
    const draft: LegendaryMethodProfile = {
      ...getLegendaryMethodBySlug("louie-simmons-conjugate-method")!,
      summary: "",
      sources: [],
      sections: createEmptyRequiredSections(),
      scores: emptyScores(),
      systemComparison: undefined,
    };
    const result = validateLegendaryMethodForPublish(draft);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const codes = result.issues.map((i) => i.code);
    expect(codes).toContain("summary_empty");
    expect(codes).toContain("sources_missing");
    expect(codes).toContain("required_section_empty");
    expect(codes).toContain("score_invalid");
    expect(canPublishLegendaryMethod(draft)).toBe(false);
  });

  it("rejects invalid source URLs", () => {
    const profile = basePublishable({
      sources: [
        {
          title: "Bad URL source",
          publisher: "Example",
          url: "http://insecure.example.com/x",
          accessDate: "2026-07-28",
          sourceType: "book",
          supports: ["athlete-and-era"],
        },
      ],
    });
    const result = validateLegendaryMethodForPublish(profile);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.code === "source_url_invalid")).toBe(
      true,
    );
  });

  it("rejects evidenceQuality high without justification", () => {
    const profile = basePublishable({
      evidenceQuality: "high",
      evidenceQualityNote: "",
    });
    const result = validateLegendaryMethodForPublish(profile);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((i) => i.code === "evidence_high_unjustified"),
    ).toBe(true);
  });

  it("rejects related programmes that use athlete names", () => {
    const profile = basePublishable({
      relatedProgrammes: [
        {
          slug: "louie-simmons-official-program",
          title: "Louie Simmons Official Program",
          href: "/programs/louie-simmons-official-program",
          relationship: "Invalid naming",
        },
      ],
    });
    expect(relatedProgrammeUsesAthleteName(profile)).toBe(true);
    const result = validateLegendaryMethodForPublish(profile);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((i) => i.code === "related_programme_athlete_name"),
    ).toBe(true);
  });

  it("rejects missing disclaimer", () => {
    const profile = basePublishable({ introductoryDisclaimer: "   " });
    const result = validateLegendaryMethodForPublish(profile);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.code === "disclaimer_missing")).toBe(
      true,
    );
  });

  it("rejects incomplete legal review even when content is otherwise publishable", () => {
    const profile = basePublishable({ legalReviewStatus: "pending" });
    const result = validateLegendaryMethodForPublish(profile);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.code === "legal_review_incomplete")).toBe(
      true,
    );
  });

  it("rejects prohibited wording in public copy", () => {
    const profile = basePublishable({
      summary:
        "This is the official programme approved by the athlete with guaranteed results.",
    });
    const result = validateLegendaryMethodForPublish(profile);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.code === "prohibited_wording")).toBe(
      true,
    );
  });

  it("accepts a fully sourced publishable profile", () => {
    const profile = basePublishable({
      evidenceQuality: "high",
      evidenceQualityNote:
        "Multiple contemporaneous coaching texts and competition records cited in sources[].",
    });
    const result = validateLegendaryMethodForPublish(profile);
    expect(result).toEqual({ ok: true });
    expect(canPublishLegendaryMethod(profile)).toBe(true);
  });

  it("blocks status published without passing validation", () => {
    const invalidPublished: LegendaryMethodProfile = {
      ...getLegendaryMethodBySlug("louie-simmons-conjugate-method")!,
      status: "published",
      summary: "",
      sources: [],
      sections: createEmptyRequiredSections(),
      scores: emptyScores(),
      systemComparison: undefined,
    };
    const result = assertLegendaryMethodRegistryIntegrity([invalidPublished]);
    expect(result.ok).toBe(false);
  });
});
