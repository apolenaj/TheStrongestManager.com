# Model feedback loop

**Date:** 2026-07-21  
**Prompt:** 92 — Model Feedback Loop  
**Domain:** `src/domain/model-feedback/`  
**Service:** `src/services/model-feedback/`  
**Schema:** `ModelFeedback`  
**Flag:** `modelFeedback` (`NEXT_PUBLIC_FF_MODEL_FEEDBACK`, default on)

---

## Intent

Collect structured feedback on AI recommendations for:

1. **Product analytics** (verdict + relatedType only — no free-text reasons)  
2. **Rule improvement** (human review of stored rows)  
3. **Future model evaluation** (offline datasets)

**Hard rule:** Production AI is **never** automatically retrained from unreviewed feedback (`mayAutoRetrainFromFeedback() === false`, `autoRetrainBlocked` always true on rows).

---

## Athlete ratings

| Verdict | UI |
| --- | --- |
| Helpful | Thumbs on adaptations, insights, program AI reviews |
| Not helpful | Same |
| Reason | Optional; stored on `ModelFeedback.reason` only |

Surfaces: `AdaptationsPanel`, `InsightsPanel`, `ProgramAiReviewPanel` via `AthleteAiFeedbackControls`.

---

## Coach decisions

| Verdict | Source |
| --- | --- |
| Accepted | Coach AI Accept |
| Modified | Coach AI Edit |
| Rejected | Coach AI Reject |

Recorded automatically via `recordCoachAiDecisionFeedback` when a coach decides on a `CoachAiSuggestion` (in addition to existing decision audit).

---

## Storage

`ModelFeedback`: actor, role, `relatedType` / `relatedId`, verdict, optional reason, `engineVersion`, `autoRetrainBlocked`.

Unique per `(actorUserId, relatedType, relatedId)`.

Related types: `program_adaptation` · `coach_ai_suggestion` · `recommendation` · `program_ai_review` · `insight`

---

## Analytics

Event `model_feedback_submitted` props: `relatedType`, `verdict`, `role` — **never** `reason`.

---

## Offline evaluation

Coach AI drafts are regression-tested offline — see `docs/AI_EVALUATION.md`. Feedback never auto-retrains; eval never calls production models.

Technique expert reviews (Prompt 95) also feed offline improvement datasets via `technique_expert_review` feedback — see `docs/TECHNIQUE_HUMAN_REVIEW.md`.

---

## Feature flag

`NEXT_PUBLIC_FF_MODEL_FEEDBACK` → `modelFeedback` (default on)
