# Personalization Engine

**Date:** 2026-07-21  
**Prompt:** 100 — Personalization Engine  
**Route:** `/app/personalization`  
**Domain:** `src/domain/personalization/`  
**Service:** `src/services/personalization/`  
**Flag:** `personalizationEngine` (`NEXT_PUBLIC_FF_PERSONALIZATION_ENGINE`, default on)

---

## Intent

Centralize ranking for product surfaces from:

| Input | Sources |
| --- | --- |
| Goal | Active `Goal` title / category |
| Sport | `primaryDiscipline`, preferred sports |
| Training history | Completed / skipped sessions, technique uploads, active program |
| Behavior | Adaptation accept/decline, model feedback |
| Preferences | Stated frequency / session length + training-style bands when available |

### Surfaces

- Dashboard  
- Recommendations  
- Program suggestions  
- Exercise alternatives  
- Content  
- Notifications  

---

## Hard rules

- **Never** personalize **pricing** (plan amount, discount, paywall) from this engine.  
- **Never** use sensitive characteristics as ranking inputs: sex, birth year / age, gender, race, ethnicity, disability, health condition.  
- Service queries intentionally omit `sex` / `birthYear`.  
- Billing catalog / entitlements stay plan-based (`src/domain/billing/`).  
- Thin data → `missingNote`; no invented fill.

`pricingPersonalization.allowed` is always `false` on every plan payload.

---

## Consumers

| Consumer | How |
| --- | --- |
| Transparency UI | `/app/personalization` |
| Dashboard | Re-ranks pending recommendations for the opportunity card when the flag is on |
| Other modules | `itemsForSurface(plan, surface)` / `getPersonalizationPlan` |

---

## Tests

`src/domain/personalization/personalization.test.ts` covers multi-surface ranking, sensitive-key stripping, and the pricing guard.
