# Technique Analysis Report UX

**Date:** 2026-07-20  
**Prompt:** 19 — Technique Analysis report UX  
**Code:** `src/components/technique/TechniqueAnalysisReport.tsx`, `src/domain/technique/report-presentation.ts`

---

## Sections

1. Overall Technique Score (+ ScoreRing)  
2. Confidence  
3. Video & lift phases (timeline + click → frame / metric / issue / recommendation)  
4. Bar path (mid-wrist proxy — hidden when confidence is poor)  
5. Previous vs current comparison (when available)  
6. Technique breakdown (observed components only)  
7. What you did well (≤3)  
8. Main improvement opportunity (≤3)  
9. How to improve (rule-based feedback engine — why / how / dosage / reassess)  
10. Re-analysis CTA  

Phase detection: `docs/LIFT_PHASE_ANALYSIS.md` (Prompt 61). Bar path: `docs/BAR_PATH_INTELLIGENCE.md` (Prompt 65). Camera quality: `docs/CAMERA_QUALITY_VALIDATION.md` (Prompt 66). Filming guide: `docs/SMART_VIDEO_RECORDING_GUIDE.md` (Prompt 67). Privacy / delete are collapsed; diagnostics stay secondary.

Static drill lists from Prompt 19 are replaced by Prompt 20’s gated engine (`docs/TECHNIQUE_FEEDBACK_ENGINE.md`).

---

## Prioritization rules

- Max **3** actions (`TECHNIQUE_REPORT_MAX_ACTIONS`)  
- Prefer weakest **observed** components — never dump all unavailable metrics as warnings  
- Drills / exercises derived from those same priorities  

---

## Comparison

`getPreviousTechniqueAnalysisForUser` loads the latest prior analysis for the **same exercise** with a score or movement report.
