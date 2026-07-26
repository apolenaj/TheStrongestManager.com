# Activation Metrics

**Date:** 2026-07-22  
**Prompt:** 160 — Activation Metrics  
**Domain:** `src/domain/activation-metrics/`  
**Service:** `src/services/activation-metrics/`  
**Dashboard:** `/app/admin/activation-metrics` (admin)  
**Flag:** `activationMetrics` (`NEXT_PUBLIC_FF_ACTIVATION_METRICS`, default **on**)

---

## Intent

Define **product activation** as a multi-step athlete outcome. Do **not** treat vanity traffic as success.

### Activated athlete (all required)

1. Completed onboarding (`AthleteProfile.onboardingCompletedAt`)
2. Logged first workout (completed `TrainingSession`)
3. Uploaded first technique analysis (`TechniqueAnalysis`, not soft-deleted)
4. Returned within seven days (product activity on a UTC day **after** signup day, within 7×24h of `User.createdAt`)

### Not activation (vanity)

| Metric | Why excluded |
| --- | --- |
| Pageviews | Traffic ≠ product use |
| `signup_started` alone | Intent ≠ activated |
| `pricing_viewed` | Marketing surface |
| Growth experiment exposure | Instrumentation |
| Account created without onboarding | Incomplete setup |

---

## Dashboard

Admin cohort (default **30 days**, non-demo athletes):

- Funnel counts + rate of signed-up
- Fully activated rate (primary)
- Partial activation count
- Sample per-athlete criteria table
- Sample gate: rates are **decision-ready** only when cohort ≥ **20**

D7 return is an **activity proxy** (workout / technique). Auth `Session` has no `createdAt`.

---

## Related

- `docs/FIRST_SESSION.md` — athlete first-session checklist (UX)
- `docs/BEHAVIORAL_RETENTION.md` — retention coaching surfaces (different product)
- `docs/GROWTH_EXPERIMENT_FRAMEWORK.md` — marketing A/B (not activation definition)

## Tests

`src/domain/activation-metrics/activation-metrics.test.ts`
