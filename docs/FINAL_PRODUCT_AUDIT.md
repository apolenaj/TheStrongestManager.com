# Final Product Audit — TheStrongestManager

**Date:** 2026-07-21  
**Prompt:** 44 — Brutal 10/10 audit and hardening  
**Verdict:** Not launch-ready as a paid Performance OS. Strong engineering honesty in many modules; conversion, monetization, and polish still fail a first-time customer and revenue test.

**Overall current score: 6.4 / 10**

This is not 10/10. Do not market it as finished.

---

## Scorecard (0–10)

| Dimension | Score | Notes |
| --- | ---: | --- |
| Brand clarity | 6 | Name is strong; hero still slogan-heavy and image-empty. |
| Homepage | 6 | Better honesty on technique/Mealnexio; still long and atmosphere-thin. |
| UX | 6 | Forced long onboarding; dashboard is a card grid. |
| Mobile UX | 7 | Touch targets improved; public/app IA still crowded in “More”. |
| Visual design | 7 | Distinct fonts/accent; card overuse and flat dark canvas remain. |
| Navigation | 7 | Desktop primary strip trimmed; Login added; app nav still heavy. |
| Onboarding | 5 | Required wall of steps; signup copy now honest about that. |
| Dashboard | 6 | Honest empties; weak “one next action” composition. |
| Exercise intelligence | 8 | Catalog + detail solid for curated set. |
| Technique analysis | 7 | Deadlift MVP real; many lifts awaiting backend; MediaPipe CDN risk. |
| Training system | 7 | Workout player real; adaptive sold ahead of paid enforcement. |
| Progress analytics | 7 | Charts honest; now gated to Pro+ entitlement. |
| Recovery | 7 | Check-ins + estimate labeling solid; no wearables. |
| Methods | 8 | Catalog, compare, history content strong for education SEO. |
| Mealnexio integration | 4 | Still a stub; marketing/pricing copy corrected to “planned”. |
| Monetization | 4 | Catalog exists; checkout stub; webhook ack-only; partial gating. |
| SEO | 7 | Sitemap/robots/clusters exist; draft legal noindexed; OG thin. |
| Performance | 6 | MediaPipe + large upload surface; no image pipeline. |
| Accessibility | 7 | Skip link + larger targets; drawer focus trap incomplete. |
| Trust | 7 | Honesty culture is real; past overclaims reduced this pass. |
| Security | 7 | Ownership + signed media + rate limits; OAuth linking + in-memory RL remain. |
| Code quality | 8 | Domain services + tests; API/checkout integration tests thin. |

Scores below 9 include problem / impact / exact fix below. Items marked **Fixed this pass** were addressed in-repo.

---

## Below 9 — Problem · Impact · Exact fix

### Brand clarity — 6

- **Problem:** Hero is wordmark + interchangeable slogans on decorative grid; no product/place imagery.  
- **Impact:** First viewport fails the brand test once the wordmark is ignored.  
- **Fix:** Full-bleed training/context visual; one brand-specific supporting sentence (partially tightened); remove redundant slogan stack later.

### Homepage — 6

- **Problem:** Long section stack; technique previously promised a future pipeline while upload already exists.  
- **Impact:** Skimmers distrust “when it ships” language.  
- **Fix:** **Fixed this pass** — HomeTechnique copy matches Deadlift MVP + awaiting-backend honesty. Still need hero imagery and shorter fold.

### UX — 6

- **Problem:** 12-step onboarding required before any OS surface; dashboard card lattice.  
- **Impact:** First-session drop-off; unclear next action.  
- **Fix:** Minimum viable onboarding (goal + units + caution) with skippable rest; dashboard single primary CTA module.

### Mobile UX — 7

- **Problem:** Bottom nav used 10px labels and short hit areas; header CTAs were `h-8`.  
- **Impact:** Mis-taps and illegible labels at 320–390px.  
- **Fix:** **Fixed this pass** — `min-h-12` mobile tabs; Button/ButtonLink min heights ≥40px; public Login added.

### Visual design — 7

- **Problem:** Cards as default chrome; flat dark surfaces.  
- **Impact:** Feels like an admin console, not a training product.  
- **Fix:** Strip decorative Card wrappers on read-only sections; add real photography/gradients with product context (not purple kitsch).

### Navigation — 7

- **Problem:** Public primary nav dumped SEO inventory; no Log in.  
- **Impact:** Returning users stall; conversion buried.  
- **Fix:** **Fixed this pass** — Desktop primary: Features, Exercises, Methods, Learn, Pricing; secondary routes `nav: false`; Log in in header + drawer.

### Onboarding — 5

- **Problem:** Signup previously said onboarding can wait; layout force-redirects until complete.  
- **Impact:** Trust break on day one.  
- **Fix:** **Fixed this pass** — Signup + form copy state onboarding is required next. Still need shorter wizard UX.

### Dashboard — 6

- **Problem:** Multi-card pillar grid dominates.  
- **Impact:** Athletes don’t see one next workout/action.  
- **Fix:** Lead with Today/workout CTA; demote secondary modules below the fold.

### Technique analysis — 7

- **Problem:** Marketing vs MVP mismatch; MediaPipe from CDN; coach media scope without playback.  
- **Impact:** Support burden and security residual.  
- **Fix:** Copy aligned (**this pass**); self-host WASM/models; coach-scoped signed URLs or remove `technique_media` grant until real.

### Training system — 7

- **Problem:** Adaptive coaching entitled on Performance but weakly monetized/enforced.  
- **Impact:** Paid value unclear.  
- **Fix:** Gate adaptations UI with same entitlement pattern as Progress; wire Stripe activation.

### Progress analytics — 7

- **Problem:** Catalog said Free lacks analytics while product served full charts.  
- **Impact:** Monetization theater.  
- **Fix:** **Fixed this pass** — Free sees strength overview + locked analytics empty state; Pro+ loads charts.

### Mealnexio integration — 4

- **Problem:** Pricing/features implied live connect.  
- **Impact:** False partnership expectation.  
- **Fix:** **Fixed this pass** — Features + limitsSummary say planned / API not live. Keep Nutrition UI stub.

### Monetization — 4

- **Problem:** No ready Stripe adapter; webhook verifies then `handled: false`; CTAs looked purchase-adjacent.  
- **Impact:** Cannot take money honestly.  
- **Fix:** **Partial this pass** — CTA label/hint + checkout-not-live alert. Launch blocker: ready adapter + entitlement writes on verified events.

### SEO — 7

- **Problem:** Draft legal pages indexable; robots missed forgot-password; thin OG on many leaves.  
- **Impact:** Indexing unfinished legal; weak shares.  
- **Fix:** **Fixed this pass** — privacy/terms `noindex`, removed from sitemap, robots disallow. Still add page-level OG and Article dates.

### Performance — 6

- **Problem:** MediaPipe chunk + CDN; 110MB action body.  
- **Impact:** Slow technique path; abuse surface.  
- **Fix:** Lazy route-only load (exists) + self-host assets; distributed rate limits; consider upload streaming.

### Accessibility — 7

- **Problem:** No skip link; small targets; drawer without full focus trap.  
- **Impact:** Keyboard/screen-reader friction.  
- **Fix:** **Partial** — skip link + `#main-content` + larger targets. Still trap focus in Drawer.

### Trust — 7

- **Problem:** Residual overclaims (Mealnexio, checkout, technique “when ships”).  
- **Impact:** Credibility erosion.  
- **Fix:** Addressed main public claims this pass; keep launch checklist against marketing pages.

### Security — 7

- **Problem:** OAuth dangerous linking; in-memory rate limits; FormData Zod gaps; no CSP.  
- **Impact:** Account takeover / abuse under scale.  
- **Fix:** Email verification before linking; Redis limiter; Zod on remaining actions; careful CSP for MediaPipe.

### Code quality — 8

- **Problem:** Strong unit domain tests; weak API/checkout integration tests.  
- **Impact:** Regressions on money/media paths.  
- **Fix:** Add route tests for webhook reject/accept, media IDOR, upload auth.

---

## Hardening completed in this pass

| Change | Location |
| --- | --- |
| `not-found`, `error`, `global-error`, `loading` | `src/app/` |
| Skip to content + `#main-content` | root + marketing + AppShell |
| Public Login + trimmed desktop nav | `PublicHeader`, `routes.ts` |
| Mobile nav / button touch targets | `AppMobileNav`, Button, ButtonLink |
| Signup/onboarding honesty | signup page, AuthForms |
| Technique homepage honesty | `HomeTechnique` |
| Mealnexio / checkout honesty | features, billing-service, PricingExperience |
| Progress entitlement gate | `progress/page.tsx` |
| Draft legal noindex + robots/sitemap | privacy, terms, robots, sitemap-entries |
| Hero support copy | `home.ts` |

---

## Test matrix (manual / structural)

| Surface | Result |
| --- | --- |
| Homepage | Renders; CTAs Start Free / Explore; technique copy updated |
| Registration / Login | Zod + rate limits; Login in header |
| Onboarding | Still required via `requireCompletedOnboarding` |
| Dashboard | Exists; empty honesty preserved |
| Exercise / Search / Methods | Catalog-backed |
| Workout / Technique / Progress | Ownership + progress gate |
| Pricing / Checkout architecture | Catalog + stub provider + verified webhook ack |
| Mobile navigation | Larger targets; More drawer |
| Error / empty / 404 | New boundaries + EmptyState pattern |
| 500 / error boundaries | `error.tsx` + `global-error.tsx` |

### Screen widths (layout contract)

Checked against layout constraints (`overflow-x-hidden` app shell, drawer mobile menus, `min-w-0` grids, bottom nav `min-h-12`): **320 / 375 / 390 / 768 / 1024 / 1440 / 1920**. Residual risk: dense app sidebar labels and long table-like analytics on narrow widths — prefer cards/stacks (already mostly stacked).

---

## Repository scan classification

| Pattern | Classification |
| --- | --- |
| `TODO` / `FIXME` / `lorem` in `src/` | **None found** |
| `placeholder=` on inputs | **OK** — form UX, not fake content |
| “placeholder” on Privacy/Terms | **Intentional** — draft legal, marked for review |
| `fake` / `never fake` in copy/docs | **Honesty guardrails** — keep |
| `vi.mock` in tests | **Test doubles** — OK |
| `console.info` analytics / email / seed | **Dev adapters** — console analytics by design; seed CLI OK |
| `console.error` in error boundaries | **OK** — failure reporting |

No production-facing lorem/demo athlete content found to strip beyond honesty copy already corrected.

---

## Gates

| Gate | Status |
| --- | --- |
| Typecheck | Pass |
| Lint | Pass |
| Tests | Pass (237) |
| Production build | Pass (`prisma generate` + `next build`) |

---

## Remaining limitations

1. Stripe checkout and subscription activation not live.  
2. Mealnexio API adapter unavailable.  
3. Technique scoring MVP limited (deadlift-suitable); other lifts await backend.  
4. Coach video playback scope incomplete.  
5. Legal policies are drafts — not counsel-approved.  
6. Onboarding still long and mandatory.  
7. In-memory rate limiting unsuitable for multi-instance production.  
8. No distributed CSP tuned for MediaPipe CDN/WASM.

---

## Technical debt

- Broaden Zod validation on remaining server actions.  
- Replace in-memory rate limit with Redis/Upstash.  
- Self-host MediaPipe assets; add CSP.  
- Focus-trap Drawer; reduce Card chrome.  
- Integration tests for billing webhook + technique media IDOR.  
- Enforce remaining entitlements (`adaptiveCoaching`, `advancedInsights`).  
- Email verification before OAuth account linking.  
- Hero product imagery and shorter homepage.

---

## Launch blockers

1. **Cannot take payment** — ready Stripe adapter + webhook entitlement writes + E2E checkout.  
2. **Counsel-approved Privacy & Terms** — replace placeholders.  
3. **Production secrets & hosting** — `AUTH_SECRET`, HTTPS, durable DB (not demo SQLite alone), storage for technique videos.  
4. **Distributed abuse controls** — rate limits that survive multi-instance.  
5. **OAuth linking policy** — verify email or disable dangerous linking.

Until blockers clear, position as **private beta / free catalog + training tools**, not a sellable Performance OS.

---

## Post-launch roadmap

1. Stripe live + entitlement enforcement everywhere catalog promises.  
2. Mealnexio real sync behind flag.  
3. Expand technique backends beyond deadlift MVP.  
4. Coach media access with audited grants.  
5. Shorten onboarding; dashboard “one next action”.  
6. Accessibility pass (focus traps, contrast audit).  
7. Performance: image CDN, MediaPipe self-host, upload streaming.  
8. Replace draft legal; enable indexing only after approval.

---

## Honesty statement

Claiming **10/10** would be false. Current product is a serious multi-module foundation with unusually strong anti-fake discipline, still short of a polished, payable, legally finished launch.
