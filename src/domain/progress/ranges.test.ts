import { describe, expect, it } from "vitest";
import {
  parseProgressRangeId,
  rangeStartDate,
} from "@/domain/progress/ranges";
import { buildPrTimeline } from "@/domain/progress/series";

describe("progress ranges", () => {
  it("defaults unknown range to 12w", () => {
    expect(parseProgressRangeId("nope")).toBe("12w");
    expect(parseProgressRangeId("4w")).toBe("4w");
  });

  it("computes inclusive start for 4 weeks", () => {
    const asOf = new Date(2026, 6, 28);
    const start = rangeStartDate("4w", asOf)!;
    expect(start.getDate()).toBe(1);
  });
});

describe("PR timeline", () => {
  it("emits only new verified highs", () => {
    const prs = buildPrTimeline([
      { at: "2026-01-01T00:00:00.000Z", valueKg: 100, label: "100 kg" },
      { at: "2026-02-01T00:00:00.000Z", valueKg: 95, label: "95 kg" },
      { at: "2026-03-01T00:00:00.000Z", valueKg: 110, label: "110 kg" },
      { at: "2026-04-01T00:00:00.000Z", valueKg: 110, label: "110 kg again" },
    ]);
    expect(prs).toHaveLength(2);
    expect(prs[0]!.value).toBe(100);
    expect(prs[1]!.value).toBe(110);
  });
});
