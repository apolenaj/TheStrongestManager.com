# Micro-Learning

**Date:** 2026-07-22  
**Prompt:** 173 — Micro-Learning  
**Domain:** `src/domain/micro-learning/`  
**UI:** `src/components/micro-learning/MicroLearningCard.tsx` (dashboard teaser)  
**Dashboard:** `/app/admin/micro-learning` (admin)  
**Flag:** `microLearning` (`NEXT_PUBLIC_FF_MICRO_LEARNING`, default **on**)

---

## Intent

Short educational cards (~1 minute):

- Why bracing matters  
- What RPE means  
- When to deload  
- Volume / technique confidence / specificity primers  

**Personalize** from athlete goals + sport focus. **Do not spam.**

---

## Anti-spam

| Rule | Value |
| --- | --- |
| Max cards / day | **1** |
| After dismiss | **72h** pause |
| After “Got it” | **24h** pause |
| Same lesson | **168h** cooldown |
| Mount | Dashboard teaser only (not every metric page) |

History is stored client-side (`localStorage`) so dismiss/complete preferences persist without inventing server spam.

---

## Personalization

`selectMicroLesson` scores catalog cards by `goal.category` and `primaryDiscipline` / preferred sports. Unmatched cards get a low baseline so general lessons can still appear.

Optional deepen: related **Learn why** topic (Prompt 172) + in-app href.

---

## Related

- `docs/ON_SITE_EDUCATION.md`  
- `docs/TRAINING_LOAD.md`  
- Academy courses (longer form)

## Tests

`src/domain/micro-learning/micro-learning.test.ts`
