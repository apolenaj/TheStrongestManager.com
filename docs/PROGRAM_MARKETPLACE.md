# Program Marketplace

**Date:** 2026-07-21  
**Prompt:** 138 — Program Marketplace  
**Browse:** `/programs/marketplace`  
**Preview:** `/programs/marketplace/[listingId]`  
**Creator hub:** `/app/program-marketplace`  
**Staff review:** `/app/program-marketplace/review`  
**Domain:** `src/domain/program-marketplace/`  
**Service:** `src/services/program-marketplace/`  
**Flag:** `programMarketplace` (`NEXT_PUBLIC_FF_PROGRAM_MARKETPLACE`, default **on**)

---

## Intent

Marketplace for training programs with:

| Field | Notes |
| --- | --- |
| Program creator | Approved Creator Program `publish_programs` capability |
| Preview | Public preview copy (not full prescription) |
| Sport | powerlifting, bodybuilding, strongman, weightlifting, technique, general |
| Goal | strength, hypertrophy, competition_prep, technique, general_fitness, weight_management |
| Duration | Weeks band (4–24) |
| Difficulty | beginner / intermediate / advanced |
| Equipment | commercial_gym, home_gym, powerlifting_gym, minimal, bodyweight_only |

## Ratings

**Only from verified purchasers** (`ProgramMarketplacePurchase.status === completed`). Guests and unpaid accounts cannot rate.

## Platform commission

On purchase, ledger `ProgramMarketplaceCommission` with platform take (default **15%** / 1500 bps) and creator remainder. Statuses: `pending` → `accrued` / `paid_external`. Estimates only — not a live bank payout.

## Copyright protection

1. Creator must attest ownership/rights on submit  
2. Listing enters `pending_review` (never skips to published)  
3. Staff publish / reject / suspend  
4. Honesty copy forbids unauthorized copyrighted commercial uploads  

## Honesty

Empty catalog stays empty — never invent listings or fake ratings.

## Analytics

`program_marketplace_submitted|reviewed|published|purchased|rated|commission_ledgered`

## Tests

`src/domain/program-marketplace/program-marketplace.test.ts`
