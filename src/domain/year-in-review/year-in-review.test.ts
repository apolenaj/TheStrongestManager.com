import { describe, expect, it } from "vitest";
import {
  assembleYearInReview,
  buildYearInReviewSharePayload,
  buildYearInReviewSnapshot,
  findMostConsistentMonth,
} from "@/domain/year-in-review";

describe("year in review", () => {
  it("picks the most consistent month by session count", () => {
    const months = [2, 4, 1, 8, 3, 2, 1, 1, 0, 0, 0, 0];
    const best = findMostConsistentMonth(months);
    expect(best?.label).toBe("Apr");
    expect(best?.sessions).toBe(8);
    expect(findMostConsistentMonth([0, 0, 0])).toBeNull();
  });

  it("assembles all required card kinds without inventing stats", () => {
    const report = assembleYearInReview({
      year: 2026,
      athleteDisplayName: "Alex",
      completedSessions: 42,
      sessionsByMonth: [2, 3, 4, 5, 4, 3, 6, 4, 3, 2, 3, 3],
      prCount: 5,
      prHighlights: [
        { id: "1", title: "Deadlift", detail: "300 kg" },
      ],
      techniqueFirstAvg: 70,
      techniqueLastAvg: 82,
      techniqueSampleCount: 8,
      topExercises: [
        { exerciseKey: "dl", exerciseLabel: "Deadlift", setCount: 120 },
        { exerciseKey: "sq", exerciseLabel: "Squat", setCount: 90 },
      ],
      competitions: [
        {
          id: "c1",
          name: "Local meet",
          sport: "powerlifting",
          dateLabel: "Aug 2026",
          status: "completed",
          weightClassLabel: "83 kg",
        },
      ],
    });

    expect(report.cards.map((c) => c.kind)).toEqual([
      "intro",
      "sessions",
      "prs",
      "technique",
      "top_exercises",
      "most_consistent_month",
      "competition",
      "closer",
    ]);
    expect(report.cards.find((c) => c.kind === "sessions")?.headline).toBe(
      "42",
    );
    expect(report.cards.find((c) => c.kind === "technique")?.headline).toBe(
      "+12",
    );
    expect(
      report.cards.find((c) => c.kind === "most_consistent_month")?.headline,
    ).toBe("Jul");
    expect(
      report.cards.find((c) => c.kind === "top_exercises")?.headline,
    ).toBe("Deadlift");
    expect(
      report.cards.find((c) => c.kind === "competition")?.stats[0]?.label,
    ).toBe("Local meet");
  });

  it("marks empty cards honestly when data is missing", () => {
    const report = assembleYearInReview({
      year: 2026,
      athleteDisplayName: "Alex",
      completedSessions: 0,
      sessionsByMonth: Array(12).fill(0),
      prCount: 0,
      prHighlights: [],
      techniqueFirstAvg: null,
      techniqueLastAvg: null,
      techniqueSampleCount: 0,
      topExercises: [],
      competitions: [],
    });
    expect(report.cards.filter((c) => c.empty).map((c) => c.kind)).toEqual([
      "sessions",
      "prs",
      "technique",
      "top_exercises",
      "most_consistent_month",
      "competition",
    ]);
  });

  it("builds share payload", () => {
    const report = assembleYearInReview({
      year: 2026,
      athleteDisplayName: "Alex",
      completedSessions: 10,
      sessionsByMonth: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      prCount: 1,
      prHighlights: [],
      techniqueFirstAvg: null,
      techniqueLastAvg: null,
      techniqueSampleCount: 0,
      topExercises: [],
      competitions: [],
    });
    const share = buildYearInReviewSharePayload(report);
    expect(share.yearKey).toBe("2026");
    expect(share.cards).toHaveLength(8);
  });

  it("snapshot lists card kinds", () => {
    const snap = buildYearInReviewSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.cardKinds).toHaveLength(8);
    expect(snap.docPath).toBe("docs/YEAR_IN_REVIEW.md");
  });
});
