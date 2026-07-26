# Research Library

**Date:** 2026-07-21  
**Prompt:** 113 — Research Library  
**Routes:** `/research`, `/research/[slug]`, `/app/admin/research`  
**Domain:** `src/domain/research-library/`  
**Service:** `src/services/research-library/`  
**Flag:** `researchLibrary` (`NEXT_PUBLIC_FF_RESEARCH_LIBRARY`, default **on**)

---

## Categories

Hypertrophy · Strength · Programming · Recovery · Nutrition · Biomechanics

## Entry fields

| Field | Rule |
| --- | --- |
| Citation (`citationLabel` + optional `citationUrl`) | **Required** label; URL must be http(s) when present |
| Summary | Required |
| Practical takeaway | Required |
| Limitations | Required |
| Evidence label | Research family only (`strong_evidence` / `moderate_evidence` / `limited_evidence`) |

## Hard rules

- **Never invent study citations.** The published catalog starts empty on purpose.  
- Empty categories stay empty until a validated entry ships.  
- Import **rejects** rows without `citationLabel`.

## Import workflow

1. Admin → **Research Library** (`/app/admin/research`)  
2. Paste CSV or JSON matching `RESEARCH_LIBRARY_IMPORT_COLUMNS`  
3. **Dry-run** validates accept/reject reasons  
4. Dry-run does **not** auto-write the curated catalog (prevents accidental invented citations)  
5. Editorial publish: add validated entries to `src/domain/research-library/catalog.ts` with real citations only

### CSV columns

`slug,category,citationLabel,citationUrl,summary,practicalTakeaway,limitations,evidenceLabel`

## Evidence Quality

Entries render with Prompt 112 research evidence badges. Guide: `/evidence`.

## AI summarizer

Admin workflow: `/app/admin/research/summarizer` (Prompt 114). Drafts from verified paper text require human approval before any public publication. See `docs/AI_RESEARCH_SUMMARIZER.md`.

## Tests

`src/domain/research-library/research-library.test.ts`
