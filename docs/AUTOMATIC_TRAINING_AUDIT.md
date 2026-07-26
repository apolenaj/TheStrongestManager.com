# Automatic Training Audit

**Date:** 2026-07-21  
**Prompt:** 58 — Upload → Analyze → Understand → Improve  
**Route:** `/app/training-audit` (flag `trainingAudit`)  
**Domain:** `src/domain/training-audit/`  
**Service:** `src/services/training-audit/`  
**UI:** `src/components/training-audit/TrainingAuditWizard.tsx`

---

## Workflow

```text
UPLOAD YOUR PROGRAM  →  ANALYZE  →  UNDERSTAND  →  IMPROVE
```

### Accepted inputs

| Mode | Status |
| --- | --- |
| Manual entry | Supported |
| CSV | Supported (`day,exercise,sets,reps,rpe,percent,load_kg`) |
| Structured pasted text | Supported (`Day N` + `Lift 4x5 @RPE8 80%`) |
| PDF / image | **Feature-flagged** (`trainingAuditPdfImage`) — honest “not available” until a real parser ships |

---

## Findings (never fabricated)

The audit identifies, from **imported lines only**:

- Potential duplicate stress  
- Missing movement patterns  
- Excessive progression (steep RPE jumps / many ≥90% days)  
- Poor exercise ordering  
- Potentially unrealistic volume  
- Unclear progression  

Unresolved exercise names stay unresolved. Missing sets/RPE/load stay null — the system does not invent program details.

Optional: reuses Training Program Score when enough structure exists (`docs/TRAINING_PROGRAM_SCORE.md`).

---

## Honesty

- Parse warnings list skipped lines — they are not completed by the model.  
- PDF/image path never fakes OCR output.  
- Improve suggestions do not auto-write Programs.

---

## Flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_FF_TRAINING_AUDIT` | on | Gate the audit route |
| `NEXT_PUBLIC_FF_TRAINING_AUDIT_PDF_IMAGE` | off | Future PDF/image parsing |

---

## Related

`docs/AI_PROGRAM_REVIEW.md`, `docs/TRAINING_PROGRAM_SCORE.md`
