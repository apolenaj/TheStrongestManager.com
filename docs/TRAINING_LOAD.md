# Training Load and Fatigue Tracking

**Date:** 2026-07-20  
**Prompt:** 24 — Training load and fatigue  
**Engine:** `training_load.v1` (`src/domain/training-load/*`)  
**Service:** `src/services/training-load/training-load-service.ts`  
**UI:** `/app/progress`, `/app/recovery`

---

## Product wording (required)

Use:

- **Estimated training load**
- **Recovery indicators**

Do **not** present uncertain fatigue / ACWR / “readiness score” models as objective truth or injury predictors.

---

## What is tracked

| Metric | Definition |
| --- | --- |
| Sets | Completed `SessionSet` rows |
| Reps | Σ `performedReps` |
| Volume | Σ (`performedLoadKg` × `performedReps`) when **both** exist |
| Estimated intensity | Mean set RPE × 10 (0–100 display), else mean prescribed % |
| Hard sets | Heuristic: RPE ≥ 8 **or** RIR ≤ 2 (not a lab fatigue measure) |
| Session RPE | `TrainingSession.perceivedEffort` when logged |
| Exercise workload | Same volume/sets/hard-sets rolled up per exercise |

Missing loads or reps are **excluded**, never invented as zero intensity.

---

## Trends

- **7 days** — last 7 calendar days  
- **28 days** — last 28 calendar days  
- **Block** — dated `ProgramBlock` when present; else program start → now; else approximate 56-day window (labeled honestly)

Daily bar charts use estimated volume only.

---

## Sudden load spikes (conservative)

Compares average daily estimated volume in the last **7 days** vs the prior **21 days**.

Flags only when **both**:

1. Ratio ≥ **1.8**
2. Absolute lift ≥ **500** kg·reps/day average
3. Baseline has ≥ **5** training days

Label: *Possible sudden increase in estimated training load*  
Explanation explicitly denies injury/fatigue-score claims.

---

## Recovery indicators

Mean readiness / sleep hours / soreness from `RecoveryEntry` in the last 7 days.  
Shown as indicators next to load — not a medical grade or overreaching diagnosis.
