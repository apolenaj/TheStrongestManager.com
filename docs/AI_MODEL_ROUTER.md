# Multi-Model AI Router

**Date:** 2026-07-21  
**Prompt:** 146 — Multi-Model AI Router  
**Domain:** `src/domain/ai-model-router/`  
**Service:** `src/services/ai-model-router/`  
**UI:** `src/components/ai-model-router/AiModelRouterPanel.tsx`  
**Dashboard:** `/app/admin/ai-router` (admin only)  
**Flag:** `aiModelRouter` (`NEXT_PUBLIC_FF_AI_MODEL_ROUTER`, default **on**)

---

## Intent

Provider abstraction so the platform is **not hard-wired to one AI vendor**.

Use different models / chains for:

| Task kind | Purpose |
| --- | --- |
| `text_reasoning` | Structured coaching / NL draft over facts |
| `vision` | Vision-language (local CV stays separate until wired) |
| `summarization` | Research / extractive polish |
| `classification` | Simple labels (prefer deterministic first) |

Also:

- **Fallback** across providers
- **Log latency**, **errors**, and **cost** (via Prompt 145 meters)

## Providers

| Id | Status | Behavior |
| --- | --- | --- |
| `none` | unavailable | Always `null` — e.g. vision default |
| `stub` | stub | Always `null` — never invents NL/scores/citations |
| *(future)* | ready | Register OpenAI / Anthropic / etc. via `registerAiModelProvider` |

Default chains:

- text_reasoning → `stub`
- summarization → `stub`
- classification → `stub`
- vision → `none`

## Flow

1. Prompt 145 `routeAiInference` gates allow/deny
2. `routeAiModelRequest` resolves provider chain
3. `runProviderFallbackChain` tries each provider
4. Each attempt meters latency / tokens / outcome (USD null until pricing)

## Wired callers

- Coach Brain → `text_reasoning`
- Research summarizer → `summarization`

Feature deterministic stubs remain the product source of truth until a live provider returns structured content.

## Related

- Prompt 144 — failure / degraded UI
- Prompt 145 — cost policy + meters

## Tests

`src/domain/ai-model-router/ai-model-router.test.ts`
