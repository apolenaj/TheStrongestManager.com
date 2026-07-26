# Coach AI Copilot

**Date:** 2026-07-21  
**Prompt:** 85 — Coach AI Copilot  
**Domain:** `src/domain/coach-ai/`  
**Service:** `src/services/coach-ai/`  
**Surface:** `/app/coach/[athleteProfileId]` (flag `coachAiCopilot`)

---

## What AI may do

- Summarize the athlete week (sessions, RPE, WoW)
- Identify performance changes (technique / frequency)
- Draft program adjustments (**never applied automatically**)
- Flag missing data (recovery, technique, sessions, program, goals)

---

## What AI never does

- Replace the coach’s decision
- Auto-apply program or training changes
- Present drafts as human coach authorship

---

## Coach sees

1. **Suggested change**
2. **Why**
3. **Supporting data**

Then: **Accept** · **Edit** · **Reject**

Decisions are audited on `CoachAiSuggestion` + `CoachAiSuggestionEvent`.  
Accept/Edit also creates a `CoachModification` with `authorship=human_coach` (the decision is the coach’s).

---

## Offline evaluation

Deterministic rubrics over fixture scenarios (recovery gaps, fatigue, technique regression, competition, etc.) — see `docs/AI_EVALUATION.md` / `src/domain/ai-eval/`.

---

## Feature flag

`NEXT_PUBLIC_FF_COACH_AI_COPILOT` → `coachAiCopilot` (default on)
