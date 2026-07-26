# Lift Phase Analysis

**Date:** 2026-07-21  
**Prompt:** 61 — Lift phase analysis  
**Code:** `src/domain/movement/phases/`, `src/domain/movement/deadlift/phases.ts`, `TechniqueVideoTimeline`, `LiftPhaseDetailPanel`  
**Pipeline:** `movement.v1.1`

---

## Intent

Expand video analysis beyond one overall score with a **phase timeline**. Click a phase to see:

| Field | Content |
| --- | --- |
| Video frame | Seek to phase start; show frame range + playhead |
| Metric | Best related observable metric (when confident) |
| Issue | Weak technique component or heuristic — or honest “none flagged” |
| Recommendation | Phase-specific coaching cue |

---

## Supported detection

| Lift | Phases | Status |
| --- | --- | --- |
| **Deadlift** | Setup → Initial pull → Knee level → Lockout (+ optional Descent) | **Detected** when landmarks allow |
| **Squat** | Setup → Descent → Bottom → Sticking region → Lockout | Catalogued only — **not detected** |
| **Bench** | Setup → Descent → Touch → Initial press → Mid-range → Lockout | Catalogued only — **not detected** |

### Reliability gates (deadlift)

- Need enough frames with visible hips (same as MVP).
- **Knee level** only when knee + wrist coverage on the rising segment clears `KNEE_LEVEL_MIN_COVERAGE` and a wrist/knee crossing is found.
- Otherwise emit legacy **Pull** (single rising blob) — never invent knee-level.

---

## UI

Technique report → **Video & lift phases**:

1. Phase range bands on the scrubber  
2. Phase chips (click selects + seeks)  
3. `LiftPhaseDetailPanel` for the selected phase  

---

## Honesty

- No squat/bench phase timelines until detectors clear the same bar.  
- No invented metrics or medical claims.  
- Overall Technique Score remains separate (deadlift scorer only).

---

## Related

`docs/MOVEMENT_ANALYSIS.md`, `docs/TECHNIQUE_REPORT_UX.md`, `docs/DEADLIFT_TECHNIQUE_SCORE.md`
