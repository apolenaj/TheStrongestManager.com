# API strategy

**Date:** 2026-07-21  
**Prompt:** 90 — API Platform Foundation  
**Status:** Architecture foundation — **do not expose a public external API yet**  
**Domain:** `src/domain/api/`  
**Helpers:** `src/services/api/api-http.ts`  
**Rate limits:** `src/lib/rate-limit.ts` (`API_RATE_LIMITS`)  
**Flag:** `apiPlatform` (`NEXT_PUBLIC_FF_API_PLATFORM`, **default off**)

Related: `docs/MOBILE_READINESS.md`, `docs/SECURITY.md`, `docs/DATA_MODEL.md`, `docs/WHITE_LABEL_ARCHITECTURE.md`.

---

## Intent

Build an **internal API architecture** that can later become a stable **external** JSON API for:

| Family | Examples (future) |
| --- | --- |
| Athlete metrics | `/api/v1/athletes/me/metrics`, scores |
| Exercises | `/api/v1/exercises`, `/api/v1/exercises/{slug}` |
| Technique analysis | list + create (evolve from today’s upload) |
| Training programs | `/api/v1/programs` |
| Performance insights | `/api/v1/insights` |

Today those paths are **catalogued only** (`FUTURE_EXTERNAL_API_CATALOG` — all `public: false`). No partner keys, no public OpenAPI portal, no unauthenticated private data.

---

## Current HTTP surface (internal)

| Path | Role | Public partner contract? |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | Auth.js cookie session | **No** |
| `/api/technique/*` | Web upload / media / movement | **No** (adapter; may feed v1 later) |
| `/api/billing/webhook` | Provider webhooks | **No** |
| Server Actions + RSC | Primary web mutations / reads | **No** |

Middleware today guards `/app/*` auth pages — **not** `/api/*`. Versioned APIs must authorize inside each route (or a future API middleware matcher).

---

## Layering

```text
Client (web today · native/partners later)
        │
        ▼
┌───────────────────────┐
│  /api/v1/* (future)   │  JSON envelope · auth · rate limit · versioning
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  src/services/*       │  Ownership checks · orchestration
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  src/domain/*         │  Pure rules
└───────────────────────┘
```

**Rule:** Route handlers never bypass services for athlete-owned data. No raw Prisma “admin” reads on public shapes.

---

## Versioning strategy

| Rule | Detail |
| --- | --- |
| Path version | `/api/v1/...` under `src/app/api/v1/...` |
| Current target | `v1` (`API_CURRENT_PUBLIC_VERSION`) |
| Unversioned `/api/*` | Internal adapters only (auth, technique, webhooks) |
| Breaking changes | New path version (`v2`); do not silently break `v1` |
| Deprecation | Document sunset window; keep `v1` readable until removed |
| Auth.js / Stripe | Stay **outside** `/api/v1` — not remounted as partner resources |

Do **not** use query `?version=` as the primary scheme.

---

## Secure authorization

| Scheme | Use |
| --- | --- |
| `cookie_session` | Web App Router + same-site cookies (Auth.js) |
| `bearer_access_token` | Future native / partner clients (not implemented) |
| `webhook_signature` | Stripe (and similar) only |
| `none_public_readonly` | **Forbidden** for athlete metrics, technique media, programs, insights |

**Helpers (foundation):**

- `requireApiSession()` — JSON **401** (never `redirect` to `/login`)
- Ownership via existing services (`assertCoachCanAccessAthlete`, athlete profile checks, etc.)
- Coach/org roles never imply private health without scopes (see org + coach docs)

**When Bearer ships later:** short-lived access token + refresh; same `userId` claims as session; CSRF not applicable to `Authorization` header.

---

## Rate limits

Reuse `rateLimit()` + per-user / IP keys (`clientKeyFromRequest`).

| Policy | Intent | Preset |
| --- | --- | --- |
| `apiRead` | Authenticated GET | 120 / min |
| `apiWrite` | Authenticated JSON mutations | 60 / min |
| `apiTechniqueWrite` | Heavy technique writes | align upload (15 / hour) |
| `apiAuthSensitive` | Token / sensitive auth | align login |

Multi-instance production should swap the store to Redis/Upstash behind the same interface — do not invent a second limiter API.

Respond **429** with `Retry-After` and envelope `error.code = rate_limited`.

---

## JSON envelope

```ts
{ ok: true, data: T, meta?: object }
{ ok: false, error: { code, message, details? } }
```

Codes: `unauthorized` · `forbidden` · `not_found` · `validation_error` · `rate_limited` · `conflict` · `not_implemented` · `internal_error` · `feature_disabled`

Helpers: `apiSuccess` / `apiError` (`src/domain/api/envelope.ts`), `jsonApiSuccess` / `jsonApiError` (`src/services/api/api-http.ts`).

---

## Planned external catalog (not mounted)

See `FUTURE_EXTERNAL_API_CATALOG` in `src/domain/api/constants.ts`.

Every entry today: `public: false`, requires session or future Bearer, points at a **service** hint.

Launch checklist before flipping any entry to public:

1. [ ] Auth scheme implemented for the client type  
2. [ ] Rate limit policy applied  
3. [ ] Ownership / scope tests  
4. [ ] Pagination / filtering where lists exist  
5. [ ] OpenAPI or equivalent contract reviewed  
6. [ ] Feature flag / partner allowlist if needed  
7. [ ] No private fields in default serializers (recovery, body, media keys, notes)

---

## What this prompt does **not** ship

- Public `/api/v1/*` resource routes  
- Partner API keys / OAuth app registry  
- Public developer portal or billed API SKU  
- Bearer token issuance  
- Remounting Auth.js or Stripe under `v1`  

Flag `apiPlatform` defaults **off** so foundation helpers can refuse work until intentionally enabled for internal pilots.

---

## Incremental path

1. **Now:** domain catalog + envelopes + rate-limit policies + docs + flag off  
2. **Next:** first internal `/api/v1/me` behind flag (session only) calling existing services  
3. **Later:** technique/programs/insights mirrors; signed media URLs  
4. **Later:** Bearer for native (see MOBILE_READINESS)  
5. **Last:** partner program + allowlists — still never “private internal” dumps  

---

## Feature flag

`NEXT_PUBLIC_FF_API_PLATFORM` → `apiPlatform` (**default off**)

Honesty: architecture is ready; the external API is **not** publicly exposed.
