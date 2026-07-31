# Mealnexio Deep Linking

**Date:** 2026-07-22  
**Prompt:** 187 — Mealnexio Deep Linking  
**Domain:** `src/domain/mealnexio-deep-linking/`  
**Admin:** `/app/admin/mealnexio-deep-linking`  
**Return:** `/app/nutrition/mealnexio-return`  
**Flag:** `mealnexioDeepLinking` (`NEXT_PUBLIC_FF_MEALNEXIO_DEEP_LINKING`, default **on**)  
**Related:** `docs/NUTRITION_INTEGRATION.md` (sync still **off**)

---

## Principle

Seamless cross-product UX between **The Strongest** and **Mealnexio** via documented deep links and a return landing — **without** faking sync, SSO, or nutrition summaries.

---

## Example (recovery → Mealnexio)

| Surface | Copy |
| --- | --- |
| Message | “Nutrition may be limiting recovery.” |
| CTA | “Open Mealnexio nutrition review” |

Shown on `/app/recovery` and `/app/nutrition` when the deep-linking flag is on. Coaching prompt only — not a diagnosis or calorie prescription.

Outbound URL includes documented query keys (`tsm_source`, `tsm_intent`, `tsm_prompt`, `tsm_sso`, optional `tsm_ref` / `tsm_return`).

---

## Return: nutrition summary

Mealnexio **may** return a structured `mealnexio_return.v1` payload with a `NutritionDailySummary`.

- Default protocol status: **`not_live`** → `acceptMealnexioReturnPayload` rejects; nothing invented.
- Landing: `/app/nutrition/mealnexio-return` explains honesty when no live handshake exists.
- When infrastructure is ready, set protocol to `ready` and optionally require HMAC (`MEALNEXIO_RETURN_HMAC_SECRET`).

---

## SSO (future)

| Status | Meaning |
| --- | --- |
| `not_configured` | Default — plain deep links only |
| `unavailable` | Explicitly not offered |
| `available` | Shared IdP / OIDC authorization code may attach identity later |

Planned model: **OIDC authorization code**. Env keys documented only: `MEALNEXIO_SSO_ISSUER`, `MEALNEXIO_SSO_CLIENT_ID`, …

`ssoAttached` is true only when status is `available` — this build never invents a session.

---

## vs live sync

| Concern | Flag | Default |
| --- | --- | --- |
| Deep links / return / SSO stub | `mealnexioDeepLinking` | **on** |
| Live calorie/macro sync API | `mealnexioSync` | **off** |

Deep linking ≠ Mealnexio API sync.

---

## Tests

```bash
npx vitest run src/domain/mealnexio-deep-linking
```
