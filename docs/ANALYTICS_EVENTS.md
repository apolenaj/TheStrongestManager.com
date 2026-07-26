# Product Analytics Events

**Date:** 2026-07-21  
**Prompt:** 42 — Privacy-aware product analytics  
**Catalog:** `src/domain/analytics/events.ts`  
**Privacy:** `src/domain/analytics/privacy.ts`  
**Provider:** `src/domain/analytics/provider.ts`  
**Service:** `src/services/analytics/track.ts`  
**Client beacon:** `src/components/analytics/AnalyticsBeacon.tsx`

---

## Principles

1. **Central catalog** — every product event name and allowed props live in `events.ts`. Do not invent ad-hoc strings in UI.
2. **Privacy first** — never send sensitive notes, raw health/biometrics, private video content, pose landmarks, emails, or free-text summaries.
3. **Services emit** — track after successful domain actions (auth, onboarding, workout, technique, billing, premium coaching, referrals, affiliates, creator program, program marketplace, content moderation). Client may only emit `homepage_viewed`, `signup_started`, `pricing_viewed`, and `premium_coaching_landing_viewed`.
4. **Honest delivery** — default adapters are console (dev) or noop (production). Register a real vendor adapter when configured; do not invent successful telemetry.

---

## Event catalog

| Event | When | Allowed props |
| --- | --- | --- |
| `homepage_viewed` | Marketing `/` mounts | _(none)_ |
| `signup_started` | `/signup` mounts | `method?` (`email` \| `google` \| `apple`) |
| `signup_completed` | Email account created | `method` |
| `onboarding_completed` | Athlete profile onboarding finishes | `athleteProfileId` |
| `workout_started` | Today’s session starts or resumes | `sessionId`, `resumed?` |
| `workout_completed` | Session locked complete | `sessionId` |
| `technique_analysis_uploaded` | Private video stored + analysis row created | `analysisId`, `exerciseSlug?`, `movementMvp?` |
| `technique_analysis_completed` | Movement pipeline persisted | `analysisId`, `backendStatus`, `supportedExercise?` |
| `pricing_viewed` | `/pricing` mounts | `checkoutEnabled` |
| `checkout_started` | Billing provider returns a checkout session | `planId`, `interval` |
| `subscription_activated` | Paid plan becomes active (webhook / lifecycle) | `planId`, `fromPlanId?` |
| `model_feedback_submitted` | Athlete/coach AI feedback verdict | `relatedType`, `verdict`, `role` |
| `premium_coaching_landing_viewed` | `/coaching/premium` mounts | `checkoutEnabled` |
| `premium_coaching_application_submitted` | Premium coaching apply succeeds | `applicationId`, `goal?`, `experienceLevel?`, `budgetBand?` |
| `premium_coaching_stage_changed` | Funnel stage advance / decline / withdraw | `applicationId`, `fromStage`, `toStage` |
| `premium_coaching_offer_presented` | Offer stage reached | `applicationId` |
| `referral_code_issued` | User referral code created | `codeLength` |
| `referral_attributed` | Signup attributed to a code | `referralId` |
| `referral_qualified` | Referred user completed onboarding | `referralId` |
| `referral_reward_granted` | Credit or access reward granted | `referralId`, `rewardKind`, `beneficiaryRole` |
| `referral_voided` | Attribution voided (abuse / self / demo) | `referralId`, `voidReason` |
| `affiliate_partner_applied` | Partner application submitted | `partnerId`, `partnerType` |
| `affiliate_partner_activated` | Staff activates partner | `partnerId`, `partnerType` |
| `affiliate_link_clicked` | Continue on `/a/[code]` | `partnerId`, `linkId` |
| `affiliate_conversion_attributed` | Signup (or sub) attributed | `partnerId`, `conversionId`, `eventType` |
| `affiliate_commission_ledgered` | Commission estimate ledgered | `partnerId`, `conversionId`, `amountCents`, `commissionStatus` |
| `creator_program_applied` | Creator application submitted | `partnershipId`, `capabilityCount` |
| `creator_program_reviewed` | Staff approve/reject/suspend | `partnershipId`, `toStatus` |
| `creator_program_approved` | Application approved (capabilities unlock) | `partnershipId` |
| `program_marketplace_submitted` | Listing submitted for copyright review | `listingId`, `sport`, `goal`, `difficulty` |
| `program_marketplace_reviewed` | Staff publish/reject/suspend | `listingId`, `toStatus` |
| `program_marketplace_published` | Listing published | `listingId` |
| `program_marketplace_purchased` | Verified purchase recorded | `listingId`, `purchaseId`, `priceCents` |
| `program_marketplace_rated` | Verified purchaser rating | `listingId`, `purchaseId`, `stars` |
| `program_marketplace_commission_ledgered` | Platform commission estimate | `listingId`, `purchaseId`, `platformCents`, `commissionStatus`, `commissionBps` |
| `content_moderation_reported` | User files a content report | `reportId`, `target`, `relatedType`, `reason` |
| `content_moderation_reviewed` | Staff review action | `reportId`, `action`, `target`, `relatedType` |
| `content_moderation_removed` | Content removed via queue | `reportId`, `target`, `relatedType` |
| `content_moderation_suspended` | Listing/profile suspended via queue | `reportId`, `target`, `relatedType` |
| `growth_experiment_exposure` | Sticky arm assignment shown | `experimentId`, `armId`, `surface` |
| `growth_experiment_conversion` | Funnel outcome for assigned arm | `experimentId`, `armId`, `surface`, `outcome` |

Opaque `userId` may accompany events when authenticated. It is **not** an email.

---

## Never log

| Category | Examples (rejected by `sanitizeAnalyticsProps`) |
| --- | --- |
| Sensitive notes | `notes`, `coachNote`, `comment`, `summary`, `body` |
| Raw health | `bodyweight`, `heartRate`, `hrv`, `injury`, `medical`, `diagnosis` |
| Private video / pose | `storageKey`, `videoUrl`, `landmarks`, `frames`, `movementReportJson`, `originalFileName` |
| Identity | `email`, `password`, `name`, `phone` |

Nested objects are rejected. Only primitives (and primitive arrays) are allowed in props.

Technique **scores**, metric values, and assessment copy stay out of product analytics — use opaque ids and status enums only.

---

## Architecture

```text
trackProductEvent / trackProductEventSafe
        │
        ▼
sanitizeAnalyticsProps  → reject forbidden keys
        │
        ▼
getActiveAnalyticsProvider().track(...)
        │
   ┌────┴────┐
 console   noop   memory (tests)   ready vendor (future)
```

Env:

- `ANALYTICS_ADAPTER=console` \| `noop` — override default
- Production defaults to **noop** until a `status: "ready"` adapter is registered

Subscription activation: call `emitSubscriptionActivatedEvent` from billing after a verified provider webhook — never invent paid activation.

---

## Call sites

| Event | Location |
| --- | --- |
| `homepage_viewed` | `AnalyticsBeacon` on marketing homepage |
| `signup_started` | `AnalyticsBeacon` on signup page |
| `signup_completed` | `registerWithEmailPassword` |
| `onboarding_completed` | `buildAthleteProfileFromOnboarding` |
| `workout_*` | `startTodaysWorkout` / `completeWorkoutSession` |
| `technique_analysis_*` | `createTechniqueUpload` / `persistMovementReport` |
| `pricing_viewed` | `AnalyticsBeacon` on pricing page |
| `checkout_started` | `tryCreateCheckoutSession` |
| `subscription_activated` | `emitSubscriptionActivatedEvent` (lifecycle hook) |

---

## Adding an event

1. Add the name to `PRODUCT_EVENT_NAMES` and typed props in `ProductEventPropsMap`.
2. Extend `ALLOWED_ANALYTICS_PROP_KEYS` if introducing a new prop key.
3. Emit via `trackProductEventSafe` from the service after success.
4. Document the row in this file.
5. Add / update unit tests in `src/domain/analytics/` and `src/services/analytics/`.
