# Workout Experience

**Date:** 2026-07-20  
**Prompt:** 22 — Workout experience  
**Routes:** `/app/today`, `/app/training`, `/app/training/[sessionId]`  
**Services:** `src/services/workout/*`  
**UI:** `src/components/workout/*`

---

## Flow

1. **Today** resolves the assigned session (in-progress → planned today → active program day for weekday → first program day).
2. Athlete sees title, goal, estimated duration, and exercise list with sets/reps/load/RPE/RIR/rest + technique cue.
3. **Start workout** creates/resumes a `TrainingSession`, snapshots prescription into `SessionExercise` / `SessionSet` (without locking).
4. **Live player** logs weight, reps, RPE/RIR, notes, and completion per set. Optional rest timer.
5. **Finish workout** locks the prescription (`prescriptionLockedAt`) and marks the session completed — later program edits cannot rewrite history.

---

## Mobile UX

- Large tap targets (`min-h-12` / `min-h-14` controls).
- Sticky finish bar above mobile bottom nav.
- Numeric `inputMode` on load/reps/RPE fields.
- One exercise section at a time with clear prescription + cue + previous performance.

---

## Offline-friendly architecture

- Client queue: `src/lib/workout/offline-queue.ts` (localStorage).
- When offline, set logs enqueue and show an honest “saved offline” state.
- On `online`, pending logs flush via `logSessionSetAction`.
- **PWA (Prompt 184):** active workout snapshot in IndexedDB; Background Sync tag when supported; SW offline shell — see `docs/PWA_READINESS.md`.
- Server remains source of truth after sync. No invented success when the write never reached the API.
- Auth, APIs, and technique media are **never** cached by the service worker.

---

## Honest empty states

- No assigned program/session → empty Today (link to Programs).
- No previous performance → “No logged sets yet for this lift”.
- Null prescription fields stay blank — never invent loads or cues.
