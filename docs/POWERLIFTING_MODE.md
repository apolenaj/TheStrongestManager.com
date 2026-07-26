# Powerlifting Mode

**Date:** 2026-07-21  
**Prompt:** 104 — Sport-Specific Mode: Powerlifting  
**Route:** `/app/powerlifting`  
**Domain:** `src/domain/powerlifting-mode/`  
**Service:** `src/services/powerlifting-mode/`  
**Flag:** `powerliftingMode` (`NEXT_PUBLIC_FF_POWERLIFTING_MODE`, default on)

---

## Intent

Sport shell that prioritizes powerlifting surfaces:

### Dashboard priorities

| Priority | Behavior |
| --- | --- |
| Squat / Bench / Deadlift | Reported PR or competition target (kg) |
| Total | Raw S+B+D when all three exist — never invented |
| Relative score | **DOTS** via cited calculator at `/tools/dots` (no invented inline score). Wilks / IPF GL deferred |
| Competition | Prep countdown / phase link |
| Weight class | Athlete-reported label / limit — not an official table |
| Attempt planning | Link to Attempt Selector |

### Training

- **Specificity** — competition-lift bias  
- **Peaking** — Competition Mode phase cues  
- **Competition commands** — common meet cues (Squat/Rack, Start/Press/Rack, Down) labeled as coaching language, **not** federation rule text  

### Technique library

Links to catalog: `back-squat`, `bench-press`, `deadlift`.

---

## Hard rules

- Do **not** confuse or apply federation-specific rules.  
- **Federation selection later** — `federation.selectedId` stays `null`.  
- Never invent DOTS coefficients; use the cited calculator at `/tools/dots`. Wilks / IPF GL stay deferred.  
- Compose existing Competition Mode + Attempt Selector; do not fork them.

---

## Related

- `docs/COMPETITION_MODE.md`  
- `docs/ATTEMPT_SELECTOR.md`  
- `docs/CALCULATOR_SUITE.md`  
- `src/domain/athlete-level/sport-strength.ts` (boundary stub)

---

## Tests

`src/domain/powerlifting-mode/powerlifting-mode.test.ts`
