# Trust Center

**Date:** 2026-07-21  
**Prompt:** 140 — Trust Center  
**Public page:** `/trust`  
**Domain:** `src/domain/trust-center/`  
**UI:** `src/components/trust-center/`, `src/app/(marketing)/trust/page.tsx`  
**Flag:** `trustCenter` (`NEXT_PUBLIC_FF_TRUST_CENTER`, default **on**)

---

## Intent

Public trust differentiator in one place. Explains product honesty without inventing capabilities:

| Section | Purpose |
| --- | --- |
| How AI works | Structured context + rules — not a freeform chatbot |
| What it can do | Draft, summarize, label, gate — human confirmation for program changes |
| What it cannot do | No diagnoses, invented scores, silent auto-apply |
| Data privacy | Export / delete posture; analytics allowlists |
| Video privacy | Technique media private; signed URLs; deletable |
| Scoring methodology | Named thresholds; confidence gates; null when insufficient |
| Safety limitations | Pain-safe gating; not medical care |
| Evidence standards | Research vs expert practice labels |

## Composition

Copy composes shipped domain honesty only:

- Coach Brain / Coach AI Copilot
- Movement disclaimers
- Technique privacy
- Pain-safe response
- Evidence quality
- Scoring confidence principles

## Surfaces

- Brand-first hero (`TheStrongest`) + tagline + CTAs to `/evidence`, `/privacy`, `/features`
- Section nav + deep links (`#how-ai-works`, …)
- Footer link on public marketing layout
- Settings cross-link for export/delete

## Honesty

- Flag off → `ComingSoon` — never fake a trust page
- No invented partnerships, accuracy %, or medical claims
- Legal drafts remain on `/privacy` and `/terms`

## Tests

`src/domain/trust-center/trust-center.test.ts`
