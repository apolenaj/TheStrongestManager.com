# Demo Mode — explicit example athlete

**Date:** 2026-07-21  
**Prompt:** 48 — Demo Mode without fake production data

---

## Intent

Provide an **explicit, interactive Demo Mode** for homepage walkthroughs, sales demos, screenshots, recruiting, and investor presentations — without ever confusing demo statistics with a logged-in production athlete.

---

## Rules

1. **Labeled always** — UI shows **“Demo athlete”** and **“Explore example dashboard.”**
2. **Isolated identity** — seed uses `User.isDemoAccount = true` and reserved email `demo-athlete@demo.thestrongest.local`.
3. **No inheritance** — production signups set `isDemoAccount: false` and cannot register reserved demo emails.
4. **No silent merges** — Demo Mode never copies stats onto a real athlete profile.
5. **Public `/demo`** — does not require login; never reads the visitor’s athlete graph.

---

## Surfaces

| Path | Role |
| --- | --- |
| `/demo` | Example performance dashboard (interactive, read-oriented) |
| `/demo/[section]` | Today / technique / progress / training / recovery / … panels |
| Homepage CTAs | “Explore example dashboard” → `/demo` |
| Public nav | “Demo” when `NEXT_PUBLIC_FF_DEMO_MODE` is on (default) |
| `/app` as demo user | Persistent **Demo athlete** banner when `isDemoAccount` |

---

## Data sources

| Source | When |
| --- | --- |
| **Fixture** | Always available — `buildDemoDashboardFixture()` |
| **Seeded** | After `npm run db:seed:demo` — prefers live `getPerformanceDashboard` for the demo user, then remaps hrefs to `/demo/*` |

Flag: `featureFlags.demoMode` (`NEXT_PUBLIC_FF_DEMO_MODE`, default **true**).

Seed password: `DEMO_ATHLETE_PASSWORD` (default local-only string). Do not deploy a weak demo password to production.

---

## Isolation checklist

- [x] `isDemoAccount` column on `User`
- [x] Signup rejects `@demo.thestrongest.local`
- [x] Signup never sets `isDemoAccount: true`
- [x] `/demo` loads fixture/seed only — not `session.user` athlete data
- [x] Dashboard hrefs under Demo Mode stay on `/demo/*`
- [x] `robots: noindex` on demo pages
- [x] `assertDemoDataNotMergedIntoProduction` guard for future merge paths

---

## Commands

```bash
npx prisma migrate deploy   # includes isDemoAccount
npm run db:seed:demo        # upsert isolated demo athlete
```

Open `/demo` for presentations. Production users who sign up still start empty — they do not inherit demo PRs, sessions, or scores.
