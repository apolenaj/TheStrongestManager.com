# Bodyweight / Performance Relationship

**Date:** 2026-07-21  
**Prompt:** 121 — Bodyweight / Performance Relationship  
**Route:** `/app/bodyweight-performance`  
**Domain:** `src/domain/bodyweight-performance/`  
**Service:** `src/services/bodyweight-performance/`  
**Flag:** `bodyweightPerformance` (`NEXT_PUBLIC_FF_BODYWEIGHT_PERFORMANCE`, default **on**)

---

## Signals

| Signal | Meaning |
| --- | --- |
| Bodyweight | Logged `BodyMetric` (`metricKey: bodyweight`) |
| Estimated strength | e1RM / effort from progress metrics or multi-rep sets |
| Relative strength | Simple **e1RM ÷ bodyweight** (not Wilks/DOTS) |

## Example narrative

- Bodyweight **−4 kg**  
- Estimated strength **stable**  
- Relative strength **improved**  

Weight change and strength change are independent — weight gain does **not** always improve strength.

## Honesty

See `BODYWEIGHT_PERFORMANCE_HONESTY` in domain constants.

## Tests

`src/domain/bodyweight-performance/bodyweight-performance.test.ts`
