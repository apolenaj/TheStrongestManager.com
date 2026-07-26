import type { GoalLiftHint } from "@/domain/goal-probability/types";

const LIFT_PATTERNS: Array<{ slug: NonNullable<GoalLiftHint>; re: RegExp }> = [
  { slug: "deadlift", re: /\bdeadlift\b|\bdl\b/i },
  { slug: "back-squat", re: /\b(back\s*)?squat\b/i },
  { slug: "bench-press", re: /\bbench(\s*press)?\b/i },
  { slug: "overhead-press", re: /\b(overhead|ohp|military)\s*press\b|\bohp\b/i },
];

/**
 * Infer competition lift from a goal title when not explicitly bound.
 */
export function inferLiftFromTitle(title: string): GoalLiftHint {
  for (const p of LIFT_PATTERNS) {
    if (p.re.test(title)) return p.slug;
  }
  return null;
}

/**
 * Pull a kg target from title when targetValue is missing
 * (e.g. "Deadlift 320 kg by October 15").
 */
export function inferTargetKgFromTitle(title: string): number | null {
  const m = title.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Best-effort target date from common title phrases.
 * Returns null when ambiguous — never invent a deadline.
 */
export function inferTargetDateFromTitle(
  title: string,
  now: Date = new Date(),
): Date | null {
  // Explicit ISO-ish: 2026-10-15
  const iso = title.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const months: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const named = title.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(20\d{2}))?\b/i,
  );
  if (!named) return null;

  const month = months[named[1]!.toLowerCase()];
  if (month == null) return null;
  const day = Number(named[2]);
  const year = named[3] ? Number(named[3]) : now.getUTCFullYear();
  if (!Number.isFinite(day) || day < 1 || day > 31) return null;

  let d = new Date(Date.UTC(year, month, day, 12, 0, 0));
  // If month/day already passed this year and year was implicit, roll forward.
  if (!named[3] && d.getTime() < now.getTime() - 2 * 24 * 60 * 60 * 1000) {
    d = new Date(Date.UTC(year + 1, month, day, 12, 0, 0));
  }
  return Number.isNaN(d.getTime()) ? null : d;
}

export function resolveTargetKg(goal: {
  targetValue: number | null;
  targetUnit: string | null;
  title: string;
}): number | null {
  if (goal.targetValue != null && goal.targetValue > 0) {
    const unit = (goal.targetUnit ?? "kg").toLowerCase();
    if (unit === "lb" || unit === "lbs") {
      return goal.targetValue * 0.45359237;
    }
    return goal.targetValue;
  }
  return inferTargetKgFromTitle(goal.title);
}
