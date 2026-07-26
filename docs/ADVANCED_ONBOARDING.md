# Advanced Onboarding Personalization

**Date:** 2026-07-21  
**Prompt:** 103 — Advanced Onboarding Personalization  
**Route:** `/app/onboarding`  
**Domain:** `src/domain/onboarding-paths/`  
**Flag:** `advancedOnboardingPersonalization` (`NEXT_PUBLIC_FF_ADVANCED_ONBOARDING`, default on)

---

## Intent

Improve onboarding by **user type**. Ask only relevant questions.

| Path | Behavior |
| --- | --- |
| Beginner | Simple goals; frequency + equipment only; no PRs / meet / program |
| Experienced athlete | Optional PRs, competition date, current program |
| Powerlifter | SBD PRs, meet date, current program; powerlifting seeded |
| Bodybuilder | Physique goals, schedule, program — no meet/SBD grid |
| Strongman | Specialty equipment, deadlift/press, meet date, program |
| Coach | Skip athlete details; enable Coach Mode; redirect `/app/coach` |

Flag off → legacy linear wizard (goal → experience → all optional details → caution).

---

## Hard rules

- Do not ask irrelevant questions for the chosen path.  
- Skipped fields are never invented.  
- Advanced fields remain **optional**.  
- Beginner stays short.

---

## Tests

`src/domain/onboarding-paths/onboarding-paths.test.ts`
