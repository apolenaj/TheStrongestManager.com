# Exercise Comparison Engine

**Date:** 2026-07-22  
**Prompt:** 166 — Exercise Comparison Engine  
**Domain:** `src/domain/exercise-comparison/`  
**Service:** `src/services/exercise-comparison/`  
**Routes:** `/compare/exercises`, `/compare/exercises/[slug]`  
**Dashboard:** `/app/admin/exercise-comparison` (admin)  
**Flag:** `exerciseComparison` (`NEXT_PUBLIC_FF_EXERCISE_COMPARISON`, default **on**)

---

## Intent

Compare **Exercise A vs Exercise B** with qualitative coaching dimensions — SEO-optimized for allowlisted pairs only.

### Flagship example

**Romanian Deadlift vs Stiff-Leg Deadlift** → `/compare/exercises/romanian-deadlift-vs-stiff-leg-deadlift`

(`stiff-leg-deadlift` is now a priority catalog exercise.)

---

## Dimensions

| Dimension | Meaning |
| --- | --- |
| Purpose | Training role |
| Technique | Start position / execution character |
| Muscles | Primary emphasis |
| Fatigue | Qualitative recovery cost (+ band label) |
| Programming | How it sits in a week/block |
| Who should choose which | Selection guidance (not medical advice) |

No invented superiority scores.

---

## SEO

| Surface | Indexing |
| --- | --- |
| `/compare/exercises/[slug]` allowlisted pairs | Indexed — unique overview, Article + FAQ, canonical |
| `/compare/exercises?a=&b=` arbitrary pairs | Shareable, `noindex`, hub canonical |
| Allowlisted query on hub | Redirects to SEO pair URL |

Sitemap includes hub + allowlisted pair paths only.

---

## Related

- `/compare` — method comparison  
- `docs/PROGRAMMATIC_SEO_SAFETY.md` — thin-page refusal  
- Legacy `/guides/deadlift-vs-romanian-deadlift` redirects here  

## Tests

`src/domain/exercise-comparison/exercise-comparison.test.ts`  
`src/domain/exercises/priority-seed.test.ts` (includes stiff-leg)
