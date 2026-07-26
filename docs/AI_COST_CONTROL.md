# AI Cost Control Architecture

**Date:** 2026-07-21  
**Prompt:** 145 — Cost Control Architecture  
**Domain:** `src/domain/ai-cost-control/`  
**Service:** `src/services/ai-cost-control/`  
**UI:** `src/components/ai-cost/AiCostDashboardPanel.tsx`  
**Dashboard:** `/app/admin/ai-cost` (admin only)  
**Flag:** `aiCostControl` (`NEXT_PUBLIC_FF_AI_COST_CONTROL`, default **on**)

---

## Intent

Optimize AI inference cost:

1. Use AI **only where it adds value**
2. **Do not** call LLM for simple calculations, filters, known rules, or scoring formulas
3. Use **caching**, **structured prompts**, and **smaller models** where appropriate
4. **Track cost per feature**
5. Internal **AI cost dashboard** architecture

## Routing policy

| Task class | LLM? |
| --- | --- |
| `calc` / `filter` / `rule` / `score` / `assemble` / `pose` / `eval_offline` / `intent_route` | **Denied** |
| `nl_draft` / `nl_summarize` / `nl_paraphrase` | Allowed only for allowlisted features + live adapter |

Allowlisted features (still stub-denied until a real LLM is registered):

- `coach_brain`, `coach_chat`, `coach_ai_copilot`, `research_summarizer`, `program_review`

When allowed: `requireStructuredOutput: true`, prefer **small** model tier, bounded `maxTokens`.

## Caching

```
aiinf:v1:{featureId}:{adapterId}:{modelTier}:{sha256(canonicalJson(payload))}
```

Volatile timestamps (`now`, `timestamp`, `computedAt`) are stripped from cache keys.

## Metering

`AiCostMeterEvent` fields: `featureId`, `taskClass`, `modelTier`, `adapterId`, `cached`, tokens, `estimatedUsd` (**null** until pricing configured), `outcome`.

Outcomes: `skipped_deterministic` · `cache_hit` · `llm_ok` · `llm_denied` · `llm_failed`

Wired today:

- Coach Brain runs → meter `rule` / stub path
- Research summarizer drafts → meter `nl_summarize` / stub path

## Dashboard

`/app/admin/ai-cost` via `requireAdmin()`:

- Totals + cost per feature
- Denied task classes
- Routing policy examples
- Honesty: USD never invented

In-memory meter/cache first — swap to Redis/DB when live LLM adapters ship.

## Related

- Prompt 144 AI Failure Modes — degrade when LLM denied/unavailable
- Product technique **credits** are separate from inference cost

## Tests

`src/domain/ai-cost-control/ai-cost-control.test.ts`
