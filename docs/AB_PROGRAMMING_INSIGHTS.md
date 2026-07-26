# A/B Programming Insights

**Date:** 2026-07-21  
**Prompt:** 120 — A/B Programming Insights  
**Route:** `/app/programming-insights`  
**Domain:** `src/domain/ab-programming-insights/`  
**Service:** `src/services/ab-programming-insights/`  
**Flag:** `abProgrammingInsights` (`NEXT_PUBLIC_FF_AB_PROGRAMMING_INSIGHTS`, default **on**)

---

## Intent

Architecture for **future anonymized** analysis of programming outcomes across:

1. **Program approaches**  
2. **Exercise choices**  
3. **Progression styles**

Pipelines are **not** publishing live winners yet. The UI ships as an honesty shell + sample-gated stubs.

## Minimum sample thresholds

| Gate | Threshold |
| --- | --- |
| Default / per dimension | ≥ `DATA_MOAT_MIN_COHORT_SIZE` (5) |
| Pairwise arm comparison | ≥ 20 per arm |

`canPublishAggregateInsight(n)` suppresses under-threshold cohorts. Observations stay empty when suppressed.

## Correlation ≠ causation

Every insight carries `correlationNotCausation: true` and the disclaimer:

> Observational association only — correlation is not causation.

## Not

- Not Experiment Mode (personal n=1) — see `docs/EXPERIMENT_MODE.md`  
- Not an online A/B judge — see `docs/AI_EVALUATION.md`  
- Not scientific research  

Consent / k-anonymity lineage: `docs/DATA_MOAT_ARCHITECTURE.md`.

## Tests

`src/domain/ab-programming-insights/ab-programming-insights.test.ts`
