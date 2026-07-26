# Smart Exercise Substitutions

**Date:** 2026-07-21  
**Prompt:** 127 — Smart Exercise Substitutions  
**Route:** `/app/exercise-substitutions`  
**Domain:** `src/domain/exercise-substitutions/`  
**Service:** `src/services/exercise-substitutions/`  
**Flag:** `exerciseSubstitutions` (`NEXT_PUBLIC_FF_EXERCISE_SUBSTITUTIONS`, default **on**)

---

## Intent

Replacement engine when a lift is unavailable. Ranked substitutes with **explained tradeoffs**.

## Example

- Unavailable: **Bench press**  
- Goal: **Chest strength**  
- Equipment: **Dumbbells** (+ bench / machine / bodyweight as available)  
- Output: **Dumbbell bench**, **Machine press**, **Push-up variation**

## Accounts for

| Factor | Effect |
| --- | --- |
| Goal | Muscle/sport alignment (e.g. chest strength) |
| Movement pattern | Prefer same pattern (push → push) |
| Fatigue | Prefer lower demand when fatigue pressure is elevated |
| Skill | Prefer lower skill for beginners / pain-safe / high fatigue |

## Catalog

Substitutes are **published catalog only** — never invented. Seed includes `dumbbell-bench-press`, `machine-chest-press`, and `push-up` with relations from `bench-press`.

## Honesty

See `EXERCISE_SUBSTITUTION_HONESTY`. Suggestions are not auto-applied.

## Tests

`src/domain/exercise-substitutions/exercise-substitutions.test.ts`
