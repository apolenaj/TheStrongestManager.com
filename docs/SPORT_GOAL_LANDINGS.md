# Sport Goal Landing Pages

**Date:** 2026-07-22  
**Prompt:** 167 — Sport Goal Landing Pages  
**Domain:** `src/domain/sport-goal-landings/`  
**Service:** `src/services/sport-goal-landings/`  
**Routes:** `/goals`, `/goals/[slug]`  
**Dashboard:** `/app/admin/sport-goal-landings` (admin)  
**Flag:** `sportGoalLandings` (`NEXT_PUBLIC_FF_SPORT_GOAL_LANDINGS`, default **on**)

---

## Intent

High-quality landings for sport/goal intent that **link into actual product features**. Avoid generic SEO filler.

---

## Shipped examples

| Goal | Path |
| --- | --- |
| Improve Deadlift | `/goals/improve-deadlift` |
| Build Bigger Chest | `/goals/build-bigger-chest` |
| Powerlifting Program | `/goals/powerlifting-program` |
| Strongman Training | `/goals/strongman-training` |

---

## Product CTAs (required)

Each landing must include:

- ≥3 product links with specific reasons  
- At least one **public** path (exercises, learn, academy, compare, …)  
- At least one **app** path (`/app/today`, `/app/technique`, `/app/programs`, sport modes, …)

Fail quality → `notFound()` / omit from sitemap.

---

## Refuse

- Generic filler phrases (“ultimate guide”, “unlock your potential”, …)  
- Sport × goal × level cartesian pages  
- Landings that only keyword-stuff without product paths  

---

## Related

- `docs/PROGRAMMATIC_SEO_SAFETY.md`  
- `docs/EXERCISE_COMPARISON.md`  
- Learn pillars `/learn/powerlifting`, `/learn/strongman`  

## Tests

`src/domain/sport-goal-landings/sport-goal-landings.test.ts`
