# Free Program Audit Funnel

**Date:** 2026-07-22  
**Prompt:** 170 — Free Program Audit Funnel  
**Domain:** `src/domain/program-audit/`  
**Service:** `src/services/program-audit/`  
**Route:** `/program-audit`  
**API:** `POST /api/program-audit/claim`  
**Dashboard:** `/app/admin/program-audit` (admin)  
**Flag:** `programAudit` (`NEXT_PUBLIC_FF_PROGRAM_AUDIT`, default **on**)

---

## Intent

SEO / acquisition tool:

1. Paste program  
2. Receive basic audit  
3. Unlock detailed recommendations with account  

**No fake scoring.** Use **deterministic checks first.**

---

## Flow

| Step | Behavior |
| --- | --- |
| Paste | Day headers + `Lift 4x5 @RPE8` lines (reuses `parseTrainingAuditPaste`) |
| Claim ticket | `POST /api/program-audit/claim` — **8 / hour / IP** |
| Basic audit | `findTrainingAuditIssues` + extra rule checks (deload cue, rest days, sparse paste) **in browser** |
| Limited results | Top **3** findings; rest locked |
| Signup | `/signup?next=/app/training-audit&from=program-audit` |

---

## Scoring honesty

- Free page **never** shows a fabricated 0–100 Program Score (`programScore.shown: false`).  
- In-app Program Score still requires enough observed components (`docs/TRAINING_PROGRAM_SCORE.md`).  
- Unresolved names / missing sets stay unresolved.

---

## Privacy

- Paste is analyzed in the browser for the free check.  
- Claim endpoint accepts **no program body**.  
- Full Training Audit under account uses normal product privacy.

---

## Related

- `docs/TECHNIQUE_CHECK.md` (funnel twin)  
- Training Audit domain / `/app/training-audit`  
- `docs/AI_PROGRAM_REVIEW.md`  

## Tests

`src/domain/program-audit/program-audit.test.ts`
