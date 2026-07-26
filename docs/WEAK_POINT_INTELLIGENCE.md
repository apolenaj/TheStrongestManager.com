# Weak Point Intelligence

**Date:** 2026-07-21  
**Prompt:** 60 — Weak-point intelligence  
**Route:** `/app/weak-points` (flag `weakPointIntelligence`)  
**Domain:** `src/domain/weak-point-intelligence/`  
**Service:** `src/services/weak-point-intelligence/`  
**UI:** `src/components/weak-point-intelligence/WeakPointIntelligencePanel.tsx`

---

## Intent

Surface **potential weak points** only when there is **logged evidence**, with confidence and recommended validation.

### Categories

| Category | Typical signals |
| --- | --- |
| Technical weakness | Technique component scores across recent analyses |
| Strength weakness | AthleteState performance trend + lift logs |
| Muscular weakness | Lift-log imbalances only — **never appearance** |
| Programming weakness | Missing active program or skip-heavy adherence |
| Recovery limitation | Enough readiness check-ins + low average |
| Consistency issue | Low completed sessions in 28 days |

### Finding shape (example)

```text
Potential weak point: Deadlift floor position
Evidence:
  - 3 recent technique analyses
  - Slow relative movement from floor (start / hip-rise components)
  - Stable lockout
Confidence: Moderate
Recommended validation: Compare paused deadlift performance
```

---

## Hard rules

1. **Evidence required** — findings with empty `evidence[]` are dropped.
2. **No appearance-based muscular claims** — photos / “looks weak” are not inputs.
3. **No invented bar velocity** — “slow from floor” is phrased via technique component proxies.
4. **Medical non-diagnosis** — recovery findings cite readiness logs only.
5. Optional bridge to Exercise Prescription via `prescriptionWeakPoint` — never auto-applies programs.

---

## Flow

```text
Athlete profile
  → technique analyses + ProgressMetric lifts + sessions + recovery + AthleteState
  → detectWeakPoints (pure)
  → WeakPointIntelligencePanel
```

---

## Related

`docs/EXERCISE_PRESCRIPTION.md`, `docs/TECHNIQUE_FEEDBACK_ENGINE.md`, `docs/PERFORMANCE_INTELLIGENCE.md`
