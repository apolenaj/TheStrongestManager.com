# Goal Probability Engine

**Date:** 2026-07-21  
**Prompt:** 69 — Goal probability engine  
**Domain:** `src/domain/goal-probability/`  
**Route:** `/app/goal-progress` (flag `goalProbability`)

---

## Intent

Estimate **goal progress** against a dated strength target.

### Example

```text
Goal: Deadlift 320 kg by October 15

Current estimate: 305–315 kg
Required improvement: +5–15 kg
Time remaining: ~12 weeks
Current trajectory: Improving ≈ 0.5 kg/week

Status: Possible but aggressive
Why: …
```

### Hard rule

**Do not claim a precise probability** (e.g. “72% chance”) unless a validated model exists.  
This product uses **qualitative** status only:

| Status | Label |
| --- | --- |
| `on_track` | On track |
| `possible_but_aggressive` | Possible but aggressive |
| `below_target` | Current trajectory below target |

Plus honesty states: insufficient data, target already within estimate, past deadline.

---

## Inputs

| Signal | Use |
| --- | --- |
| Goal title / targetValue / targetDate | Target kg + deadline (title parsing when fields empty) |
| PR prediction range | Current estimate |
| Daily e1RM samples (56d) | Trajectory slope (kg/week) |
| Projection vs required rate | Status classification |

---

## Feature flag

`NEXT_PUBLIC_FF_GOAL_PROBABILITY` → `goalProbability` (default on)
