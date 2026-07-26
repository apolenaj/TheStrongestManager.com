# Check-in System

**Date:** 2026-07-21  
**Prompt:** 133 — Check-in System  
**Route:** `/app/check-in` (athlete), `/app/check-in/configure` (coach)  
**Domain:** `src/domain/check-in-system/`  
**Service:** `src/services/check-in-system/`  
**Flag:** `checkInSystem` (`NEXT_PUBLIC_FF_CHECK_IN_SYSTEM`, default **on**)

---

## Intent

Customizable **weekly check-in**. Questions may cover:

- Training
- Recovery
- Bodyweight
- Goal progress

**Coach can configure** which allowlisted questions appear.  
**AI summarizes** submitted answers (labelled **AI summary**).  
**Do not ask excessive sensitive health questions.**

## Hard rules

1. Only catalog keys from `CHECK_IN_QUESTION_CATALOG` may be enabled.
2. `CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS` blocks medical/mental-health/intake-style topics.
3. Distinct from daily `RecoveryEntry` and auto `WeeklyAthleteReview`.
4. Not a diagnosis or medical assessment.

## Persistence

- `CoachCheckInTemplate` — coach default or athlete-specific enabled keys
- `WeeklyCheckIn` — per athlete / weekKey responses
- `WeeklyCheckInSummary` — AI summary rows (`source = ai_summary`)

## Tests

`src/domain/check-in-system/check-in-system.test.ts`
