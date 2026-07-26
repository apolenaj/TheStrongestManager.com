# Premium Coaching Sales Flow

**Date:** 2026-07-21  
**Prompt:** 134 — Premium Coaching Sales Flow  
**Landing:** `/coaching/premium`  
**Apply:** `/coaching/premium/apply`  
**Athlete status:** `/app/premium-coaching`  
**Staff review:** `/app/premium-coaching/review`  
**Domain:** `src/domain/premium-coaching-sales/`  
**Service:** `src/services/premium-coaching-sales/`  
**Flag:** `premiumCoachingSales` (`NEXT_PUBLIC_FF_PREMIUM_COACHING_SALES`, default **on**)

---

## Intent

Premium coaching funnel:

1. **Landing**
2. **Application** — Goal, Experience, Budget range, Availability
3. **Do not promise acceptance**
4. Flow: **Apply → Review → Consultation → Offer**
5. **Track conversion events**

## Honesty

> Submitting an application does not promise acceptance, a coach match, or a coaching spot.

Success copy after submit: *Application received. This does not mean you have been accepted.*

## Conversion events (analytics catalog)

| Event | When |
| --- | --- |
| `premium_coaching_landing_viewed` | Landing mounts (client beacon) |
| `premium_coaching_application_submitted` | Apply succeeds |
| `premium_coaching_stage_changed` | Stage advance / decline / withdraw |
| `premium_coaching_offer_presented` | Offer stage reached |

Props are enums / opaque ids only — never notes or free-text.

## Persistence

`PremiumCoachingApplication` — status + stage timestamps + optional `offerJson` (proposal, not payment).

## Tests

`src/domain/premium-coaching-sales/premium-coaching-sales.test.ts`
