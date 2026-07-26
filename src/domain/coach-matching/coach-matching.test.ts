import { describe, expect, it } from "vitest";
import {
  rankOrganicMatches,
  rankSponsoredMatches,
  scoreCoachMatch,
  type CoachMatchCandidate,
  type CoachMatchPreferences,
} from "@/domain/coach-matching";

const prefs: CoachMatchPreferences = {
  goal: "competition_prep",
  sport: "powerlifting",
  experience: "intermediate",
  budgetMax: 200,
  language: "en",
  locationOrTimezone: "Europe/Berlin",
  coachingStyle: "meet_prep",
};

function coach(
  overrides: Partial<CoachMatchCandidate> & Pick<CoachMatchCandidate, "id" | "slug" | "displayName">,
): CoachMatchCandidate {
  return {
    bio: null,
    specializations: [],
    languages: [],
    goalTags: [],
    experienceLevels: [],
    coachingStyles: [],
    timezone: null,
    locationLabel: null,
    priceMajor: null,
    availabilityStatus: "open",
    isSponsored: false,
    ...overrides,
  };
}

describe("coach matching engine", () => {
  it("ranks by organic fit and explains why", () => {
    const strong = coach({
      id: "1",
      slug: "a",
      displayName: "Alex",
      specializations: ["powerlifting"],
      goalTags: ["competition_prep"],
      experienceLevels: ["intermediate"],
      coachingStyles: ["meet_prep"],
      languages: ["en"],
      timezone: "Europe/Berlin",
      priceMajor: 150,
    });
    const weak = coach({
      id: "2",
      slug: "b",
      displayName: "Blake",
      specializations: ["bodybuilding"],
      languages: ["es"],
    });

    const ranked = rankOrganicMatches(prefs, [weak, strong], 5);
    expect(ranked[0]?.coach.id).toBe("1");
    expect(ranked[0]!.organicScore).toBeGreaterThan(ranked[1]?.organicScore ?? 0);
    expect(ranked[0]!.reasons.some((r) => r.factor === "Sport")).toBe(true);
    expect(buildWhy(ranked[0]!)).toMatch(/Sport/i);
  });

  it("never boosts organic score for sponsored placement", () => {
    const organic = coach({
      id: "o",
      slug: "o",
      displayName: "Organic",
      specializations: ["powerlifting"],
      goalTags: ["competition_prep"],
      experienceLevels: ["intermediate"],
      coachingStyles: ["meet_prep"],
      languages: ["en"],
      timezone: "Europe/Berlin",
      priceMajor: 100,
      isSponsored: false,
    });
    const paid = {
      ...organic,
      id: "p",
      slug: "p",
      displayName: "Paid",
      isSponsored: true,
    };

    const a = scoreCoachMatch(prefs, organic);
    const b = scoreCoachMatch(prefs, paid);
    expect(a.organicScore).toBe(b.organicScore);
    expect(b.sponsoredLabel).toBe("Sponsored");
    expect(a.sponsoredLabel).toBeNull();
  });

  it("keeps sponsored labeled separately without inventing rank from payment", () => {
    const lowFitSponsored = coach({
      id: "s",
      slug: "s",
      displayName: "Sponsored Low",
      specializations: ["yoga"],
      isSponsored: true,
    });
    const highFit = coach({
      id: "h",
      slug: "h",
      displayName: "High Fit",
      specializations: ["powerlifting"],
      goalTags: ["competition_prep"],
      experienceLevels: ["intermediate"],
      coachingStyles: ["meet_prep"],
      languages: ["en"],
      timezone: "Europe/Berlin",
      priceMajor: 120,
      isSponsored: false,
    });

    const organic = rankOrganicMatches(prefs, [lowFitSponsored, highFit], 5);
    expect(organic[0]?.coach.id).toBe("h");

    const sponsored = rankSponsoredMatches(
      prefs,
      [lowFitSponsored, highFit],
      3,
    );
    expect(sponsored.every((r) => r.sponsoredLabel === "Sponsored")).toBe(true);
    expect(sponsored.every((r) => r.coach.isSponsored)).toBe(true);
  });
});

function buildWhy(result: {
  reasons: Array<{ factor: string; detail: string }>;
}): string {
  return result.reasons.map((r) => `${r.factor}: ${r.detail}`).join(" · ");
}
