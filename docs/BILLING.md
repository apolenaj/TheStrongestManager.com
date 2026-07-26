# Pricing & Monetization

**Date:** 2026-07-20  
**Prompt:** 33 — Pricing and monetization  
**Route:** `/pricing`  
**Catalog:** `src/domain/billing/catalog.ts` (single source of prices)  
**Provider:** `src/domain/billing/provider.ts` (Stripe-compatible)  
**Service:** `src/services/billing/billing-service.ts`  
**UI:** `src/components/marketing/PricingExperience.tsx`

---

## Tiers

| Plan | Role |
| --- | --- |
| **Free** | Exercise library, training methods, basic tracking, limited technique demo |
| **Pro** | Training tools, progress analytics, programs, more technique analysis |
| **Performance** | Advanced adaptive coaching, higher analysis limits, advanced insights, Mealnexio integration |
| **Elite Coaching** | Optional future — not self-serve checkout |

Legacy DB values: `athlete` → `pro`, `coach_premium` → `elite_coaching` via `normalizePlanId`.

---

## Central prices

Display amounts live in `getPlanCatalog()` (cents). Override without editing UI:

- `PRICING_PRO_MONTHLY_CENTS` / `PRICING_PRO_ANNUAL_CENTS`
- `PRICING_PERFORMANCE_MONTHLY_CENTS` / `PRICING_PERFORMANCE_ANNUAL_CENTS`
- `STRIPE_PRICE_*` for Stripe Price ids

Do **not** hard-code dollar amounts in marketing components.

---

## Stripe abstraction

```text
BillingProviderAdapter {
  createCheckoutSession() → null until ready
  createCustomerPortalSession() → null until ready
}
unavailableStripeAdapter  → status: unavailable
```

Checkout enabled only when `billingCheckout` flag **and** provider `ready` **and** Stripe env configured.

Webhook: `POST /api/billing/webhook` verifies `Stripe-Signature` via `verifyStripeWebhookSignature`. Returns 503 when `STRIPE_WEBHOOK_SECRET` is unset. Does **not** invent subscription activations until a ready adapter handles verified events.

---

## UI honesty (no dark patterns)

- Monthly default; annual optional toggle  
- Features + limits per tier  
- Dedicated **Cancellation** section  
- No countdown / fake scarcity / forced annual  

---

## Technique analysis credits

Usage-based technique analyses: monthly allocation from plan limits, optional packs, atomic spend, refund on system failure. See `docs/TECHNIQUE_CREDITS.md`.

---

## Billing 2.0

Lifecycle upgrades (Prompt 157): trials, coupons, upgrades/downgrades, grace periods, invoices, webhook idempotency. **Never grant subscription from frontend alone.** See `docs/BILLING_2.md`.

---

## Organization (B2B) billing

Separate from consumer plans. See `docs/ORG_BILLING.md` (Prompt 88).

- Catalog: `src/domain/org-billing/catalog.ts`
- Schema: `OrgSubscription`
- **No hard-coded B2B dollars** — publish via `PRICING_ORG_*_CENTS` when ready
