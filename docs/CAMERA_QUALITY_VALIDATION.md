# Camera Quality Validation

**Date:** 2026-07-21  
**Prompt:** 66 — Camera quality validation  
**Domain:** `src/domain/camera-quality/`  
**UI:** `CameraQualityPanel` on upload + pre-analysis  
**Sample helpers:** `src/lib/camera-quality-sample.ts`

---

## Intent

Assess video quality **before** analysis to reduce inaccurate results.

### Detect

| Check | Evidence |
| --- | --- |
| Camera angle | Declared angle + suitability |
| Subject visibility | Pose landmark coverage (when available) |
| Lighting | Mean luma from sampled frames |
| Occlusion | Missing extremities / low visibility |
| Frame rate adequacy | Estimated fps when measurable |
| Full movement visibility | Ankles/wrists near frame edges |

### Output

- **Analysis readiness score** (0–100)  
- Verdict: **GOOD FOR ANALYSIS** or **RECORD AGAIN**  
- Reason (e.g. “Feet and barbell are partially outside the frame.”)  
- Recording instructions  

---

## Flow

```text
Upload wizard
  → sample brightness + metadata
  → assessCameraQuality (pre-pose)
  → CameraQualityPanel

Extract poses
  → derivePoseQualitySignals
  → assessCameraQuality (pose-checked)
  → RECORD AGAIN → instructions + optional “Analyze anyway”
  → GOOD → continue pipeline
```

Unknown checks are not invented as passes.

---

## Related

`docs/TECHNIQUE_ANALYSIS.md`, `docs/MOVEMENT_ANALYSIS.md`, `docs/BAR_PATH_INTELLIGENCE.md`
