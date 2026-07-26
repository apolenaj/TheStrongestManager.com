# Conventional Deadlift Technique Score

**Date:** 2026-07-20  
**Prompt:** 18 — Deadlift Technique Score  
**Code:** `src/domain/movement/deadlift/score/*`  
**Formula:** `deadlift.technique.weighted_v1` v1.0.0

---

## What it returns

| Field | Meaning |
| --- | --- |
| `score` | 0–100 weighted mean of **observed** components, or `null` |
| `confidence` | `none` \| `low` \| `medium` \| `high` |
| `metricsObserved` | Component labels that contributed |
| `metricsUnavailable` | Component labels that could not be scored (+ reason) |
| `keyIssue` | Primary limitation or weakest component |
| `positiveFindings` | Highest-scoring observed components (≥75) |
| `recommendations` | Coaching-oriented next steps (not medical advice) |
| `assumptions` | Documented scoring assumptions |

Persisted to `TechniqueAnalysis.overallScore` only when `score != null`.

---

## Components & nominal weights

Weights sum to **1.0**. Unavailable components are dropped; remaining weights are **renormalized**.

| Component | Weight | Primary evidence |
| --- | --- | --- |
| Setup consistency | 0.12 | Mid-hip y variance in setup phase |
| Start position | 0.15 | Shoulder–hip horiz/vert at start (image plane) |
| Bracing indicators | 0.08 | **Usually unavailable** — IAP/breath not in 2D pose |
| Bar proximity | 0.12 | Wrist–hip vertical proxy during pull |
| Hip rise pattern | 0.15 | Monotonicity of hip rise in pull |
| Back-angle consistency | 0.18 | Torso-angle stddev during pull |
| Lockout | 0.12 | \|hip.y − shoulder.y\| in lockout region |
| Rep consistency | 0.08 | ≥2 pull cycles; else unavailable |

Threshold constants live in `thresholds.ts` with written rationale.

---

## Camera angle

Not every metric is available from every angle (see `camera-suitability.ts`).

- **Side:** preferred for Technique Score  
- **Overhead / unknown:** unsuitable → **no score**  
- Limited keys are treated as unavailable for affected components  

---

## Minimum data

- ≥ **3** observed components to emit a numeric score  
- ≥ **4** for medium confidence eligibility  
- ≥ **6** + side camera + solid landmark confidence for high  

If minima are not met → `score: null` (not invented).

---

## Assumptions (non-negotiable)

1. Image-plane landmarks only — not 3D joint kinematics.  
2. Deterministic documented weights; renormalize when components drop out.  
3. Bracing is not scored from pose alone.  
4. Bar proximity uses a **wrist** proxy — not true bar tracking.  
5. Rep consistency requires ≥2 detectable cycles.  
6. No joint force, spine load, or injury-risk claims.  

---

## Tests

`src/domain/movement/deadlift/score/score.test.ts`  
`src/domain/movement/pipeline.test.ts`

Related: `docs/MOVEMENT_ANALYSIS.md`, `docs/SCORING_SYSTEM.md`
