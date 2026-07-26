# AI Program Review

**Date:** 2026-07-21  
**Prompt:** 56 — Full AI-assisted program analysis  
**Route:** `/app/program-review` (`?programId=`)  
**Domain:** `src/domain/program-review/`  
**Service:** `src/services/program-review/`  
**UI:** `src/components/program-review/ProgramAiReviewPanel.tsx`  
**Storage:** `ProgramAiReview` (Prisma history rows)

---

## Intent

Analyze a training program the athlete has assigned/created (or a library template) across:

- Frequency · Volume · Intensity  
- Exercise selection · Movement balance · Fatigue distribution  
- Specificity · Progression strategy · Recovery demands  

### Output

1. Program Overview  
2. Strengths  
3. Potential issues  
4. Goal alignment  
5. Weekly stress distribution  
6. Recommended improvements  

**Rule:** never label a program “bad” without context. Findings are framed against **goal, experience, schedule, equipment, and recovery capacity**.

---

## Flow

```text
Select program / template
  → load Program graph (weeks → days → workouts → exercises)
  → load athlete context (goal, experience, days/week, equipment, recovery)
  → extractProgramStructureSignals
  → assembleProgramAiReview
  → ProgramAiReviewPanel
  → optional saveProgramAiReviewAction → ProgramAiReview history
```

Programs are created/assigned under `/app/programs`. This surface analyzes — it does not auto-rewrite the plan.

**Training Program Score (Prompt 57):** each review includes `programScore` (`overallScore`, `subscores`, `confidence`, `reasoning`, `missingInformation`). See `docs/TRAINING_PROGRAM_SCORE.md`.

---

## Honesty

- Missing prescription fields → `insufficient_data`, not invented intensity.  
- Schedule/equipment/recovery conflicts → `context_mismatch` with explicit “not a bad program” framing.  
- Improvements never auto-apply (use Adaptations for confirmed changes).

---

## Related

`docs/ADAPTIVE_PROGRAMMING.md`, `docs/TRAINING_PROGRAM_DATA_MODEL.md`, `docs/WEEKLY_ATHLETE_REVIEW.md`, `docs/FIT_ENGINE.md`
