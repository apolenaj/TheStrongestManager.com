import { describe, expect, it } from "vitest";
import {
  buildCoachingContextCards,
  EXERCISE_DETAIL_SECTIONS,
  relatedMethodsForPattern,
  usefulForFromSportRelevance,
} from "@/domain/exercises/detail-presentation";

describe("exercise detail presentation", () => {
  it("defines compact section navigation ids", () => {
    expect(EXERCISE_DETAIL_SECTIONS.map((s) => s.id)).toEqual([
      "overview",
      "technique",
      "setup",
      "execution",
      "media",
      "muscles",
      "mistakes",
      "variations",
      "programming",
      "useful-for",
      "avoid-modify",
      "related-exercises",
      "related-methods",
    ]);
  });

  it("labels coaching context cards as non-scientific", () => {
    const cards = buildCoachingContextCards({
      difficulty: "intermediate",
      movementPattern: "squat",
      equipment: ["barbell", "rack"],
      laterality: "bilateral",
    });
    expect(cards.length).toBe(4);
    expect(cards.every((card) => card.detail.length > 10)).toBe(true);
    expect(
      cards.some((card) => /not a lab|not biomechanical/i.test(card.detail)),
    ).toBe(true);
  });

  it("maps useful-for from sport relevance without inventing sports", () => {
    const lines = usefulForFromSportRelevance(
      { powerlifting: "high", bodybuilding: "none" },
      "advanced",
    );
    expect(lines.some((l) => l.includes("Powerlifting"))).toBe(true);
    expect(lines.some((l) => l.includes("Bodybuilding"))).toBe(false);
  });

  it("returns coaching method associations for known patterns", () => {
    expect(relatedMethodsForPattern("squat").length).toBeGreaterThan(0);
    expect(relatedMethodsForPattern("unknown").length).toBe(0);
  });
});
