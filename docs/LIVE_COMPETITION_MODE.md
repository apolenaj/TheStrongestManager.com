# Live Competition Mode

**Date:** 2026-07-22  
**Prompt:** 196 — Live Competition Mode  
**Domain:** `src/domain/live-competition-mode/`  
**Athlete UI:** `/app/competition/live` (Coming Soon until runtime)  
**Admin:** `/app/admin/live-competition`  
**Flags:**
- `liveCompetitionMode` (`NEXT_PUBLIC_FF_LIVE_COMPETITION_MODE`, default **on**) — architecture
- `liveCompetitionRuntime` (`NEXT_PUBLIC_FF_LIVE_COMPETITION_RUNTIME`, default **off**) — meet-day persistence

**Related prep:** `docs/COMPETITION_MODE.md` (`/app/competition`)

---

## Principle

**Future feature architecture** for meet day. Track what happened — do not invent federation results or unsafe instructions.

| Capability | Contract |
| --- | --- |
| Enter competition | Start/resume a meet session (optionally linked to Competition Prep) |
| Attempts | Planned load + attempt number per lift — athlete-entered |
| Results | `good` / `no_lift` / `not_taken` / `pending` |
| Next attempt | Resolve next pending row (SBD × 1→2→3) |
| Warm-up timing | Clock windows vs platform time — **not** load prescriptions |
| Offline-friendly | Local draft queue (`tsm-live-competition-pending`); sync when online |

---

## Safety

Refused:

- Auto-prescribed max jumps or “must take” loads  
- Encouraging lifting through sharp pain / distress  
- Dehydration / extreme cut protocols  
- Guaranteed make claims  
- Impersonating federation rulings  
- Warm-up **load** protocols disguised as timing  

Large planned jumps may surface a **caution** to confirm with a coach — never an auto-approved load.

---

## Offline

Draft mutations: upsert attempt plan, log result, update warm-up slot, update meet clock.  
Helper: `src/lib/live-competition/offline-queue.ts` (same spirit as workout offline queue).

Runtime stays **off** until persistence + safety review.

---

## vs Competition Prep (Prompt 70)

| | Prep (`/app/competition`) | Live (`/app/competition/live`) |
| --- | --- | --- |
| When | Weeks → meet week | Meet day |
| Focus | Phase, taper sketches, attempt plans | Live board, results, clocks |
| Status | Shipped | Architecture; runtime off |

---

## Future persistence (not shipped)

Expect tables along the lines of `LiveMeetSession`, `LiveAttempt`, `LiveWarmupSlot` when runtime launches.

---

## Tests

```bash
npx vitest run src/domain/live-competition-mode
```
