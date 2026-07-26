# Technique human review pipeline

**Date:** 2026-07-21  
**Prompt:** 95 — Human Review Pipeline  
**Domain:** `src/domain/technique-review/`  
**Service:** `src/services/technique-review/`  
**Flag:** `techniqueExpertReview` (`NEXT_PUBLIC_FF_TECHNIQUE_EXPERT_REVIEW`, default on)  
**Surfaces:** Technique report panel · `/app/technique-review` queue

---

## Intent

Technique analyses always support **AI Analysis**. Optionally, a verified Expert Contributor may **Confirm**, **Correct**, or **Comment**.

**Hard rule:** Never present AI analysis as expert-reviewed unless an expert has decided.

---

## Flow

1. Athlete requests review (consent to share video + analysis with verified experts).
2. Status → `pending_review` — badge stays **AI analysis**.
3. Verified expert opens `/app/technique-review` → Confirm / Correct / Comment.
4. Status → `confirmed` | `corrected` | `commented` — badge becomes **Expert reviewed**.
5. AI vs expert **disagreement** (`none` | `score` | `summary` | `qualitative` | `mixed`) is stored for future offline model improvement.
6. `autoRetrainBlocked` always true — never live retrain.

---

## Who can review

Only `ExpertContributorProfile.verificationStatus === "verified"`.  
Coach Mode alone is insufficient.

---

## Model feedback

Decisions also write `ModelFeedback` with `role=expert`, `relatedType=technique_expert_review`, verdicts `confirmed` | `corrected` | `commented` (when `modelFeedback` is on).

---

## Privacy

Media access for experts requires athlete `expertReviewConsentAt` and an active/completed review row.

---

## Paid Expert Technique Review

Purchase-gated products (single lift / training / competition prep) live under Prompt 96 — see `docs/HUMAN_ANALYSIS.md`. Free optional review above does not charge; paid orders use `HumanAnalysisOrder` status tracking and never invent turnaround SLAs.
