# Coaching Notes Intelligence

**Date:** 2026-07-21  
**Prompt:** 131 — Coaching Notes Intelligence  
**Route:** `/app/coaching-notes`  
**Domain:** `src/domain/coaching-notes-intelligence/`  
**Service:** `src/services/coaching-notes-intelligence/`  
**Flag:** `coachingNotesIntelligence` (`NEXT_PUBLIC_FF_COACHING_NOTES_INTELLIGENCE`, default **on**)

---

## Intent

Allow **coach notes**. AI may **summarize** eligible notes.  
**Private notes** are never used for unrelated product purposes.  
Always show source: **Coach note** or **AI summary**.

## Sources

| Source | Label | Meaning |
| --- | --- | --- |
| `coach_note` | Coach note | Human-authored workspace comment |
| `ai_summary` | AI summary | Machine overview of eligible notes — never labelled as a coach note |

## Privacy hard rules

1. `isPrivate === true` → excluded from AI summarization.
2. Private notes excluded from unrelated product use (TCI heuristics, data moat, analytics, public profile, org).
3. Summaries persist on `CoachNoteSummary` — separate from `CoachNote` rows.
4. Summarization requires active coach↔athlete access.

## Surfaces

| Surface | Behavior |
| --- | --- |
| `/app/coaching-notes` | Pick athlete → notes + generate AI summary |
| Coach workspace Notes | Private checkbox, source badges, generate summary |
| Training Consistency | Only non-private notes scanned for break context |

## Persistence

- `CoachNote.isPrivate`, `CoachNote.allowAiSummarize`
- `CoachNoteSummary` — `summaryBody`, `sourceNoteIdsJson`, `excludedPrivateCount`, `source = ai_summary`

## Tests

`src/domain/coaching-notes-intelligence/coaching-notes-intelligence.test.ts`
