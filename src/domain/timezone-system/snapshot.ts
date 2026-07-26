import {
  COMMON_TIMEZONES,
  DEFAULT_TIMEZONE,
  TIMEZONE_ENGINE_VERSION,
  TIMEZONE_SYSTEM_HONESTY,
} from "@/domain/timezone-system/constants";
import {
  formatCompetitionDateInTimeZone,
  formatDateTimeInTimeZone,
} from "@/domain/timezone-system/format";
import {
  daysUntilInTimezone,
  localDateInputToUtc,
  toUtcIso,
  zonedDateKey,
} from "@/domain/timezone-system/zoned";

export type TimezoneSystemSnapshot = {
  engineVersion: typeof TIMEZONE_ENGINE_VERSION;
  defaultTimezone: typeof DEFAULT_TIMEZONE;
  commonTimezoneCount: number;
  storageRule: "utc_iso";
  displayRule: "athlete_iana_local";
  samples: {
    utcIso: string;
    newYorkDate: string;
    pragueDate: string;
    /** Same UTC instant — different local calendar near a day boundary. */
    nearMidnightUtc: string;
    daysUntilMeetNy: number;
    daysUntilMeetPrague: number;
  };
  surfaces: readonly string[];
  honesty: readonly string[];
  generatedAt: string;
};

export function buildTimezoneSystemSnapshot(
  generatedAt: string = new Date().toISOString(),
): TimezoneSystemSnapshot {
  // Fixed fixture: 2026-07-22T02:30:00.000Z
  const instant = new Date("2026-07-22T02:30:00.000Z");
  const meet = localDateInputToUtc("2026-08-01", "America/New_York", "noon")!;

  return {
    engineVersion: TIMEZONE_ENGINE_VERSION,
    defaultTimezone: DEFAULT_TIMEZONE,
    commonTimezoneCount: COMMON_TIMEZONES.length,
    storageRule: "utc_iso",
    displayRule: "athlete_iana_local",
    samples: {
      utcIso: toUtcIso(instant),
      newYorkDate: formatDateTimeInTimeZone(instant, "America/New_York"),
      pragueDate: formatDateTimeInTimeZone(instant, "Europe/Prague"),
      nearMidnightUtc: `NY ${zonedDateKey(instant, "America/New_York")} · Prague ${zonedDateKey(instant, "Europe/Prague")}`,
      daysUntilMeetNy: daysUntilInTimezone(
        meet,
        instant,
        "America/New_York",
      ),
      daysUntilMeetPrague: daysUntilInTimezone(
        meet,
        instant,
        "Europe/Prague",
      ),
    },
    surfaces: [
      "Workout dates",
      "Competition countdowns",
      "Notifications (local day bounds)",
      "Coach communication timestamps",
    ],
    honesty: TIMEZONE_SYSTEM_HONESTY,
    generatedAt,
  };
}

/** Admin sample line — competition date formatting. */
export function sampleCompetitionLabel(
  date: Date,
  timeZone: string,
): string {
  return formatCompetitionDateInTimeZone(date, timeZone);
}
