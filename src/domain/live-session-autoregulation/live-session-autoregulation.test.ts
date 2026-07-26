import { describe, expect, it } from "vitest";
import {
  LIVE_AUTOREG_EXAMPLE,
  LIVE_AUTOREG_FORBIDDEN,
  evaluateLiveAutoregulation,
  mayAutoApplyAutoregulation,
  buildLiveAutoregSnapshot,
} from "@/domain/live-session-autoregulation";

describe("live session autoregulation", () => {
  it("suggests reduce next set for the 250×3 @7 vs @9 example", () => {
    const result = evaluateLiveAutoregulation({
      completed: {
        plannedLoadKg: LIVE_AUTOREG_EXAMPLE.plannedLoadKg,
        plannedReps: LIVE_AUTOREG_EXAMPLE.plannedReps,
        plannedRpe: LIVE_AUTOREG_EXAMPLE.plannedRpe,
        actualLoadKg: LIVE_AUTOREG_EXAMPLE.actualLoadKg,
        actualReps: LIVE_AUTOREG_EXAMPLE.actualReps,
        actualRpe: LIVE_AUTOREG_EXAMPLE.actualRpe,
      },
      nextSetLoadKg: 250,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.suggestion.kind).toBe("reduce_next_set");
    expect(result.suggestion.requiresUserConfirmation).toBe(true);
    expect(result.suggestion.autoApplied).toBe(false);
    expect(result.suggestion.proposedNextLoadKg).toBe(245);
    expect(result.suggestion.rpeDelta).toBe(2);
  });

  it("does not suggest when RPE is not significantly harder", () => {
    const result = evaluateLiveAutoregulation({
      completed: {
        plannedLoadKg: 100,
        plannedReps: 5,
        plannedRpe: 7,
        actualLoadKg: 100,
        actualReps: 5,
        actualRpe: 7.5,
      },
      nextSetLoadKg: 100,
    });
    expect(result.ok).toBe(false);
  });

  it("does not invent RPE or auto-apply", () => {
    expect(
      evaluateLiveAutoregulation({
        completed: {
          plannedLoadKg: 100,
          plannedReps: 5,
          plannedRpe: null,
          actualLoadKg: 100,
          actualReps: 5,
          actualRpe: 9,
        },
        nextSetLoadKg: 100,
      }).ok,
    ).toBe(false);
    expect(mayAutoApplyAutoregulation()).toBe(false);
    expect(LIVE_AUTOREG_FORBIDDEN).toContain(
      "auto_apply_without_confirmation",
    );
    const snap = buildLiveAutoregSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/LIVE_SESSION_AUTOREGULATION.md");
  });
});
