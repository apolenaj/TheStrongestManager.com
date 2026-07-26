# Evidence Quality System

**Date:** 2026-07-21  
**Prompt:** 112 — Evidence Quality System  
**Route:** `/evidence`  
**Domain:** `src/domain/evidence-quality/`  
**UI:** `src/components/evidence-quality/`  
**Flag:** `evidenceQualitySystem` (`NEXT_PUBLIC_FF_EVIDENCE_QUALITY_SYSTEM`, default **on**)

---

## Labels

| Label | Family |
| --- | --- |
| Strong evidence | Research evidence |
| Moderate evidence | Research evidence |
| Limited evidence | Research evidence |
| Coaching consensus | Expert practice |
| Historical method | Expert practice |
| Heuristic | Expert practice |

## Hard rules

- Do **not** fake scientific certainty.  
- Separate **research evidence** from **expert practice**.  
- Articles / claims link to real sources **only when citations exist** (`https` URLs). Missing URLs stay missing.  
- Legacy `ExerciseEvidenceClaim.supportLevel` (`strong` / `moderate` / `limited`) maps to research labels; unknown → limited (never invent strong).

## Surfaces

| Surface | Behavior |
| --- | --- |
| Exercise evidence claims | Quality badge + citation link when URL present |
| Method sections | Layer → historical method / limited evidence / coaching consensus |
| Expert articles | Default coaching consensus (expert practice) |
| History archive | Historical method label |
| Learn hub | Points to `/evidence` guide |

## Tests

`src/domain/evidence-quality/evidence-quality.test.ts`
