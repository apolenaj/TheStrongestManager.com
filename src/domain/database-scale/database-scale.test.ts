import { describe, expect, it } from "vitest";
import {
  DATABASE_SCALE_FINDINGS,
  DATABASE_SCALE_FOCUS,
  DATABASE_SCALE_HONESTY,
  DATABASE_SCALING_PATH,
  DATABASE_SCALE_PAGE_SIZES,
  buildDatabaseScaleSnapshot,
} from "@/domain/database-scale";

describe("database scale audit", () => {
  it("covers all prompt focus areas", () => {
    const focuses = new Set(DATABASE_SCALE_FINDINGS.map((f) => f.focus));
    for (const id of DATABASE_SCALE_FOCUS) {
      expect(focuses.has(id)).toBe(true);
    }
  });

  it("documents scaling path without premature sharding", () => {
    expect(DATABASE_SCALING_PATH.map((p) => p.phase)).toEqual([1, 2, 3, 4, 5]);
    expect(DATABASE_SCALING_PATH[0]?.title).toMatch(/Indexes/i);
    const last = DATABASE_SCALING_PATH[DATABASE_SCALING_PATH.length - 1]!;
    expect(last.title).toMatch(/Shard/i);
    expect(last.avoid).toMatch(/prematurely/i);
    expect(DATABASE_SCALE_HONESTY.join(" ")).toMatch(/sharding/i);
  });

  it("ships index and N+1 fixes; defines page sizes", () => {
    expect(
      DATABASE_SCALE_FINDINGS.some(
        (f) => f.id === "idx.session_completed" && f.status === "shipped",
      ),
    ).toBe(true);
    expect(
      DATABASE_SCALE_FINDINGS.some(
        (f) => f.id === "n1.workout_previous" && f.status === "shipped",
      ),
    ).toBe(true);
    expect(DATABASE_SCALE_PAGE_SIZES.techniqueList).toBeGreaterThan(0);
    const snap = buildDatabaseScaleSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.counts.shipped).toBeGreaterThan(0);
    expect(snap.scalingPath).toHaveLength(5);
  });
});
