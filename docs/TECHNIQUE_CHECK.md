# Free Technique Check Funnel

**Date:** 2026-07-22  
**Prompt:** 169 — Free Technique Check Funnel  
**Domain:** `src/domain/technique-check/`  
**Service:** `src/services/technique-check/`  
**Route:** `/technique-check`  
**API:** `POST /api/technique-check/claim`  
**Dashboard:** `/app/admin/technique-check` (admin)  
**Flag:** `techniqueCheck` (`NEXT_PUBLIC_FF_TECHNIQUE_CHECK`, default **on**)

---

## Intent

Acquisition flow:

1. Upload one lift  
2. Basic analysis  
3. Limited insight  
4. Create account to save full report  

**Do not require signup before showing any value** when technically feasible.  
Ensure privacy. Rate-limit abuse.

---

## Flow

| Step | Behavior |
| --- | --- |
| Consent + local file | Deadlift clip validated client-side; object URL only |
| Claim ticket | `POST /api/technique-check/claim` — **5 / hour / IP** |
| Analyze | MediaPipe + `runMovementPipeline` **in browser** |
| Limited insight | Labeled observed / estimated / recommended; score teaser when earned |
| Signup | `/signup?next=/app/technique&from=technique-check` for full report |

---

## Privacy

- Guest video is **not uploaded** and not stored on our servers.  
- Claim endpoint accepts **no video body**.  
- Pose landmarks are not sent to analytics.  
- After signup, normal technique privacy applies (`docs/TECHNIQUE_ANALYSIS.md`).

---

## Rate limits

| Surface | Limit |
| --- | --- |
| Guest claim ticket | 5 / hour / IP (`RATE_LIMITS.techniqueCheckClaim` + domain constants) |
| Ticket TTL | 20 minutes (HMAC signed) |

---

## Honesty

- No invented Technique Scores.  
- Limited insight locks full component breakdown, bar-path, drill pack, history.  
- MediaPipe CDN failure fails honestly — signup CTA still offered for in-app upload.

---

## Related

- `docs/TECHNIQUE_ANALYSIS.md`  
- `docs/MOVEMENT_ANALYSIS.md`  
- `docs/DEADLIFT_TECHNIQUE_SCORE.md`  

## Tests

`src/domain/technique-check/technique-check.test.ts`
