import { describe, expect, it } from "vitest";
import {
  buildSharePath,
  parseFitSearchParams,
  recommendApproach,
} from "@/domain/fit";
import type { FitInputs } from "@/domain/fit/types";
import { getPublishedMethods } from "@/domain/methods/catalog";
import { FIT_RULES } from "@/domain/fit/rules";

const base: FitInputs = {
  goal: "strength",
  experience: "intermediate",
  days: "4",
  session: "medium",
  recovery: "moderate",
  equipment: "full_gym",
  sport: "none",
  preference: "variety",
};

describe("fit recommendApproach", () => {
  it("never claims a single perfect method — always offers primary framing with alternative when possible", () => {
    const result = recommendApproach(base);
    expect(result.primary).not.toBeNull();
    expect(result.alternative).not.toBeNull();
    expect(result.primary!.slug).not.toBe(result.alternative!.slug);
    expect(result.primary!.whyItFits.length).toBeGreaterThan(0);
    expect(result.primary!.tradeoffs.length).toBeGreaterThan(0);
    expect(result.primary!.exampleStructure.length).toBeGreaterThan(20);
    expect(result.matchedRules.length).toBeGreaterThan(0);
  });

  it("recommends HIT-leaning approaches for limited recovery + short sessions + low-volume preference", () => {
    const result = recommendApproach({
      ...base,
      recovery: "limited",
      session: "short",
      days: "2",
      preference: "high_effort_low_volume",
      goal: "hypertrophy",
    });
    expect(result.primary?.slug).toBe("high-intensity-training");
  });

  it("favors high-frequency for weightlifting + high-frequency preference", () => {
    const result = recommendApproach({
      ...base,
      goal: "weightlifting",
      sport: "weightlifting",
      preference: "high_frequency",
      days: "5",
      experience: "intermediate",
    });
    expect(result.primary?.slug).toBe("high-frequency-training");
  });

  it("opens conjugate for advanced powerlifting", () => {
    const result = recommendApproach({
      ...base,
      goal: "powerlifting",
      sport: "powerlifting",
      experience: "advanced",
      days: "4",
      recovery: "high",
      preference: "variety",
    });
    expect(
      [result.primary?.slug, result.alternative?.slug].includes("conjugate"),
    ).toBe(true);
  });

  it("only references published method slugs in rules", () => {
    const published = new Set(getPublishedMethods().map((m) => m.slug));
    for (const rule of FIT_RULES) {
      for (const effect of rule.effects) {
        expect(published.has(effect.slug)).toBe(true);
      }
    }
  });

  it("round-trips shareable URLs", () => {
    const path = buildSharePath(base);
    expect(path.startsWith("/fit?")).toBe(true);
    const qs = Object.fromEntries(new URLSearchParams(path.slice(5)));
    expect(parseFitSearchParams(qs)).toEqual(base);
  });

  it("is deterministic", () => {
    const a = recommendApproach(base);
    const b = recommendApproach(base);
    expect(a.primary?.slug).toBe(b.primary?.slug);
    expect(a.alternative?.slug).toBe(b.alternative?.slug);
    expect(a.matchedRules.map((r) => r.id)).toEqual(
      b.matchedRules.map((r) => r.id),
    );
  });
});
