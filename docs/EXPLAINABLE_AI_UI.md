# Explainable AI UI

**Date:** 2026-07-21  
**Prompt:** 141 — Explainable AI UI  
**Domain:** `src/domain/explainable-ai/`  
**UI:** `src/components/explainable-ai/WhyAmISeeingThis.tsx`  
**Flag:** `explainableAiUi` (`NEXT_PUBLIC_FF_EXPLAINABLE_AI_UI`, default **on**)

---

## Intent

Every AI insight answers **“Why am I seeing this?”** with:

| Block | Content |
| --- | --- |
| **Why** | Supporting data (facts that drove the insight) |
| **Confidence** | High / Moderate / Low / Insufficient data (Prompt 142) |
| **Missing information** | Gaps that limit certainty — empty stays empty |

### Example

```
Recommendation:
Keep deadlift load unchanged.

Why:
RPE increased.
Rep speed trend decreased.

Confidence:
Moderate

Missing information:
Recovery data incomplete.
```

## Contract

`ExplainableInsightView`:

- `summary` — optional one-liner
- `supportingData: string[]`
- `confidence: ConfidenceLevel`
- `missingInformation: string[]`

Adapters map existing engines — never invent rows:

| Mapper | Source |
| --- | --- |
| `fromCoachBrainRecommendation` | Coach Brain |
| `fromCoachAiDraft` | Coach AI Copilot |
| `fromCoachChatAnswer` | Coach Chat |
| `fromInsightProposal` | Cross-domain insights |
| `fromWeakPointFinding` | Weak-point intelligence |
| `fromDailyBriefInsight` | Daily coaching brief |
| `fromAdaptation` | Adaptive programming |
| `fromFatigueAnalysis` | Fatigue alerts |
| `fromDeloadAnalysis` | Deload intelligence |
| `fromPersonalizationItem` | Personalization engine |
| `fromScoreResult` | Scoring engines |

## Surfaces wired

- Coach Brain / Coach Chat
- Coach AI Copilot
- Insights (+ dashboard teaser)
- Daily brief
- Adaptations
- Weak points
- Fatigue / Deload
- Personalization

## Honesty

- Flag off → panel returns `null` (no fake explainability chrome)
- Empty supporting / missing lists stay empty
- Confidence reuses scoring `ConfidenceLevel`

## Tests

`src/domain/explainable-ai/explainable-ai.test.ts`
