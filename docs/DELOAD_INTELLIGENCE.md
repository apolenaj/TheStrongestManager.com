# Deload Intelligence

**Date:** 2026-07-21  
**Prompt:** 124 — Deload Intelligence  
**Route:** `/app/deload-intelligence`  
**Domain:** `src/domain/deload-intelligence/`  
**Service:** `src/services/deload-intelligence/`  
**Flag:** `deloadIntelligence` (`NEXT_PUBLIC_FF_DELOAD_INTELLIGENCE`, default **on**)

---

## Intent

Recommend **Consider deload** from multiple converging signals.  
**Never** auto-deload. **Never** trigger from one bad workout. **User decides.**

## Signals

| Signal | Stress when… |
| --- | --- |
| Performance trend | Direction down |
| RPE | Elevated session RPE across ≥2 sessions |
| Recovery | Readiness low (&lt;45) or declining ≥8 pts |
| Missed reps | Sustained miss rate ≥15% across enough sets |
| Training load | Volume spike (or volume up + recovery stress) |

## Gates

- ≥ **4** completed sessions in the window
- ≥ **2** independent stress signals
- Suppress for **7 days** after an accepted/applied deload adaptation

## Output

- Label: **Consider deload** (or hold / insufficient)
- Explanation of which signals fired
- `userDecides: true` — no program mutation

## Distinct from

- Adaptive per-exercise `deload` proposals (`/app/adaptations`)
- Decision tree `should-i-deload`
- Program Builder planned deload weeks
- TCI deload context windows (adherence only)

## Honesty

See `DELOAD_INTELLIGENCE_HONESTY` in domain constants.

## Tests

`src/domain/deload-intelligence/deload-intelligence.test.ts`
