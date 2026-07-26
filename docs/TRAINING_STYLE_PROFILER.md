# Training Style Profiler

**Date:** 2026-07-21  
**Prompt:** 99 — Training Style Profiler  
**Route:** `/app/training-style`  
**Domain:** `src/domain/training-style/`  
**Service:** `src/services/training-style/`  
**Flag:** `trainingStyleProfiler` (`NEXT_PUBLIC_FF_TRAINING_STYLE_PROFILER`, default on)

---

## Intent

Discover **practical training preferences** from:

- User choices (stated days/week, session length, coaching status)  
- Training adherence / skipped sessions  
- Session completion  
- Feedback (adaptation accept/decline + helpful ratings)  
- Effort logs (RPE)

Example summary:

> High-intensity preference. Moderate frequency. Low tolerance for high-volume sessions.

---

## Dimensions

| Id | Bands |
| --- | --- |
| `intensity_preference` | prefer_lower · balanced · prefer_higher |
| `frequency_preference` | low · moderate · high |
| `volume_tolerance` | low · moderate · high |

Each dimension includes confidence, source (`stated` / `observed` / `mixed` / `insufficient`), evidence bullets, and `missingNote` when thin.

---

## Hard rules

- **Do not** present psychological personality claims (Big Five, temperament, “kind of person”).  
- Prefer coaching-language preferences only.  
- Never invent bands when data is insufficient.  
- Never auto-apply program changes from the profiler.

Tests assert `TRAINING_STYLE_FORBIDDEN_CLAIMS` never appear in assembled copy.
