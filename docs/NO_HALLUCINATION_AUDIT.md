# No-hallucination & trust audit

**Date:** 2026-07-21  
**Prompt:** 50 — Final “no hallucination” audit  
**Scope:** Customer-facing pages and product UI copy (marketing, pricing, demo, app empty/onboarding states)

---

## Intent

Earn trust by being honest about what the product knows and does not know. No fake partnerships, user counts, reviews, AI accuracy, biomechanics certainty, medical capability, scientific certainty, real-time integrations, invented personalization, or fake sync.

### Claim classes

| Class | Meaning |
| --- | --- |
| **VERIFIED** | Backed by shipped code + real athlete/system data (or explicitly measured) |
| **DEMONSTRATION** | Explicitly labeled demo / example / fixture — not the visitor’s account |
| **HEURISTIC** | Rule-based coaching practice or model estimate — not laboratory truth |
| **ESTIMATE** | Computed from limited signals; confidence may be low/medium |
| **UNVERIFIED** | Must not appear as a product claim — remove or rewrite |

---

## Surfaces scanned

| Area | Paths |
| --- | --- |
| Marketing home | `src/app/(marketing)/page.tsx`, `src/lib/content/home.ts`, `src/components/marketing/*` |
| Features / pricing | `features/page.tsx`, `pricing/*`, `domain/billing/catalog.ts` |
| Fit / compare / methods / exercises / learn / history / academy / coaching | `(marketing)/*` |
| Demo Mode | `/demo`, `DemoChrome` |
| Legal | privacy, terms |
| App | dashboard first-session, recovery, nutrition, progress empties, onboarding caution |
| Grep | AI, guaranteed, clinically, partners, real-time, diagnos, medical, 100%, proven, personalized, sync, testimonial, users counts |

---

## Category findings

| Risk category | Result |
| --- | --- |
| Fake partnerships | **Fixed** — footer said “partner”; now “Planned nutrition connection… (not live yet)” |
| Fake user numbers | **None found** — FAQ states counts only from real production data |
| Fake reviews | **None found** — marketplace shows empty / no demo coaches |
| Fake AI accuracy | **None found** — no “AI diagnoses” / accuracy % claims |
| Fake biomechanics | **Honest** — movement docs/UI: image-plane / heuristic, not force models |
| Fake medical capability | **Honest** — repeated not-diagnosis / not medical device |
| Fake scientific certainty | **Honest** — methods/history: not universal optimum; mixed evidence |
| Fake real-time integration | **Honest** — Mealnexio / Stripe checkout gated; no fake sync |
| Fake personalized analysis | **Fixed** — Fit SEO “Personalized” → rule-based / illustrative |
| Fake data synchronization | **Honest** — nutrition never invents macros; sync flag off |

---

## Claim register (representative)

| Claim / surface | Class | Status |
| --- | --- | --- |
| Deadlift movement analysis when camera/pose suitable | **HEURISTIC** / partially **VERIFIED** pipeline | Kept; FAQ honest |
| Score source labels: observed / estimated / reported / recommended | **VERIFIED** labeling system | Kept |
| Recovery Readiness | **ESTIMATE** | UI: “Not medical accuracy” |
| Fit approach suggestions | **HEURISTIC** | SEO rewritten away from “Personalized” |
| Adaptive programming | **HEURISTIC** recommendations (athlete approves) | Pricing labels clarified |
| Cross-domain insights | **HEURISTIC** when enough data | Pricing: “when enough data exists” |
| Mealnexio nutrition | **UNVERIFIED** as live product | Entitlement ≠ live API; copy fixed |
| Stripe self-serve checkout | Unavailable until configured | Honest CTAs |
| Demo dashboard / seeded athlete | **DEMONSTRATION** | Banner: “Demo athlete” |
| Technique “any main lift unlocks readout” (old dashboard) | Overclaim | **Fixed** — deadlift side-view + suitable pose |
| JSON-LD `HealthApplication` | Medical-adjacent | **Fixed** → `SportsApplication` |
| Home title “Train smarter…” | Outcome slogan | **Fixed** → hero-aligned |
| Score band “Critical” | Performance band | Clarified not medical status |
| Free “demo allowance” technique row | Confusable with Demo Mode | **Fixed** → Free plan allowance |

---

## Corrections shipped (Prompt 50)

| File | Change |
| --- | --- |
| `src/app/(marketing)/fit/page.tsx` | SEO: rule-based / illustrative — not “Personalized” program |
| `src/components/layout/PublicFooter.tsx` | No “partner”; planned connection, not live |
| `src/app/(marketing)/page.tsx` | Title matches hero; Schema.org `SportsApplication` |
| `src/components/dashboard/PerformanceDashboard.tsx` | Technique next-step matches deadlift MVP honesty |
| `src/components/marketing/HomeAnalytics.tsx` | Critical = performance band, not medical |
| `src/domain/billing/catalog.ts` | Adaptive / insights / Mealnexio / Free technique labels |
| `src/services/billing/billing-service.ts` | Limits summary honesty |
| `src/config/routes.ts` | Drop stale “Performance OS” / “knowledge engine” IA copy |
| `src/domain/billing/catalog.test.ts` | Assert “API not live” wording |

---

## Honesty contract (must hold)

1. **Demo data says demo** — `/demo` banner + `isDemoPresentation` / `isDemoAccount`.  
2. **Estimated data says estimated** — recovery readiness, heuristic scores, confidence labels.  
3. **Recommendations say recommendations** — fit, adaptive, opportunity cards — not commands or diagnoses.  
4. **Observed metrics say observed** — technique confidence basis, source badges.  
5. **Unavailable data is unavailable** — `NOT_ENOUGH_DATA`, empty states, “API not live”, checkout off.

---

## Residual accepted risk (low)

- Marketing still describes **product capability** (what the app can do when data exists). That is intentional and paired with empty-state honesty.  
- “Critical” remains a score-band name; now explicitly non-medical on the home analytics section.  
- Performance plan may show Mealnexio as **included entitlement** while API is off — label states entitlement / not live.

---

## Verification

After corrections: typecheck, lint, tests, and **production build** (`npm run build`).
