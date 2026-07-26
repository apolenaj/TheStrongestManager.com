import { describe, expect, it } from "vitest";
import {
  assemblePerformanceStory,
  buildChapterLines,
  buildPerformanceStorySharePayload,
  buildPerformanceStorySnapshot,
  containsFakeCausalLanguage,
} from "@/domain/performance-story";

describe("performance story", () => {
  it("builds example-shaped chapters without causal glue", () => {
    const story = assemblePerformanceStory({
      year: 2026,
      units: "kg",
      months: [
        {
          month: 1,
          year: 2026,
          liftPeaks: [
            { liftKey: "deadlift", liftLabel: "Deadlift", bestLoadKg: 280 },
          ],
          techniqueAvg: null,
          techniqueAvgPrior: null,
          bodyweightStartKg: null,
          bodyweightEndKg: null,
          completedSessions: 8,
        },
        {
          month: 4,
          year: 2026,
          liftPeaks: [
            { liftKey: "deadlift", liftLabel: "Deadlift", bestLoadKg: 300 },
          ],
          techniqueAvg: null,
          techniqueAvgPrior: null,
          bodyweightStartKg: null,
          bodyweightEndKg: null,
          completedSessions: 10,
        },
        {
          month: 7,
          year: 2026,
          liftPeaks: [],
          techniqueAvg: 82,
          techniqueAvgPrior: 70,
          bodyweightStartKg: 90,
          bodyweightEndKg: 85,
          completedSessions: 9,
        },
      ],
    });

    const jan = story.chapters.find((c) => c.month === 1)!;
    expect(jan.lines.map((l) => l.text)).toContain("Deadlift 280 kg.");

    const apr = story.chapters.find((c) => c.month === 4)!;
    expect(apr.lines.map((l) => l.text)).toContain("Deadlift 300 kg.");

    const jul = story.chapters.find((c) => c.month === 7)!;
    expect(jul.lines.map((l) => l.text)).toEqual(
      expect.arrayContaining([
        "Technique improved +12.",
        "Bodyweight −5 kg.",
      ]),
    );

    // Parallel facts — never a single causal sentence joining them
    for (const line of jul.lines) {
      expect(containsFakeCausalLanguage(line.text)).toBe(false);
    }
    expect(story.causalityCaveat).toMatch(/not proof/i);
  });

  it("omits quiet months from chapters", () => {
    const story = assemblePerformanceStory({
      year: 2026,
      units: "kg",
      months: [
        {
          month: 3,
          year: 2026,
          liftPeaks: [],
          techniqueAvg: null,
          techniqueAvgPrior: null,
          bodyweightStartKg: null,
          bodyweightEndKg: null,
          completedSessions: 0,
        },
      ],
    });
    expect(story.chapters).toHaveLength(0);
    expect(story.quietMonths).toContain("March");
  });

  it("builds share payload without inventing causality", () => {
    const story = assemblePerformanceStory({
      year: 2026,
      units: "kg",
      months: [
        {
          month: 1,
          year: 2026,
          liftPeaks: [
            { liftKey: "squat", liftLabel: "Squat", bestLoadKg: 180 },
          ],
          techniqueAvg: null,
          techniqueAvgPrior: null,
          bodyweightStartKg: null,
          bodyweightEndKg: null,
          completedSessions: 4,
        },
      ],
    });
    const share = buildPerformanceStorySharePayload({
      story,
      athleteDisplayName: "Alex",
    });
    expect(share.yearKey).toBe("2026");
    expect(share.chapters[0]?.lines[0]).toMatch(/Squat/);
    expect(share.honestyNote).toMatch(/parallel facts|not proof|caused/i);
  });

  it("detects forbidden causal phrasing", () => {
    expect(containsFakeCausalLanguage("Deadlift 280 kg.")).toBe(false);
    expect(
      containsFakeCausalLanguage("Technique improved because bodyweight dropped."),
    ).toBe(true);
  });

  it("snapshot documents example shape", () => {
    const snap = buildPerformanceStorySnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.exampleChapterShape[0]).toMatch(/January/);
    expect(snap.docPath).toBe("docs/PERFORMANCE_STORY.md");
  });

  it("formats lb units for lift lines", () => {
    const lines = buildChapterLines(
      {
        month: 1,
        year: 2026,
        liftPeaks: [
          { liftKey: "deadlift", liftLabel: "Deadlift", bestLoadKg: 100 },
        ],
        techniqueAvg: null,
        techniqueAvgPrior: null,
        bodyweightStartKg: null,
        bodyweightEndKg: null,
        completedSessions: 1,
      },
      "lb",
    );
    expect(lines[0]?.text).toMatch(/lb/);
  });
});
