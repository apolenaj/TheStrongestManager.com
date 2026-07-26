# Bar Path Intelligence

**Date:** 2026-07-21  
**Prompt:** 65 — Bar-path intelligence  
**Code:** `src/domain/movement/bar-path/`, pipeline `movement.v1.2`  
**UI:** `BarPathPanel` on the technique report

---

## Intent

Where technically possible, track a **bar-path proxy** and visualize it.

### First support

| Lift | Camera |
| --- | --- |
| Deadlift | Side preferred; 45°/front reduced confidence |
| Squat | **Side view only** |
| Bench | **Side view only** |

### Tracked (when displayable)

- Horizontal deviation (mid-wrist x stddev)  
- Vertical path range (mid-wrist y travel)  
- Rep consistency (across ≥2 vertical cycles)

---

## Honesty rules

1. **Proxy = mid-wrist** — not a CV bar-plate detector.  
2. If coverage/confidence is poor → **`displayable: false`**, metrics and path points empty — **metric hidden**.  
3. **Never fabricate** tracking or invent multi-rep consistency without cycles.  

---

## Flow

```text
Pose frames
  → analyzeBarPath (confidence gate)
  → MovementReport.barPath
  → BarPathPanel (SVG path + metrics, or honest hidden state)
```

---

## Related

`docs/MOVEMENT_ANALYSIS.md`, `docs/LIFT_PHASE_ANALYSIS.md`, `docs/DEADLIFT_TECHNIQUE_SCORE.md`
