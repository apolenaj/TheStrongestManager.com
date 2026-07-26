# Verified Lift System

**Date:** 2026-07-21  
**Prompt:** 77 — Verified Lift System  
**Domain:** `src/domain/verified-lift/`  
**Route:** `/app/verified-lifts` (flag `verifiedLifts`)  
**Admin review:** `/app/admin/verified-lifts`  
**Model:** `VerifiedLiftClaim`

---

## Levels

| Level | Meaning |
| --- | --- |
| Self-reported | Athlete claim — not platform verification |
| Video submitted | Video evidence + basic metadata attached |
| Competition verified | Meet metadata + evidence + **approved** manual review |

---

## Officially verified

`isOfficiallyVerified` is **true only when all** of:

1. `level === competition_verified`
2. `reviewStatus === approved`
3. Video (or storage) evidence present
4. Competition metadata: meet name + meet date (federation recommended)

Video-submitted lifts are **never** labeled “officially verified.”

---

## Verification process

1. **Video evidence** — link a technique analysis upload (or storage key)
2. **Metadata** — performed date; for competition: meet name, date, federation
3. **Manual review** — athlete submits (`pending_review`); staff approve/reject in admin queue

On approve for competition without full criteria, level falls back to `video_submitted` — competition is not granted silently.

---

## Badges

| Badge | When |
| --- | --- |
| Self-reported | Default claim |
| Video submitted | Evidence attached, not yet competition-approved |
| Pending review | In manual review queue |
| Video reviewed | Approved on video path only |
| Competition verified | Competition level after approval |
| Officially verified | Same as competition path **only when criteria pass** |
| Rejected / Revoked | Review outcomes |

---

## Feature flag

`NEXT_PUBLIC_FF_VERIFIED_LIFTS` → `verifiedLifts` (default on)
