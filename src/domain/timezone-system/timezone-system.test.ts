import { describe, expect, it } from "vitest";
import {
  buildTimezoneSystemSnapshot,
  daysUntilInTimezone,
  endOfZonedDay,
  formatDateTimeInTimeZone,
  localDateInputToUtc,
  normalizeTimezone,
  startOfZonedDay,
  TIMEZONE_SYSTEM_HONESTY,
  toUtcIso,
  zonedDateKey,
} from "@/domain/timezone-system";

describe("timezone system", () => {
  it("normalizes blank/invalid zones to UTC", () => {
    expect(normalizeTimezone(null)).toBe("UTC");
    expect(normalizeTimezone("Not/AZone")).toBe("UTC");
    expect(normalizeTimezone("America/New_York")).toBe("America/New_York");
  });

  it("stores UTC ISO and displays local", () => {
    const instant = new Date("2026-07-22T02:30:00.000Z");
    expect(toUtcIso(instant)).toBe("2026-07-22T02:30:00.000Z");
    expect(zonedDateKey(instant, "America/New_York")).toBe("2026-07-21");
    expect(zonedDateKey(instant, "Europe/Prague")).toBe("2026-07-22");
    expect(formatDateTimeInTimeZone(instant, "UTC")).toMatch(/Jul 22/);
  });

  it("bounds local days in UTC for notification windows", () => {
    const mid = new Date("2026-07-22T18:00:00.000Z");
    const start = startOfZonedDay(mid, "America/Los_Angeles");
    const end = endOfZonedDay(mid, "America/Los_Angeles");
    expect(zonedDateKey(start, "America/Los_Angeles")).toBe("2026-07-22");
    expect(start.getTime()).toBeLessThan(mid.getTime());
    expect(end.getTime()).toBeGreaterThan(mid.getTime());
    expect(zonedDateKey(end, "America/Los_Angeles")).toBe("2026-07-23");
  });

  it("computes competition countdown in athlete timezone", () => {
    const meet = localDateInputToUtc("2026-08-01", "America/New_York", "noon")!;
    // 2026-07-31T03:00Z = 2026-07-30 23:00 EDT
    const nowNyEvening = new Date("2026-07-31T03:00:00.000Z");
    expect(zonedDateKey(nowNyEvening, "America/New_York")).toBe("2026-07-30");
    expect(daysUntilInTimezone(meet, nowNyEvening, "America/New_York")).toBe(2);

    const nowUtc = new Date("2026-07-31T12:00:00.000Z");
    expect(daysUntilInTimezone(meet, nowUtc, "UTC")).toBe(1);
  });

  it("documents store-UTC display-local honesty", () => {
    expect(TIMEZONE_SYSTEM_HONESTY.join(" ")).toMatch(/UTC/i);
    expect(TIMEZONE_SYSTEM_HONESTY.join(" ")).toMatch(/local/i);
    const snap = buildTimezoneSystemSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.storageRule).toBe("utc_iso");
    expect(snap.surfaces).toEqual(
      expect.arrayContaining([
        "Workout dates",
        "Competition countdowns",
        "Notifications (local day bounds)",
        "Coach communication timestamps",
      ]),
    );
  });
});
