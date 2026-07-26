# Smart Video Recording Guide

**Date:** 2026-07-21  
**Prompt:** 67 — Smart video recording guide  
**Domain:** `src/domain/recording-guide/`  
**UI:** `SmartVideoRecordingGuide` + `RecordingGuideDiagram` on technique upload

---

## Intent

Show **exercise-specific filming guidance before upload**:

- Recommended camera angle  
- Distance  
- Height  
- What must be visible  
- Visual placement diagram  
- Honest angle tradeoffs  

### Examples

| Lift | Guidance |
| --- | --- |
| Deadlift | 45° front-side recommended for general analysis |
| Squat | Side or 45° depending on analysis goal |
| Bench | Side view for bar path |

**Hard rule:** Do not claim one angle captures all metrics.

---

## Flow

```text
Select exercise
  → getRecordingGuide(slug)
  → SmartVideoRecordingGuide (diagram + specs)
  → suggest recommendedCameraAngle
  → choose file → camera quality (Prompt 66)
```

---

## Related

`docs/CAMERA_QUALITY_VALIDATION.md`, `docs/TECHNIQUE_ANALYSIS.md`, `docs/BAR_PATH_INTELLIGENCE.md`
