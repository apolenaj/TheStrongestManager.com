# Billing 2.0

**Date:** 2026-07-22  
**Prompt:** 157 — Billing 2.0  
**Domain:** `src/domain/billing/billing-2.ts`, `webhook-parse.ts`  
**Apply:** `src/services/billing/webhook-apply-service.ts`  
**Webhook:** `POST /api/billing/webhook`  
**Dashboard:** `/app/admin/billing-2` (admin)  
**Flag:** `billing2` (`NEXT_PUBLIC_FF_BILLING_2`, default **on**)  
**Migration:** `prisma/migrations/20260721500000_billing_2/`

---

## Hard rule

**Never grant a subscription (or paid credits) solely from frontend state.**  
Checkout success URLs and client JS must not write `Subscription`. Entitlements apply only after a **signature-verified** provider webhook is processed idempotently (or a trusted admin path with audit — not shipped as a silent toggle).

---

## Supported capabilities

| Capability | How |
| --- | --- |
| Monthly / Annual | `Subscription.billingInterval` + catalog prices |
| Trials | `status=trialing` + `trialEndsAt` from provider |
| Coupons | `CouponRedemption` + `Subscription.couponCode` |
| Credits | Existing ledger; packs via webhook `externalRef` |
| Upgrades | Immediate plan upsert on `subscription.updated` |
| Downgrades | `pendingPlan` when `cancel_at_period_end` |
| Grace periods | `past_due` + `graceEndsAt` (default 3 days) keeps paid entitlements |
| Invoices | `BillingInvoice` mirror from `invoice.*` events |
| Webhook idempotency | `BillingWebhookEvent.providerEventId` unique |

---

## Webhook flow

1. Rate limit  
2. Require `STRIPE_WEBHOOK_SECRET`  
3. Verify `Stripe-Signature`  
4. Insert `BillingWebhookEvent` (duplicate → no-op success)  
5. Parse → commands → apply (subscription / invoice / credits / coupon)  
6. Mark processed / ignored / failed  

Metadata must include `userId` (and `planId` when activating). Missing user metadata → ignore command (no invented user).

---

## Schema additions

- `Subscription`: `billingInterval`, `providerPriceId`, `trialEndsAt`, `graceEndsAt`, `pendingPlan`, `couponCode`  
- `BillingWebhookEvent`  
- `BillingInvoice`  
- `CouponRedemption`  

---

## Related

- `docs/BILLING.md` — pricing catalog / UI honesty (Prompt 33)  
- `docs/TECHNIQUE_CREDITS.md` — credit ledger  
- Checkout still requires ready Stripe adapter + `billingCheckout` flag  

## Tests

`src/domain/billing/billing-2.test.ts`
