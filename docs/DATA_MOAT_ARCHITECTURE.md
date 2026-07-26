# Data moat architecture

**Date:** 2026-07-21  
**Prompt:** 91 — Data Moat Architecture  
**Status:** Architecture readiness — **no live surveillance or model-training pipeline**  
**Domain:** `src/domain/data-moat/`  
**Service stub:** `src/services/data-moat/data-moat-service.ts`  
**Schema:** `DataMoatConsent`, `AggregationJob`  
**Flag:** `dataMoat` (`NEXT_PUBLIC_FF_DATA_MOAT`, **default off**)

**Goal:** Future model improvement from **privacy-safe, consent-gated, anonymized** aggregates — **not** surveillance, not selling individual profiles.

Related: `docs/SECURITY.md`, `docs/API_STRATEGY.md`, `docs/ORG_GYM_DASHBOARD.md`, `src/domain/analytics/privacy.ts`.

---

## Intent

Aggregated signals can improve coaching heuristics, technique priors, and programming guidance **if and only if**:

1. The athlete **opts in** (default **off**)  
2. Data is **stripped of identifiers** before publish  
3. Cohorts meet a **k-anonymity** floor  
4. Retention is **bounded** and documented  

Potential anonymized insight families:

| Kind | Question (cohort-level) |
| --- | --- |
| Technique patterns | How do technique metric distributions shift over time for an exercise? |
| Training outcomes | How do session frequency / adherence bands relate to later scores? |
| Exercise response | How do load/rep progressions look across similar programs? |
| Programming trends | Which program structures correlate with continued training (counts only)? |

---

## Design principle

```text
┌──────────────────────────────────────────────────────────────┐
│  Athlete settings — Data Moat consent (default off)          │
└────────────────────────────┬─────────────────────────────────┘
                             │ optedIn + scopes + policyVersion
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  Eligible source extract (service layer only)                │
│  Numeric / categorical training & technique fields           │
│  NO email, names, notes, video, pose, recovery biometrics    │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  AggregationJob — cohort rollups                             │
│  k-anonymity suppress · sanitizeMoatOutputProps              │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  Anonymized artifact (stats only) → future model priors      │
└──────────────────────────────────────────────────────────────┘
```

Platform moat ≠ org dashboard aggregates (`OrgMembership.aggregateOptIn`). Org analytics stay inside the gym; moat is **cross-tenant, anonymized, consent-gated**.

---

## Data source

| Allowed (after consent + scope) | Forbidden (never in moat outputs) |
| --- | --- |
| `TrainingSession` status, completedAt **buckets**, session counts | `userId`, `athleteProfileId`, email, display names |
| `SessionSet` load / reps / RPE (banded) | Session free-text `notes` |
| `TechniqueAnalysis.overallScore`, `TechniqueMetric` key+value | Video, `storageKey`, pose/landmarks, `movementReportJson`, filenames |
| `AthleteScore` / `ProgressMetric` numerics | Recovery entries (sleep, HRV, readiness values) |
| Program structure counts (days/weeks/exercise ids) | Coach notes, body metrics, sex, exact DOB, geo |

Source categories (domain): `DATA_MOAT_SOURCE_CATEGORIES`.

Raw product rows **stay in the athlete-owned DB**. The moat does **not** copy PII into a separate identifiable warehouse.

---

## Consent

**Model:** `DataMoatConsent` (1:1 `AthleteProfile`)

| Field | Rule |
| --- | --- |
| `optedIn` | Default **false** |
| `scopesJson` | `training_aggregates` · `technique_aggregates` · `strength_aggregates` — each default false |
| `policyVersion` | Must match job `sourcePolicyVersion` (`data_moat_policy.v1`) |
| `consentedAt` / `revokedAt` | Audit trail |

**Gate:** `athleteEligibleForInsight({ consent, insightKind })` — requires opt-in, no revoke, matching policy, and all scopes for that insight kind.

**Distinct from:**

- `LeaderboardOptIn` / `AthleteLevelOptIn` — social / level display  
- `OrgMembership.aggregateOptIn` — gym org dashboard only  
- `TechniqueAnalysis.analysisConsentAt` — running an analysis, not platform moat  

UI for moat consent is **not** shipped in this prompt (flag off). Service stubs exist for a later Settings section.

---

## Anonymization

1. **Drop identifiers** — `sanitizeMoatOutputProps` rejects `DATA_MOAT_FORBIDDEN_OUTPUT_KEYS` (aligned with analytics privacy).  
2. **Bucket** — week/month, exercise slug, experience band — never singleton traces.  
3. **k-anonymity** — `DATA_MOAT_MIN_COHORT_SIZE = 5`; `cohortPublishable` / `toAnonymizedCohortStat` suppress smaller cohorts (`suppressed: true`, empty stats).  
4. **No re-identification joins** — job results must not be joinable back to profiles via embedded ids.

`AggregationJob.resultJson` may store only anonymized cohort stats that pass sanitization.

---

## Retention

| Artifact | Default |
| --- | --- |
| Intermediate job scratch | **7 days** then delete |
| Anonymized published artifacts | **730 days** (24 months), then purge/rebuild |
| Consent audit (`consentedAt` / `revokedAt` / policy) | Account lifetime + **3 years** (or legal minimum) |
| Failed job logs (no PII) | **90 days** |

Constants: `DATA_MOAT_RETENTION` in `src/domain/data-moat/constants.ts`. Enforcement jobs are **future** — document policy now.

Account purge / media purge (`src/services/privacy/*`) remains the path for deleting source data; revoke consent immediately stops **eligibility** for new jobs.

---

## What this prompt does **not** ship

- Live ETL / warehouse / model training jobs  
- Selling or sharing identifiable athlete profiles  
- Silent enrollment (“improve the product” without consent)  
- Including recovery/body/video in aggregates “because it’s useful”  
- Cross-org deanonymization for coaches or admins  

---

## Incremental path

1. **Now:** domain rules + consent/job schema + service eligibility stubs + this doc + flag off  
2. **Next:** Settings UI for Data Moat consent (honest copy)  
3. **Later:** first `AggregationJob` worker for one insight kind (dry-run + suppress)  
4. **Later:** feed anonymized priors into heuristic engines (documented, reversible)  
5. **Never:** individual-level surveillance dashboards  

---

## Feature flag

`NEXT_PUBLIC_FF_DATA_MOAT` → `dataMoat` (**default off**)

Honesty: architecture is ready for privacy-safe improvement; pipelines are **not** running; consent defaults to **excluded**.

Model feedback on AI recommendations (helpful / not helpful; coach accept / modify / reject) is separate — see `docs/MODEL_FEEDBACK.md`. Feedback never auto-retrains production models.
