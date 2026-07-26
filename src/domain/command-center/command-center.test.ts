import { describe, expect, it } from "vitest";
import {
  COMMAND_CENTER_SECTIONS,
  COMMAND_CENTER_WIDGET_CATALOG,
  buildCommandCenterSnapshot,
  buildWidgetSnippets,
  defaultAboveFoldSectionIds,
  defaultLayoutPreferences,
  densityFromViewportWidth,
  moveWidgetOrder,
  normalizeLayoutPreferences,
  resolveCommandCenterLayout,
  setWidgetFold,
  setWidgetVisible,
} from "@/domain/command-center";
import type { DashboardView } from "@/services/dashboard/types";

function minimalDashboard(over: Partial<DashboardView> = {}): DashboardView {
  const emptyScore = {
    key: "x",
    label: "X",
    href: "/app",
    value: null as number | null,
    level: null,
    source: "insufficient" as const,
    emptyLabel: "Not enough data yet.",
    statusLabel: null,
    detail: null,
  };
  return {
    athleteProfileId: "p1",
    greetingName: "Athlete",
    goalTitle: null,
    goals: [],
    discipline: null,
    sportFocuses: [],
    isMultiSport: false,
    experienceLevel: null,
    isNewAthlete: false,
    firstSession: {
      goalChosen: false,
      profileReady: true,
      techniqueUploaded: false,
      workoutLogged: false,
      completedCount: 1,
      totalCount: 4,
    },
    scores: {
      athlete: { ...emptyScore, key: "athlete", label: "Athlete" },
      strength: { ...emptyScore, key: "strength", label: "Strength" },
      technique: { ...emptyScore, key: "technique", label: "Technique" },
      programming: { ...emptyScore, key: "programming", label: "Programming" },
      recovery: { ...emptyScore, key: "recovery", label: "Recovery" },
      consistency: { ...emptyScore, key: "consistency", label: "Consistency" },
      mobilityReadiness: null,
    },
    opportunity: null,
    topInsight: null,
    recentProgress: [],
    trainingLoad: {
      completedLast7Days: 0,
      completedLast28Days: 0,
      plannedUpcoming: 0,
      hasEnoughData: false,
      href: "/app/programs",
    },
    recentSessions: [],
    upcomingWorkout: null,
    techniqueTrend: [],
    recoveryTrend: [],
    personalRecords: [],
    prsBySport: [],
    ...over,
  };
}

describe("command center", () => {
  it("covers all required sections", () => {
    expect([...COMMAND_CENTER_SECTIONS]).toEqual([
      "today",
      "performance",
      "training",
      "technique",
      "recovery",
      "nutrition",
      "goal_trajectory",
      "ai_coach",
    ]);
    expect(COMMAND_CENTER_WIDGET_CATALOG).toHaveLength(8);
  });

  it("keeps only TODAY above the fold by default", () => {
    expect(defaultAboveFoldSectionIds()).toEqual(["today"]);
    const layout = resolveCommandCenterLayout(
      defaultLayoutPreferences(),
      1200,
    );
    expect(layout.aboveFold.map((w) => w.id)).toEqual(["today"]);
    expect(layout.belowFold.length).toBe(7);
    expect(layout.density).toBe("spacious");
  });

  it("adapts density from viewport width", () => {
    expect(densityFromViewportWidth(375)).toBe("compact");
    expect(densityFromViewportWidth(800)).toBe("comfortable");
    expect(densityFromViewportWidth(1400)).toBe("spacious");
  });

  it("lets users hide, reorder, and move widgets across the fold", () => {
    let prefs = defaultLayoutPreferences();
    prefs = setWidgetVisible(prefs, "nutrition", false);
    prefs = setWidgetFold(prefs, "ai_coach", "above");
    prefs = moveWidgetOrder(prefs, "training", "up");

    const layout = resolveCommandCenterLayout(prefs, 800);
    expect(layout.hidden.map((w) => w.id)).toContain("nutrition");
    expect(layout.aboveFold.map((w) => w.id)).toEqual(
      expect.arrayContaining(["today", "ai_coach"]),
    );
    expect(layout.densitySource).toBe("viewport");
  });

  it("normalizes corrupt stored prefs without inventing sections", () => {
    const prefs = normalizeLayoutPreferences({
      version: 99,
      densityOverride: "nope",
      widgets: [{ id: "today", visible: false }, { id: "fake" }],
    });
    expect(prefs.densityOverride).toBeNull();
    expect(prefs.widgets).toHaveLength(8);
    expect(prefs.widgets.find((w) => w.id === "today")?.visible).toBe(false);
  });

  it("builds snippets that stay empty without inventing scores", () => {
    const snippets = buildWidgetSnippets(minimalDashboard());
    expect(snippets.performance.empty).toBe(true);
    expect(snippets.nutrition.empty).toBe(true);
    expect(snippets.training.headline).toMatch(/not enough data/i);
  });

  it("snapshot documents default above-fold policy", () => {
    const snap = buildCommandCenterSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.defaultAboveFold).toEqual(["today"]);
    expect(snap.docPath).toBe("docs/COMMAND_CENTER.md");
    expect(snap.sections).toHaveLength(8);
  });
});
