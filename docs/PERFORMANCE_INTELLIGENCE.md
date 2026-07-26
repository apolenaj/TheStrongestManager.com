# Performance Intelligence Core

**Date:** 2026-07-21  
**Prompt:** 51 — Unified Performance Intelligence layer  
**Domain:** `src/domain/performance-intelligence/`  
**Service:** `src/services/performance-intelligence/`  
**UI:** `AthleteStatePanel` (presentational only)

---

## Intent

Combine existing athlete signals into one coherent **AthleteState** — not a concatenation of charts.

Inputs may include training history, completed sets, exercise performance, estimated strength, technique analyses, recovery check-ins, bodyweight trends, program adherence, competition goals, and nutrition **when available**.

---

## Architecture

```text
UI (AthleteStatePanel / Dashboard)
        │  read-only view
        ▼
PerformanceIntelligenceService.getAthleteState(userId)
        │  loadIntelligenceParts (Prisma + engines)
        ▼
assembleAthleteState(parts)   ← pure domain
        │
        ├── computeAthleteScores / analyzeStrength
        ├── training-load volume + spike
        ├── insights signal helpers (BW slope, volume %)
        └── nutrition connection status (never invent macros)
```

| Layer | Responsibility |
| --- | --- |
| **Domain** | `AthleteState` types, `StateField` provenance, pure `assembleAthleteState` |
| **Service** | Single load path; call existing engines; **only** entry for product UI |
| **UI** | Format badges / dates / summaries — **never** recompute trends or confidence |

**Rule:** Components must not independently calculate athlete state. Call `getAthleteState` (or receive a prebuilt `AthleteStateView`).

Engine version: `performance_intelligence.v1`

---

## AthleteState fields

Every field is a `StateField<T>`:

| Meta | Role |
| --- | --- |
| `value` | Structured payload or `null` |
| `source` | `observed` \| `heuristic` \| `reported` \| `recommended` \| `insufficient` |
| `confidence` | `none` \| `low` \| `medium` \| `high` |
| `lastUpdated` | Newest supporting signal time |
| `missingDependencies` | What would strengthen the reading |
| `summary` | Athlete-facing honesty copy |

| Field | Derivation (high level) |
| --- | --- |
| `performanceTrend` | Strength score + strength recent/prior trend |
| `fatigueTrend` | Volume % change + readiness delta + load-spike flag (**not** medical fatigue) |
| `techniqueTrend` | Technique score + analysis sample direction |
| `bodyweightTrend` | Reported BW slope (kg/week) when enough samples |
| `trainingConsistency` | Consistency score engine (session completion ratio) |
| `programProgress` | Programming/adherence score + active program name |
| `recoveryStatus` | Recovery score + latest readiness band |
| `goalProgress` | Active goal + qualitative alignment with strength trend |
| `dataConfidence` | Aggregate confidence across fields with signals |
| `dataFreshness` | Age of newest training/recovery/technique/body/lift signal |
| `nutritionAvailability` | Connection/targets only — macros never invented |

---

## Honesty

1. Missing data stays `null` / `insufficient` with explicit `missingDependencies`.  
2. Fatigue and recovery are **heuristics / estimates**, not diagnoses.  
3. Goal progress does not invent % complete without a measurable target.  
4. Nutrition reports availability until a real sync adapter ships.  
5. Demo Mode remains separately labeled — PI reads the demo athlete graph only when that account is loaded.

See also: `docs/SCORING_SYSTEM.md`, `docs/TRAINING_LOAD.md`, `docs/CROSS_DOMAIN_INSIGHTS.md`, `docs/NO_HALLUCINATION_AUDIT.md`.

---

## API

```ts
import { getAthleteState } from "@/services/performance-intelligence";

const view = await getAthleteState(userId);
// view.state : AthleteState
// view.honesty : PI_HONESTY
```

Pure assembly (tests / advanced orchestration):

```ts
import { assembleAthleteState } from "@/domain/performance-intelligence";
```

---

## Dashboard wiring

`/app/dashboard` loads `getAthleteState` beside `getPerformanceDashboard` and passes the view into `PerformanceDashboard` → `AthleteStatePanel`.

Future work may consolidate Prisma loads so dashboard scores and AthleteState share one graph fetch — without moving formulas into UI.
