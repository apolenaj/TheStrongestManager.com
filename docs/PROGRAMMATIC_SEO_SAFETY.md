# Programmatic SEO Safety

**Date:** 2026-07-22  
**Prompt:** 165 — Programmatic SEO Safety  
**Domain:** `src/domain/programmatic-seo-safety/`  
**Service:** `src/services/programmatic-seo-safety/`  
**Routes:** `/guides`, `/guides/[slug]`  
**Dashboard:** `/app/admin/programmatic-seo-safety` (admin)  
**Flag:** `programmaticSeoSafety` (`NEXT_PUBLIC_FF_PROGRAMMATIC_SEO_SAFETY`, default **on**)

---

## Intent

Scalable page **templates** only for useful content. **Do not** generate thousands of thin pages.

Every shipped guide requires:

1. **Unique value** — substantive overview + unique key  
2. **Structured data** — Article (+ FAQ when present) matching visible content  
3. **Internal links** — ≥2 links to real deep pages  
4. **Quality checks** — section depth gates; fail closed  

---

## Templates (examples)

| Template | Example guide |
| --- | --- |
| Deadlift variations | `/guides/deadlift-variations` |
| Exercise comparisons | `/compare/exercises/[slug]` via Exercise Comparison Engine (Prompt 166) |
| Method comparisons | `/guides/dup-vs-block-periodization` |

Allowlist only — never cartesian facet factories or auto variation slug minting.

---

## Refuse

- exercise × sport × equipment × level pages  
- Variation label → URL without reviewed catalog content  
- Unique canonical per `/compare?methods=` combo (hub canonical stays `/compare`; query views are `noindex`)  
- Bulk AI stubs  

---

## Indexing

- Sitemap includes quality-passed `/guides/*` only  
- Failed quality → `notFound()` / noindex / omitted from sitemap  

---

## Related

- `docs/SEO_CONTENT_ENGINE.md` — topic pillars  
- `docs/METHOD_COMPARISON.md` — interactive compare tool  

## Tests

`src/domain/programmatic-seo-safety/programmatic-seo-safety.test.ts`
