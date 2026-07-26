# AI Observability

**Date:** 2026-07-21  
**Prompt:** 147 — AI Observability  
**Domain:** `src/domain/ai-observability/`  
**Service:** `src/services/ai-observability/`  
**UI:** `src/components/ai-observability/AiObservabilityPanel.tsx`  
**Dashboard:** `/app/admin/ai-observability` (admin only)  
**Flag:** `aiObservability` (`NEXT_PUBLIC_FF_AI_OBSERVABILITY`, default **on**)

---

## Intent

Internal monitoring for AI systems:

| Metric | Source |
| --- | --- |
| AI requests | Cost meter events |
| Success rate | `llm_ok / (llm_ok + llm_failed)` |
| Latency | Meter + router attempt `latencyMs` |
| Cost | Tokens + estimated USD (null until pricing) |
| Failures | LLM failed/denied + router errors/nulls |
| Hallucination reports | Offline eval dimension + quality-flag proxy |
| User feedback | `ModelFeedback` groupBy verdict/relatedType |

## Privacy

**Do not log private raw inputs unnecessarily.**

Never on this dashboard / snapshot:

- Prompts, messages, completions, payloads
- Free-text `reason` / notes / comments
- Emails, health, video, landmarks, storage keys

Feedback load uses Prisma `groupBy` on `verdict` + `relatedType` only — **never** selects `reason`.

## Architecture

Compose layer — no new event store:

1. `listAiCostMeterEvents()` (Prompt 145)
2. `listAiRouterAttemptLogs()` (Prompt 146)
3. `ModelFeedback` counts (Prompt 92)

## Related

- `/app/admin/ai-cost`
- `/app/admin/ai-router`
- Offline hallucination eval: `docs/AI_EVALUATION.md`

## Tests

`src/domain/ai-observability/ai-observability.test.ts`
