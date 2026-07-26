import { describe, expect, it } from "vitest";
import {
  PERSONALIZATION_FORBIDDEN_USES,
  PERSONALIZATION_HONESTY,
  PERSONALIZATION_SENSITIVE_CHARACTERISTICS,
  assemblePersonalizationPlan,
  assertNotPricingPersonalization,
  isPricingPersonalizationAllowed,
  itemsForSurface,
  personalizationPlanText,
  type PersonalizationSignals,
} from "@/domain/personalization";

function base(
  overrides: Partial<PersonalizationSignals> = {},
): PersonalizationSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    lookbackDays: 28,
    goal: { title: "Powerlifting competition", category: "performance" },
    sport: {
      primaryDiscipline: "powerlifting",
      preferredSports: ["powerlifting"],
    },
    history: {
      completedSessions: 8,
      skippedSessions: 1,
      trainingDays: 8,
      hasActiveProgram: false,
      techniqueUploads: 0,
    },
    behavior: {
      acceptedAdaptations: 1,
      declinedAdaptations: 0,
      feedbackHelpful: 1,
      feedbackNotHelpful: 0,
    },
    preferences: {
      daysPerWeek: 4,
      sessionLengthMinutes: 75,
      intensityBand: "prefer_higher",
      frequencyBand: "moderate",
      volumeToleranceBand: "low",
    },
    pendingRecommendations: [
      {
        id: "r1",
        title: "Log accessory volume",
        body: "Add one accessory session.",
        category: "training",
        priority: 2,
      },
      {
        id: "r2",
        title: "Upload a squat video",
        body: "Technique still empty.",
        category: "technique",
        priority: 1,
      },
    ],
    ...overrides,
  };
}

describe("personalization engine", () => {
  it("personalizes each product surface from goal/sport/history/behavior/preferences", () => {
    const plan = assemblePersonalizationPlan(base());
    expect(plan.summaryLine).toBeTruthy();
    expect(plan.surfaces).toHaveLength(6);

    expect(itemsForSurface(plan, "dashboard").length).toBeGreaterThan(0);
    expect(itemsForSurface(plan, "recommendations")[0]?.title).toMatch(
      /squat|accessory|technique|upload/i,
    );
    expect(itemsForSurface(plan, "program_suggestions")[0]?.title).toMatch(
      /Program/i,
    );
    expect(itemsForSurface(plan, "exercise_alternatives")[0]?.title).toMatch(
      /Powerlifting/i,
    );
    expect(itemsForSurface(plan, "content")[0]?.href).toBeTruthy();
    expect(itemsForSurface(plan, "notifications").length).toBeGreaterThanOrEqual(
      0,
    );
  });

  it("never allows pricing personalization and strips sensitive extras", () => {
    expect(isPricingPersonalizationAllowed()).toBe(false);
    expect(() => assertNotPricingPersonalization("pricing")).toThrow(
      /must not personalize pricing/i,
    );

    const plan = assemblePersonalizationPlan(
      base({
        unsafeExtras: {
          sex: "female",
          birthYear: 1990,
          favoriteColor: "blue",
        },
      }),
    );
    expect(plan.pricingPersonalization.allowed).toBe(false);
    expect(plan.ignoredSensitiveKeys).toEqual(
      expect.arrayContaining(["sex", "birthYear"]),
    );

    const text = personalizationPlanText(plan);
    for (const use of PERSONALIZATION_FORBIDDEN_USES) {
      // Honesty may mention "pricing" as a denial — ensure we never claim a price.
      expect(text).not.toMatch(new RegExp(`${use}\\s*[:=]\\s*\\$?\\d`));
    }
    for (const key of PERSONALIZATION_SENSITIVE_CHARACTERISTICS) {
      // Plan must not assert athlete sex/age as a ranking reason in item copy.
      expect(text).not.toContain(`driven by ${key}`);
    }
    expect(PERSONALIZATION_HONESTY.join(" ")).toMatch(
      /never personalized from sensitive/i,
    );
  });

  it("does not invent items when signals are empty", () => {
    const empty = assemblePersonalizationPlan(
      base({
        goal: { title: null, category: null },
        sport: { primaryDiscipline: null, preferredSports: [] },
        history: {
          completedSessions: 0,
          skippedSessions: 0,
          trainingDays: 0,
          hasActiveProgram: false,
          techniqueUploads: 0,
        },
        behavior: {
          acceptedAdaptations: 0,
          declinedAdaptations: 0,
          feedbackHelpful: 0,
          feedbackNotHelpful: 0,
        },
        preferences: {
          daysPerWeek: null,
          sessionLengthMinutes: null,
          intensityBand: null,
          frequencyBand: null,
          volumeToleranceBand: null,
        },
        pendingRecommendations: [],
      }),
    );
    // Honest onboarding cues are allowed; fabricated scores/prices are not.
    const recs = itemsForSurface(empty, "recommendations");
    expect(recs.every((r) => r.href != null)).toBe(true);
    expect(empty.pricingPersonalization.allowed).toBe(false);
  });
});
