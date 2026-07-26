# Movement Analysis MVP (Pose Pipeline)

**Date:** 2026-07-20  
**Prompt:** 17 — Pose / movement analysis MVP  
**Code:** `src/domain/movement/*`, `src/services/movement/*`, technique analysis UI + `/api/technique/analyses/[id]/movement`

---

## Goal

Extract **observable** body landmarks and movement data from video via a **modular pose-estimation adapter**, then produce a confidence-tagged report.

**Pipeline:** Video → Frames → Pose landmarks → Movement phases (Prompt 61) → Observable metrics → Technique heuristics → Bar path (Prompt 65) → Confidence → Report

Phase timelines: conventional **deadlift** only when detection is reliable. Squat/bench phases are catalogued but not emitted — see `docs/LIFT_PHASE_ANALYSIS.md`.

Bar path: deadlift + side-view squat/bench via mid-wrist proxy — see `docs/BAR_PATH_INTELLIGENCE.md`. Hidden when confidence is poor.

---

## Principles

1. **No invented biomechanics** — image-plane geometry only; not 3D inverse dynamics.
2. **No joint force / injury risk** without validated models (none in MVP).
3. **Every metric includes confidence** (`none` | `low` | `medium` | `high` + 0–1 score).
4. **Unsuitable camera → tell the user** (e.g. overhead deadlift).
5. **`overallTechniqueScore`** comes only from the documented conventional deadlift scorer (`deadlift.technique.weighted_v1`) when enough components are observable — see `docs/DEADLIFT_TECHNIQUE_SCORE.md`.
6. **Adapters are replaceable** — MediaPipe today, MoveNet/custom later.

---

## MVP scope

| Item | Support |
| --- | --- |
| Exercise | Conventional **deadlift** (`slug=deadlift`) first |
| Camera | Side best; 45°/front/rear partial; **overhead unsuitable** |
| Metrics | Approx hip height, shoulder–hip relation, torso-angle consistency, lockout stacking proxy, symmetry (when angle allows), wrist–hip proxy for bar/body |
| Diagnostics | `/app/technique/[id]/diagnostics` + optional fixture in development |
| Model eval | Offline benchmarks + `/app/admin/technique-eval` — see `docs/TECHNIQUE_MODEL_EVALUATION.md` |
| Human review | Optional expert Confirm / Correct / Comment — see `docs/TECHNIQUE_HUMAN_REVIEW.md` |

---

## Architecture

```text
PoseEstimationAdapter (browser_mediapipe | client_landmarks | diagnostics_fixture | unavailable)
        │
        ▼
runMovementPipeline()   // pure domain
        │
        ▼
MovementReport → TechniqueAnalysis.movementReportJson + TechniqueMetric rows
```

Domain lives under `src/domain/movement/` (camera suitability, geometry, deadlift phases/metrics/heuristics, fixture, pipeline).

---

## API

`POST /api/technique/analyses/[analysisId]/movement`

```json
{
  "poseProvider": "browser_mediapipe",
  "frames": [ { "index": 0, "timeSeconds": 0, "landmarks": [...] } ],
  "useFixture": false
}
```

`useFixture: true` is **development-only** and labels `diagnostics.fixture`.

---

## Honesty

- Upload of deadlift → `status=awaiting_pose`, `analysisBackendStatus=pose_mvp_ready`
- After pipeline → `status=completed`; `overallScore` set only when deadlift Technique Score can be computed (else null)
- Unsuitable camera → `analysisBackendStatus=unsuitable_camera` + clear message + no Technique Score

See also `docs/TECHNIQUE_ANALYSIS.md` (upload/storage).
