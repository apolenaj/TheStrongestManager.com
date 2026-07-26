# Universal Timeline

**Date:** 2026-07-22  
**Prompt:** 191 — Universal Timeline  
**Domain:** `src/domain/universal-timeline/`  
**Athlete UI:** `/app/timeline`  
**Admin:** `/app/admin/universal-timeline`  
**Flag:** `universalTimeline` (`NEXT_PUBLIC_FF_UNIVERSAL_TIMELINE`, default **on**)

---

## Principle

A single **athlete history timeline** assembled from real records. Empty means no matching history — never invent workouts, PRs, or coach notes.

---

## Event kinds

| Kind | Source |
| --- | --- |
| Workout | Completed `TrainingSession` |
| PR | Progress metrics (improving lift keys) + PR Intelligence events when flagged |
| Technique analysis | `TechniqueAnalysis` (not deleted) |
| Program change | `ProgramVersion` on athlete programs |
| Competition | `CompetitionPrep` |
| Bodyweight milestone | `BodyMetric` bodyweight — first log or ≥ 2.5 kg change vs prior |
| Coach note | Non-private, active `CoachNote` |

---

## Filters

Query: `/app/timeline?kinds=workout,pr,technique_analysis`

Toggle chips on the page. Empty `kinds` = show all. Counts reflect the full unfiltered history.

---

## Honesty

- Private coach notes excluded  
- AI coach-note summaries are not listed as coach notes  
- Competition rows are prep records, not fabricated meet results  
- Bodyweight milestones are logging milestones, not body-comp diagnoses  

---

## Tests

```bash
npx vitest run src/domain/universal-timeline
```
