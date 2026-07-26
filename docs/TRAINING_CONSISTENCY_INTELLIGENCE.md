# Training Consistency Intelligence

**Date:** 2026-07-21  
**Prompt:** 123 — Training Consistency Intelligence  
**Route:** `/app/training-consistency`  
**Domain:** `src/domain/training-consistency-intelligence/`  
**Service:** `src/services/training-consistency-intelligence/`  
**Flag:** `trainingConsistencyIntelligence` (`NEXT_PUBLIC_FF_TRAINING_CONSISTENCY_INTELLIGENCE`, default **on**)

---

## Intent

Improve consistency measurement so it reflects **adherence to the plan**, not **days in the gym**.

Does **not** reward completing every scheduled session blindly.

## What counts

| Signal | Effect |
| --- | --- |
| Planned rest (`ProgramDay` without workout) | Honoring rest = on-plan |
| Deload (accepted adaptation or deload-named week) | Skips / reduced training = context-adjusted, not a miss |
| Injury break (adaptation/coach/session notes) | Pause window = context-adjusted |
| Program change (`ProgramVersion`) | Short transition window = context-adjusted |
| Extra gym on rest days | Tracked separately — **does not** raise adherence |

## What does not count

- Raw completed-session counts
- Filling rest days in the gym to “keep a streak”
- Blind 100% session completion when the plan called for rest or deload

## Distinct from

- Behavioral Retention (`/app/retention`) — ethical follow-through UX
- Consistency Score pillar — still session completion ratio (legacy)
- Leaderboards / achievements that rank gym days

## Honesty

See `TRAINING_CONSISTENCY_HONESTY` in domain constants.

## Tests

`src/domain/training-consistency-intelligence/training-consistency-intelligence.test.ts`
