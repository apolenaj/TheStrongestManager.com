# SEO Content Engine

**Date:** 2026-07-21  
**Prompt:** 39 — Scalable SEO architecture  
**Domain:** `src/domain/seo/`  
**Routes:** `/learn`, `/learn/[slug]`  
**Infra:** `src/app/sitemap.ts`, `src/app/robots.ts`

---

## Principles

1. **Topic → pillar → supporting pages** — clusters defined in `SEO_TOPIC_CLUSTERS`.
2. **No thin AI spam** — supporting links point only at existing deep content (exercises, methods, history, academy, tools).
3. **Every indexed pillar earns its URL** — overview + sections + FAQ + internal links.
4. **Do not misuse structured data** — emit schema only when page content matches.

---

## Core clusters

| Cluster | Pillar |
| --- | --- |
| Exercise technique | `/learn/exercise-technique` |
| Exercise variations | `/learn/exercise-variations` |
| Training methods | `/learn/training-methods` |
| Powerlifting | `/learn/powerlifting` |
| Bodybuilding | `/learn/bodybuilding` |
| Strongman | `/learn/strongman` |
| Programming | `/learn/programming` |
| Technique errors | `/learn/technique-errors` |
| Performance | `/learn/performance` |

---

## Technical SEO

| Concern | Implementation |
| --- | --- |
| Sitemap | `buildPublicSitemapEntries()` → `/sitemap.xml` |
| Robots | Allow public; disallow `/app/`, `/api/`, auth pages |
| Canonical | `alternates.canonical` on marketing pages; `absoluteUrl()` / `metadataBase` |
| Schema | `Article`, `BreadcrumbList`, `FAQPage` (when FAQs exist), `Course` (Academy), `VideoObject` only if `contentUrl` present |

Helpers: `src/domain/seo/schema.ts` · `JsonLdScript` component.

Wired on: learn pillars, methods, exercises, academy courses (plus existing home FAQ / history Article).

---

## What we refuse

- Thousands of auto-generated exercise/program stubs  
- FAQPage / VideoObject / Course markup without matching visible content  
- Indexing authenticated `/app/*` surfaces  

See also **Prompt 165** — `docs/PROGRAMMATIC_SEO_SAFETY.md`: allowlisted `/guides` templates with unique value, structured data, internal links, and quality gates; `/compare` query combos never get unique canonicals.
