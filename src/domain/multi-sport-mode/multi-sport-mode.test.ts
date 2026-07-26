import { describe, expect, it } from "vitest";
import {
  assembleMultiSportMode,
  isMultiSportAthlete,
  multiSportModeText,
  normalizeSportFocuses,
} from "@/domain/multi-sport-mode";

describe("multi-sport-mode", () => {
  it("normalizes Powerlifting + Strongman into two focuses", () => {
    const focuses = normalizeSportFocuses({
      preferredSports: ["powerlifting", "strongman"],
      primaryDiscipline: "hybrid",
    });
    expect(focuses).toEqual(["powerlifting", "strongman"]);
    expect(isMultiSportAthlete(focuses)).toBe(true);
  });

  it("separates PRs by sport namespace and keeps a single-profile payload", () => {
    const mode = assembleMultiSportMode({
      preferredSports: ["powerlifting", "strongman"],
      primaryDiscipline: "hybrid",
      goals: [
        { title: "Add 10 kg to total", category: "performance", priority: 2 },
        { title: "Farmer’s walk 100 m", category: "performance", priority: 1 },
      ],
      loggedPrs: [
        {
          metricKey: "lift_squat",
          value: 180,
          unit: "kg",
          recordedAt: new Date("2026-01-01"),
        },
        {
          metricKey: "lift_bench",
          value: 120,
          unit: "kg",
          recordedAt: new Date("2026-01-02"),
        },
        {
          metricKey: "sm_farmers_walk_distance",
          value: 40,
          unit: "m",
          recordedAt: new Date("2026-01-03"),
        },
        {
          metricKey: "wl_snatch_weight",
          value: 90,
          unit: "kg",
          recordedAt: new Date("2026-01-04"),
        },
      ],
    });

    expect(mode.singleProfile).toBe(true);
    expect(mode.mixedGoalsAllowed).toBe(true);
    expect(mode.isMultiSport).toBe(true);
    expect(mode.focuses.map((f) => f.id)).toEqual([
      "powerlifting",
      "strongman",
    ]);
    expect(mode.goals).toHaveLength(2);

    const pl = mode.prGroups.find((g) => g.sportId === "powerlifting");
    const sm = mode.prGroups.find((g) => g.sportId === "strongman");
    expect(pl?.prs.map((p) => p.metricKey)).toEqual([
      "lift_squat",
      "lift_bench",
    ]);
    expect(sm?.prs.map((p) => p.metricKey)).toEqual([
      "sm_farmers_walk_distance",
    ]);
    // WL PR must not appear under PL or SM groups
    expect(
      mode.prGroups.flatMap((g) => g.prs).map((p) => p.metricKey),
    ).not.toContain("wl_snatch_weight");

    expect(multiSportModeText(mode)).toContain("Powerlifting + Strongman");
  });

  it("treats a single focus as not multi-sport", () => {
    const mode = assembleMultiSportMode({
      preferredSports: ["powerlifting"],
      primaryDiscipline: "powerlifting",
      goals: [],
      loggedPrs: [],
    });
    expect(mode.isMultiSport).toBe(false);
    expect(mode.focuses).toHaveLength(1);
  });
});
