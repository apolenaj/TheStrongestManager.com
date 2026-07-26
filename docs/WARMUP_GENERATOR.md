# Warm-up Generator

**Date:** 2026-07-22  
**Prompt:** 197 — Warm-up Generator  
**Domain:** `src/domain/warmup-generator/`  
**Athlete UI:** `/app/warmup`  
**Admin:** `/app/admin/warmup-generator`  
**Flag:** `warmupGenerator` (`NEXT_PUBLIC_FF_WARMUP_GENERATOR`, default **on**)

---

## Principle

Plan **progressive warm-ups** from:

| Input | Use |
| --- | --- |
| Target working weight | Ceiling — all warm-ups stay **below** it |
| Exercise | Known lifts + custom label |
| Recent history | 14-day working-set volume / heaviest (when logged) |

Defaults are **conservative**. The athlete can **edit, add, or remove** every set.

---

## Outputs

- Ordered warm-up sets (load kg + reps + label)
- Shorter ladder when recent volume is high (or “prefer fewer sets”)
- Hard cap: **5** sets · top warm-up ≤ **90%** of target
- Rounded to 2.5 kg

---

## Fatigue avoidance

- Cap set count  
- Fatigue ladder (3 sets) when volume ratio is high  
- Never prescribe warm-ups at/above working weight  
- No mandatory rest protocols or “must complete” language  

---

## Honesty

Planning aid only — not medical advice; empty history does not invent past sessions.

---

## Tests

```bash
npx vitest run src/domain/warmup-generator
```
