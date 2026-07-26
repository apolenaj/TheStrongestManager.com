# Training Program Score

**Date:** 2026-07-21  
**Prompt:** 57 — Transparent Program Score  
**Code:** `src/domain/program-score/`  
**Formula:** `program.quality.weighted_v1` v1.0.0  
**UI:** `/app/program-review` (ScoreRing + subscores)

---

## Contract

| Field | Meaning |
| --- | --- |
| `overallScore` | 0–100 renormalized weighted mean of **observed** components, or `null` |
| `subscores` | Per-component score / weight / effectiveWeight / status |
| `confidence` | `none` \| `low` \| `medium` \| `high` |
| `reasoning` | `formulaId`, `formulaVersion`, `formulaDescription`, `minimumData`, `notes`, `assumptions` |
| `missingInformation` | Explicit gaps — never invent scores to fill them |

UI shows the numeric score only when confidence is `medium` or `high` (`displayableProgramScore`).

**Not** the athlete Scoring System `programming` pillar (that measures session adherence).

---

## Components & nominal weights

Weights sum to **1.0**. Unavailable components are dropped; remaining weights are **renormalized**.

| Component | Weight | Scored when |
| --- | --- | --- |
| Goal alignment | 0.18 | Primary goal + exercises on file |
| Specificity | 0.16 | Exercise lines with movement patterns |
| Progression | 0.14 | Progression rules and/or RPE/%/load anchors |
| Volume suitability | 0.14 | `targetSets` weekly estimate **and** experience or recovery capacity |
| Fatigue management | 0.13 | Day-level workouts with set density |
| Exercise balance | 0.12 | Movement-pattern tags present |
| Recovery compatibility | 0.13 | Known recovery capacity + day prescriptions |

Threshold constants and rationale live in `src/domain/program-score/thresholds.ts`.

---

## Minimum data

- ≥ **4** observed components to emit `overallScore`  
- ≥ **5** for medium confidence eligibility  
- ≥ **6** with no low-confidence components for high  

If minima are not met → `overallScore: null` (not an arbitrary number).

Volume suitability **refuses** to score without experience level or recovery capacity — avoids inventing a “suitable volume” band.

---

## Formula (human-readable)

```text
overallScore = Σ (componentScore × (componentWeight / Σ observedWeights))
```

rounded to integer 0–100 after clamping.

---

## Assumptions

1. Scores the **prescribed** program graph + profile context — not logged adherence.  
2. Distinct from athlete `programming` adherence score.  
3. Deterministic documented weights; renormalize when components drop.  
4. Volume uses prescribed `targetSets`, not measured tonnage.  
5. Low scores cite fit/data gaps — never a blanket “bad program” label.  
6. Not medical advice / not injury risk.

---

## Tests

`src/domain/program-score/program-score.test.ts`

---

## Related

`docs/AI_PROGRAM_REVIEW.md`, `docs/SCORING_SYSTEM.md`, `docs/DEADLIFT_TECHNIQUE_SCORE.md`
