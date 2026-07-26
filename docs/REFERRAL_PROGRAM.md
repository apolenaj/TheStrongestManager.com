# Referral Program

**Date:** 2026-07-21  
**Prompt:** 135 — Referral Program  
**App:** `/app/referral`  
**Domain:** `src/domain/referral-program/`  
**Service:** `src/services/referral-program/`  
**Flag:** `referralProgram` (`NEXT_PUBLIC_FF_REFERRAL_PROGRAM`, default **on**)

---

## Intent

Referral architecture where each user receives a **personal referral code**.

### Possible rewards

| Kind | Meaning |
| --- | --- |
| `technique_credits` | Ledgered analysis credits (`grant_referral`) |
| `free_month` | Time-boxed complimentary **Pro** access |
| `premium_features` | Time-boxed complimentary **Performance** access |

Defaults grant **technique credits** to referrer + referee after qualification (safest). Free month / premium features remain grantable kinds (staff path).

### Anti-pyramid

- **Single-level only** — you never earn from someone else’s invites.
- No downlines, tiers, recruiting bonuses, or cascading commissions.
- Rewards are product credits or limited complimentary access — **not cash or residual income**.

### Abuse prevention

- Self-referral voided
- Demo accounts cannot earn referral rewards
- Monthly rewarded-referral cap per referrer
- Pending attribution cap
- Qualification requires **onboarding complete** (not bare signup)
- Idempotent reward keys; credit ledger never invents balance
- Fail-closed if beneficiary is not the direct referrer/referee

## Flow

1. User opens `/app/referral` → code issued (`UserReferralCode`)
2. Invitee signs up with `?ref=` → `Referral` attributed (or voided)
3. Invitee completes onboarding → qualify → default rewards granted
4. Analytics: `referral_code_issued`, `referral_attributed`, `referral_qualified`, `referral_reward_granted`, `referral_voided`

## Persistence

- `UserReferralCode`
- `Referral` (one per referred user)
- `ReferralReward`
- `ReferralAccessGrant` (for free month / premium features)

## Tests

`src/domain/referral-program/referral-program.test.ts`
