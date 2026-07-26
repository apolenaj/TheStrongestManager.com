# Video Privacy Controls

**Date:** 2026-07-22  
**Prompt:** 178 — Video Privacy Controls  
**Domain:** `src/domain/video-privacy/`  
**Admin:** `/app/admin/video-privacy`  
**Flag:** `videoPrivacyControls` (`NEXT_PUBLIC_FF_VIDEO_PRIVACY_CONTROLS`, default **on**)

---

## Rules

1. **Private by default** — technique videos are never public or used for marketing.  
2. **Use only for analysis** — required explicit checkbox at upload.  
3. **Allow expert review** — optional, default off.  
4. **Allow anonymous model improvement** — optional, default off; not a public gallery.  
5. **No hidden consent** — extras are never pre-ticked; declining is the default.

---

## Storage

| Field | Meaning |
| --- | --- |
| `analysisConsentAt` | Explicit private analysis consent |
| `allowExpertReview` + `expertReviewConsentAt` | Expert share opt-in |
| `modelImprovementConsentAt` | Anonymous model-improvement opt-in (null = off) |
| `videoPrivacyVersion` | Policy version shown at consent time |
| `privacyNote` | Human-readable summary on the analysis |

---

## Athlete surfaces

| Surface | Behavior |
| --- | --- |
| Upload wizard | Required analysis consent + optional expert / model-improvement checkboxes |
| Analysis detail → Privacy & delete | Change optional opts; delete upload |
| Expert review request | Blocked unless expert-review opt-in is on |

---

## Data moat

Profile-level data-moat opt-in is **not** enough for technique patterns. Aggregation should also require per-video `modelImprovementConsentAt` (`athleteEligibleForInsight` + `videoModelImprovementOptIn`).

---

## Honesty

See `VIDEO_PRIVACY_HONESTY` — no live retrain claim; no public gallery from model-improvement opt-in.
