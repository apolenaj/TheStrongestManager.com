# Legendary Training Methods — Production Audit

**Product:** The Strongest  
**Feature:** Legendary Training Methods  
**Date:** 2026-07-28  
**Prompt:** 8B — QA Testing, Production Build and Final Audit Report  
**Method:** Terminal lint / typecheck / vitest / `next build`, plus content-schema, sitemap, metadata, paid-product, and disclaimer validation via `scripts/legendary-methods-audit.ts`

---

## 1. Executive summary

Legendary Training Methods is **technically ready to ship as a draft-gated educational shell**. The library index, navigation, homepage CTA, legal/editorial safeguards, SEO scaffolding, and production build all pass. **Zero profiles are published**; drafts are excluded from sitemap, cards, search, static params, and default public URL serving.

| Question | Answer |
| --- | --- |
| Does the production build succeed? | **Yes** |
| Are drafts publicly indexed? | **No** |
| Are athlete photographs used? | **No** (abstract SVG / OG art only) |
| Do paid programmes use athlete names? | **No** |
| Are legal disclaimers present? | **Yes** |
| Are citations present on draft content? | **Yes** (≥5 HTTPS sources each) |
| Can any profile publish today? | **No** — blocked on `legalReviewStatus` + `publishedAt` |

**Launch recommendation (see §13): CONDITIONAL GO** — ship the infrastructure and empty/draft-safe library; **do not flip any profile to `published` until legal review passes.**

None of the **strict NO-GO** criteria in this prompt are currently triggered for the draft-gated ship.

---

## 2. Implemented routes

| Route | Role | Build status (2026-07-28) |
| --- | --- | --- |
| `/legendary-methods` | Library index (CollectionPage, filters, learn sections) | ○ Static — **5.36 kB** / 115 kB first load |
| `/legendary-methods/[slug]` | Profile detail (Article + Breadcrumb when published) | ● SSG shell — **no pre-rendered slugs** while all drafts; 73.7 kB / **246 kB** first load |
| `/legendary-methods/opengraph-image` | Abstract social graphic (no athlete imagery) | ○ Static |
| `/` (homepage section) | “Learn From the Strongest” + CTA | ○ Static (homepage) |

**Supporting discovery (not exclusive to this feature):**

- Header nav + Learn mega-menu + footer → `/legendary-methods`
- Internal links from Learn hub, Methods index/detail, programme detail CTAs, Learn clusters (bodybuilding / powerlifting / strongman / programming), 1RM + attempt-planner tools

**Draft URL behaviour:** `generateStaticParams` emits **only published** slugs (currently none). Default request handling returns `notFound()` unless `ALLOW_LEGENDARY_DRAFT_PREVIEW=true`. Preview drafts are `noindex`.

---

## 3. Published and draft profiles status

| Metric | Result |
| --- | ---: |
| Registry profiles | **10** |
| `status: "published"` | **0** |
| `status: "draft"` | **10** |
| `legalReviewStatus: "passed"` | **0** (all unset / pending) |
| `canPublishLegendaryMethod()` today | **false** for all 10 |
| Homepage featured cards shown | **0** (published-only) |
| Library cards shown | **0** (published-only) |

| Slug | Status | Sources | Publish-ready? |
| --- | --- | ---: | --- |
| `arnold-schwarzenegger-golden-era-volume` | draft | 5 | No |
| `tom-platz-extreme-leg-training` | draft | 5 | No |
| `ronnie-coleman-heavy-high-volume-training` | draft | 5 | No |
| `eddie-hall-500kg-deadlift` | draft | 6 | No |
| `hafthor-bjornsson-strongman-strength` | draft | 6 | No |
| `colton-engelbrecht-superheavyweight-powerlifting` | draft | 5 | No |
| `john-haack-relative-strength` | draft | 6 | No |
| `jamal-browner-sumo-deadlift` | draft | 5 | No |
| `boris-sheiko-russian-powerlifting` | draft | 5 | No |
| `louie-simmons-conjugate-method` | draft | 5 | No |

**Current publish blockers (intentional gates):** `legal_review_incomplete`, `published_at_missing`.

---

## 4. Copyright and endorsement safeguards checklist

| Control | Status | Evidence |
| --- | --- | --- |
| Short + complete disclaimers | **Pass** | `LEGENDARY_DISCLAIMER_*`, profile `introductoryDisclaimer`, template header/sources/footer |
| Index honesty / no affiliation claims | **Pass** | Library disclaimer variant + nav/footer copy |
| Prohibited wording lint | **Pass** | 0 hits across all profiles |
| Negated educational “exact programme” language allowed | **Pass** | Scanner + windowed negation |
| Related programmes ≠ athlete-named products | **Pass** | `relatedProgrammeUsesAthleteName` — 0 hits |
| Commercial catalog ≠ athlete name tokens | **Pass** | `paidProgrammeCatalogUsesAthleteNames()` → false |
| Related programme independence CTA | **Pass** | Conversion prompts + independence notice |
| No celebrity / athlete photos in UI | **Pass** | Abstract `LegendaryMethodCardArt` SVG only |
| Asset licence registry | **Pass (empty by design)** | No non-original assets registered; prohibited categories documented (8) |
| OG / social art abstract | **Pass** | `/legendary-methods/opengraph-image` |
| Editorial labels (facts vs analysis vs modernised) | **Pass** | Section shells + evidence chips |
| Draft exclusion (sitemap / cards / search / default URLs) | **Pass** | Audit: `draftsInSitemap: []`, `draftServeDefault: false` |
| Legal review required before publish | **Pass** | Validation gate |

---

## 5. Source-validation results

| Check | Result |
| --- | --- |
| Minimum sources per profile | **5** (max observed 6) |
| All source URLs `https://` | **Pass** |
| Title / publisher / accessDate / supports[] present | **Pass** |
| Required section bodies filled (excl. sources body) | **Pass** (0 missing) |
| Section layer alignment (facts vs analysis) | **Pass** (0 mismatches) |
| Registry integrity (`assertLegendaryMethodRegistryIntegrity`) | **Pass** |
| Evidence quality labels present | **Pass** (all `moderate`) |
| Related programme hrefs resolve to catalog slugs | **Pass** (0 broken) |

This audit validates **structural** source quality (URL, fields, counts, layers). It does **not** replace human legal/editorial review of claim accuracy or fair-use quotation length.

---

## 6. SEO results

| Requirement | Result |
| --- | --- |
| `/legendary-methods` CollectionPage schema | **Pass** |
| BreadcrumbList on library | **Pass** |
| Article schema (published profiles) | **Implemented** (author Josef + editorial team, dates, abstract image) — unused until publish |
| BreadcrumbList on profiles | **Implemented** for published only |
| Unique titles / descriptions / canonicals | **Pass** across all 10 drafts |
| Canonical on library | **Pass** |
| Drafts: noindex + no canonical | **Pass** |
| Sitemap includes index only (no draft slugs) | **Pass** — only `…/legendary-methods` |
| Open Graph / Twitter abstract art | **Pass** (no athlete images) |
| Author attribution | **Pass** (Josef + The Strongest editorial team) |
| Published / modified dates in schema + metadata | **Implemented** (requires `publishedAt` / review timestamps at publish) |

---

## 7. Accessibility results

| Area | Result | Notes |
| --- | --- | --- |
| Keyboard filter controls | **Pass** | `radiogroup` + arrow/Home/End |
| Screen-reader labels | **Pass** | Card art short labels; external-link sr-only text |
| Heading hierarchy | **Pass** | Filtered library emits category `h2`; profile `h1` → section `h2` |
| Tables | **Pass** | Captions, `scope="col"`, horizontal scroll |
| Focus states | **Pass** | Focus-visible rings on nav, filters, CTAs, TOC |
| Score meters | **Pass** | `role="meter"` + `aria-valuenow` (+ valuetext when unscored) |
| Sticky TOC | **Pass** | Desktop sticky + mobile expand in `<nav>` |
| Skip link | **Pass** | Skip to `#legendary-profile-main` |
| Reduced motion | **Pass** | `motion-reduce:transition-none` on meters / card transitions |
| Legendary-methods ESLint (incl. jsx-a11y) | **Pass** (0 errors / 0 warnings after audit fixes) |

**Not run in this pass:** full assistive-technology manual session (VoiceOver / NVDA) or automated axe CI job.

---

## 8. Responsive results

Layouts target **320 / 375 / 430 / 768 / 1024 / 1440 / 1920** via fluid grids, `min-w-0`, overflow-x tables, and sticky TOC that collapses on small screens.

| Surface | Expected behaviour | Code status |
| --- | --- | --- |
| Library cards | 1 → 2 → 3 columns | Implemented |
| Homepage featured grid | 1 → 2 → 3 columns | Implemented (empty until publish) |
| Profile header | Stack then 2-column | Implemented |
| Scorecards | 1 → 2 columns | Implemented |
| Tables | Horizontal scroll under ~28–36rem min width | Implemented |
| Sticky contents | Mobile accordion; desktop sticky | Implemented |
| Primary CTAs | Full-width / wrap-safe min heights | Implemented |

**Not run in this pass:** device lab / browser matrix screenshots. Responsive behaviour is implemented; visual sign-off remains a pre-marketing QA step.

---

## 9. Performance results

| Metric | Result |
| --- | --- |
| Production build | **Success** (~104s wall time in this audit) |
| Library route first load JS | **~115 kB** |
| Profile route first load JS | **~246 kB** (P1 — client TOC / analytics / library patterns) |
| Listing payload | Card models only (one-sentence insight) — **no full section bodies** |
| SVG artwork | Inline abstract motifs; `content-visibility` + intrinsic size hints |
| Homepage cards when unpublished | Omitted (no empty shells) |
| Static generation of draft slugs | **None** |

---

## 10. Test and build results

| Check | Command / scope | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | **Pass** |
| Lint (feature paths) | `eslint` on legendary domain/components/routes + homepage section | **Pass** (0 issues) |
| Unit / domain tests | `vitest run src/domain/legendary-methods` | **Pass** (37 tests) |
| Related analytics catalog | Covered in prior suite / events list includes Legendary events | **Pass** |
| Content / schema / sitemap audit | `npx tsx scripts/legendary-methods-audit.ts` | **Pass** |
| Production build | `npm run build` | **Pass** (329 static pages generated) |
| Internal-link validation (related programmes → catalog) | Audit script | **Pass** |
| Metadata uniqueness | Audit script | **Pass** |
| Content-schema validation | CollectionPage / Article builders + registry integrity | **Pass** |

---

## 11. Unresolved P0 issues

**None for draft-gated launch.**

Blocking items for **publishing** a profile (product gates, not production defects):

1. Complete legal review → set `legalReviewStatus: "passed"`
2. Set `publishedAt` (ISO) and flip `status: "published"` only after counsel/editorial sign-off

---

## 12. Unresolved P1 issues

1. **Profile JS weight (~246 kB first load)** — further split client islands (TOC / analytics) if Core Web Vitals suffer after publish traffic.
2. **Zero published profiles** — homepage featured grid and library cards stay empty by design until publish.
3. **Manual AT + breakpoint screenshot QA** not executed in this audit session.
4. **Related programme CTA titles** are principle-led display strings mapped to catalog slugs (correct for endorsement rules); consider aligning display titles 1:1 with catalog `name` for checkout clarity when convenient.
5. **Sitemap `lastModified` for index** still uses build-time `new Date()` for most static entries; profile entries use review timestamps when published.

---

## 13. Launch recommendation: CONDITIONAL GO

### Strict NO-GO criteria evaluation

| Criterion | Triggered? |
| --- | --- |
| Draft content publicly indexed | **No** |
| Citations missing on publishable content | **No** (drafts sourced; none published without gates) |
| Athlete photographs without permission | **No** |
| Paid programmes use athlete names | **No** |
| Production build fails | **No** |
| Navigation broken | **No** |
| Legal disclaimers missing | **No** |
| Factual claims knowingly unsupported in published pages | **No** (nothing published) |

### Verdict

| Scope | Recommendation |
| --- | --- |
| Ship feature shell (index, nav, homepage CTA, safeguards, OG, empty library state) | **GO** |
| Publish any athlete/coach profile to production index | **NO-GO** until legal review + `publishedAt` + explicit publish |

**Overall label for Prompt 8B: CONDITIONAL GO.**

Ship the infrastructure now. Keep all ten profiles as `draft` until a documented legal/editorial pass sets `legalReviewStatus: "passed"` and publishes intentionally, one profile at a time if preferred.

---

## Appendix A — Audit commands reproduced

```bash
npm run typecheck
npx eslint src/domain/legendary-methods src/components/legendary-methods \
  "src/app/(marketing)/legendary-methods" \
  src/components/marketing/HomeLegendaryMethods.tsx
npx vitest run src/domain/legendary-methods
npx tsx scripts/legendary-methods-audit.ts
npm run build
```

## Appendix B — Related programme CTA map (generic titles → catalog slugs)

| Profile | CTA title | Catalog slug |
| --- | --- | --- |
| Arnold | Golden Era High-Volume Hypertrophy | `powerbuilding-hybrid` |
| Tom Platz | Extreme Leg Development Block | `powerbuilding-hybrid` |
| Ronnie Coleman | Heavy High-Volume Bodybuilding | `powerbuilding-hybrid` |
| Eddie Hall | Linear Strength Builder | `linear-strength-builder` |
| Hafþór Björnsson | Strength and Athleticism Hybrid | `conjugate-strength-system` |
| Colton Engelbrecht | Absolute Strength Total Builder | `block-periodisation` |
| John Haack | Relative Strength Powerlifting | `dup-powerlifting-system` |
| Jamal Browner | Deadlift Specialisation Strength | `dup-powerlifting-system` |
| Boris Sheiko | High-Frequency Total Builder | `dup-powerlifting-system` |
| Louie Simmons | Concurrent Strength System | `conjugate-strength-system` |

All mapped slugs exist in `PROGRAM_CATALOG_SEED`; none include athlete name tokens.
