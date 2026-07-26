# Progress Analytics

**Date:** 2026-07-20  
**Prompt:** 25 — Progress analytics  
**Route:** `/app/progress`  
**Service:** `src/services/progress/progress-analytics-service.ts`  
**UI:** `src/components/progress/*`

---

## Sections

| Section | Data |
| --- | --- |
| Strength trend | Best load/day from ProgressMetric or SessionSet |
| PR timeline | New verified load highs only (never Estimated 1RM) |
| Estimated 1RM | Epley from multi-rep logs (2–12), labeled Estimated |
| Volume | Weekly Σ(load×reps) |
| Bodyweight | `BodyMetric` bodyweight |
| Technique trend | Completed `TechniqueAnalysis.overallScore` |
| Consistency | Weekly completed ÷ (completed+skipped) |
| Program adherence | Same ratio for active-program-linked sessions |

## Controls

- **Compare:** 4 weeks · 12 weeks · 6 months · 1 year · All time (`?range=`)
- **Exercise:** major-lift logs + exercises with completed sets (`?exercise=`)

## Chart rules

- Readable X/Y axes with **unit label**
- Responsive SVG (mobile)
- Tooltips on hover/focus/tap
- Honest **empty states** when a series has no points

## Honesty

Estimated 1RM ≠ PR. Missing data stays empty — never invented chart filler.
