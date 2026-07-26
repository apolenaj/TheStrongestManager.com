import { describe, expect, it } from "vitest";
import {
  ACTIVITY_FEED_FORBIDDEN_PATTERNS,
  ACTIVITY_FEED_KINDS,
  ACTIVITY_FEED_MAX_ITEMS,
  assembleActivityFeedItems,
  buildActivityFeedSnapshot,
  defaultActivityFeedVisibility,
  kindsEnabledByVisibility,
} from "@/domain/activity-feed";

describe("activity feed mvp", () => {
  it("covers PR, competition, achievement, and shared technique", () => {
    expect([...ACTIVITY_FEED_KINDS]).toEqual([
      "pr",
      "competition_result",
      "achievement",
      "shared_technique",
    ]);
  });

  it("respects visibility toggles", () => {
    const all = defaultActivityFeedVisibility();
    expect(kindsEnabledByVisibility(all)).toHaveLength(4);
    expect(
      kindsEnabledByVisibility({ ...all, feedEnabled: false }),
    ).toHaveLength(0);
    expect(
      kindsEnabledByVisibility({ ...all, showPrs: false, showAchievements: false }),
    ).toEqual(["competition_result", "shared_technique"]);
  });

  it("assembles only enabled kinds from real sources and caps finitely", () => {
    const visibility = defaultActivityFeedVisibility();
    const manyPrs = Array.from({ length: 50 }, (_, i) => ({
      id: `p${i}`,
      at: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
      title: "NEW PR",
      headline: `${100 + i} kg`,
      href: "/app/prs" as string | null,
    }));

    const result = assembleActivityFeedItems(
      {
        prs: manyPrs,
        competitions: [
          {
            id: "c1",
            at: "2026-06-01T00:00:00.000Z",
            name: "Local meet",
            sport: "powerlifting",
            weightClassLabel: "83 kg",
          },
        ],
        achievements: [
          {
            id: "a1",
            achievementId: "first_workout",
            title: "First Workout",
            earnedAt: "2026-05-01T00:00:00.000Z",
          },
        ],
        techniqueShares: [
          {
            id: "t1",
            token: "abc",
            at: "2026-04-01T00:00:00.000Z",
            headline: "Deadlift 78",
          },
        ],
      },
      visibility,
    );

    expect(result.items.length).toBeLessThanOrEqual(ACTIVITY_FEED_MAX_ITEMS);
    expect(result.items.length).toBeLessThanOrEqual(20);
    expect(result.capped).toBe(true);
    expect(result.endOfFeed).toBe(true);
    expect(result.items.some((i) => i.kind === "competition_result")).toBe(
      true,
    );
    expect(result.items.some((i) => i.kind === "pr")).toBe(true);

    const hidden = assembleActivityFeedItems(
      {
        prs: manyPrs.slice(0, 3),
        competitions: [],
        achievements: [],
        techniqueShares: [],
      },
      { ...visibility, showPrs: false },
    );
    expect(hidden.items).toHaveLength(0);
  });

  it("documents anti-dark-pattern refusals", () => {
    expect(ACTIVITY_FEED_FORBIDDEN_PATTERNS).toContain("infinite_scroll");
    expect(ACTIVITY_FEED_FORBIDDEN_PATTERNS).toContain("endless_engagement");
    expect(ACTIVITY_FEED_FORBIDDEN_PATTERNS).toContain("fake_like_counts");
    const snap = buildActivityFeedSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/ACTIVITY_FEED.md");
    expect(snap.kinds).toHaveLength(4);
  });
});
