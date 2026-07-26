import type { ChartPoint } from "@/domain/progress/ranges";
import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";

/** Append-only PR events: a point whenever value sets a new high. */
export function buildPrTimeline(
  samples: Array<{ at: string; valueKg: number; label?: string }>,
): ChartPoint[] {
  const sorted = [...samples].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
  const points: ChartPoint[] = [];
  let best = -Infinity;
  for (const sample of sorted) {
    if (sample.valueKg > best) {
      best = sample.valueKg;
      points.push({
        at: sample.at,
        value: sample.valueKg,
        meta: sample.label ?? `${sample.valueKg} kg`,
      });
    }
  }
  return points;
}

/** Weekly volume buckets from daily tonnage points. */
export function bucketWeeklyVolume(
  daily: Array<{ dayKey: string; volumeKg: number }>,
): ChartPoint[] {
  const weeks = new Map<string, number>();
  for (const day of daily) {
    const d = new Date(`${day.dayKey}T12:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    // ISO week key: year-Wxx using Thursday rule approximation via Monday start
    const monday = new Date(d);
    const dayIdx = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - dayIdx);
    const key = monday.toISOString().slice(0, 10);
    weeks.set(key, (weeks.get(key) ?? 0) + day.volumeKg);
  }
  return [...weeks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([at, value]) => ({
      at: `${at}T00:00:00.000Z`,
      value: Math.round(value * 10) / 10,
      meta: "Week starting",
    }));
}

export function e1rmPointsFromSets(
  sets: Array<{
    at: string;
    loadKg: number;
    reps: number;
  }>,
): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (const set of sets) {
    const e1rm = estimate1rmKg(set.loadKg, set.reps);
    if (e1rm == null) continue;
    points.push({
      at: set.at,
      value: Math.round(e1rm * 10) / 10,
      meta: `${set.loadKg} kg × ${set.reps} (Estimated)`,
    });
  }
  return points.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

/** Best e1RM per day for cleaner charts. */
export function bestPerDay(points: ChartPoint[]): ChartPoint[] {
  const byDay = new Map<string, ChartPoint>();
  for (const point of points) {
    const day = point.at.slice(0, 10);
    const existing = byDay.get(day);
    if (!existing || point.value > existing.value) {
      byDay.set(day, point);
    }
  }
  return [...byDay.values()].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}
