# Program Version Control

**Date:** 2026-07-21  
**Prompt:** 118 — Program Version Control  
**Route:** `/app/programs/[id]/versions`  
**Domain:** `src/domain/program-version/`  
**Service:** `src/services/program-version/`  
**Flag:** `programVersionControl` (`NEXT_PUBLIC_FF_PROGRAM_VERSION_CONTROL`, default **on**)

---

## Versions

Labels are **v1**, **v2**, **v3**, … (`formatProgramVersionLabel`).

Each version stores:

| Field | Meaning |
| --- | --- |
| Who | `changedByUserId` (+ display name) |
| Why | `reason` (required) |
| Date | `createdAt` |
| Snapshot | Editable prescription JSON |

## Restore

1. Checkpoint current state as a new version  
2. Reapply snapshot name/description + workout exercise targets  
3. Record a restore version pointing at the source (`restoredFromVersionNumber`)  

## Protect completed training history

- `TrainingSession` rows that are completed / prescription-locked are **never** updated, deleted, or rewritten  
- Restore plans list `protectedSessionIds`; mutation lists must stay empty for those ids  
- Locked session ledgers (`SessionExercise` / `SessionSet`) remain the historical source of truth  

## Auto versioning

- Template assign → **v1** (`source: assign`) when `changedByUserId` is provided  
- Accepted adaptations → next version (`source: adaptation`)  

## Tests

`src/domain/program-version/program-version.test.ts`
