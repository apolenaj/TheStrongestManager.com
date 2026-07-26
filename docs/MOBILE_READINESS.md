# Mobile readiness — future native apps

**Date:** 2026-07-21  
**Prompt:** 49 — Final architecture for future mobile (web · iOS · Android)  
**Status:** Documentation only — **do not build a native app in this prompt**

---

## Intent

TheStrongestManager is a Next.js web product today. Business logic should remain reusable for:

- **Web** (current App Router client)
- **iOS** (future native)
- **Android** (future native)

This document records what already separates cleanly, what the preferred API/service boundaries are, and what must be added later — without shipping a mobile client now.

Related: `docs/DATA_MODEL.md`, `docs/SECURITY.md`, `docs/WORKOUT_EXPERIENCE.md`, `docs/TECHNIQUE_ANALYSIS.md`, `docs/MOVEMENT_ANALYSIS.md`, `docs/INFORMATION_ARCHITECTURE.md`, **`docs/API_STRATEGY.md`** (Prompt 90 — versioning, auth, rate limits for future `/api/v1`).

---

## Current architecture (as built)

```text
┌─────────────────────────────────────────────────────────────┐
│  Web UI (RSC + client components)                           │
│  Cookie JWT session (Auth.js)                               │
└───────────────┬─────────────────────────────┬───────────────┘
                │ Server Actions (most writes) │
                │ /api/technique/* (upload)    │
                │ /api/auth/* (Auth.js)        │
                ▼                              ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│  src/services/*          │    │  src/domain/*               │
│  Orchestration + Prisma  │───▶│  Pure rules / engines       │
└──────────────────────────┘    └─────────────────────────────┘
                │
                ▼
┌──────────────────────────┐
│  AthleteProfile graph    │
│  (ownership-checked)     │
└──────────────────────────┘
```

**Native apps today:** none.  
**Primary mutation path today:** Server Actions (`"use server"`).  
**JSON HTTP surface today:** Auth.js, technique upload/media/movement, billing webhook, settings data export.

---

## Design principle for multi-platform

| Layer | Own | Reuse on mobile? |
| --- | --- | --- |
| `src/domain/*` | Scoring, workout helpers, movement pipeline, ownership, billing catalog, sync-safe rules | **Yes** — keep UI-free |
| `src/services/*` | Auth, workout, technique, recovery, programming, privacy | **Yes** — call from future API handlers, not from Swift/Kotlin directly |
| Server Actions / RSC pages | Web transport + rendering | **No** — not a native contract |
| Future `/api/v1/*` (not built) | Stable JSON for web + iOS + Android | **Target boundary** |

**Rule:** Prefer extending **service functions** and later wrapping them in authenticated JSON routes. Avoid putting business rules in React components or Server Actions alone.

---

## 1. Authentication strategy

### Today (web)

| Concern | Implementation |
| --- | --- |
| Stack | Auth.js (NextAuth v5) — `src/auth.ts`, `src/auth.config.ts` |
| Session | **JWT** (`strategy: "jwt"`, ~30 days); `session.user.id` |
| Providers | Email/password credentials; optional Google / Apple when env configured |
| Transport | HTTP-only session **cookie**; middleware guards `/app/*` |
| Helpers | `requireSession()` / `getOptionalSession()` in `src/services/auth/session.ts` |
| Media auth | Separate HMAC signed `?token=` for technique video GET — session + ownership still required |

Prisma `Session` / `Account` tables exist via the adapter; **runtime sessions are JWT**, not DB-session lookups.

### Future (web + iOS + Android)

Keep **one identity** (`User`) and **one athlete graph** (`AthleteProfile`). Add a native-friendly token layer **alongside** cookies — do not replace web cookies overnight.

| Recommendation | Notes |
| --- | --- |
| **Access token (short-lived)** | Bearer for `/api/v1/*`; same `userId` claims as JWT session |
| **Refresh token (rotating)** | Device-bound; revoke on logout / password change / account delete |
| **OAuth on device** | Reuse Google/Apple provider config; map to same `User` / `Account` rows |
| **Credentials** | Same `account-service` password verify; issue tokens via API, not cookie-only |
| **CSRF** | Cookie web keeps Auth.js CSRF; Bearer API uses Authorization header (no cookie CSRF) |
| **Demo accounts** | `isDemoAccount` stays isolated — mobile Demo Mode must label and never merge (see `docs/DEMO_MODE.md`) |

**Do not:** share technique media HMAC secrets to the client as a substitute for login. **Do not:** put athlete PII in JWT claims beyond opaque `userId`.

### Ownership stays server-side

All platforms must resolve `userId` → `AthleteProfile` on the server and use the same ownership helpers (`src/domain/security/ownership.ts`, coach grants). Native clients never trust a client-supplied `athleteProfileId` alone.

---

## 2. Shared data

### Canonical store

| Entity | Shared across platforms? | Notes |
| --- | --- | --- |
| `User` | Yes | Identity + roles (`isAthlete` / `isCoach` / `isAdmin`) |
| `AthleteProfile` | Yes | 1:1 with User — all training intelligence hangs here |
| Goals, experience, body metrics, progress metrics | Yes | Profile enrichment |
| Programs / blocks / weeks / days | Yes | Editable live graph |
| `TrainingSession` + `SessionExercise` / `SessionSet` | Yes | Locked history after `prescriptionLockedAt` |
| `TechniqueAnalysis` | Yes | Soft-delete; private `storageKey` |
| `RecoveryEntry` | Yes | Check-ins |
| `Recommendation`, scores, adaptations | Yes | Server-computed / athlete-decided |
| Subscription + credits | Yes | On `User`, not profile |
| Exercise / method catalogs | Yes | Domain catalogs + DB exercises |

**Auth ≠ athlete** remains the split for every client (`docs/DATA_MODEL.md`).

### What is *not* shared as product data

| Concern | Today | Mobile implication |
| --- | --- | --- |
| Web `localStorage` workout queue | Browser only | Native needs its own durable queue (SQLite/Room/Core Data) with the **same payload shape** |
| RSC-rendered HTML | Web only | Mobile consumes JSON DTOs |
| Demo fixture presentation | `/demo` web | Optional labeled demo API later — never write into production profiles |

### Suggested future DTO boundary

Expose versioned resources derived from existing services, e.g.:

- `GET /api/v1/me` — user + profile summary  
- `GET /api/v1/today` — today’s workout view (from workout-service)  
- `GET /api/v1/dashboard` — dashboard-service view  
- CRUD-ish endpoints for recovery, profile fields, session set logs  

Reuse service return types; add explicit serializers so web and mobile stay aligned.

---

## 3. Training sync

### Today

| Step | Mechanism |
| --- | --- |
| Resolve Today | `workout-service` (server) |
| Start / resume | Server Action → `TrainingSession` `in_progress` + prescription snapshot |
| Log set | Server Action → `SessionSet` fields + `completedAt` |
| Finish | Lock `prescriptionLockedAt`, status `completed` |
| Offline (web) | `src/lib/workout/offline-queue.ts` → flush `logSessionSetAction` on `online` |

Server is source of truth after a successful write. Empty / failed sync stays honest (no fake “saved to cloud”).

### Session state machine (sync-relevant)

```text
planned → in_progress → completed
                ↘ skipped
```

Important fields: `scheduledAt`, `startedAt`, `completedAt`, `prescriptionLockedAt`, per-set `completedAt`.  
After lock, prescription rows are immutable history (`docs/TRAINING_PROGRAM_DATA_MODEL.md`, `docs/WORKOUT_EXPERIENCE.md`).

### Future sync model (recommended, not built)

1. **Authoritative server** — same services; clients are optimistic caches.  
2. **Idempotent set logs** — client supplies `clientMutationId` (UUID); server dedupes.  
3. **Pull** — `updatedAt` / cursor per session for “what changed since”.  
4. **Conflict policy** — last-write-wins on unlocked set fields; **reject** edits when `prescriptionLockedAt` is set.  
5. **Start/complete** — require online *or* queue with clear “pending sync” UI; never invent completed sessions server-side.  
6. **Multi-device** — two phones logging the same set: first accepted write wins; second gets conflict error + refresh.

Web can later migrate the localStorage queue to the same mutation ID protocol so all platforms share one sync contract.

---

## 4. Video analysis

### Today

| Stage | Implementation |
| --- | --- |
| Upload | `POST /api/technique/analyses` multipart → `createTechniqueUpload` |
| Storage | Private local disk (`storageKey`); not a public CDN URL |
| Playback | `GET .../media?token=` HMAC + session + ownership; **full file buffer** (no range streaming) |
| Pose MVP | Browser MediaPipe → `POST .../movement` → `persistMovementReport` |
| Status | Analysis + `analysisBackendStatus` honesty labels; scores not invented |
| Credits | Deducted at upload (`docs/TECHNIQUE_CREDITS.md`) |

### Future (mobile cameras)

| Need | Direction |
| --- | --- |
| Upload | Prefer **direct-to-object-storage** signed PUT (S3-compatible) + finalize API — avoid shipping multi‑GB through the Next process |
| Resumable upload | Required for flaky cellular; not present today |
| Streaming / range GET | Required for scrubbing in-app players |
| Pose | Native pose SDK **or** server-side pose job; keep `poseProvider` label on the report |
| Push when ready | See §6 — analysis `completed` / `failed` is a natural trigger |
| Same domain pipeline | Reuse `src/domain/movement/*` and technique services behind API |

**Boundary:** Mobile uploads bytes + metadata; **scoring and honesty labels stay on the server** (or on a labeled edge worker that still writes through services).

---

## 5. Offline workout logging

### Today (web only)

- Queue: `PendingSetLog` in `localStorage` (`sessionId`, `sessionSetId`, load/reps/RPE/RIR/notes, `markComplete`).  
- Flush when browser fires `online`.  
- UX: large tap targets, sticky finish bar (`docs/WORKOUT_EXPERIENCE.md`) — patterns native should keep.

### Future (native)

| Capability | Guidance |
| --- | --- |
| Durable store | Encrypted on-device DB for pending mutations + cached Today prescription |
| Cache Today | Download prescription snapshot at start (or last known) for gyms with no signal |
| Allowed offline | Set logs, notes, rest timer; optional local “mark complete” pending sync |
| Risky offline | Starting a *new* session without server id — prefer creating session online first, or allocate server id via a lightweight “reserve session” call when briefly online |
| After lock | No offline edits; show read-only completed workout |
| Honesty | UI must distinguish **saved on device** vs **synced to account** |

Align native queue fields with the web `PendingSetLog` shape so one server idempotency layer serves all clients.

---

## 6. Push notification opportunities

**Today:** no APNs, FCM, or web-push. Email exists for password reset (`src/services/email/send-email.ts`). Billing webhook acknowledges only.

### High-value future triggers (product-honest)

| Event | Why | Priority |
| --- | --- | --- |
| Technique analysis ready / failed | User left the app after upload | High |
| Workout reminder (scheduled Today) | Consistency; athlete-opt-in only | High |
| Coach note or modification awaiting decision | Coach platform | Medium |
| Adaptive proposal pending Accept/Modify/Decline | Programming | Medium |
| Credit / subscription lifecycle | Billing honesty (renewal, failed payment) | Medium |
| Streak / “you have an unfinished in_progress session” | Soft nudge — not guilt spam | Low |

### Implementation sketch (later)

- Device registration table: `userId`, platform, push token, lastSeenAt, revokedAt  
- Preferences on profile/settings: per-category opt-in (default off for marketing)  
- Worker/queue emits after service success paths (same place analytics fire today)  
- Never push medical claims, raw biometrics, or video content in the payload — deep link + opaque ids only  

---

## 7. API / service boundary roadmap (not built)

Phased approach — **documentation target only**:

1. **Extract** — ensure every Server Action is a thin wrapper over `src/services/*` (mostly true already).  
2. **Add `/api/v1`** — JSON routes calling the same services; Auth via Bearer (native) or session (web).  
3. **Version DTOs** — stable shapes for Today, session, set log, technique status.  
4. **Media** — signed upload + ranged download.  
5. **Sync** — `clientMutationId` + conflict errors.  
6. **Push** — device tokens + preference-gated events.  

Until then, web remains the only production client.

### Existing HTTP surface (inventory)

| Route | Role | Mobile-ready? |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | Auth.js | Cookie-oriented; not sufficient alone for native |
| `POST /api/technique/analyses` | Video upload | Closest existing pattern; needs auth model for Bearer |
| `GET /api/technique/analyses/[id]/media` | Private video | Needs range requests + token strategy for apps |
| `POST /api/technique/analyses/[id]/movement` | Pose report | Reusable if auth + payload stay stable |
| `POST /api/billing/webhook` | Stripe | Server-to-server only |
| `/app/.../settings/export` | Data export | Authenticated download; pattern for “account dump” |

---

## 8. Platform matrix

| Concern | Web (now) | iOS (future) | Android (future) |
| --- | --- | --- | --- |
| Auth session | Cookie JWT | Bearer + refresh | Bearer + refresh |
| Today / log workout | Actions + offline queue | API + on-device queue | API + on-device queue |
| Technique upload | Multipart API | Signed PUT + finalize | Signed PUT + finalize |
| Pose | Browser MediaPipe | Native or server pose | Native or server pose |
| Push | — | APNs | FCM |
| Billing | Stripe Checkout (flagged) | Stripe / Apple IAP policy TBD | Stripe / Play Billing TBD |
| Demo Mode | `/demo` labeled | Optional labeled sandbox | Optional labeled sandbox |

IAP and Play Billing are **policy and product** decisions; they are not implied by the current Stripe abstraction (`docs/BILLING.md`).

---

## 9. Explicit non-goals (this prompt)

- Do **not** scaffold React Native, Expo, SwiftUI, or Kotlin apps.  
- Do **not** add `/api/v1` routes solely for speculation. See `docs/API_STRATEGY.md` for the catalog, envelopes, and launch checklist before mounting public resources.
- Do **not** weaken honesty rules (fake scores, silent sync success, unlabeled demo data) for mobile convenience.

---

## 10. Readiness summary

| Area | Ready to reuse? | Gap before native ship |
| --- | --- | --- |
| Domain + services | **Strong** | Thin JSON API wrappers |
| Data model / ownership | **Strong** | Stable DTOs + mutation ids |
| Auth | Web-solid | Access/refresh token API |
| Training sync | Partial (web queue) | Cross-device protocol + conflicts |
| Video analysis | Partial (upload API) | Resumable upload, streaming, native pose path |
| Offline logging | Web localStorage only | Durable native store + honesty UX |
| Push | None | Device registry + opt-in events |

**Bottom line:** Keep business logic in `domain` + `services`. Treat Server Actions and RSC as the **web adapter**. A future mobile app should speak a versioned authenticated API that calls the same services — so Web, iOS, and Android stay one product with one athlete graph.
