# Conversion Funnel

**Date:** 2026-07-22  
**Prompt:** 162 — Conversion Funnel  
**Domain:** `src/domain/conversion-funnel/`  
**Service:** `src/services/conversion-funnel/`  
**Dashboard:** `/app/admin/conversion-funnel` (admin)  
**Flag:** `conversionFunnel` (`NEXT_PUBLIC_FF_CONVERSION_FUNNEL`, default **on**)

---

## Intent

Track the product path from marketing to paid, visualize the funnel, and **rank drop-offs** so the largest losses are obvious. Drop-offs identify where to investigate — not automatic root causes.

---

## Stages

| # | Stage | Evidence |
| --- | --- | --- |
| 1 | Homepage | `homepage_viewed` (live) |
| 2 | Signup | Account created — durable `User` / `signup_completed` |
| 3 | Onboarding | `onboarding_completed` |
| 4 | First value | First completed workout **or** technique upload |
| 5 | Pricing | `pricing_viewed` (live) |
| 6 | Checkout | `checkout_started` (live) |
| 7 | Paid | Paid subscription / `subscription_activated` |

Individuals may view pricing before first value; the path is an **ordered analysis model**.

---

## Visualization & drop-offs

Admin console shows:

- Relative bar widths vs top of funnel
- Step conversion (% of previous) and absolute drop-off
- Drop-offs ranked by absolute volume lost

Sample gate: top-of-funnel ≥ **20** for decision-ready rates. Default durable cohort: **30 days**.

Live homepage / pricing / checkout counters are process-local until a warehouse is wired. Durable stages prefer unique-user DB counts.

---

## Instrumentation

- Homepage emits `homepage_viewed` via `AnalyticsBeacon`
- Successful `trackProductEvent` calls bump matching funnel stage counters
- Client-allowed events: `homepage_viewed`, `signup_started`, `pricing_viewed`, `premium_coaching_landing_viewed`

---

## Related

- `docs/ANALYTICS_EVENTS.md` — catalog  
- `docs/ACTIVATION_METRICS.md` — activation definition (first value overlaps)  
- `docs/GROWTH_EXPERIMENT_FRAMEWORK.md` — CTA experiments on this path  

## Tests

`src/domain/conversion-funnel/conversion-funnel.test.ts`
