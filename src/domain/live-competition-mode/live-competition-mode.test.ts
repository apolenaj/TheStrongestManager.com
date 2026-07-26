import { describe, expect, it } from "vitest";
import {
  LIVE_COMPETITION_CAPABILITIES,
  LIVE_COMPETITION_SAFETY_REFUSALS,
  buildLiveCompetitionSnapshot,
  buildWarmupTimingView,
  cautionForAttemptJump,
  emptyPowerliftingAttemptBoard,
  resolveNextAttempt,
  type LiveAttemptRecord,
} from "@/domain/live-competition-mode";

describe("live competition mode architecture", () => {
  it("covers enter, attempts, results, next, warm-up, offline", () => {
    const ids = LIVE_COMPETITION_CAPABILITIES.map((c) => c.id);
    expect(ids).toEqual([
      "enter_competition",
      "track_attempts",
      "track_results",
      "next_attempt",
      "warmup_timing",
      "offline_friendly",
    ]);
  });

  it("resolves next pending attempt in SBD order", () => {
    const board = emptyPowerliftingAttemptBoard("meet1").map((row, i) => ({
      ...row,
      id: `a${i}`,
    })) as LiveAttemptRecord[];

    board[0]!.result = "good";
    board[0]!.plannedLoadKg = 200;
    board[1]!.result = "no_lift";

    const next = resolveNextAttempt(board);
    expect(next?.attempt.lift).toBe("squat");
    expect(next?.attempt.attemptNumber).toBe(3);
  });

  it("builds warm-up timing without load prescriptions", () => {
    const view = buildWarmupTimingView({
      platformAt: "2026-07-22T14:00:00.000Z",
      nowMs: Date.parse("2026-07-22T13:00:00.000Z"),
      slots: [
        {
          id: "s1",
          meetSessionId: "m1",
          kind: "general",
          offsetMinutesBeforePlatform: 60,
          label: "General",
          completed: false,
        },
        {
          id: "s2",
          meetSessionId: "m1",
          kind: "platform_ready",
          offsetMinutesBeforePlatform: 10,
          label: "Ready",
          completed: false,
        },
      ],
    });
    expect(view.slots[0]!.minutesUntil).toBe(0);
    expect(view.slots[1]!.minutesUntil).toBe(50);
    expect(view.honesty).toMatch(/timing aids only/i);
  });

  it("cautions large jumps without prescribing a load", () => {
    expect(
      cautionForAttemptJump({
        previousGoodLoadKg: 200,
        plannedLoadKg: 230,
      }),
    ).toMatch(/confirm with your coach/i);
    expect(
      cautionForAttemptJump({
        previousGoodLoadKg: 200,
        plannedLoadKg: 205,
      }),
    ).toBeNull();
  });

  it("refuses unsafe instruction patterns and documents offline key", () => {
    expect(LIVE_COMPETITION_SAFETY_REFUSALS).toContain(
      "dehydration_or_cut_protocol",
    );
    expect(LIVE_COMPETITION_SAFETY_REFUSALS).toContain(
      "unsafe_warmup_load_protocol",
    );
    const snap = buildLiveCompetitionSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/LIVE_COMPETITION_MODE.md");
    expect(snap.offlineStorageKey).toBe("tsm-live-competition-pending");
    expect(snap.liveRuntimeEnabled).toBe(false);
  });
});
