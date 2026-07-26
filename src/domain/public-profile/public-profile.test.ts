import { describe, expect, it } from "vitest";
import {
  assemblePublicProfile,
  computeTrainingStreakDays,
  defaultVisibility,
  normalizePublicSlug,
  parseVisibilityJson,
} from "@/domain/public-profile";

describe("normalizePublicSlug", () => {
  it("normalizes and rejects reserved/short slugs", () => {
    expect(normalizePublicSlug("Jane-Doe_99")).toBe("jane-doe-99");
    expect(normalizePublicSlug("ab")).toBeNull();
    expect(normalizePublicSlug("admin")).toBeNull();
    expect(normalizePublicSlug("My Cool Lift")).toBe("my-cool-lift");
  });
});

describe("assemblePublicProfile", () => {
  const signals = {
    displayName: "Jane",
    sport: "powerlifting",
    bio: "Puller",
    prs: [{ liftLabel: "Deadlift", loadKg: 200, reps: 1 }],
    competitions: [
      {
        name: "Local",
        sport: "powerlifting",
        date: "2026-01-01T00:00:00.000Z",
        weightClassLabel: "63 kg",
      },
    ],
    achievements: [
      { title: "NEW PR", headline: "200 kg", at: "2026-02-01T00:00:00.000Z" },
    ],
    techniqueHighlights: [
      {
        exerciseLabel: "Deadlift",
        score: 86,
        at: "2026-03-01T00:00:00.000Z",
      },
    ],
    trainingStreakDays: 5,
    bodyMetrics: [
      {
        label: "Bodyweight",
        value: 62,
        unit: "kg",
        recordedAt: "2026-03-01T00:00:00.000Z",
      },
    ],
    recoverySummary: "SECRET RECOVERY",
    privateNotes: "SECRET NOTES",
  };

  it("defaults to name/sport only and never leaks recovery/notes", () => {
    const view = assemblePublicProfile("jane", defaultVisibility(), signals);
    expect(view.displayName).toBe("Jane");
    expect(view.sport).toBe("powerlifting");
    expect(view.prs).toBeNull();
    expect(view.bodyMetrics).toBeNull();
    expect(JSON.stringify(view)).not.toMatch(/SECRET/);
    expect(view.hiddenByPrivacy).toContain("Recovery data");
    expect(view.hiddenByPrivacy).toContain("Private notes");
  });

  it("includes body metrics only when explicitly selected", () => {
    const vis = defaultVisibility();
    vis.body_metrics = true;
    vis.prs = true;
    const view = assemblePublicProfile("jane", vis, signals);
    expect(view.bodyMetrics).toHaveLength(1);
    expect(view.prs).toHaveLength(1);
  });
});

describe("computeTrainingStreakDays", () => {
  it("counts consecutive days ending today", () => {
    const now = new Date("2026-07-21T15:00:00.000Z");
    const streak = computeTrainingStreakDays(
      [
        new Date("2026-07-21T10:00:00.000Z"),
        new Date("2026-07-20T10:00:00.000Z"),
        new Date("2026-07-19T10:00:00.000Z"),
        new Date("2026-07-17T10:00:00.000Z"),
      ],
      now,
    );
    expect(streak).toBe(3);
  });
});

describe("parseVisibilityJson", () => {
  it("merges known keys only", () => {
    const v = parseVisibilityJson(
      JSON.stringify({ prs: true, recovery: true, junk: true }),
    );
    expect(v.prs).toBe(true);
    expect(v.body_metrics).toBe(false);
  });
});
