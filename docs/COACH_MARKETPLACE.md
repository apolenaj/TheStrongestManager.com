# Coach Marketplace MVP

**Date:** 2026-07-21  
**Prompt:** 83 — Coaching Marketplace MVP (extends Prompt 37)  
**Domain:** `src/domain/marketplace/`  
**Service:** `src/services/marketplace/`  
**Public:** `/coaching`, `/coaching/[slug]`  
**Coach:** `/app/coach/marketplace`  
**Flag:** `coachMarketplace` / `NEXT_PUBLIC_FF_COACH_MARKETPLACE` (default **on**)

---

## Athlete / visitor

| Action | Behavior |
| --- | --- |
| Browse | Published listings only — never invents coaches |
| Filter by sport | `?sport=` matches specialization strings |
| View profile | `/coaching/[slug]` |
| Request consultation | Creates `CoachMarketplaceInquiry` — **no payment** |

---

## Coach controls

Availability · Pricing (display) · Specializations · Publish/draft · Inquiry inbox

---

## Payments

**Disabled.** `MARKETPLACE_PAYMENTS_DISABLED = true`. Pricing is informational; checkout/payouts remain future work.

---

## Honesty

- Empty catalog → Coming soon (no demo coaches)
- Credentials labeled Verified only when verified
- Marketplace ≠ Coach Mode data grants
