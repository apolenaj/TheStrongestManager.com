# Myth vs Reality Engine

**Date:** 2026-07-21  
**Prompt:** 115 — Myth vs Reality Engine  
**Routes:** `/myths`, `/myths/[slug]`  
**Domain:** `src/domain/myth-vs-reality/`  
**Service:** `src/services/myth-vs-reality/`  
**Flag:** `mythVsRealityEngine` (`NEXT_PUBLIC_FF_MYTH_VS_REALITY`, default **on**)

---

## Page structure

Every entry uses the same five sections:

1. **Claim** — the myth / search question  
2. **What people say** — common gym / internet framing  
3. **What evidence suggests** — careful, labelled (Evidence Quality System)  
4. **Practical answer** — what to do in training  
5. **Nuance** — context clickbait usually skips  

## Seed examples

| Slug | Claim |
| --- | --- |
| `knees-over-toes` | Do knees over toes destroy knees? |
| `is-sumo-cheating` | Is sumo cheating? |
| `high-rep-strength` | Does high-rep training build strength? |

## Hard rules

- **Avoid clickbait misinformation.** No “debunked forever,” fake certainty, or invented medical scares.  
- **Never invent study citations / DOIs.** Evidence labels without fake paper titles.  
- Prefer `coaching_consensus`, `heuristic`, or honest research-family labels — not `strong_evidence` without real citations.  
- Educational copy is not medical advice.

## Related

- Evidence Quality: `/evidence`  
- Research Library: `/research`  
- Methods: `/methods`

## Tests

`src/domain/myth-vs-reality/myth-vs-reality.test.ts`
