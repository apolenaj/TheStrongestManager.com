# Injury-Modification Architecture

**Date:** 2026-07-21  
**Prompt:** 130 — Injury-Modification Architecture  
**Route:** `/app/injury-modification`  
**Domain:** `src/domain/injury-modification/`  
**Service:** `src/services/injury-modification/`  
**Flag:** `injuryModification` (`NEXT_PUBLIC_FF_INJURY_MODIFICATION`, default **on**)

---

## Intent

Architecture for **user-declared training limitations**.  
This is **not** injury diagnosis.

## User may select

| Declaration | Meaning |
| --- | --- |
| Avoid painful movement | Skip/swap movements that currently hurt |
| Temporary restriction | Short-term limit on load, range, or pattern |
| Professional instruction | Follow clinician/coach instructions (source noted; not verified) |

## System may suggest

| Suggestion | Behavior |
| --- | --- |
| Alternative exercises | Links to Smart Exercise Substitutions |
| Reduced range | Prefer controlled / partial-range options (not clinical ROM Rx) |
| Lower loading | Bias adaptations toward reduce/keep load |

Suggestions are **never auto-applied as treatment**.

## Always show

> Follow guidance from a qualified healthcare professional who knows your history. This app does not diagnose injury or disease.

## Hard rules

1. **Never diagnose** — forbidden diagnostic language in product copy.
2. **Pain-Safe wins** — if Pain-Safe Response is active, Injury Modification suggestions defer (no optimistic workarounds).
3. Clearing a declaration is **not** medical clearance.
4. Distinct from free-text `movementNotes` — structured declarations are the system of record.

## Wired surfaces

| Surface | Behavior |
| --- | --- |
| Injury modification UI | Declare / clear / review suggestions + disclaimer |
| Exercise substitutions | Prefer lower-skill / regression-friendly swaps when active |
| Exercise prescription | Treat active declarations as pain/technique caution signals |
| Adaptations | Prefer lower loading over increases when active (Pain-Safe still hard-stops) |

## Persistence

`InjuryModification` — `declarationKind`, `status`, `affectedArea`, `instructionSource`, `notes`, `startsAt` / `endsAt` / `clearedAt`.

## Tests

`src/domain/injury-modification/injury-modification.test.ts`
