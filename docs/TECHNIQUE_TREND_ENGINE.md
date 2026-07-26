# Technique Trend Engine

**Date:** 2026-07-21  
**Prompt:** 63 — Technique trend engine  
**Route:** `/app/technique-trends` (flag `techniqueTrendEngine`)  
**Domain:** `src/domain/technique-trend/`  
**Service:** `src/services/technique-trend/`  
**UI:** `src/components/technique-trend/TechniqueTrendPanel.tsx`

---

## Intent

Longitudinal technique analytics for the same lift under **compatible camera angles**.

### Example

```text
Deadlift Technique Score:
72  76  79  83
```

Show:

- Improved metrics  
- Stable metrics  
- Regressed metrics  

Identify:

- Most improved technical element  
- Current persistent issue  

---

## Camera compatibility

| Rule | Behavior |
| --- | --- |
| Same eligible angle | Comparable (`side` with `side`, etc.) |
| Overhead / other / unknown | Never enter a series |
| Cross-angle (e.g. side ↔ 45°) | **Not compared** unless listed in `TECHNIQUE_TREND_SUPPORTED_ANGLE_PAIRS` (empty by default) |

---

## Classification

| Status | Rule |
| --- | --- |
| Improved | Latest − first ≥ `+5` points |
| Regressed | Latest − first ≤ `-5` |
| Stable | Otherwise |

Persistent issue: component still ≤ 55 on the latest analysis and in the issue band on a majority of comparable samples. **Cause is not attributed.**

---

## Flow

```text
Completed TechniqueAnalysis (overallScore + movement report)
  → samples grouped by exerciseSlug + cameraAngle
  → assembleTechniqueTrends
  → TechniqueTrendPanel
```

---

## Related

`docs/DEADLIFT_TECHNIQUE_SCORE.md`, `docs/TECHNIQUE_ANALYSIS.md`, `docs/LIFT_PHASE_ANALYSIS.md`
