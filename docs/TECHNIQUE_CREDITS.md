# Technique Analysis Credit System

**Date:** 2026-07-21  
**Prompt:** 34 — Technique analysis credit system  
**Domain:** `src/domain/billing/credits.ts`  
**Service:** `src/services/billing/credit-service.ts`  
**Schema:** `CreditBalance` + `CreditTransaction`

---

## Concept

| Audience | Credits |
| --- | --- |
| **Free** | Limited trial / monthly allocation (`techniqueAnalysesPerMonth` from plan catalog, currently 2) |
| **Paid** | Monthly allocation (Pro 20, Performance 60) |
| **Unlimited plans** | No debit (Elite) |
| **Optional** | Credit packs (`credits_5`, `credits_20`) |

---

## Data

- **`CreditBalance`** — wallet cache (`balance`, `lastReason`)
- **`CreditTransaction`** — append-only history: `delta`, `balanceAfter`, `kind`, `reason`, `relatedType`/`relatedId`, `expiresAt`, `settlesGrantId`

Kinds: `grant_monthly` · `grant_trial` · `grant_pack` · `spend_analysis` · `refund_analysis` · `expire` · `adjust`

---

## Atomic deduction

`deductAnalysisCredit` uses `updateMany` with `balance >= cost` inside `$transaction`, then writes the ledger row. Concurrent spends cannot overdraw.

## Never charge on system failure

- Storage write failure after deduct → **`refundAnalysisCredit`** + delete analysis  
- Movement honesty-contract system failure → mark failed + **refund**  
- User outcomes (`unsuitable_camera`, etc.) remain completed — credits stay spent  

Refunds are **idempotent** per analysis id.

## Expiry

Monthly/trial grants set `expiresAt` to end of UTC month. `expireStaleCredits` settles unused remainder (idempotent per grant via `settlesGrantId`). Packs default to no expiry.

## UI

`/app/technique` shows balance, period allocation, pack list, and recent ledger activity.
