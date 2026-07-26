# Live Session Autoregulation

**Date:** 2026-07-22  
**Prompt:** 199 — Live Session Autoregulation  
**Domain:** `src/domain/live-session-autoregulation/`  
**Live UI:** Workout player (after completing a set)  
**Admin:** `/app/admin/live-session-autoregulation`  
**Flag:** `liveSessionAutoregulation` (`NEXT_PUBLIC_FF_LIVE_SESSION_AUTOREGULATION`, default **on**)

---

## Principle

During a workout, compare **actual RPE** to **planned RPE**. If the set was **significantly harder**, suggest an adjustment (e.g. reduce next set). **Never** change the prescription until the athlete confirms.

### Example

| | Load × reps | RPE |
| --- | --- | --- |
| Planned | 250 × 3 | 7 |
| Actual | 250 × 3 | 9 |

→ Suggestion: **Reduce next set** (confirm required).

---

## Rules

- Significant harder: actual − planned ≥ **1.5** RPE  
- Missing planned or actual RPE → no suggestion (never invented)  
- Suggestion kind: `reduce_next_set` (conservative load trim, 2.5 kg steps)  
- `requiresUserConfirmation: true` · `autoApplied: false` · `mayAutoApplyAutoregulation()` → `false`  
- Apply path refuses unless `confirmed: true`

---

## Tests

```bash
npx vitest run src/domain/live-session-autoregulation
```
