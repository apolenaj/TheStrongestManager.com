# User Segmentation

**Date:** 2026-07-22  
**Prompt:** 163 — User Segmentation  
**Domain:** `src/domain/user-segmentation/`  
**Service:** `src/services/user-segmentation/`  
**Dashboard:** `/app/admin/user-segmentation` (admin)  
**Flag:** `userSegmentation` (`NEXT_PUBLIC_FF_USER_SEGMENTATION`, default **on**)

---

## Intent

Segment athletes with **behavior and product context**. Never create sensitive demographic segmentation unnecessarily.

Segments are **multi-label** — one athlete can be Beginner + Powerlifting + Paid.

---

## Segments

| Segment | Signal |
| --- | --- |
| Beginner | `TrainingExperience.level = beginner` |
| Advanced | `level` is `advanced` or `elite` |
| Powerlifting | `primaryDiscipline` or preferred sports include powerlifting |
| Bodybuilding | `primaryDiscipline` or preferred sports include bodybuilding |
| Coach | `User.isCoach` or `primaryDiscipline = coach` |
| Paid | Paid plan (`pro` / `performance` / `elite_coaching`) with active/trialing/past_due |
| High engagement | ≥3 completed workouts in last 14 days, or ≥2 workouts + ≥1 technique upload |

---

## Never used

Denied signals include: sex, gender, birth year, age, race, ethnicity, bodyweight, height, body metrics, medical, injury.

---

## Dashboard

`/app/admin/user-segmentation` — distribution bars, definitions, denylist, sample assignments. Default cohort: **90 days** (non-demo).

---

## Related

- `docs/ADVANCED_ONBOARDING.md` — path IDs that seed sport/level  
- `docs/PERSONALIZATION_ENGINE.md` — sensitive characteristic deny-list  
- `docs/ACTIVATION_METRICS.md` / `docs/RETENTION_ANALYTICS.md` — engagement proxies  

## Tests

`src/domain/user-segmentation/user-segmentation.test.ts`
