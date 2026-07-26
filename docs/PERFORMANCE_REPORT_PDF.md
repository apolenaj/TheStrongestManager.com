# Performance Report PDF

**Date:** 2026-07-21  
**Prompt:** 97 — Performance Report PDF  
**Domain:** `src/domain/performance-report/`  
**Service:** `src/services/performance-report/`  
**Download:** `GET /api/performance-report`  
**UI:** `/app/performance-report`  
**Flag:** `performanceReportPdf` (`NEXT_PUBLIC_FF_PERFORMANCE_REPORT_PDF`, default on)

---

## Sections

1. Athlete overview  
2. Strength  
3. Technique  
4. Training  
5. Recovery  
6. Progress  
7. Key recommendations  

Default data period: last **28 days** (`from` / `to` query params as `YYYY-MM-DD`).

---

## Honesty contract

Every PDF states:

| Requirement | How |
| --- | --- |
| **Data period** | Cover + footer (`from → to`, day count) |
| **Missing data** | Cover list + per-section callouts |
| **Estimated metrics** | Cover list + `[Estimated]` on e1RM lines |
| **No unsupported claims** | No injury risk, medical diagnosis, or invented scores |

Metric kinds: `observed` · `estimated` · `reported` · `missing`.

---

## Branding

Uses platform branding (`TheStrongestManager`) via branding defaults. Clean typography (Helvetica), accent when available — not a flashy marketing deck.

---

## Stack

- Assemble: pure domain from gathered signals (mirrors weekly-review honesty)  
- Render: **pdfkit** server-side  
- Auth + rate limit (`dataExport` preset)
