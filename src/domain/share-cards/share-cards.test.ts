import { describe, expect, it } from "vitest";
import type { PrEvent } from "@/domain/pr-intelligence";
import {
  assertOnlySelectedMetrics,
  buildShareCardModel,
  defaultSelectedMetrics,
  SHARE_CARD_BRAND,
} from "@/domain/share-cards";

const event: PrEvent = {
  id: "str:s2:rep_pr+estimated_1rm",
  types: ["rep_pr", "estimated_1rm"],
  primaryType: "rep_pr",
  at: "2026-03-10T12:00:00.000Z",
  exerciseKey: "deadlift",
  exerciseLabel: "Deadlift",
  title: "NEW PR",
  headline: "260 kg × 7",
  related: ["Estimated 1RM increased.", "Technique score also improved."],
  metrics: {
    loadKg: 260,
    reps: 7,
    estimated1rmKg: 320,
    volumeKg: 1820,
    techniqueScore: 86,
    previousEstimated1rmKg: 312,
    previousTechniqueScore: 82,
  },
};

describe("buildShareCardModel", () => {
  it("defaults to no private metrics", () => {
    const model = buildShareCardModel(event, {
      formatId: "instagram_story",
      selectedMetrics: defaultSelectedMetrics(),
    });
    expect(model.eyebrow).toBe("NEW DEADLIFT PR");
    expect(model.headline).toMatch(/260 KG/);
    expect(model.brand).toBe(SHARE_CARD_BRAND);
    expect(model.includedMetrics).toEqual([]);
    expect(model.lines.filter((l) => l.kind === "stat")).toHaveLength(0);
    expect(assertOnlySelectedMetrics(model, [])).toBe(true);
  });

  it("includes opted-in technique and e1RM lines", () => {
    const model = buildShareCardModel(event, {
      formatId: "instagram_post",
      selectedMetrics: ["technique_delta", "estimated_1rm_delta"],
    });
    const stats = model.lines.filter((l) => l.kind === "stat");
    expect(stats.some((s) => s.label === "Technique" && s.value === "82 → 86")).toBe(
      true,
    );
    expect(
      stats.some((s) => s.label === "Estimated 1RM" && s.value === "+8 kg"),
    ).toBe(true);
    expect(model.includedMetrics).toEqual([
      "technique_delta",
      "estimated_1rm_delta",
    ]);
    expect(
      assertOnlySelectedMetrics(model, [
        "technique_delta",
        "estimated_1rm_delta",
      ]),
    ).toBe(true);
  });

  it("does not leak volume unless selected", () => {
    const model = buildShareCardModel(event, {
      formatId: "tiktok",
      selectedMetrics: ["technique_delta"],
    });
    expect(model.lines.some((l) => l.label === "Volume")).toBe(false);
    expect(model.includedMetrics).not.toContain("volume");
  });
});
