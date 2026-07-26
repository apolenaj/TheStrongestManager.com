# Creator Program

**Date:** 2026-07-21  
**Prompt:** 137 — Creator Program  
**Hub:** `/app/creator`  
**Staff review:** `/app/creator/review`  
**Domain:** `src/domain/creator-program/`  
**Service:** `src/services/creator-program/`  
**Flag:** `creatorProgram` (`NEXT_PUBLIC_FF_CREATOR_PROGRAM`, default **on**)

---

## Intent

Future creator partnership architecture. Creators may (after approval):

| Capability | Meaning |
| --- | --- |
| `share_technique_score` | Technique score card sharing with creator path |
| `publish_programs` | Future program publish / marketplace listing |
| `share_content` | Educational content channels |
| `earn_referral_revenue` | Link to referral + affiliate revenue paths (ledger estimates) |

## Do not imply partnership until approved

- Status starts as **`pending`** (role label: **Creator applicant**).
- Only **`approved`** uses the label **Creator partner**.
- Success copy: *Application received. This does not mean you are an approved creator partner.*
- Capabilities resolve to **[]** unless `status === approved` (`resolveCreatorCapabilities`).

## Separation

| Program | Surface |
| --- | --- |
| Personal referral | `/app/referral` (`?ref=`) |
| Affiliate tracking | `/app/affiliate` (`?aff=`) |
| Creator partnership | `/app/creator` (capabilities gate) |

Optional soft-link to an active `AffiliatePartner` of type `creator` on approval — never treats pending applicants as affiliates.

## Flow

1. Apply at `/app/creator` → `CreatorPartnership` pending  
2. Staff reviews at `/app/creator/review` → approve / reject / suspend  
3. Approved → capability hrefs unlock (technique, programs, content, referral/affiliate)

## Analytics

- `creator_program_applied`
- `creator_program_reviewed`
- `creator_program_approved`

## Tests

`src/domain/creator-program/creator-program.test.ts`
