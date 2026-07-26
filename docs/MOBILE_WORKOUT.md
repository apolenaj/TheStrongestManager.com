# Mobile-First Workout App Experience

**Date:** 2026-07-22  
**Prompt:** 183 — Mobile-First Workout App Experience  
**Domain:** `src/domain/mobile-workout/`  
**Player:** `/app/training/[sessionId]` (`WorkoutPlayer`)  
**Flag:** `mobileWorkoutExperience` (`NEXT_PUBLIC_FF_MOBILE_WORKOUT_EXPERIENCE`, default **on**)  
**Admin:** `/app/admin/mobile-workout`

---

## Intent

Make the live workout feel like a **native mobile training app**, not a dashboard:

| Priority | Implementation |
| --- | --- |
| One-hand use | Thumb-zone sticky dock (rest + finish); Prev/Next exercise |
| Fast set logging | One **Complete set** tap; values seeded from prescription / last perform |
| Large controls | ≥48px steppers for load / reps / RPE |
| Minimal typing | Steppers first; notes collapsed |
| Auto-save | Debounced draft save (~900ms); offline queue |
| Rest timer | Sticky compact timer; auto-starts on set complete |
| Previous performance | Prominent block on the focused exercise |
| No dashboard density | **One exercise at a time** during in-progress workouts |

Flag off → previous multi-exercise scroll layout (legacy).

---

## Components

- `WorkoutPlayer` — focus mode when flag on  
- `SetLogger` — `NumberStepper` + auto-save  
- `RestTimer` — `compact` + `autoStart`  
- Offline queue — `src/lib/workout/offline-queue.ts` (unchanged contract)

---

## Honesty

- Previous performance comes from last logged session for that lift — never invented  
- Auto-save drafts do not mark sets complete; Complete set starts rest  
- Server remains source of truth after online sync  

---

## Tests

```bash
npx vitest run src/domain/mobile-workout
```
