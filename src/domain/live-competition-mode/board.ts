import {
  LIVE_ATTEMPT_NUMBERS,
  LIVE_ATTEMPT_RESULTS,
  LIVE_LIFT_KINDS,
  type LiveAttemptNumber,
  type LiveAttemptResult,
  type LiveLiftKind,
} from "@/domain/live-competition-mode/constants";
import type {
  LiveAttemptRecord,
  LiveNextAttempt,
  LiveWarmupSlot,
  LiveWarmupTimingView,
} from "@/domain/live-competition-mode/types";

const LIFT_ORDER: LiveLiftKind[] = ["squat", "bench", "deadlift", "other"];

export function isLiveLiftKind(value: string): value is LiveLiftKind {
  return (LIVE_LIFT_KINDS as readonly string[]).includes(value);
}

export function isLiveAttemptResult(value: string): value is LiveAttemptResult {
  return (LIVE_ATTEMPT_RESULTS as readonly string[]).includes(value);
}

export function isLiveAttemptNumber(n: number): n is LiveAttemptNumber {
  return (LIVE_ATTEMPT_NUMBERS as readonly number[]).includes(n);
}

/**
 * Resolve the next pending attempt: squat→bench→deadlift, attempts 1→2→3.
 * Does not invent loads — only picks among existing board rows.
 */
export function resolveNextAttempt(
  attempts: LiveAttemptRecord[],
): LiveNextAttempt {
  const pending = attempts.filter((a) => a.result === "pending");
  if (pending.length === 0) {
    return null;
  }

  pending.sort((a, b) => {
    const liftDiff =
      LIFT_ORDER.indexOf(a.lift) - LIFT_ORDER.indexOf(b.lift);
    if (liftDiff !== 0) return liftDiff;
    return a.attemptNumber - b.attemptNumber;
  });

  const next = pending[0]!;
  return {
    attempt: next,
    reason: `Next pending: ${next.lift} attempt ${next.attemptNumber}.`,
  };
}

/**
 * Warm-up timing from platform clock + offset slots.
 * Never attaches recommended loads.
 */
export function buildWarmupTimingView(input: {
  platformAt: string | null;
  slots: LiveWarmupSlot[];
  nowMs?: number;
}): LiveWarmupTimingView {
  const now = input.nowMs ?? Date.now();
  const platformMs = input.platformAt
    ? new Date(input.platformAt).getTime()
    : null;

  const slots = [...input.slots]
    .sort(
      (a, b) =>
        b.offsetMinutesBeforePlatform - a.offsetMinutesBeforePlatform,
    )
    .map((slot) => {
      if (platformMs == null || !Number.isFinite(platformMs)) {
        return {
          ...slot,
          scheduledAt: null,
          minutesUntil: null,
        };
      }
      const scheduledMs =
        platformMs - slot.offsetMinutesBeforePlatform * 60_000;
      return {
        ...slot,
        scheduledAt: new Date(scheduledMs).toISOString(),
        minutesUntil: Math.round((scheduledMs - now) / 60_000),
      };
    });

  return {
    platformAt: input.platformAt,
    slots,
    honesty:
      "Warm-up windows are timing aids only — they never prescribe loads, jumps, or cut protocols.",
  };
}

/**
 * Soft guard: flag large planned jump vs previous good attempt.
 * Returns a caution string — never auto-blocks or invents a “safe” load.
 */
export function cautionForAttemptJump(input: {
  previousGoodLoadKg: number | null;
  plannedLoadKg: number | null;
  /** Absolute kg jump above which we surface a caution (not a ban). */
  cautionDeltaKg?: number;
}): string | null {
  const deltaThreshold = input.cautionDeltaKg ?? 20;
  if (
    input.previousGoodLoadKg == null ||
    input.plannedLoadKg == null ||
    !Number.isFinite(input.previousGoodLoadKg) ||
    !Number.isFinite(input.plannedLoadKg)
  ) {
    return null;
  }
  const jump = input.plannedLoadKg - input.previousGoodLoadKg;
  if (jump <= deltaThreshold) return null;
  return `Planned jump is ${Math.round(jump)} kg above the last good lift — confirm with your coach. This app never auto-approves jumps.`;
}

/** Default empty SBD attempt board (all pending, no loads). */
export function emptyPowerliftingAttemptBoard(
  meetSessionId: string,
): Omit<LiveAttemptRecord, "id">[] {
  const lifts: LiveLiftKind[] = ["squat", "bench", "deadlift"];
  const rows: Omit<LiveAttemptRecord, "id">[] = [];
  for (const lift of lifts) {
    for (const attemptNumber of LIVE_ATTEMPT_NUMBERS) {
      rows.push({
        meetSessionId,
        lift,
        attemptNumber,
        plannedLoadKg: null,
        result: "pending",
        resultLoggedAt: null,
        notes: null,
      });
    }
  }
  return rows;
}
