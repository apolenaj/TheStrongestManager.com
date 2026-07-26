# Retention Analytics

**Date:** 2026-07-22  
**Prompt:** 161 — Retention Analytics  
**Domain:** `src/domain/retention-analytics/`  
**Service:** `src/services/retention-analytics/`  
**Dashboard:** `/app/admin/retention-analytics` (admin)  
**Flag:** `retentionAnalytics` (`NEXT_PUBLIC_FF_RETENTION_ANALYTICS`, default **on**)

---

## Intent

Analyze product return and paid retention with honest statistics. **Never treat correlation as causation automatically.**

Distinct from athlete Behavioral Retention UX (`docs/BEHAVIORAL_RETENTION.md`) and Activation Metrics (`docs/ACTIVATION_METRICS.md`).

---

## D1 / D7 / D30

Activity return after signup (completed workouts + technique uploads):

| Window | Definition |
| --- | --- |
| D1 | Activity on a UTC day **after** signup day, within 1 day of `User.createdAt` |
| D7 | Same, within 7 days |
| D30 | Same, within 30 days |

Auth `Session` has no `createdAt` — this is an **activity proxy**, not a login counter. Demo accounts excluded. Default cohort lookback: **60 days**. Rates decision-ready at cohort ≥ **20**.

---

## Subscription retention

Among athletes in the cohort with a **paid** plan (`pro` / `performance` / `elite_coaching`):

- Still entitled (`active` | `trialing` | `past_due`)
- `cancelAtPeriodEnd` rate

Snapshot of current subscription state for the signup cohort — not a full longitudinal survival curve.

---

## Feature retention

| Feature | Early | Reuse |
| --- | --- | --- |
| Workouts | ≥1 completed session in days 0–7 | ≥1 completed session in days 8–30 |
| Technique | ≥1 upload in days 0–7 | ≥1 upload in days 8–30 |

Reuse rate is among early users only. Does **not** prove the feature caused retention.

---

## Action correlations (vs D30)

Early actions (days 0–7) compared for D30 retention rate with vs without:

- Completed onboarding  
- Logged a workout  
- Uploaded technique  
- 2+ workouts  
- Workout + technique  

Each row includes `rateDelta`, status `estimate_only` | `insufficient_sample` (min cell **10**), and an explicit **causation note**. Status is never “causal.”

---

## Related

- `docs/ACTIVATION_METRICS.md` — activation definition  
- `docs/BEHAVIORAL_RETENTION.md` — athlete follow-through UX  
- `docs/BILLING_2.md` — subscription statuses / grace  

## Tests

`src/domain/retention-analytics/retention-analytics.test.ts`
