# Exercise Prescription Engine

**Date:** 2026-07-21  
**Prompt:** 59 — Multi-rule exercise recommendations  
**Route:** `/app/exercise-prescription` (flag `exercisePrescription`)  
**Domain:** `src/domain/exercise-prescription/`  
**Service:** `src/services/exercise-prescription/`  
**UI:** `src/components/exercise-prescription/ExercisePrescriptionPanel.tsx`

---

## Intent

Recommend exercises from the **published catalog** using multiple transparent rules — never a single-heuristic auto-prescribe.

### Inputs

- Goal  
- Sport  
- Weak point  
- Equipment  
- Experience  
- Technique limitations  
- Pain flags  
- Current program (slugs + movement patterns)

### Output (per recommendation)

| Field | Example |
| --- | --- |
| Recommended exercise | Romanian Deadlift |
| Reason (Why) | Posterior-chain hypertrophy and hip-extension strength |
| Primary purpose | Posterior-chain hypertrophy and hip-extension strength |
| Expected fatigue | high / moderate / low |
| Skill demand | high / moderate / low |
| Best placement in week | After a lighter lower day… |
| Alternatives | Hip thrust, deadlift, … |

---

## Anti–single-heuristic rule

A candidate must accumulate weight from **≥ 2 distinct rules** (`EXERCISE_PRESCRIPTION_MIN_RULE_HITS`) before it can appear. Effects targeting unknown catalog slugs are ignored — lifts are never invented.

---

## Flow

```text
Profile + weakPoint query
  → load published catalog candidates
  → load active program patterns/slugs
  → PRESCRIPTION_RULES (multi-rule weights + reasons)
  → recommendExercises (rank, alternatives, transparency)
  → ExercisePrescriptionPanel
```

---

## Related

`docs/FIT_ENGINE.md`, `docs/EXERCISE_INTELLIGENCE.md`, `docs/TECHNIQUE_FEEDBACK_ENGINE.md`
