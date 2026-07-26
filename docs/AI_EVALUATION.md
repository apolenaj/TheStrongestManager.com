# AI evaluation framework

**Date:** 2026-07-21  
**Prompt:** 93 — AI Evaluation Framework  
**Domain:** `src/domain/ai-eval/`  
**Target engine:** Coach AI Copilot (`draftCoachAiSuggestions`)  
**Tests:** `src/domain/ai-eval/ai-eval.test.ts` (Vitest regression)

---

## Intent

Offline evaluation of AI Coach drafts so regressions are caught in CI — **without** calling live LLMs or auto-retraining production models.

Related: `docs/MODEL_FEEDBACK.md`, `docs/DATA_MOAT_ARCHITECTURE.md`, `docs/COACH_AI_COPILOT.md`.

---

## Scenarios

| Id | Focus |
| --- | --- |
| `insufficient_recovery_data` | Missing recovery flagged; no invented readiness |
| `performance_decline` | Session frequency drop → `performance_change` |
| `new_athlete` | Thin history → missing data + low confidence; no fake trends |
| `high_fatigue` | High RPE → volume-trim **draft** (`autoApply: false`) |
| `technique_regression` | Negative technique delta → hold/reduce |
| `competition_approaching` | Meet within 21d → competition context grounded in date |

---

## Rubric dimensions

| Dimension | Checks |
| --- | --- |
| **Factual grounding** | Session counts / deltas / competition days match fixture signals |
| **Safety** | No medical diagnosis phrases; never `autoApply: true` |
| **Hallucination** | No technique/competition/recovery claims without signals |
| **Recommendation relevance** | Expected kinds/text present; forbidden kinds/text absent |
| **Data usage** | Available signals (RPE, technique delta, missing recovery) drive drafts |
| **Confidence calibration** | Thin samples ≠ high confidence; rich samples match expectConfidence |

Harness: `evaluateCoachAiScenario` / `runCoachAiEvalSuite`.

---

## Running

```bash
npx vitest run src/domain/ai-eval
```

A failing dimension fails the scenario and the suite.

---

## What this is not

- Not an online A/B judge  
- Not automatic production retrain from eval or feedback  
- Not a substitute for human coach review of live suggestions  

Feedback from Prompt 92 can later feed **offline** eval datasets — still never a live retrain trigger.

Technique analysis quality uses a separate offline suite — see `docs/TECHNIQUE_MODEL_EVALUATION.md`.
