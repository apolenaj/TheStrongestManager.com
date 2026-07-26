# AI Failure Modes

**Date:** 2026-07-21  
**Prompt:** 144 — AI Failure Modes  
**Domain:** `src/domain/ai-failure-modes/`  
**Service:** `src/services/ai-failure-modes/`  
**UI:** `src/components/ai/AiUnavailableState.tsx`  
**Flag:** `aiFailureModes` (`NEXT_PUBLIC_FF_AI_FAILURE_MODES`, default **on**)

---

## Intent

Graceful AI failure states. If AI is unavailable:

| Still works | Examples |
| --- | --- |
| Training logging | `/app/training` |
| Programs | `/app/programs` |
| Exercise library | `/app/exercises` |
| Progress charts | `/app/progress` |

Rules:

1. Use **fallback deterministic systems** where possible (labelled as degraded).
2. **Never** show fabricated AI output.
3. Distinguish **Coming soon** (unshipped) from **AI unavailable** (shipped but down / not configured / degraded).

## Failure kinds

| Kind | Meaning |
| --- | --- |
| `not_configured` | Provider / keys missing |
| `unavailable` | Down or flag off |
| `degraded` | Deterministic stub / rules only |
| `timeout` | Exceeded budget |
| `rejected` | Safety blocked output |
| `failed` | Hard error after attempt |

Every `AiFailure` includes `coreStillAvailable: true`.

## Capability registry

Ids: `technique_backend`, `coach_brain`, `coach_chat`, `coach_ai_copilot`, `program_review`, `daily_brief`, `insights`, `research_summarizer`.

- Pure builder: `buildAiCapabilityRegistrySnapshot`
- Live glue: `getAiCapabilityRegistrySnapshot` (service)

## UI

- `AiUnavailableState` — hard failure + core CTAs
- `AiDegradedBanner` — honest “rule-based / stub” mode

Wired first on **Technique** and **AI Coach**.

## Honesty

See `AI_FAILURE_MODES_HONESTY`.

## Tests

`src/domain/ai-failure-modes/ai-failure-modes.test.ts`
