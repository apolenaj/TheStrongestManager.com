# Training Program Data Model

**Date:** 2026-07-20  
**Prompt:** 21 — Training program data model  
**Schema:** `prisma/schema.prisma` (programming + session ledger)  
**Services:** `src/services/programming/program-service.ts`  
**Guards:** `src/domain/programming/*`

---

## Hierarchy

```text
Program (template | athlete)
  └── ProgramBlock
        └── ProgramWeek
              └── ProgramDay
                    └── Workout (template | athlete)
                          └── WorkoutExercise
                                └── WorkoutSet
ProgressionRule (program- and/or exercise-scoped)
```

**Execution (separate from editable templates):**

```text
TrainingSession
  └── SessionExercise   ← prescription snapshot + name
        └── SessionSet  ← prescribed* + performed* (immutable after lock)
```

---

## Prescription fields

Supported on workout lines / sets:

| Field | Exercise | Set |
| --- | --- | --- |
| Sets / reps | ✓ (`targetSets`, `targetReps`) | ✓ (`targetReps`) |
| Load (canonical kg) | ✓ `targetLoadKg` | ✓ `targetLoadKg` |
| Percentage | ✓ | ✓ |
| RPE | ✓ | ✓ |
| RIR | ✓ | ✓ |
| Tempo | ✓ | ✓ |
| Rest | ✓ `restSeconds` | ✓ |
| Notes | ✓ | ✓ |

Null means “not prescribed” — never invent defaults.

---

## Templates vs athlete programs

| `Program.kind` | Role |
| --- | --- |
| `template` | Library / reusable — not an athlete’s live plan |
| `athlete` | Assigned, editable copy (`sourceTemplateId` links to template) |

`assignProgramTemplateToAthlete` clones blocks/weeks/days without mutating the template.

Workouts similarly use `kind` (`template` | `athlete`).

---

## Editability vs history

- **Programs** with status `draft` / `active` are editable.
- Completing a session calls `lockSessionPrescription`:
  - Copies prescription into `SessionExercise` / `SessionSet`
  - Sets `prescriptionLockedAt` + `workoutNameSnapshot`
- Later edits to program/workout templates **do not** rewrite locked session rows.

## Version history (Prompt 118)

`ProgramVersion` stores append-only snapshots (`v1`, `v2`, `v3`, …) with who / why / date.  
Restore reapplies editable prescription targets and never mutates locked `TrainingSession` ledgers.  
See `docs/PROGRAM_VERSION_CONTROL.md`.

---

## Progression rules

`ProgressionRule.ruleKind`: `add_load` | `add_reps` | `double_progression` | `percent_wave` | `custom`  
Params live in `paramsJson`. `source` defaults to `recommended` (not observed outcomes).

Adaptive suggestions (Prompt 23) are separate: `ProgramAdaptation` proposals never auto-apply — see `docs/ADAPTIVE_PROGRAMMING.md`.
