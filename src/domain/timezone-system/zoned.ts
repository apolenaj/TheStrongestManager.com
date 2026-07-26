import {
  DEFAULT_TIMEZONE,
  type ZonedDateTimeParts,
} from "@/domain/timezone-system/constants";

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** Normalize profile / input timezone to a valid IANA id (default UTC). */
export function normalizeTimezone(
  value: string | null | undefined,
): string {
  const trimmed = value?.trim();
  if (!trimmed) return DEFAULT_TIMEZONE;
  return isValidTimeZone(trimmed) ? trimmed : DEFAULT_TIMEZONE;
}

/** Persist / transport helper — always UTC ISO-8601 with Z. */
export function toUtcIso(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toISOString();
}

/** Ensure a Date from DB/JSON is treated as an absolute instant (UTC-backed). */
export function asUtcDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input);
}

export function zonedParts(
  date: Date,
  timeZone: string,
): ZonedDateTimeParts {
  const tz = normalizeTimezone(timeZone);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    second: Number(bag.second),
  };
}

/** Local calendar key YYYY-MM-DD in the given timezone. */
export function zonedDateKey(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * Convert a wall-clock time in `timeZone` to a UTC Date.
 * Iteratively corrects for offset (handles DST).
 */
export function zonedWallTimeToUtc(
  parts: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;
  },
  timeZone: string,
): Date {
  const tz = normalizeTimezone(timeZone);
  const hour = parts.hour ?? 0;
  const minute = parts.minute ?? 0;
  const second = parts.second ?? 0;
  let utcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    hour,
    minute,
    second,
  );
  for (let i = 0; i < 4; i += 1) {
    const asZoned = zonedParts(new Date(utcMs), tz);
    const asUtcGuess = Date.UTC(
      asZoned.year,
      asZoned.month - 1,
      asZoned.day,
      asZoned.hour,
      asZoned.minute,
      asZoned.second,
    );
    const desired = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      hour,
      minute,
      second,
    );
    const delta = desired - asUtcGuess;
    if (delta === 0) break;
    utcMs += delta;
  }
  return new Date(utcMs);
}

/** Start of the athlete’s local calendar day containing `date`, as UTC instant. */
export function startOfZonedDay(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  return zonedWallTimeToUtc(
    { year: p.year, month: p.month, day: p.day, hour: 0, minute: 0, second: 0 },
    timeZone,
  );
}

/** Exclusive end of local day (start of next local day). */
export function endOfZonedDay(date: Date, timeZone: string): Date {
  const start = startOfZonedDay(date, timeZone);
  // Advance ~36h then snap to next local midnight — DST-safe enough for day bounds
  const guess = new Date(start.getTime() + 36 * 3600 * 1000);
  return startOfZonedDay(guess, timeZone);
}

/**
 * Parse a local calendar date (yyyy-mm-dd) into a UTC instant.
 * Defaults to local noon so the calendar day is stable across most offsets.
 */
export function localDateInputToUtc(
  dateKey: string,
  timeZone: string,
  time: "start" | "noon" = "noon",
): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return zonedWallTimeToUtc(
    {
      year,
      month,
      day,
      hour: time === "noon" ? 12 : 0,
      minute: 0,
      second: 0,
    },
    timeZone,
  );
}

/**
 * Whole calendar days from `now`’s local date to `target`’s local date
 * in the athlete timezone (competition countdowns).
 */
export function daysUntilInTimezone(
  target: Date,
  now: Date,
  timeZone: string,
): number {
  const tz = normalizeTimezone(timeZone);
  const startKey = zonedDateKey(now, tz);
  const endKey = zonedDateKey(target, tz);
  const start = localDateInputToUtc(startKey, tz, "noon");
  const end = localDateInputToUtc(endKey, tz, "noon");
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000));
}
