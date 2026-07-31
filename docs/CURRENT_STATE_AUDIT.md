# The Strongest — Current State Audit

**Audit date:** 2026-07-20  
**Workspace:** `/Users/josefapolenar/Desktop/TheStrongest`  
**Auditor role:** Prompt 1 — Complete repository audit  
**Scope:** Full technical and product inspection; no major product changes  

---

## Executive verdict

The repository is a **greenfield empty workspace**.

| Check | Result |
| --- | --- |
| Files present | **None** (only this audit doc after Prompt 1) |
| Git repository | **Not initialized** |
| Package manager / lockfile | **Absent** |
| Framework | **None** |
| Runnable application | **None** |
| Production build | **Not applicable** — nothing to build |

There is **no functional code to preserve or delete**. There are **no critical build blockers to fix** because there is no application toolchain yet.

Nearby Desktop projects (`Me`, `Projekt`) are **unrelated** and were not treated as The Strongest source.

---

## Inspection checklist (as requested)

| Area | Finding |
| --- | --- |
| Framework | Not present |
| Routing | Not present |
| Component structure | Not present |
| Styling | Not present |
| Dependencies | Not present |
| Database | Not present |
| Authentication | Not present |
| API architecture | Not present |
| Existing pages | Not present |
| Existing UI | Not present |
| Responsive behavior | Not present |
| Environment variables | Not present (no `.env`, no `.env.example`) |
| Unfinished code / TODOs | Not present |
| Mock data | Not present |
| Fake functionality | Not present |
| Security risks | No application attack surface yet; empty folder only |
| Broken links | Not present |
| Unused dependencies | Not present |

---

## 1. Existing architecture

**There is no application architecture.**

Observed filesystem state at audit time:

```
TheStrongest/
  (empty directory)
```

Missing foundational layers:

- Application framework (Next.js / similar)
- `package.json` / lockfile / `node_modules`
- TypeScript / ESLint / test config
- `src/` or `app/` source tree
- Database schema / ORM / migrations
- Auth provider integration
- API routes / server actions / services
- Design tokens / global styles
- CI/CD, Docker, deployment config
- README, LICENSE, `.gitignore`
- Git history

Prompt 0 (Master Project Constitution) has been accepted as product/engineering law, but it is **not yet encoded** in repo artifacts (rules files, README, architecture docs beyond this audit).

---

## 2. What works

| Item | Status |
| --- | --- |
| Workspace folder exists | Yes |
| Cursor workspace binding | Yes (`TheStrongest`) |
| Product constitution (Prompt 0) | Accepted in conversation; not yet in-repo |
| Deployable product | No |
| Auth / billing / AI / DB | No |

**Nothing application-level works**, because nothing has been scaffolded.

---

## 3. What is partially implemented

**Nothing.** No partial features, stubs, routes, or UI shells exist.

---

## 4. What is fake / demo-only

**Nothing.** No seeded data, mock APIs, placeholder testimonials, fake metrics, or demo accounts.

This is favorable relative to the anti-hallucination constitution: we start clean with honest empty states rather than stripping fabricated social proof later.

---

## 5. What is broken

| Issue | Severity | Notes |
| --- | --- | --- |
| No application to run | Blocker for product | Expected for greenfield |
| No `npm`/`pnpm` scripts | Blocker for build | Expected |
| No git history | Process gap | Should initialize in next scaffold prompt |
| Cannot run production build | Expected | No toolchain |

**Critical blockers preventing the app from building:** none that can be “fixed” without scaffolding a new app. Prompt 1 forbids major changes; therefore **no scaffold was created in this step**.

---

## 6. Technical debt

**None in code** (no code).

**Process / prep debt to avoid from day one:**

1. Delayed git init → harder change tracking  
2. Delayed `.env.example` + secrets discipline → risk of leaked keys later  
3. Delayed strict TypeScript / lint / test gates → debt accumulates fast  
4. Mixing business logic into UI if services are not established early  
5. Landing-page-first without Performance OS information architecture  
6. Invented metrics/testimonials if marketing copy is written before data exists  

---

## 7. Security risks

### Current (empty repo)

| Risk | Level | Notes |
| --- | --- | --- |
| Exposed secrets in repo | None | No files |
| Client-side API keys | None | No app |
| Unvalidated input | None | No APIs |
| Auth misconfiguration | None | No auth |
| Dependency CVEs | None | No dependencies |

### Risks to prevent in upcoming prompts

- Never commit `.env` / credentials  
- Never expose AI / payment / DB keys client-side  
- Validate all external input at API boundaries  
- Prefer server-side AI and billing calls  
- Use least-privilege service roles for DB  
- Feature-flag unfinished capabilities; do not fake them  

---

## 8. UX problems

**No UI exists**, so there are no layout, contrast, or responsiveness bugs to report.

### Product UX risks if built incorrectly (constitution-aligned)

| Risk | Why it matters |
| --- | --- |
| Generic SaaS / crypto / gaming look | Undermines elite coaching brand |
| Fake social proof / partnership logos | Violates anti-hallucination rules |
| Dead CTAs that appear functional | Violates feature completion rule |
| No clear “What should I do next?” path | Breaks core UX principle |
| Overclaiming AI measurement precision | Trust and medical/safety risk |
| Crowded first viewport (stats, schedules, chips) | Conflicts with premium brand-first composition |

---

## 9. Recommended architecture

Target: **Next.js App Router + TypeScript strict + modular services**, dark premium UI, honest empty states.

### High-level stack (recommended)

| Layer | Recommendation | Rationale |
| --- | --- | --- |
| Framework | Next.js (App Router) | SEO, RSC, API routes, strong DX |
| Language | TypeScript `strict` | Constitution requirement |
| Styling | CSS variables + modular CSS or Tailwind with brand tokens | Dark/charcoal/white/gold system |
| Auth | One provider only (e.g. Auth.js / Clerk / Supabase Auth) — pick once | Avoid duplicate auth systems |
| Database | PostgreSQL + Prisma or Drizzle | Durable athlete/coach data |
| Storage | S3-compatible for video/media | Technique analysis assets |
| AI | Server-only provider SDK (OpenAI/Anthropic/etc.) | No client key exposure |
| Payments | Stripe (server) | Premium coaching / subscriptions |
| Nutrition | Mealnexio.com integration via dedicated service module | Constitution item 10 |
| Hosting | Vercel or equivalent Node host | Fits Next.js |

### Suggested repository shape

```
apps/web or (monorepo later) /
  app/                    # routes (marketing + product)
  components/             # presentation only
  services/               # scoring, training, analytics, ai, nutrition, billing
  lib/                    # shared utils, env validation
  types/                  # domain types
  prisma/ or db/          # schema + migrations
  docs/                   # audits, ADRs, product docs
  public/                 # static assets
  .env.example
```

### Domain modules (services, not UI)

1. **AthleteProfileService** — goals, assessment, profile  
2. **ScoringService** — observed vs heuristic vs reported vs recommended  
3. **TrainingService** — programming + adaptation  
4. **TechniqueService** — analysis pipeline (honest confidence labels)  
5. **RecoveryService**  
6. **NutritionIntegrationService** — Mealnexio  
7. **CoachToolsService**  
8. **MarketplaceService** (later)  
9. **AcademyService** (later)  
10. **BillingService**  
11. **AnalyticsService**  

### Routing IA (product flow)

```
Goal → Assessment → Athlete profile → Training → Technique
  → Recovery → Nutrition → Progress → Recommendations → Adaptation
```

Public marketing routes stay separate from authenticated Performance OS routes.

### Brand / design tokens (baseline)

- Base: black / charcoal  
- Type: white / near-white  
- Accent: gold/yellow (selective)  
- Success: green (performance positive only)  
- Warning/error: red/orange only  
- Motion: intentional, respect `prefers-reduced-motion`  

### Quality gates (every prompt)

- `tsc` / typecheck  
- lint  
- relevant automated tests  
- production build  

---

## 10. Recommended build sequence

Order optimized for constitution compliance and minimal rewrite:

| Phase | Prompt focus | Deliverable |
| --- | --- | --- |
| **A** | Foundation | Git init, Next.js + TS strict, ESLint, `.gitignore`, `.env.example`, brand tokens, root layout, SEO shell |
| **B** | Marketing shell | Honest public landing (brand-first), no fake metrics/logos; Coming soon / feature flags for unfinished areas |
| **C** | Auth + data | Single auth system, PostgreSQL schema (users, athletes, empty profiles), honest empty states |
| **D** | Athlete core loop | Goal → Assessment → Profile → “What next?” recommendations (rules-based first) |
| **E** | Training OS | Programming models, session logging, progress tracking |
| **F** | Technique (honest AI) | Upload/analysis pipeline with confidence labels; no false precision |
| **G** | Recovery + nutrition | Recovery tracking; Mealnexio integration service |
| **H** | Coach tools | Coach dashboards, athlete assignment |
| **I** | Monetization | Stripe billing, premium human coaching flows |
| **J** | Growth surfaces | Marketplace, Academy/certs, B2B/API — only after core OS is real |

### Immediate next step (Prompt 2 candidate)

**Scaffold the application foundation** (Phase A): initialize git, create Next.js App Router project with TypeScript strict mode, lint/test scripts, design tokens, `.env.example`, and a minimal buildable app shell — without inventing product claims or fake functionality.

---

## Build attempt (Prompt 1 requirement)

| Command | Result |
| --- | --- |
| Production build | **Skipped / N/A** — no `package.json`, no framework, no source |
| Typecheck | N/A |
| Lint | N/A |
| Automated tests | N/A |

**Critical blocker fixes applied:** none (nothing to fix without major scaffolding, which Prompt 1 forbids).

---

## Audit conclusion

The Strongest is at **day zero**. The correct move is not to retrofit or “repair” an existing product — it is to **scaffold deliberately** under the Master Project Constitution, with modular services, honest UX, and quality gates from the first commit.

**Do not start feature work until Phase A (foundation) exists and builds cleanly.**
