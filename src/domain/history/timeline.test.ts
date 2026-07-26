import { describe, expect, it } from "vitest";
import { getPublishedMethods } from "@/domain/methods/catalog";
import {
  HISTORY_ERAS,
  allHistoryEraSlugs,
  getHistoryEraBySlug,
  listHistoryEras,
} from "@/domain/history/timeline";

describe("history timeline", () => {
  it("includes the required educational eras", () => {
    const slugs = allHistoryEraSlugs();
    expect(slugs).toEqual(
      expect.arrayContaining([
        "early-physical-culture",
        "golden-era-bodybuilding",
        "soviet-weightlifting-systems",
        "high-intensity-training",
        "westside-conjugate",
        "modern-autoregulation",
        "evidence-informed-programming",
      ]),
    );
    expect(slugs).toHaveLength(7);
  });

  it("sorts eras chronologically by sortYear", () => {
    const years = listHistoryEras().map((e) => e.sortYear);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });

  it("only links published method slugs", () => {
    const published = new Set(getPublishedMethods().map((m) => m.slug));
    for (const era of HISTORY_ERAS) {
      expect(era.narrative.length).toBeGreaterThanOrEqual(2);
      expect(era.relatedMethodSlugs.length).toBeGreaterThan(0);
      for (const slug of era.relatedMethodSlugs) {
        expect(published.has(slug)).toBe(true);
      }
    }
  });

  it("resolves era by slug", () => {
    expect(getHistoryEraBySlug("westside-conjugate")?.title).toMatch(
      /conjugate/i,
    );
    expect(getHistoryEraBySlug("missing")).toBeUndefined();
  });
});
