import { describe, expect, it } from "vitest";
import {
  A11Y_AUDIT_CRITERIA,
  assertTechniqueScoreNotColorOnly,
  buildAccessibilityAuditSnapshot,
  formatScoreAnnouncement,
  SCORE_SYMBOLS,
  SCORE_TEXT_LABELS,
  ACCESSIBILITY_HONESTY,
} from "@/domain/accessibility-system";

describe("accessibility 2.0", () => {
  it("covers required WCAG audit surfaces", () => {
    const surfaces = new Set(A11Y_AUDIT_CRITERIA.map((c) => c.surface));
    for (const required of [
      "keyboard",
      "screen_reader",
      "charts",
      "video_analysis",
      "forms",
      "modals",
      "focus_traps",
      "color_blindness",
      "technique_scores",
    ] as const) {
      expect(surfaces.has(required)).toBe(true);
    }
  });

  it("requires technique scores to use text + symbol, not color alone", () => {
    expect(
      assertTechniqueScoreNotColorOnly({
        hasNumericValue: true,
        hasTextLabel: true,
        hasNonColorSymbol: true,
      }),
    ).toBe(true);
    expect(
      assertTechniqueScoreNotColorOnly({
        hasNumericValue: true,
        hasTextLabel: false,
        hasNonColorSymbol: false,
      }),
    ).toBe(false);

    for (const level of Object.keys(SCORE_TEXT_LABELS) as Array<
      keyof typeof SCORE_TEXT_LABELS
    >) {
      expect(SCORE_TEXT_LABELS[level].length).toBeGreaterThan(0);
      expect(SCORE_SYMBOLS[level].length).toBeGreaterThan(0);
    }
    expect(formatScoreAnnouncement(82, "good", "Technique")).toMatch(
      /Technique: 82, Good/,
    );
    expect(ACCESSIBILITY_HONESTY.join(" ")).toMatch(
      /text label|never the only|not color-only|reinforcement/i,
    );
  });

  it("builds an audit snapshot with passes for shipped fixes", () => {
    const snap = buildAccessibilityAuditSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.counts.fail).toBe(0);
    expect(snap.counts.pass).toBeGreaterThanOrEqual(10);
    expect(
      snap.criteria.some((c) => c.id === "technique.score_dual_cue"),
    ).toBe(true);
  });
});
