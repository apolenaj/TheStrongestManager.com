import { describe, expect, it } from "vitest";
import {
  filterLegendaryMethodCards,
  groupLegendaryMethodCards,
  legendaryMethodOneSentenceInsight,
  listFeaturedLegendaryMethodCards,
  listLegendaryMethodCards,
  toLegendaryMethodCardModel,
  type LegendaryMethodCardModel,
} from "@/domain/legendary-methods/cards";
import { LEGENDARY_METHOD_PROFILES } from "@/domain/legendary-methods/catalog";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

function sampleCard(
  overrides: Partial<LegendaryMethodCardModel> = {},
): LegendaryMethodCardModel {
  return {
    slug: "sample",
    href: "/legendary-methods/sample",
    athleteName: "Sample Athlete",
    profileTitle: "Sample Athlete — Analysis",
    category: "powerlifting",
    categoryLabel: "Powerlifting",
    sportLabel: "Powerlifting",
    shortDescription: "Short description",
    methodFocus: "Relative strength",
    recoveryDemand: 7,
    beginnerSuitability: 3,
    evidenceQuality: "mixed",
    readingTimeMinutes: 9,
    ...overrides,
  };
}

describe("legendary method cards", () => {
  it("maps profile fields into library cards", () => {
    const profile = {
      slug: "john-haack-relative-strength",
      status: "published",
      athleteName: "John Haack",
      profileTitle: "John Haack — Elite Strength at a Lower Bodyweight",
      shortTitle: "Elite Strength at a Lower Bodyweight",
      category: "powerlifting",
      sportLabel: "Powerlifting",
      summary: "An educational summary for card display.",
      introductoryDisclaimer: "Disclaimer",
      keyCharacteristics: ["Relative strength focus"],
      bestFor: [],
      notRecommendedFor: [],
      quickProfile: {
        primaryGoal: "",
        typicalFrequency: "",
        volumeLevel: "",
        intensityProfile: "",
        recoveryDemand: "",
        technicalDifficulty: "",
        bestSuitedFor: "",
        evidenceQuality: "moderate",
      },
      scores: {
        strengthPotential: { value: 9, justification: "" },
        hypertrophyPotential: { value: 4, justification: "" },
        recoveryDemand: { value: 6, justification: "" },
        technicalDifficulty: { value: 7, justification: "" },
        beginnerSuitability: { value: 2, justification: "" },
        advancedSuitability: { value: 9, justification: "" },
      },
      evidenceQuality: "moderate",
      sections: [],
      whatLiftersGetWrong: [],
      relatedProgrammes: [],
      sources: [],
      seo: {
        title: "t",
        description: "d",
        canonicalPath: "/legendary-methods/john-haack-relative-strength",
      },
    } as LegendaryMethodProfile;

    const card = toLegendaryMethodCardModel(profile);
    expect(card.athleteName).toBe("John Haack");
    expect(card.methodFocus).toBe("Elite Strength at a Lower Bodyweight");
    expect(card.recoveryDemand).toBe(6);
    expect(card.href).toBe(
      "/legendary-methods/john-haack-relative-strength",
    );
  });

  it("filters and groups cards by category", () => {
    const cards = [
      sampleCard({ slug: "a", category: "bodybuilding", categoryLabel: "Bodybuilding" }),
      sampleCard({ slug: "b", category: "strongman", categoryLabel: "Strongman" }),
      sampleCard({ slug: "c", category: "powerlifting", categoryLabel: "Powerlifting" }),
      sampleCard({
        slug: "d",
        category: "training-system",
        categoryLabel: "Training system",
      }),
    ];

    expect(filterLegendaryMethodCards(cards, "strongman")).toHaveLength(1);
    expect(filterLegendaryMethodCards(cards, "all")).toHaveLength(4);
    expect(groupLegendaryMethodCards(cards).map((g) => g.category)).toEqual([
      "bodybuilding",
      "strongman",
      "powerlifting",
      "training-system",
    ]);
    expect(listLegendaryMethodCards([])).toEqual([]);
  });

  it("returns no homepage featured cards until profiles are published", () => {
    expect(listFeaturedLegendaryMethodCards(LEGENDARY_METHOD_PROFILES, 6)).toEqual(
      [],
    );
    const published = LEGENDARY_METHOD_PROFILES.map((profile) => ({
      ...profile,
      status: "published" as const,
      legalReviewStatus: "passed" as const,
    }));
    const featured = listFeaturedLegendaryMethodCards(published, 6);
    expect(featured).toHaveLength(6);
    expect(featured.map((card) => card.slug)).toEqual([
      "arnold-schwarzenegger-golden-era-volume",
      "tom-platz-extreme-leg-training",
      "eddie-hall-500kg-deadlift",
      "john-haack-relative-strength",
      "boris-sheiko-russian-powerlifting",
      "louie-simmons-conjugate-method",
    ]);
  });

  it("extracts a one-sentence insight for compact cards", () => {
    expect(
      legendaryMethodOneSentenceInsight(
        "Volume density mattered. Recovery limits still apply for most lifters.",
      ),
    ).toBe("Volume density mattered.");
  });
});
