import { describe, expect, it } from "vitest";
import {
  SESSION_READINESS_FORBIDDEN,
  SESSION_READINESS_RECOMMENDATIONS,
  adjustSessionReadiness,
  buildSessionReadinessAdjusterSnapshot,
} from "@/domain/session-readiness-adjuster";

describe("session readiness adjuster", () => {
  it("only recommends proceed, minor adjustment, or review load", () => {
    expect([...SESSION_READINESS_RECOMMENDATIONS]).toEqual([
      "proceed",
      "minor_adjustment",
      "review_load",
    ]);
    expect(SESSION_READINESS_FORBIDDEN).toContain("cancel_workout");
    expect(SESSION_READINESS_FORBIDDEN).toContain(
      "cancel_from_single_metric",
    );
  });

  it("proceeds when signals look fine", () => {
    const adj = adjustSessionReadiness({
      sleepHours: 8,
      fatigue: 3,
      soreness: 2,
      motivation: 8,
    });
    expect(adj.recommendation).toBe("proceed");
    expect(adj.cancelsWorkout).toBe(false);
    expect(adj.concernCount).toBe(0);
  });

  it("does not cancel or review_load from a single metric", () => {
    const sleepOnly = adjustSessionReadiness({
      sleepHours: 4,
      fatigue: null,
      soreness: null,
      motivation: null,
    });
    expect(sleepOnly.recommendation).toBe("minor_adjustment");
    expect(sleepOnly.cancelsWorkout).toBe(false);
    expect(sleepOnly.singleMetricEscalationBlocked).toBe(true);
    expect(sleepOnly.recommendation).not.toBe("review_load");

    const fatigueOnly = adjustSessionReadiness({
      sleepHours: 8,
      fatigue: 9,
      soreness: 2,
      motivation: 7,
    });
    expect(fatigueOnly.recommendation).toBe("minor_adjustment");
    expect(fatigueOnly.cancelsWorkout).toBe(false);
  });

  it("may review_load when multiple concerns agree", () => {
    const adj = adjustSessionReadiness({
      sleepHours: 4,
      fatigue: 9,
      soreness: 8,
      motivation: 2,
    });
    expect(adj.recommendation).toBe("review_load");
    expect(adj.concernCount).toBeGreaterThanOrEqual(2);
    expect(adj.cancelsWorkout).toBe(false);
  });

  it("documents snapshot and never invents cancel", () => {
    const snap = buildSessionReadinessAdjusterSnapshot(
      "2026-07-22T00:00:00.000Z",
    );
    expect(snap.docPath).toBe("docs/SESSION_READINESS_ADJUSTER.md");
    expect(snap.recommendations.map((r) => r.id)).not.toContain("cancel");
    expect(snap.reviewLoadMinConcerns).toBe(2);
  });
});
