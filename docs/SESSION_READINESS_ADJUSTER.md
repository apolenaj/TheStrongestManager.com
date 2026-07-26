# Session Readiness Adjuster

**Date:** 2026-07-22  
**Prompt:** 198 — Session Readiness Adjuster  
**Domain:** `src/domain/session-readiness-adjuster/`  
**Athlete UI:** `/app/session-readiness`  
**Admin:** `/app/admin/session-readiness`  
**Flag:** `sessionReadinessAdjuster` (`NEXT_PUBLIC_FF_SESSION_READINESS_ADJUSTER`, default **on**)

---

## Principle

Before a workout, a **quick check-in** informs a session recommendation. The athlete always keeps control — the system does **not** cancel a workout from one metric.

### Check-in

| Field | Notes |
| --- | --- |
| Sleep | Hours (optional) |
| Fatigue | 1–10 (higher = more fatigued) |
| Soreness | 1–10 |
| Motivation | 1–10 |

Skipped fields are omitted — never invented.

### Recommendations

| ID | Meaning |
| --- | --- |
| `proceed` | Signals look workable |
| `minor_adjustment` | Consider a small trim — not a cancel |
| `review_load` | Several signals agree — review top loads |

**Cancel is not a recommendation.**

### Escalation rules

- **0** concerns → proceed  
- **1** concern → minor adjustment only (`review_load` blocked)  
- **≥2** concerns → review load  

`cancelsWorkout` is always `false`.

---

## Persistence

Saving writes through the existing Recovery check-in path (`RecoveryEntry`) for sleep / fatigue / soreness / motivation. Full recovery UI remains at `/app/recovery`.

---

## Tests

```bash
npx vitest run src/domain/session-readiness-adjuster
```
