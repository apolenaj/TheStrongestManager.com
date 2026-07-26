# Multi-Athlete Coach Dashboard

**Date:** 2026-07-21  
**Prompt:** 86 — Multi-Athlete Coach Dashboard  
**Domain:** `src/domain/coach-dashboard/`  
**Service:** `src/services/coach/multi-athlete-dashboard-service.ts` (+ `getCoachDashboard`)  
**Route:** `/app/coach` (flags `appCoach` + `multiAthleteCoachDashboard`)

---

## Attention categories

| Category | When |
| --- | --- |
| Missed training | No completed sessions in 7d (had training in 28d) |
| Performance decline | Meaningful week-over-week session drop |
| Technique regression | Technique score trend ≤ −5 with enough samples |
| Competition approaching | Active/planned meet within 21 days |
| New PR | Detected PR events in last 7 days (positive, low urgency) |
| Incomplete check-in | Recovery scope + training this week without a check-in |

---

## Prioritization (anti-overwhelm)

- Rank by **urgency**: critical → high → medium → low
- Cap queue at **10** items; max **2** per athlete
- New PRs never outrank missed training / competition / decline at equal score
- Quiet athletes stay on the roster with a **Quiet** badge — no alert spam

Recovery / check-in signals appear **only** with `recovery` scope.

---

## Feature flag

`NEXT_PUBLIC_FF_MULTI_ATHLETE_COACH_DASHBOARD` → `multiAthleteCoachDashboard` (default on)

When off, `/app/coach` falls back to the simpler alerts + reviews layout.
