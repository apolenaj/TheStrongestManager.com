# Achievement System

**Date:** 2026-07-21  
**Prompt:** 79 — Achievement System  
**Domain:** `src/domain/achievement/`  
**Route:** `/app/achievements` (flag `achievementSystem`)  
**Model:** `AthleteAchievement`

---

## Design rules

- **Small catalog** (soft max 12) — avoid excessive gamification
- Unlock **only from real evidence** — never invent awards
- Each achievement states the **positive behavior** it reinforces
- Estimated 1RM alone is not framed as a competition-verified achievement

---

## Catalog

| Id | Reinforces |
| --- | --- |
| First Workout | Showing up and finishing a session |
| First Technique Analysis | Filming and reviewing technique |
| 10 Workouts | Building a training habit |
| Technique +10 Improvement | Iterating on movement quality |
| First PR | Honest strength / technique logging |
| 12-Week Consistency | Long-horizon consistency |
| Competition Completed | Finishing a meet prep plan |

---

## Forbidden patterns

Daily login points, max-load-today, open-every-screen, share spam, bodyweight-cut, skip-recovery.

---

## Feature flag

`NEXT_PUBLIC_FF_ACHIEVEMENT_SYSTEM` → `achievementSystem` (default on)
