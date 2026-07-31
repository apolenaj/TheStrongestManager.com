# The Strongest — Data Model

**Date:** 2026-07-20  
**Prompt:** 7 — Database foundation (extended through Prompt 21)  
**ORM:** Prisma  
**Local DB:** SQLite (`DATABASE_URL`) — switch provider to PostgreSQL for production when ready  

**Scale:** See `docs/DATABASE_SCALE_AUDIT.md` (Prompt 153) — indexes, pagination, analytics separation; **do not prematurely shard**.

**Backups / DR:** See `docs/DISASTER_RECOVERY.md` (Prompt 156) — database + file backup, restore tests, video retention. No automated backup product in-repo yet.

---

## Design principles

1. **Auth ≠ athlete domain** — `User` is identity only. Training intelligence lives under `AthleteProfile`.
2. **Stable IDs** — all primary keys use `cuid()` strings.
3. **Timestamps** — mutable entities have `createdAt` + `updatedAt`; event-like rows also use `recordedAt` / schedule fields.
4. **Normalized relationships** — no duplicated athlete blobs; catalogs (`Exercise`) are shared; templates (`Workout`) are distinct from logs (`TrainingSession`).
5. **Honest scoring** — technique and athlete scores store an explicit `source` (`observed` | `heuristic` | `reported` | `recommended`).
6. **Marketplace foundation without fake supply** — listing/credential/review tables exist (Prompt 37); public browse stays Coming soon until real `published` coaches. Billing still stops at `Subscription` + `CreditBalance` (no payouts).
7. **Editable programs ≠ mutable history** — live program graphs may change; completed sessions keep snapshotted prescriptions (`SessionExercise` / `SessionSet`). See `docs/TRAINING_PROGRAM_DATA_MODEL.md`.
8. **Academy curriculum in domain; progress in DB** — Certificate of Completion only (Prompt 38).

---

## Entity overview

| Entity | Role |
| --- | --- |
| `User` | Auth identity (email/OAuth, sessions) + role flags `isAthlete` / `isCoach` / `isAdmin` |
| `AthleteProfile` | Performance OS profile (1:1 User) |
| `CoachAthleteAccess` | Explicit coach ↔ athlete grant (scopes + revoke audit) |
| `CoachNote` | Timestamped coach comments on athlete workspace |
| `CoachModification` | Human coach suggested change (never auto-applied) |
| `CoachModificationEvent` | Append-only audit for coach modifications |
| `CoachMarketplaceProfile` | Public coach listing (draft until published) |
| `CoachCredential` | Credential claim + verification status |
| `CoachMarketplaceReview` | Reviews (empty until real engagements) |
| `CoachMarketplaceInquiry` | Future matching interest stub |
| `AcademyEnrollment` | Student course enrollment (by catalog slug) |
| `AcademyLessonProgress` | Lesson completion |
| `AcademyQuizAttempt` | Quiz scores |
| `AcademyCompletionCertificate` | Certificate of Completion only |
| `AdminAuditLog` | Append-only staff/content change audit |
| `Goal` | Athlete goals |
| `BodyMetric` | Time-series body measurements |
| `TrainingExperience` | Current training background (1:1 profile) |
| `Exercise` | Global exercise intelligence catalog |
| `ExerciseVariation` | Named modifiers of an exercise |
| `ExerciseRelation` | Regression / progression / variation links |
| `ExerciseEvidenceClaim` | Cited evidence only (never fabricated) |
| `Workout` | Workout **template** or athlete day prescription |
| `WorkoutExercise` | Exercises inside a workout |
| `WorkoutSet` | Planned sets (reps, load, %, RPE, RIR, tempo, rest) |
| `Program` | Multi-block program (`template` \| `athlete`) |
| `ProgramBlock` | Block within a program |
| `ProgramWeek` | Week slot (optional block membership) |
| `ProgramDay` | Day within a week → workout |
| `ProgressionRule` | Deterministic progression params |
| `ProgramAdaptation` | Suggested program change (pending until decided) |
| `ProgramAdaptationEvent` | Append-only adaptation audit trail |
| `TrainingSession` | **Logged** session occurrence |
| `SessionExercise` | Immutable prescription snapshot line |
| `SessionSet` | Immutable prescribed + performed set |
| `TechniqueAnalysis` | Technique review job/result |
| `TechniqueMetric` | Per-metric lines for an analysis |
| `AthleteScore` | Scored athlete dimensions over time |
| `RecoveryEntry` | Recovery / readiness logs |
| `ProgressMetric` | Performance progress time-series |
| `Recommendation` | “What should I do next?” items |
| `WeeklyAthleteReview` | Stored weekly performance review (`reviewJson` per `weekKey`) |
| `ProgramAiReview` | Stored AI program analysis history (`reviewJson`) |
| `Subscription` | Plan entitlement (1:1 User) |
| `CreditBalance` | Simple credit wallet (1:1 User) |

Auth-supporting tables (`Account`, `Session`, `VerificationToken`, `PasswordResetToken`) remain for Auth.js and are not part of the athlete product graph.

---

## Relationship map

```text
User 1────────1 AthleteProfile
User 1────────1 Subscription
User 1────────1 CreditBalance
User 1────────* CoachAthleteAccess          (as coach)
AthleteProfile 1────────* CoachAthleteAccess (grants)
AthleteProfile 1────────* CoachNote
AthleteProfile 1────────* CoachModification 1────────* CoachModificationEvent
User 1────────* CoachNote                   (author)
User 1────────* CoachModification           (author)
User 1────────1 CoachMarketplaceProfile     (optional public listing)
CoachMarketplaceProfile 1────────* CoachCredential
CoachMarketplaceProfile 1────────* CoachMarketplaceReview
CoachMarketplaceProfile 1────────* CoachMarketplaceInquiry
User 1────────* AcademyEnrollment
AcademyEnrollment 1────────* AcademyLessonProgress
AcademyEnrollment 1────────* AcademyQuizAttempt
AcademyEnrollment 1────────1 AcademyCompletionCertificate
User 1────────* AdminAuditLog               (isAdmin staff only)

AthleteProfile 1────────* Goal
AthleteProfile 1────────* BodyMetric
AthleteProfile 1────────1 TrainingExperience
AthleteProfile 1────────* Program              (kind=athlete)
AthleteProfile 1────────* Workout
AthleteProfile 1────────* TrainingSession
AthleteProfile 1────────* TechniqueAnalysis
AthleteProfile 1────────* AthleteScore
AthleteProfile 1────────* RecoveryEntry
AthleteProfile 1────────* ProgressMetric
AthleteProfile 1────────* Recommendation

Exercise 1────────* ExerciseVariation
Exercise 1────────* ExerciseRelation (from/to)
Exercise 1────────* ExerciseEvidenceClaim
Exercise 1────────* WorkoutExercise
Exercise 1────────* SessionExercise
Exercise 1────────* TechniqueAnalysis

Program (template) 1────────* Program (athlete clones via sourceTemplateId)
Program 1────────* ProgramBlock 1────────* ProgramWeek 1────────* ProgramDay
ProgramDay ──────── Workout
ProgramWeek ──────── Workout                 (legacy single-workout pointer)
Workout 1────────* WorkoutExercise 1────────* WorkoutSet
Program / WorkoutExercise ──── ProgressionRule
ProgramAdaptation → ProgramAdaptationEvent   (never auto-applied)

TrainingSession 1────────* SessionExercise 1────────* SessionSet
TrainingSession 1────────* TechniqueAnalysis
TechniqueAnalysis 1────────* TechniqueMetric
```

### Why templates vs sessions

- **`Workout` / `WorkoutExercise` / `WorkoutSet`** describe *what should be done* (editable prescription).
- **`TrainingSession` + `SessionExercise` / `SessionSet`** record *what was prescribed and what happened*.  
  Completing a session locks a snapshot so later program edits cannot rewrite history.

### Why User vs AthleteProfile

Registration creates a `User`. Athlete onboarding creates/fills `AthleteProfile` afterward — matching the product rule that authentication is separate from onboarding.

---

## Field conventions

| Concern | Convention |
| --- | --- |
| Status / category fields | `String` with documented allowed values (SQLite-friendly; easy to tighten later) |
| Units preference | `AthleteProfile.units` is `kg` or `lb` (legacy `metric`/`imperial` normalize on read). Length display uses **cm** or **ft/in**; distance uses **m/km** or **ft/mi**. See `docs/UNIT_SYSTEM.md`. |
| Timezone | `AthleteProfile.timezone` is IANA (nullable → UTC). **Store UTC; display local.** See `docs/TIMEZONE_SYSTEM.md`. |
| Canonical storage | Mass **kg**; height **cm**; distance **m**. Timestamps are UTC instants. UI converts for input/display only — calculations use canonical values. |
| Personal records | Append-only `ProgressMetric` rows (`lift_*` keys) — never overwrite prior PR history. |
| Soft product honesty | `source`, `confidenceBasis`, `scoreLevel` on scoring entities; runtime scores via `src/domain/scoring` + `docs/SCORING_SYSTEM.md` |
| Technique uploads | Private `storageKey` + signed media route; `analysisBackendStatus`; `overallScore` null until a real backend — see `docs/TECHNIQUE_ANALYSIS.md` |
| Movement / pose MVP | `movementReportJson`, `poseProvider`, `poseFrameCount`; image-plane metrics with confidence — see `docs/MOVEMENT_ANALYSIS.md` |
| Programming | Blocks → weeks → days; templates vs athlete programs; locked session ledger — see `docs/TRAINING_PROGRAM_DATA_MODEL.md` |
| Adaptive programming | Suggestions with reason + confidence; Accept/Modify/Decline; full audit — see `docs/ADAPTIVE_PROGRAMMING.md` |
| Workout UX | Today → live session logging with offline queue — see `docs/WORKOUT_EXPERIENCE.md` |
| Training load | Estimated volume/intensity + recovery indicators (not fatigue science) — see `docs/TRAINING_LOAD.md` |
| Progress analytics | Strength/PR/e1RM/volume/bodyweight/technique/consistency/adherence charts — see `docs/PROGRESS_ANALYTICS.md` |
| Recovery system | Optional daily check-in + Recovery Readiness estimate (no fabricated sleep; wearable stub only) — see `docs/RECOVERY_SYSTEM.md` |
| Training methods | Curated method catalog with historical vs modern interpretation layers — see `docs/TRAINING_METHODS.md` |
| Method comparison | 2–3 method qualitative compare + shareable URLs — see `docs/METHOD_COMPARISON.md` |
| Training history | Educational timeline of strength & physique culture — see `docs/HISTORY_OF_TRAINING.md` |
| Fit engine | Transparent rule-based primary + alternative method recommendations — see `docs/FIT_ENGINE.md` |
| Nutrition / Mealnexio | Provider abstraction + honest status/targets/CTA; sync flagged off — see `docs/NUTRITION_INTEGRATION.md` |
| Cross-domain insights | Training × recovery × nutrition × body metrics — evidence, confidence, action — see `docs/CROSS_DOMAIN_INSIGHTS.md` |
| Technique credits | Usage-based analysis credits + ledger — see `docs/TECHNIQUE_CREDITS.md` |
| Coach platform | Roles + explicit `CoachAthleteAccess` grants/scopes — see `docs/COACH_PLATFORM.md` |
| Coach athlete detail | Workspace sections + notes + auditable human modifications vs AI — see `docs/COACH_ATHLETE_DETAIL.md` |
| Coach marketplace | Listing/credential/review foundation; no fake supply — see `docs/COACH_MARKETPLACE.md` |
| Academy | Curriculum catalog + enrollment/progress/Certificate of Completion — see `docs/ACADEMY.md` |
| SEO content engine | Topic clusters → pillars → supporting deep links; sitemap/robots/schema — see `docs/SEO_CONTENT_ENGINE.md` |
| Global search | Deterministic alias-aware search across public catalogs — see `docs/GLOBAL_SEARCH.md` |
| Admin CMS | `User.isAdmin` + `/app/admin` + `AdminAuditLog` — see `docs/ADMIN_CMS.md` |
| Exercise content | Coaching fields = `coaching_practice`; evidence only via `ExerciseEvidenceClaim` with real citations — see `docs/EXERCISE_INTELLIGENCE.md` |
| Polymorphic links | `Recommendation.relatedType` + `relatedId` only — no marketplace join tables |
| Deletes | Cascade from `User` → profile and auth children; catalog `Exercise` uses `Restrict` when referenced by workout / session lines |

---

## Billing

- **`Subscription`** — plan + status + interval, trial/grace/pending plan, coupon, provider IDs. See `docs/BILLING.md` + `docs/BILLING_2.md`.
- **`BillingWebhookEvent`** — idempotent provider event ledger (`providerEventId` unique).
- **`BillingInvoice`** — mirrored provider invoices.
- **`CouponRedemption`** — coupon/promo audit (does not grant plan alone).
- **`CreditBalance`** — technique analysis wallet cache.
- **`CreditTransaction`** — append-only ledger (grants, spends, refunds, expiry). See `docs/TECHNIQUE_CREDITS.md`.
- **Catalog** — list prices and entitlements in `src/domain/billing/catalog.ts` (env-overridable cents).

No payouts or coach storefronts in this foundation. Entitlements are never granted from frontend checkout success alone. Marketplace pricing fields are structured for future checkout — see `docs/COACH_MARKETPLACE.md`.

---

## Migrations

Migrations live in `prisma/migrations/`.

```bash
npm run db:migrate    # apply migrations (deploy)
npm run db:migrate:dev # create/apply in development
npm run db:generate   # regenerate Prisma Client
```

Local default remains SQLite. For production PostgreSQL:

1. Change `datasource.provider` to `postgresql`.
2. Set `DATABASE_URL` to the Postgres connection string.
3. Generate a fresh migration (or use `prisma migrate diff`) appropriate to the target.

---

## What is deliberately out of scope

- Live coach directory with placeholder coaches (schema ready; supply empty — see `docs/COACH_MARKETPLACE.md`)  
- Marketplace messaging, bookings, and payouts (extension points documented)  
- Fake accredited Academy certifications (Certificate of Completion only — see `docs/ACADEMY.md`)  
- Automatic application of progression rules to future weeks (rules are stored; engine can come later)  
- Nutrition meal objects / diary tables (Mealnexio adapter + sync flag first — see `docs/NUTRITION_INTEGRATION.md`)  
