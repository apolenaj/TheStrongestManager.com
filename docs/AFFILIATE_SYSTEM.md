# Affiliate System

**Date:** 2026-07-21  
**Prompt:** 136 — Affiliate System  
**Hub:** `/app/affiliate`  
**Staff review:** `/app/affiliate/review`  
**Public directory:** `/affiliates`  
**Click landing:** `/a/[code]`  
**Domain:** `src/domain/affiliate-system/`  
**Service:** `src/services/affiliate-system/`  
**Flag:** `affiliateSystem` (`NEXT_PUBLIC_FF_AFFILIATE_SYSTEM`, default **on**)

---

## Intent

Affiliate tracking architecture for:

- **Creators**
- **Coaches**
- **Partners**

Track:

| Signal | Storage |
| --- | --- |
| Clicks | `AffiliateClick` |
| Conversions | `AffiliateConversion` (`signup` / `subscription`) |
| Commission | `AffiliateCommission` ledger (`pending` → `accrued` / `paid_external`) |

Separate from the personal **referral** program (`/app/referral`, `?ref=`). Affiliates use `?aff=` and `/a/[code]`.

## Disclosure (required)

**Do not display affiliate partnerships without disclosure.**

- Domain gate: `canDisplayAffiliatePartnerships` / `filterPartnersForDisplay` return empty when `disclosureVisible` is false.
- UI: `AffiliateDisclosureBanner` on directory, landing, hub, review, and affiliate signup.
- Apply flow requires disclosure acknowledgment.

## Honesty

- Commission rows are **ledger estimates**, not guaranteed payouts.
- `paid_external` means settled outside this app — no fake in-app bank payouts.
- No income claims or multi-level recruiting.

## Flow

1. User applies at `/app/affiliate` (creator / coach / partner) with disclosure ack → `pending`
2. Staff activates at `/app/affiliate/review`
3. Partner shares `/a/{code}` → disclosure → Continue → click recorded → `/signup?aff=…`
4. Signup attributes conversion + pending commission ledger
5. Public `/affiliates` lists active partners **only with disclosure on the page**

## Analytics

- `affiliate_partner_applied`
- `affiliate_partner_activated`
- `affiliate_link_clicked`
- `affiliate_conversion_attributed`
- `affiliate_commission_ledgered`

## Tests

`src/domain/affiliate-system/affiliate-system.test.ts`
