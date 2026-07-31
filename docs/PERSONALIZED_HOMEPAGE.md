# Personalized Homepage

**Date:** 2026-07-22  
**Prompt:** 164 — Personalized Homepage  
**Domain:** `src/domain/personalized-homepage/`  
**Service:** `src/services/personalized-homepage/`  
**Dashboard:** `/app/admin/personalized-homepage` (admin)  
**Flag:** `personalizedHomepage` (`NEXT_PUBLIC_FF_PERSONALIZED_HOMEPAGE`, default **on**)

---

## Intent

Allow soft homepage variants by **traffic intent** while keeping **canonical brand identity** and avoiding **misleading cloaking** for search engines.

---

## Allowlisted intents

| Intent | Query examples | Soft changes |
| --- | --- | --- |
| Default | _(none)_ / unknown | Canonical support + secondary CTA |
| Powerlifting | `?intent=powerlifting` | Powerlifting-framed support; methods secondary |
| Technique | `?intent=technique` | Technique-framed support; `#technique` secondary |
| Coach | `?intent=coach` | Coach-framed support; `/coaching` secondary |
| SEO landing | `?intent=seo` | Support matches indexed meta description |

Also accepts allowlisted `utm_campaign` aliases when `intent` is absent.

---

## Always locked (anti-cloaking)

- Brand: `The Strongest`
- Hero headline lines (`Upload a lift…`)
- Document title, meta description, canonical `/`, Open Graph, JSON-LD
- No User-Agent / bot-vs-human branching

Soft fields only: hero support sentence + secondary CTA href/label. Growth experiment CTA labels still apply independently.

---

## Related

- `docs/GROWTH_EXPERIMENT_FRAMEWORK.md` — homepage CTA A/B  
- `docs/SEO_CONTENT_ENGINE.md` — canonicals / indexing  
- `docs/USER_SEGMENTATION.md` — product segments (not marketing cloaking)

## Tests

`src/domain/personalized-homepage/personalized-homepage.test.ts`
