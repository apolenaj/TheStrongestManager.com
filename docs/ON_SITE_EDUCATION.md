# On-Site Education Engine

**Date:** 2026-07-22  
**Prompt:** 172 — On-Site Education Engine  
**Domain:** `src/domain/on-site-education/`  
**UI:** `src/components/on-site-education/LearnWhy.tsx`  
**Dashboard:** `/app/admin/on-site-education` (admin)  
**Flag:** `onSiteEducation` (`NEXT_PUBLIC_FF_ON_SITE_EDUCATION`, default **on**)

---

## Intent

When a user sees a metric, allow **Learn why** — explain in context without leaving the dashboard.

Examples: RPE, training volume, technique confidence, Athlete Score pillars.

---

## UX

Inline `<details>` expander (same spirit as Explainable AI). No modal/drawer that pulls focus off the page. Stop-propagation on dashboard score cards so Links still work.

## Surfaces

- Dashboard score pillars  
- Progress charts (volume, e1RM, technique trend, …)  
- Technique report (confidence)  
- Workout player (RPE when prescribed)

## Related

- `docs/EXPLAINABLE_AI_UI.md`  
- `docs/MICRO_LEARNING.md` (Prompt 173 teaser cards)  
- `docs/SCORING_SYSTEM.md`

## Tests

`src/domain/on-site-education/on-site-education.test.ts`
