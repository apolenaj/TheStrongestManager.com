# AI Coach Brain architecture

**Date:** 2026-07-21  
**Prompt:** 52 — AI Coach Brain  
**Domain:** `src/domain/coach-brain/`  
**Service:** `src/services/coach-brain/`  
**Audit:** `CoachBrainAuditLog` (Prisma)

---

## Intent

The Strongest AI Coach is **not a generic chatbot**. It reasons from structured athlete data through a fixed pipeline, returns structured recommendations, and **never modifies programs** without explicit athlete confirmation.

---

## Pipeline

```text
Athlete Data
    → Performance Intelligence (AthleteState)
    → Rules / deterministic systems
    → AI reasoning layer (adapter; stub today)
    → Safety validation
    → Recommendation engine (structured outputs)
    → User explanation (reasoningSummary — no hidden CoT)
```

| Stage | Module |
| --- | --- |
| Data + PI | Tool runners → `getAthleteState` + profile/training/PRs/… |
| Rules | `evaluateCoachBrainRules(tools)` |
| Reasoning | `CoachBrainReasoningAdapter` (`stub.deterministic` until LLM) |
| Safety | `validateCoachBrainRecommendations` |
| Orchestration | `runCoachBrain({ userId })` |
| Audit | Append-only `CoachBrainAuditLog` per stage |

Engine version: `coach_brain.v1`

---

## Internal tools

| Tool | Role |
| --- | --- |
| `getAthleteProfile` | Name, discipline, experience, units |
| `getRecentTraining` | Completed session counts + recent titles |
| `getTechniqueTrend` | From AthleteState technique field |
| `getRecoveryTrend` | From AthleteState recovery field |
| `getProgramContext` | Active program + adherence score |
| `getGoalProgress` | Goal title + qualitative status |
| `getRecentPRs` | Best reported/observed major lifts |
| `getNutritionSummary` | Connection/targets only — no invented macros |
| `getAthleteState` | Full Performance Intelligence snapshot |

Tools are **orchestration-only** (service-side), not a public chat tool API.

---

## Structured recommendation output

Every recommendation includes:

| Field | Purpose |
| --- | --- |
| `recommendation` | What to consider |
| `reasoningSummary` | Concise explainable reasoning (athlete-facing) |
| `supportingData` | Tool/key/value facts |
| `confidence` | `none` \| `low` \| `medium` \| `high` |
| `risks` | Caveats |
| `missingInformation` | What would strengthen the advice |
| `recommendedAction` | Next step + `requiresExplicitConfirmation` |

**No chain-of-thought field** is returned or stored. Adapter notes in audit are operational only.

For `confirm_adaptation` actions, `requiresExplicitConfirmation` is **always true**. Actual program edits go through existing Accept / Modify / Decline (`ProgramAdaptation`) — the brain never writes prescription rows itself.

---

## Safety

Blocks text matching medical diagnosis, “guaranteed”, clinical proof, auto-apply, calorie prescriptions, etc. Incomplete structures are rejected. Fail closed: rejected runs emit empty recommendations + `safety.rejected` audit.

Honesty constants: `COACH_BRAIN_HONESTY`.

---

## Audit log

`CoachBrainAuditLog` actions:

- `run.started`
- `tools.gathered`
- `rules.evaluated`
- `reasoning.completed`
- `safety.rejected` / `safety.passed`
- `recommendation.emitted`

Stores structured JSON only (recommendation objects, tool ok/missing). Correlated by `runId`.

---

## API

```ts
import { runCoachBrain, listCoachBrainAuditLogs } from "@/services/coach-brain";

const result = await runCoachBrain({ userId });
// result.recommendations : CoachBrainRecommendation[]
// result.rejected : boolean
```

Register a future LLM adapter with `registerCoachBrainReasoningAdapter` — same structured output contract; safety remains mandatory.

---

## Explicit non-goals (Prompt 52)

- No silent program mutation  
- No invented medical or nutrition certainty  

Conversational chat UI shipped in Prompt 53 — see `docs/AI_COACH_CHAT.md`.

Related: `docs/AI_COACH_CHAT.md`, `docs/PERFORMANCE_INTELLIGENCE.md`, `docs/ADAPTIVE_PROGRAMMING.md`, `docs/CROSS_DOMAIN_INSIGHTS.md`.
