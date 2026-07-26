# Weightlifting Mode

**Date:** 2026-07-21  
**Prompt:** 107 — Sport-Specific Mode: Weightlifting  
**Route:** `/app/weightlifting`  
**Domain:** `src/domain/weightlifting-mode/`  
**Service:** `src/services/weightlifting-mode/`  
**Flags:**
- `weightliftingMode` (`NEXT_PUBLIC_FF_WEIGHTLIFTING_MODE`, default **on**)
- `weightliftingAdvancedVideoAnalysis` (`NEXT_PUBLIC_FF_WEIGHTLIFTING_ADVANCED_VIDEO`, default **off**)

---

## Intent

Olympic weightlifting sport shell.

### Lifts

| Lift | PR key |
| --- | --- |
| Snatch | `wl_snatch_weight` |
| Clean | `wl_clean_weight` |
| Jerk | `wl_jerk_weight` |
| Clean & Jerk | `wl_clean_and_jerk_weight` |

### Tracking

| Area | Behavior |
| --- | --- |
| Technique | **Deferred** — not implemented until lift-specific models exist |
| Positions | Educational checklist only (not video scores) |
| Attempts | Structural 3 snatch + 3 C&J slots |
| Competition total | Snatch + C&J when both logged |

---

## Hard rules

- **Do not implement technique analysis** until specific snatch/clean/jerk models exist.  
- `techniqueAnalysis.implemented` is always `false`.  
- **Advanced video analysis** is a separate flag and defaults **off**. Turning it on does not invent analysis — it only records intent for a future pipeline.  
- Competition totals are never invented from partial lifts.

---

## Tests

`src/domain/weightlifting-mode/weightlifting-mode.test.ts`
