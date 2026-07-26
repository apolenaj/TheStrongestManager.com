# Technique model evaluation

**Date:** 2026-07-21  
**Prompt:** 94 — Technique Model Evaluation  
**Domain:** `src/domain/technique-eval/`  
**Dashboard:** `/app/admin/technique-eval` (staff only)  
**Tests:** `src/domain/technique-eval/technique-eval.test.ts`

---

## Intent

Offline benchmark infrastructure for technique-analysis quality — landmark detection, phase detection, metric consistency, and camera-angle robustness — **without** publishing accuracy percentages from synthetic fixtures.

Related: `docs/MOVEMENT_ANALYSIS.md`, `docs/AI_EVALUATION.md`, `docs/DEADLIFT_TECHNIQUE_SCORE.md`.

---

## Test dataset architecture

Each case shares one shape (fixtures today; human-labeled video later):

| Field | Role |
| --- | --- |
| `datasetKind` | `synthetic_fixture` \| `human_labeled` |
| `frames` + `cameraAngle` + `exerciseSlug` | Input to `runMovementPipeline` |
| `groundTruth` | Required landmarks / coverage bounds, expected & forbidden phases, limited metrics, score withhold |
| `focuses` | Which quality metrics gate the case |

Catalog (`TECHNIQUE_EVAL_DATASET`): side clean, low visibility, front partial, overhead unsuitable, metric repeatability, 45° foreshorten.

---

## Metrics

| Id | Checks |
| --- | --- |
| `landmark_detection_quality` | Coverage vs min/max ground truth; low-vis stays below detection threshold |
| `phase_detection` | Expected phases present; forbidden phases not invented |
| `metric_consistency` | Identical re-run (ε); expected observables present |
| `camera_angle_robustness` | Suitability flag; limited keys; score withheld when required |

Harness: `runTechniqueEvalSuite` / `buildTechniqueEvalDashboardSnapshot`.

---

## Accuracy claims

`formatPublicAccuracyClaim` returns **“No public accuracy claim — insufficient human-labeled benchmark data.”** unless `datasetKind === "human_labeled"` and `labeledSampleCount ≥ 1`.

Internal fixture rates may appear in admin/CI with an explicit “not a public accuracy claim” caveat.

---

## Running

```bash
npx vitest run src/domain/technique-eval
```

Admin dashboard re-runs the suite server-side on each load (deterministic fixtures — no athlete media).

---

## What this is not

- Not a marketing accuracy badge  
- Not a substitute for a human-labeled video benchmark set  
- Not auto-retrain of the pose / technique model  
