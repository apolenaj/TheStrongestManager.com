import { describe, expect, it } from "vitest";
import { scoreProgramFinder } from "@/domain/program-finder/scoring";
import {
  trainingMaxesFromOneRmsKg,
  validateOptionalOneRms,
} from "@/domain/program-catalog/one-rm";
import { generateFirstTrainingWeek } from "@/domain/program-catalog/generate-week-one";

describe("program finder scoring", () => {
  it("is deterministic and prefers linear for beginners with poor recovery", () => {
    const a = scoreProgramFinder({
      goal: "strength",
      experience: "beginner",
      days: "3",
      weakest: "none",
      recovery: "poor",
    });
    const b = scoreProgramFinder({
      goal: "strength",
      experience: "beginner",
      days: "3",
      weakest: "none",
      recovery: "poor",
    });
    expect(a.primary.familyId).toBe("linear-strength-builder");
    expect(a.primary.familyId).toBe(b.primary.familyId);
    expect(a.primary.score).toBe(b.primary.score);
    expect(a.primary.reasons.length).toBeGreaterThan(0);
    expect(a.honesty).toBe("transparent_weighted_score");
    expect(a.primary.reasons.every((r) => typeof r.key === "string")).toBe(
      true,
    );
  });

  it("prefers high-frequency for advanced powerlifters with many days and good recovery", () => {
    const result = scoreProgramFinder({
      goal: "powerlifting",
      experience: "advanced",
      days: "6",
      weakest: "bench",
      recovery: "good",
    });
    expect(result.primary.familyId).toBe("high-frequency-sbd");
    expect(result.secondary.familyId).not.toBe(result.primary.familyId);
  });
});

describe("1RM validation", () => {
  it("accepts blank optional maxes", () => {
    expect(validateOptionalOneRms({}, "kg").ok).toBe(true);
  });

  it("rejects unrealistic bench vs squat ratio", () => {
    const result = validateOptionalOneRms(
      { squat: 100, bench: 200 },
      "kg",
    );
    expect(result.ok).toBe(false);
  });

  it("rejects ceiling breaches and builds TMs at 90%", () => {
    expect(validateOptionalOneRms({ squat: 900 }, "kg").ok).toBe(false);
    const ok = validateOptionalOneRms({ squat: 200, bench: 120, deadlift: 240 }, "kg");
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(trainingMaxesFromOneRmsKg(ok.valuesKg).squat).toBe(180);
  });
});

describe("week-one generation", () => {
  it("creates the requested number of training days", () => {
    const week = generateFirstTrainingWeek({
      scheduleVariant: "4day",
      unitSystem: "kg",
      trainingMaxes: { squat: 180, bench: 108, deadlift: 216 },
      weakestLift: "bench",
      productName: "Test",
    });
    expect(week.week).toBe(1);
    expect(week.days).toHaveLength(4);
    expect(
      week.days.some((d) =>
        d.exercises.some((e) => e.sets.some((s) => s.kind === "backoff")),
      ),
    ).toBe(true);
  });
});
