import { describe, expect, it } from "vitest";
import {
  applyPillarFreshnessToConfidence,
  buildFreshnessSnapshot,
  formatRelativeFreshness,
  freshnessMissingInformation,
} from "@/domain/data-freshness";

describe("data freshness system", () => {
  const now = new Date("2026-07-21T12:00:00.000Z");
  const day = 24 * 60 * 60 * 1000;

  it("formats Prompt 143 example copy", () => {
    expect(
      formatRelativeFreshness(
        new Date(now.getTime() - 42 * day),
        now,
        "technique",
      ),
    ).toBe("42 days old.");
    expect(formatRelativeFreshness(null, now, "recovery")).toBe(
      "No data this week.",
    );
    expect(
      formatRelativeFreshness(
        new Date(now.getTime() - 7 * day),
        now,
        "recovery",
      ),
    ).toBe("No data this week.");
    expect(
      formatRelativeFreshness(
        new Date(now.getTime() - 1 * day),
        now,
        "strength",
      ),
    ).toBe("Updated yesterday.");
  });

  it("builds pillar display lines from signal timestamps", () => {
    const snapshot = buildFreshnessSnapshot(
      [
        {
          kind: "technique_analysis",
          at: new Date(now.getTime() - 42 * day),
        },
        {
          kind: "lift_log",
          at: new Date(now.getTime() - 1 * day),
        },
      ],
      now,
    );

    expect(snapshot.pillars.technique.displayLine).toBe(
      "Technique data: 42 days old.",
    );
    expect(snapshot.pillars.recovery.displayLine).toBe(
      "Recovery: No data this week.",
    );
    expect(snapshot.pillars.strength.displayLine).toBe(
      "Strength estimate: Updated yesterday.",
    );
    expect(snapshot.pillars.technique.band).toBe("stale");
    expect(snapshot.pillars.recovery.band).toBe("missing");
    expect(snapshot.pillars.strength.band).toBe("fresh");
  });

  it("surfaces stale/missing pillars for AI missing information", () => {
    const snapshot = buildFreshnessSnapshot(
      [
        {
          kind: "technique_analysis",
          at: new Date(now.getTime() - 42 * day),
        },
      ],
      now,
    );
    const missing = freshnessMissingInformation(snapshot);
    expect(missing.some((m) => /Technique data/i.test(m))).toBe(true);
    expect(missing.some((m) => /Recovery/i.test(m))).toBe(true);
  });

  it("caps AI confidence when pillars are stale", () => {
    const snapshot = buildFreshnessSnapshot(
      [
        {
          kind: "technique_analysis",
          at: new Date(now.getTime() - 50 * day),
        },
      ],
      now,
    );
    expect(
      applyPillarFreshnessToConfidence("high", snapshot, "technique"),
    ).toBe("low");
    expect(
      applyPillarFreshnessToConfidence("high", snapshot, "assessment"),
    ).toBe("none");
  });
});
