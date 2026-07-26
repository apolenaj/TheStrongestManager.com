import { describe, expect, it } from "vitest";
import { resolveCommandCenterLayout } from "@/domain/command-center";
import {
  DASHBOARD_FOCUS_IDS,
  applyFocusPreset,
  buildCustomDashboardsSnapshot,
  layoutPreferencesForFocus,
  normalizeSavedLayout,
  saveCustomDashboardLayout,
  suggestDashboardFocus,
} from "@/domain/custom-dashboards";

describe("custom dashboards", () => {
  it("exposes all required focus choices", () => {
    expect([...DASHBOARD_FOCUS_IDS]).toEqual([
      "strength",
      "technique",
      "recovery",
      "nutrition",
      "competition",
      "bodybuilding",
    ]);
  });

  it("provides smart defaults with TODAY + focus widget above fold", () => {
    for (const id of DASHBOARD_FOCUS_IDS) {
      const prefs = layoutPreferencesForFocus(id);
      const layout = resolveCommandCenterLayout(prefs, 1200);
      expect(layout.aboveFold[0]?.id).toBe("today");
      expect(layout.aboveFold.length).toBe(2);
      expect(layout.aboveFold.length + layout.belowFold.length).toBe(8);
    }

    const strength = resolveCommandCenterLayout(
      layoutPreferencesForFocus("strength"),
      800,
    );
    expect(strength.aboveFold.map((w) => w.id)).toEqual([
      "today",
      "performance",
    ]);

    const technique = resolveCommandCenterLayout(
      layoutPreferencesForFocus("technique"),
      800,
    );
    expect(technique.aboveFold.map((w) => w.id)).toEqual([
      "today",
      "technique",
    ]);
  });

  it("suggests focus from profile signals without inventing", () => {
    expect(
      suggestDashboardFocus({
        primaryDiscipline: null,
        preferredSports: [],
        goalCategories: [],
      }).fromSignals,
    ).toBe(false);

    expect(
      suggestDashboardFocus({
        primaryDiscipline: "bodybuilding",
        preferredSports: [],
        goalCategories: [],
      }).focusId,
    ).toBe("bodybuilding");

    expect(
      suggestDashboardFocus({
        primaryDiscipline: null,
        preferredSports: [],
        goalCategories: ["competition"],
      }).focusId,
    ).toBe("competition");
  });

  it("saves and normalizes layouts", () => {
    const applied = applyFocusPreset("recovery", "2026-07-22T00:00:00.000Z");
    expect(applied.focusId).toBe("recovery");
    expect(applied.savedAt).toBe("2026-07-22T00:00:00.000Z");
    expect(applied.customizedAfterPreset).toBe(false);

    const saved = saveCustomDashboardLayout(
      applied,
      "2026-07-22T01:00:00.000Z",
    );
    expect(saved.savedAt).toBe("2026-07-22T01:00:00.000Z");

    const normalized = normalizeSavedLayout({
      focusId: "nope",
      layout: { widgets: [{ id: "today", visible: true }] },
    });
    expect(normalized.focusId).toBe("strength");
    expect(normalized.layout.widgets).toHaveLength(8);
  });

  it("snapshot lists focuses and storage key", () => {
    const snap = buildCustomDashboardsSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.focuses).toHaveLength(6);
    expect(snap.docPath).toBe("docs/CUSTOM_DASHBOARDS.md");
    expect(snap.storageKey).toContain("custom_dashboard");
  });
});
