# Daily Coaching Brief

**Date:** 2026-07-21  
**Prompt:** 54 — Personalized “Today” intelligence brief  
**Route:** `/app/today` (also `/app` → Today after onboarding)  
**Domain:** `src/domain/daily-brief/`  
**Service:** `src/services/daily-brief/`  
**UI:** `src/components/daily-brief/DailyCoachingBriefPanel.tsx`

---

## Intent

A personalized **Today** intelligence brief that shows only high-value coaching for the day — not a full metrics dump.

Possible section kinds (subset rendered per day):

- Today’s workout  
- Current priority / primary focus  
- Recovery status  
- Technique focus  
- Progress toward goal  
- Important warning  
- Suggested action  

**Rule:** do not show everything. Prioritize **maximum three** important insights.

### Example composition

```text
TODAY
Primary focus: Deadlift setup consistency.
Why: Your last two analyses showed increasing hip-position variation.
Training: Heavy deadlift today.
Recovery: No major issue detected.
Action: Record your final working set from 45°.
```

---

## Flow

```text
getDailyCoachingBrief(userId)
  → Today workout + AthleteState + last 2 technique reports + recovery count
  → deriveTechniqueFocusFromAssessments (honest deltas only)
  → buildDailyCoachingBrief (rank → cap 3 insights → compose lines)
  → DailyCoachingBriefPanel above TodayWorkoutPanel
```

App entry `/app` redirects to `/app/today` after onboarding so the brief is the central daily experience.

---

## Honesty

- Thin recovery logs → cite check-in count; never “recovery has been poor.”  
- “No major issue detected” only when enough check-ins exist and status is not low.  
- Technique “increasing variation” only from last-two component score deltas.  
- No medical diagnosis language.

---

## Related

`docs/PERFORMANCE_INTELLIGENCE.md`, `docs/AI_COACH_BRAIN.md`, `docs/AI_COACH_CHAT.md`, `docs/WORKOUT_EXPERIENCE.md`
