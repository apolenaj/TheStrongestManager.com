/**
 * Calendar month windows (UTC) for monthly reports.
 */

export type MonthWindow = {
  /** e.g. 2026-07 */
  monthKey: string;
  monthStart: Date;
  /** Exclusive end = first day of next month. */
  monthEnd: Date;
  label: string;
  inProgress: boolean;
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function monthKeyFromDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

export function parseMonthKey(
  monthKey: string,
  now = new Date(),
): MonthWindow | null {
  const m = /^(\d{4})-(\d{2})$/.exec(monthKey.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) return null;
  return monthWindowFor(year, month, now);
}

export function monthWindowContaining(now = new Date()): MonthWindow {
  return monthWindowFor(now.getUTCFullYear(), now.getUTCMonth() + 1, now);
}

export function monthWindowFor(
  year: number,
  month1to12: number,
  now = new Date(),
): MonthWindow {
  const monthStart = new Date(Date.UTC(year, month1to12 - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month1to12, 1));
  const monthKey = `${year}-${pad2(month1to12)}`;
  const label = monthStart.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const inProgress = now < monthEnd && now >= monthStart;
  return { monthKey, monthStart, monthEnd, label, inProgress };
}

export function previousMonthWindow(window: MonthWindow): MonthWindow {
  const prev = new Date(window.monthStart);
  prev.setUTCMonth(prev.getUTCMonth() - 1);
  return monthWindowFor(prev.getUTCFullYear(), prev.getUTCMonth() + 1);
}

export function formatMonthRangeLabel(window: MonthWindow): string {
  const from = window.monthStart.toISOString().slice(0, 10);
  const toExclusive = window.monthEnd.toISOString().slice(0, 10);
  return `${window.label} (${from} → ${toExclusive}, exclusive end)`;
}
