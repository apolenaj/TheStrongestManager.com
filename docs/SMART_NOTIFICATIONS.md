# Smart Notification System

**Date:** 2026-07-21  
**Prompt:** 101 — Smart Notification System  
**Route:** `/app/notifications`  
**Bell:** App top bar drawer  
**Domain:** `src/domain/notifications/`  
**Service:** `src/services/notifications/`  
**Flag:** `smartNotifications` (`NEXT_PUBLIC_FF_SMART_NOTIFICATIONS`, default on)

---

## Intent

Useful alerts from real signals only:

| Kind | Example |
| --- | --- |
| `workout_today` | Workout today |
| `technique_reanalysis_due` | Technique re-analysis due (~28 days) |
| `competition_countdown` | Competition in 14 / 7 / 3 / 1 days |
| `weekly_review_ready` | Weekly review ready |
| `recovery_trend_declining` | Recovery trend declining |
| `pr_achieved` | PR achieved |

Never invent events. Empty inbox stays empty.

---

## User controls

| Control | Options |
| --- | --- |
| Channels | In-app · Email · Push (preference stored; delivery after device registry) |
| Frequency | Realtime · Daily digest · Weekly digest · Muted |
| Types | Per-kind toggles |
| Cap | Max new notifications / UTC day (default 5) |

---

## Anti-spam

- Daily cap (`maxPerDay`)
- Per-kind cooldown hours
- Dedupe key (`athleteProfileId` + `dedupeKey` unique)
- Muted frequency → no new rows
- Digest frequencies hold lower-priority kinds

---

## Data

- `NotificationPreference` — 1:1 athlete prefs  
- `AthleteNotification` — inbox rows  

Email uses existing `sendEmail` when `emailEnabled`. Push is preference-only until MOBILE_READINESS device registry.

---

## Tests

`src/domain/notifications/notifications.test.ts`
