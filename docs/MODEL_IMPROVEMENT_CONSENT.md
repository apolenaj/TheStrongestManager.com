# Model Improvement Consent

**Date:** 2026-07-22  
**Prompt:** 179 — Model Improvement Consent  
**Domain:** `src/domain/model-improvement-consent/`  
**Athlete UI:** `/app/settings/consent`  
**Admin:** `/app/admin/model-improvement-consent`  
**Flag:** `modelImprovementConsent` (`NEXT_PUBLIC_FF_MODEL_IMPROVEMENT_CONSENT`, default **on**)

---

## Separate kinds — never bundled

| Kind | What it is | Revoke |
| --- | --- | --- |
| **Service use** | Using the product; technique analysis still needs per-upload consent | Delete videos / delete account |
| **Expert review** | Account preference + per-video share with verified experts | Turn off preference · revoke all video expert flags |
| **Research / model improvement** | Anonymized data-moat aggregates for future model improvement | Revoke account opt-in · clears video model-improvement flags |

Expert review **never** implies research. Research **never** implies expert review or public video.

---

## Storage

| Preference | Store |
| --- | --- |
| Expert account preference | `AthleteConsentPreference.expertReviewOptIn` |
| Research account opt-in | `DataMoatConsent` (writable when `modelImprovementConsent` or `dataMoat`) |
| Per-video expert / research | `TechniqueAnalysis.allowExpertReview` · `modelImprovementConsentAt` |

---

## Honesty

No live training pipeline is claimed. See `MODEL_IMPROVEMENT_CONSENT_HONESTY` and `docs/DATA_MOAT_ARCHITECTURE.md` / `docs/VIDEO_PRIVACY_CONTROLS.md`.
