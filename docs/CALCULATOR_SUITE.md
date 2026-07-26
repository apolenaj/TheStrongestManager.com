# Calculator Suite

**Date:** 2026-07-22  
**Prompt:** 168 — Calculator Suite  
**Domain:** `src/domain/calculator-suite/`  
**Service:** `src/services/calculator-suite/`  
**Routes:** `/tools`, `/tools/[slug]`  
**Dashboard:** `/app/admin/calculator-suite` (admin)  
**Flag:** `calculatorSuite` (`NEXT_PUBLIC_FF_CALCULATOR_SUITE`, default **on**)

---

## Intent

Useful training tools that **lead into the platform**. Do not overpromise precision.

---

## Shipped calculators

| Tool | Path | Formula / behavior |
| --- | --- | --- |
| Estimated 1RM | `/tools/estimated-1rm` | Epley (1985), 2–12 reps only |
| Plate calculator | `/tools/plate-calculator` | Greedy paired metric plates |
| DOTS | `/tools/dots` | OpenPowerlifting / Tim Rohr coefficients |
| Volume | `/tools/volume-calculator` | Load × reps × sets tonnage |
| Attempt planner | `/tools/attempt-planner` | Wraps attempt-selector sketches |
| Training max | `/tools/training-max` | TM = 1RM × fraction (default 0.9) |

---

## Precision honesty

- Every page ships a precision note + formula citation.  
- Quality gates refuse tools without product CTAs (public + app) and honesty copy.  
- DOTS is cited; **Wilks / IPF GL are not computed**.  
- e1RM is never a verified PR. Attempt sketches are never guarantees.

---

## Product CTAs

Each calculator links into real features (`/app/today`, `/app/programs`, `/app/attempt-selector`, `/app/powerlifting`, …) so numbers become logged training.

Powerlifting Mode relative-score priority now links to `/tools/dots` without inventing an inline score.

---

## Related

- `docs/POWERLIFTING_MODE.md`  
- `docs/SCORING_SYSTEM.md` (Epley)  
- Attempt selector domain  

## Tests

`src/domain/calculator-suite/calculator-suite.test.ts`
