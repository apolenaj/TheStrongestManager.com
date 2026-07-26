import { normalizeTimezone } from "@/domain/timezone-system/zoned";

export type FormatInTimeZoneOptions = Intl.DateTimeFormatOptions & {
  locale?: string;
};

/** Display an instant in the athlete’s timezone (presentation only). */
export function formatInTimeZone(
  input: Date | string | number,
  timeZone: string,
  options: FormatInTimeZoneOptions = {},
): string {
  const { locale = "en-US", ...fmt } = options;
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    timeZone: normalizeTimezone(timeZone),
    ...fmt,
  }).format(d);
}

export function formatDateInTimeZone(
  input: Date | string | number,
  timeZone: string,
  locale = "en-US",
): string {
  return formatInTimeZone(input, timeZone, {
    locale,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTimeInTimeZone(
  input: Date | string | number,
  timeZone: string,
  locale = "en-US",
): string {
  return formatInTimeZone(input, timeZone, {
    locale,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Long competition date headline. */
export function formatCompetitionDateInTimeZone(
  input: Date | string | number,
  timeZone: string,
  locale = "en-US",
): string {
  return formatInTimeZone(input, timeZone, {
    locale,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
