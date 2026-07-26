# Entitlement System

**Date:** 2026-07-22  
**Prompt:** 158 — Entitlement System  
**Domain:** `src/domain/entitlements/`  
**Service:** `src/services/entitlements/entitlement-service.ts` (`EntitlementService`)  
**Dashboard:** `/app/admin/entitlements` (admin)  
**Flag:** `entitlementSystem` (`NEXT_PUBLIC_FF_ENTITLEMENT_SYSTEM`, default **on**)

---

## Intent

Centralize product access checks. **Do not scatter** `Subscription.plan` / `PlanLimits` reads across components.

| Product feature | Catalog limit key |
| --- | --- |
| Technique analyses / month | `techniqueAnalysesPerMonth` |
| AI Coach | `adaptiveCoaching` |
| Advanced analytics / insights | `advancedInsights` |
| Coach tools | `coachWorkspace` |
| Programs | `activePrograms` |
| Progress analytics | `progressAnalytics` |

Limits remain defined only in `src/domain/billing/catalog.ts`. EntitlementService loads via `getSubscriptionForUser` (referral + Billing 2.0 grace).

---

## EntitlementService API

```ts
import { EntitlementService, requireFeature } from "@/services/entitlements";

await requireFeature(userId, "progress_analytics");
await EntitlementService.getTechniqueAnalysisMonthlyLimit(userId);
await EntitlementService.canConsumeFeatureSlot(userId, "programs", usedCount);
```

---

## Wired call sites

- Progress page → `progress_analytics`
- Credit monthly allocation → `technique_analyses`
- Adaptive proposals → `adaptive_coaching`
- AI Coach page → `ai_coach`
- Insights page → `advanced_analytics`
- Coach dashboard → `coach_tools` (+ `isCoach` role)
- Program template assign → `programs` slot check

---

## Related

- `docs/BILLING.md` / `docs/BILLING_2.md` — plans & webhooks  
- Org entitlements stay separate (`org-billing`)

## Tests

`src/domain/entitlements/entitlements.test.ts`
