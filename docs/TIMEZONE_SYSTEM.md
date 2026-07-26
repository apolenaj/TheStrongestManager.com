# Timezone system

**Date:** 2026-07-22  
**Prompt:** 150 — Timezone System  
**Domain:** `src/domain/timezone-system/`  
**Service:** `src/services/timezone-system/`  
**UI:** Profile timezone · workouts · competition · notifications · messages · `/app/admin/timezone-system`  
**Flag:** `timezoneSystem` (`NEXT_PUBLIC_FF_TIMEZONE_SYSTEM`, default **on**)

---

## Intent

| Rule | Detail |
| --- | --- |
| **Store UTC** | Timestamps persist as absolute UTC instants (`DateTime` / ISO-Z) |
| **Display local** | Format with athlete `AthleteProfile.timezone` (IANA) |
| **Respect user timezone** | Calendar “today”, countdowns, and day caps use the athlete’s local day |

Surfaces:

1. **Workout dates** — session started/completed in local time  
2. **Competition countdowns** — `daysUntil` on local calendar dates  
3. **Notifications** — `todayKey` + daily delivery caps on local day bounds  
4. **Coach communication** — message timestamps in local time  

## Architecture

```text
Input (local calendar date) → localDateInputToUtc → store UTC
UTC instant → format*InTimeZone(athleteTz) → UI
```

Preference: `AthleteProfile.timezone` (nullable → normalize to `UTC`).

## Related

- Profile editor timezone picker (`COMMON_TIMEZONES`)
- `docs/UNIT_SYSTEM.md` (parallel presentation-preference pattern)
- `docs/DATA_MODEL.md`

## Tests

`src/domain/timezone-system/timezone-system.test.ts`
