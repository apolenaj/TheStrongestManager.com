# Organization Billing (B2B)

**Date:** 2026-07-21  
**Prompt:** 88 — Organization Billing  
**Domain:** `src/domain/org-billing/`  
**Service:** `src/services/org/org-billing-service.ts`  
**Schema:** `OrgSubscription`  
**Route:** `/app/org/[orgId]/billing` (flag `orgBilling`)

---

## Architecture

Centralized org billing is **separate** from consumer `Subscription` (Pro / Performance).

| Layer | Responsibility |
| --- | --- |
| `getOrgPlanCatalog()` | Plans, seats, usage, features; prices only from env |
| `OrgSubscription` | Per-organization plan, status, Stripe ids, seat overrides, usage counters |
| `resolveOrgEntitlements()` | Active limits for seat/usage enforcement |
| Same `BillingProviderAdapter` | Future org checkout — never invents charges |

---

## Plans

| Plan | Seats / usage (defaults; env-overridable) |
| --- | --- |
| `org_free` | 1 coach · 5 athletes · low technique pool |
| `org_team` | 5 coaches · 40 athletes · higher pool |
| `org_facility` | 20 coaches · 200 athletes · large pool |
| `org_enterprise` | Unlimited (contact; not self-serve) |

Limits also cover **features**: org dashboard, team analytics, export aggregates, priority support.

---

## Prices (do not hard-code)

Leave unset until product publishes B2B list prices:

- `PRICING_ORG_TEAM_MONTHLY_CENTS` / `_ANNUAL_CENTS`
- `PRICING_ORG_FACILITY_MONTHLY_CENTS` / `_ANNUAL_CENTS`
- `STRIPE_PRICE_ORG_*`

UI shows **“Price not published”** when env is empty. Checkout stays off until `billingCheckout` + provider `ready` + Stripe price IDs.

---

## Seats & upgrade

- Coach seats: active `org_admin` + `org_coach`
- Athlete seats: active `org_athlete`
- Upgrade ladder via `getOrgUpgradeOptions` + **Request upgrade** (honest no-charge until Stripe org checkout exists)

Capabilities: `billing_view` · `billing_manage` (org admins by default)

---

## Feature flag

`NEXT_PUBLIC_FF_ORG_BILLING` → `orgBilling` (default on)
