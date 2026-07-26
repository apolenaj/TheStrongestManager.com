/**
 * Timezone system (Prompt 150).
 * Store UTC. Display local. Respect AthleteProfile.timezone (IANA).
 */

export const TIMEZONE_ENGINE_VERSION = "timezone.v1" as const;

/** Fallback when profile timezone is missing or invalid. */
export const DEFAULT_TIMEZONE = "UTC";

export const TIMEZONE_SYSTEM_HONESTY = [
  "All timestamps are stored as UTC instants — never rewrite history when a user changes timezone.",
  "Workout dates, competition countdowns, notifications, and coach messages display in the athlete’s IANA timezone.",
  "Calendar “today” and day-bounded notifications use the athlete’s local day, not the server’s clock alone.",
] as const;

/**
 * Curated IANA zones for the profile picker (not exhaustive).
 * Invalid / blank values normalize to UTC.
 */
export const COMMON_TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Prague",
  "Europe/Warsaw",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Athens",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "America/Mexico_City",
] as const;

export type CommonTimezone = (typeof COMMON_TIMEZONES)[number];

export type ZonedDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};
