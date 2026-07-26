import { describe, expect, it } from "vitest";
import {
  resolvePlanningCeiling,
  selectAttempts,
} from "@/domain/attempt-selector";

describe("resolvePlanningCeiling", () => {
  it("returns null without inputs", () => {
    expect(
      resolvePlanningCeiling({
        strength: null,
        goalKg: null,
        confidence: "moderate",
        historyBestMadeKg: null,
      }),
    ).toBeNull();
  });

  it("blends strength with confidence", () => {
    const high = resolvePlanningCeiling({
      strength: { lowKg: 300, highKg: 320, sourceLabel: "test" },
      goalKg: null,
      confidence: "high",
      historyBestMadeKg: null,
    })!;
    const low = resolvePlanningCeiling({
      strength: { lowKg: 300, highKg: 320, sourceLabel: "test" },
      goalKg: null,
      confidence: "low",
      historyBestMadeKg: null,
    })!;
    expect(low).toBeLessThan(high);
  });
});

describe("selectAttempts", () => {
  it("produces opener, second, and conditional third range", () => {
    const result = selectAttempts({
      lift: "deadlift",
      recentStrength: {
        lowKg: 305,
        highKg: 325,
        sourceLabel: "PR prediction",
      },
      history: [
        {
          meetDate: new Date("2026-01-10T12:00:00.000Z"),
          lift: "deadlift",
          openerKg: 290,
          secondKg: 305,
          thirdKg: 315,
          bestMadeKg: 305,
          missedOpener: false,
        },
      ],
      confidence: "moderate",
      goalKg: 330,
      risk: "balanced",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const s = result.selection;
    expect(s.openerKg).toBeGreaterThan(0);
    expect(s.secondKg).toBeGreaterThan(s.openerKg);
    expect(s.third.highKg).toBeGreaterThanOrEqual(s.third.lowKg);
    expect(s.third.lowKg).toBeGreaterThan(s.secondKg);
    expect(s.third.condition).toMatch(/depending on the second/i);
    expect(s.strategy.length).toBeGreaterThan(3);
    expect(s.honestyNote).toMatch(/never a guarantee/i);
    expect(s.strategy.join(" ")).not.toMatch(/guaranteed make|will make/i);
  });

  it("matches the example shape near 300 / 315 / 325–330 on conservative-ish ceiling", () => {
    const result = selectAttempts({
      lift: "deadlift",
      recentStrength: {
        lowKg: 315,
        highKg: 335,
        sourceLabel: "training",
      },
      history: [],
      confidence: "high",
      goalKg: 330,
      risk: "conservative",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Conservative ~90% / 95% / 97–99% of ~330 ceiling
    expect(result.selection.openerKg).toBeGreaterThanOrEqual(290);
    expect(result.selection.openerKg).toBeLessThanOrEqual(305);
    expect(result.selection.secondKg).toBeGreaterThanOrEqual(305);
    expect(result.selection.secondKg).toBeLessThanOrEqual(320);
    expect(result.selection.third.lowKg).toBeGreaterThanOrEqual(315);
    expect(result.selection.third.highKg).toBeLessThanOrEqual(335);
  });

  it("aggressive risk raises attempts vs conservative", () => {
    const base = {
      lift: "squat" as const,
      recentStrength: {
        lowKg: 180,
        highKg: 200,
        sourceLabel: "est",
      },
      history: [],
      confidence: "moderate" as const,
      goalKg: 200,
    };
    const cons = selectAttempts({ ...base, risk: "conservative" });
    const agg = selectAttempts({ ...base, risk: "aggressive" });
    expect(cons.ok && agg.ok).toBe(true);
    if (!cons.ok || !agg.ok) return;
    expect(agg.selection.openerKg).toBeGreaterThanOrEqual(
      cons.selection.openerKg,
    );
    expect(agg.selection.secondKg).toBeGreaterThanOrEqual(
      cons.selection.secondKg,
    );
  });

  it("withholds when data is missing", () => {
    const result = selectAttempts({
      lift: "bench",
      recentStrength: null,
      history: [],
      confidence: "low",
      goalKg: null,
      risk: "balanced",
    });
    expect(result.ok).toBe(false);
  });

  it("pulls opener down after a missed opener in history", () => {
    const made = selectAttempts({
      lift: "bench",
      recentStrength: { lowKg: 140, highKg: 150, sourceLabel: "est" },
      history: [
        {
          meetDate: new Date("2026-03-01"),
          lift: "bench",
          openerKg: 140,
          secondKg: 145,
          thirdKg: 150,
          bestMadeKg: 145,
          missedOpener: false,
        },
      ],
      confidence: "moderate",
      goalKg: 150,
      risk: "balanced",
    });
    const missed = selectAttempts({
      lift: "bench",
      recentStrength: { lowKg: 140, highKg: 150, sourceLabel: "est" },
      history: [
        {
          meetDate: new Date("2026-03-01"),
          lift: "bench",
          openerKg: 145,
          secondKg: null,
          thirdKg: null,
          bestMadeKg: null,
          missedOpener: true,
        },
      ],
      confidence: "moderate",
      goalKg: 150,
      risk: "balanced",
    });
    expect(made.ok && missed.ok).toBe(true);
    if (!made.ok || !missed.ok) return;
    expect(missed.selection.openerKg).toBeLessThanOrEqual(
      made.selection.openerKg,
    );
  });
});
