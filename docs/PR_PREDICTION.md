# PR Prediction Engine

**Date:** 2026-07-21  
**Prompt:** 68 — PR prediction engine  
**Domain:** `src/domain/pr-prediction/`  
**Route:** `/app/pr-prediction` (flag `prPrediction`)

---

## Intent

Conservative **estimated 1RM ranges** — never a single exact number.

### Example

```text
Estimated deadlift potential: 305–315 kg
Confidence: Moderate
Assumptions: …
```

### Inputs

| Signal | Role |
| --- | --- |
| Recent working sets | Load × reps (Epley for multi-rep; singles use load) |
| RPE | Proximity to failure; missing RPE discounts estimates |
| Rep performance | Missed targets lower confidence |
| Trend | Improving / stable / declining bias (conservative) |
| Training phase | Accumulation / intensification / peaking / deload |
| Fatigue | High fatigue or low readiness shifts range down |

### Hard rules

- **Range only** — never present a point 1RM as a verified PR.
- **Withhold** when data quality is insufficient (default: &lt;2 qualifying sets).
- Explain **assumptions** on every prediction.
- Not a medical or competition attempt prescription.

---

## Qualifying sets

- Last **28 days**
- Work / AMRAP sets with load + reps ≤ 12
- Prefer RPE ≥ 7 (hard sets)
- Soft high-rep sets without RPE are excluded

Exception: one ≤5-rep set at RPE ≥ 8.5 may produce a **low**-confidence range.

---

## Confidence

| Level | Typical evidence |
| --- | --- |
| High | Several hard sets with RPE + known trend/phase/fatigue |
| Moderate | ≥2 qualifying sets with partial context |
| Low | Single hard-set exception, missed reps, or thin RPE |

---

## Feature flag

`NEXT_PUBLIC_FF_PR_PREDICTION` → `prPrediction` (default on)
