# AI Research Summarizer

**Date:** 2026-07-21  
**Prompt:** 114 — AI Research Summarizer  
**Route:** `/app/admin/research/summarizer`  
**Domain:** `src/domain/research-summarizer/`  
**Service:** `src/services/research-summarizer/`  
**Flag:** `aiResearchSummarizer` (`NEXT_PUBLIC_FF_AI_RESEARCH_SUMMARIZER`, default **on**)

---

## Workflow

1. Admin pastes **verified** paper metadata + abstract/text  
2. System validates input (`citationLabel` required)  
3. Adapter produces an **AI draft** with structured fields  
4. Human reviews: approve / request changes / reject  
5. Only **approved** drafts are publishable — Research Library catalog is still an editorial step (not auto-written)

## Input

| Field | Rule |
| --- | --- |
| `citationLabel` | **Required** — operator-supplied; never invented |
| `citationUrl` | Optional http(s) |
| `title` / `authors` / `year` | Optional verified metadata |
| `abstractOrText` | Required verified paper text |
| `category` | Optional Research Library category |

## Output (AI draft)

Research question · Methods · Findings · Limitations · Practical relevance

Every draft is labelled `isAiGenerated: true` with `citationSource: "verified_input"`.

## Hard rules

- **Never create citations from model memory.** Missing `citationLabel` → hard reject.  
- **AI output must be reviewed before public publication.** `canPublishResearchSummary` is true only when `status === "approved"` and citation is verified.  
- Stub adapter is extractive/deterministic; future LLM adapters must echo the same contract (no invented citations).

## Review statuses

`ai_draft` → `under_review` → `approved` | `rejected`

## Related

- Research Library: `docs/RESEARCH_LIBRARY.md`  
- Evidence Quality: `/evidence`

## Tests

`src/domain/research-summarizer/research-summarizer.test.ts`
