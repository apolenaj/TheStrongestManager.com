# Weekly Athlete Review

**Date:** 2026-07-21  
**Prompt:** 55 — Automatic weekly performance review  
**Route:** `/app/weekly-review` (`?week=2026-W30`)  
**Domain:** `src/domain/weekly-review/`  
**Service:** `src/services/weekly-review/`  
**UI:** `src/components/weekly-review/WeeklyAthleteReviewPanel.tsx`  
**Storage:** `WeeklyAthleteReview` (Prisma)

---

## Intent

An automatic **weekly performance review** that summarizes the athlete’s week without dumping raw charts:

- Training completed  
- Program adherence  
- Strength changes  
- Volume  
- Technique  
- Recovery  
- Bodyweight  
- PRs  
- Main improvement  
- Biggest current limitation  

Ends with **NEXT WEEK → Keep · Change · Watch**.

Supports **this week vs previous week** comparison and **stores historical reviews**.

---

## Flow

```text
getWeeklyAthleteReview({ userId, weekKey? })
  → gather signals for this week + previous week
  → assembleWeeklyAthleteReview (summaries + Next week plan)
  → upsert WeeklyAthleteReview.reviewJson (history)
  → WeeklyAthleteReviewPanel (comparison + history links)
```

---

## Honesty

- Thin recovery → cite check-in count; never invent “poor recovery.”  
- Strength deltas use estimated 1RM from logged sets only.  
- Missing sections stay explicit via `missingNote`.  
- Keep / Change / Watch are coaching-practice suggestions — not medical advice.

---

## Related

`docs/PROGRESS_ANALYTICS.md`, `docs/DAILY_COACHING_BRIEF.md`, `docs/PERFORMANCE_INTELLIGENCE.md`
