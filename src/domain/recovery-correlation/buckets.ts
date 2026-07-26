/**
 * Bucket recovery + session performance into weeks.
 */

import type { RecoveryWeekBucket } from "@/domain/recovery-correlation/types";

function weekKeyFromDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const monday = new Date(d);
  const dayIdx = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - dayIdx);
  return monday.toISOString().slice(0, 10);
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type RecoveryLogPoint = {
  at: string;
  sleepHours: number | null;
  stress: number | null;
  soreness: number | null;
};

export type SessionPerfPoint = {
  at: string;
  perceivedEffort: number | null;
  completed: boolean;
};

/**
 * Build weekly buckets from recovery logs and completed sessions.
 */
export function bucketRecoveryPerformanceWeeks(input: {
  recovery: RecoveryLogPoint[];
  sessions: SessionPerfPoint[];
}): RecoveryWeekBucket[] {
  const map = new Map<
    string,
    {
      sleep: number[];
      stress: number[];
      soreness: number[];
      rpe: number[];
      completed: number;
    }
  >();

  const ensure = (key: string) => {
    let row = map.get(key);
    if (!row) {
      row = { sleep: [], stress: [], soreness: [], rpe: [], completed: 0 };
      map.set(key, row);
    }
    return row;
  };

  for (const r of input.recovery) {
    const key = weekKeyFromDate(r.at);
    if (!key) continue;
    const row = ensure(key);
    if (r.sleepHours != null) row.sleep.push(r.sleepHours);
    if (r.stress != null) row.stress.push(r.stress);
    if (r.soreness != null) row.soreness.push(r.soreness);
  }

  for (const s of input.sessions) {
    const key = weekKeyFromDate(s.at);
    if (!key) continue;
    const row = ensure(key);
    if (s.completed) row.completed += 1;
    if (s.perceivedEffort != null) row.rpe.push(s.perceivedEffort);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, row]) => ({
      weekKey,
      sleepHoursMean: mean(row.sleep),
      sleepSampleCount: row.sleep.length,
      stressMean: mean(row.stress),
      stressSampleCount: row.stress.length,
      sorenessMean: mean(row.soreness),
      sorenessSampleCount: row.soreness.length,
      sessionRpeMean: mean(row.rpe),
      sessionsWithRpe: row.rpe.length,
      completedSessions: row.completed,
    }));
}
