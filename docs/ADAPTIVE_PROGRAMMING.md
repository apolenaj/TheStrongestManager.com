# Adaptive Programming Engine

**Date:** 2026-07-20  
**Prompt:** 23 — Adaptive programming engine  
**Engine:** `src/domain/adaptive/*` (`adaptive.v1`)  
**Services:** `src/services/adaptive/*`  
**UI:** `/app/adaptations`, `/app/programs`

---

## Principle

**Suggestions never silently change the athlete program.**  
The engine proposes; the athlete **Accepts**, **Modifies**, or **Declines**. Every step is written to `ProgramAdaptationEvent`.

---

## Inputs

| Signal | Source |
| --- | --- |
| Completed sets | `SessionSet` (completed, lookback) |
| RPE | performed vs prescribed |
| Missed reps | performedReps &lt; prescribedReps |
| Recent performance | load trend across recent sets |
| Training consistency | completed / (completed+skipped) sessions |
| Recovery | `RecoveryEntry.readiness` mean |
| Technique trend | recent vs prior `TechniqueAnalysis.overallScore` |
| Goal | active `Goal` title/category |

Null signals stay null — confidence drops; the engine does not invent data.

---

## Outputs (`changeKind`)

- `increase_load` / `keep_load` / `reduce_load`
- `increase_volume` / `reduce_volume`
- `deload`

Each proposal stores:

- **Recommended change** (athlete-facing label)
- **Reason** (why)
- **Confidence** (`low` | `medium` | `high`)
- **Params** JSON (`deltaKg`, `loadMultiplier`, `setsDelta`)
- **inputsJson** frozen snapshot for audit

---

## Decision flow

```text
proposeAdaptationsForAthlete
  → ProgramAdaptation status=pending + event proposed
  → (prior pending for same line → superseded)

Athlete:
  Accept  → apply proposed params to athlete WorkoutExercise (+ sets) + events accepted/applied
  Modify  → apply athlete params + events modified/applied
  Decline → status=declined + event declined (no prescription write)
```

Library templates (`Workout.kind=template` without athlete owner) are never mutated.

Completed session ledgers remain immutable (Prompt 21).

---

## When proposals are created

1. After **Finish workout** (non-blocking; failure does not undo completion)
2. Manual **Refresh suggestions** on Adaptations / Programs

---

## Audit

`ProgramAdaptationEvent.eventType`: `proposed` | `accepted` | `modified` | `declined` | `applied` | `superseded` | `expired`

Before/after prescription snapshots live on the adaptation row (`beforeStateJson` / `afterStateJson`).
