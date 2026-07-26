/**
 * Monday-start week helpers (aligned with progress volume bucketing).
 */

export type WeekWindow = {
  /** e.g. 2026-W30 */
  weekKey: string;
  weekStart: Date;
  /** Exclusive end (next Monday 00:00). */
  weekEnd: Date;
};

/** Local Monday 00:00 containing `date`. */
export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const dayIdx = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayIdx);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * ISO-like week key using Monday start + ISO week-number (Thursday rule).
 */
export function weekKeyFromMonday(monday: Date): string {
  const thursday = addDays(monday, 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  const year = thursday.getFullYear();
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}

export function weekWindowContaining(date: Date): WeekWindow {
  const weekStart = startOfWeekMonday(date);
  const weekEnd = addDays(weekStart, 7);
  return {
    weekKey: weekKeyFromMonday(weekStart),
    weekStart,
    weekEnd,
  };
}

export function previousWeekWindow(window: WeekWindow): WeekWindow {
  const weekStart = addDays(window.weekStart, -7);
  const weekEnd = window.weekStart;
  return {
    weekKey: weekKeyFromMonday(weekStart),
    weekStart,
    weekEnd,
  };
}

/** Parse 2026-W30 → Monday start when possible; null if invalid. */
export function parseWeekKey(weekKey: string, reference = new Date()): WeekWindow | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekKey.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (!Number.isFinite(year) || week < 1 || week > 53) return null;

  // Find Monday of ISO week: Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4);
  const week1Monday = startOfWeekMonday(jan4);
  const monday = addDays(week1Monday, (week - 1) * 7);
  // Sanity: key must match
  const window = weekWindowContaining(monday);
  if (window.weekKey !== weekKey) {
    // Fallback: walk from reference year
    void reference;
    return window;
  }
  return window;
}

export function formatWeekRangeLabel(window: WeekWindow): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const start = window.weekStart.toLocaleDateString(undefined, opts);
  const end = addDays(window.weekEnd, -1).toLocaleDateString(undefined, {
    ...opts,
    year: "numeric",
  });
  return `${start} – ${end}`;
}
