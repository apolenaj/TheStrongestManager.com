/**
 * Progress analytics ranges (Prompt 25).
 */

export const PROGRESS_RANGES = [
  { id: "4w", label: "4 weeks", days: 28 },
  { id: "12w", label: "12 weeks", days: 84 },
  { id: "6m", label: "6 months", days: 183 },
  { id: "1y", label: "1 year", days: 365 },
  { id: "all", label: "All time", days: null },
] as const;

export type ProgressRangeId = (typeof PROGRESS_RANGES)[number]["id"];

export function parseProgressRangeId(
  raw: string | null | undefined,
): ProgressRangeId {
  const match = PROGRESS_RANGES.find((r) => r.id === raw);
  return match?.id ?? "12w";
}

export function rangeStartDate(
  rangeId: ProgressRangeId,
  asOf = new Date(),
): Date | null {
  const def = PROGRESS_RANGES.find((r) => r.id === rangeId)!;
  if (def.days == null) return null;
  const start = new Date(asOf);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (def.days - 1));
  return start;
}

export type ChartPoint = {
  /** ISO date for sorting / tooltips */
  at: string;
  /** Numeric value in canonical units (kg, score, ratio, etc.) */
  value: number;
  /** Optional secondary value (e.g. reps for e1RM) */
  meta?: string;
};

export type ProgressSeries = {
  id: string;
  title: string;
  description: string;
  unitLabel: string;
  points: ChartPoint[];
  emptyTitle: string;
  emptyDescription: string;
};
