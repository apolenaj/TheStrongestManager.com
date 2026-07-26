import { describe, expect, it } from "vitest";
import {
  SPORT_GOAL_LANDINGS,
  SPORT_GOAL_LANDING_HONESTY,
  buildSportGoalLandingSnapshot,
  evaluateSportGoalLandingQuality,
  listIndexableSportGoalPaths,
} from "@/domain/sport-goal-landings";

describe("sport goal landings", () => {
  it("ships the prompt examples and refuses filler language", () => {
    expect(SPORT_GOAL_LANDINGS.map((p) => p.slug)).toEqual([
      "improve-deadlift",
      "build-bigger-chest",
      "powerlifting-program",
      "strongman-training",
    ]);
    expect(SPORT_GOAL_LANDING_HONESTY.join(" ")).toMatch(/filler/i);
    expect(SPORT_GOAL_LANDING_HONESTY.join(" ")).toMatch(/product/i);
  });

  it("requires product links into real features and passes quality", () => {
    for (const page of SPORT_GOAL_LANDINGS) {
      const q = evaluateSportGoalLandingQuality(page);
      expect(q.passed, page.slug).toBe(true);
      expect(page.productLinks.some((l) => l.surface === "app")).toBe(true);
      expect(page.productLinks.some((l) => l.surface === "public")).toBe(true);
    }

    const filler = evaluateSportGoalLandingQuality({
      ...SPORT_GOAL_LANDINGS[0]!,
      slug: "filler",
      overview:
        "In today's fast-paced world, look no further for the ultimate guide to unlock your potential with game-changing results and best tips and tricks.",
      uniqueValueKey: "x",
      productLinks: SPORT_GOAL_LANDINGS[0]!.productLinks.slice(0, 1),
    });
    expect(filler.passed).toBe(false);
    expect(filler.checks.find((c) => c.id === "no_filler")?.ok).toBe(false);
  });

  it("lists only quality-passed paths", () => {
    const paths = listIndexableSportGoalPaths();
    expect(paths).toHaveLength(4);
    expect(paths.every((p) => p.startsWith("/goals/"))).toBe(true);
    const snap = buildSportGoalLandingSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.indexableCount).toBe(4);
    expect(snap.rejectedCount).toBe(0);
  });
});
