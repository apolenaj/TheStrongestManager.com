# Historical Training Archive

**Date:** 2026-07-21  
**Prompt:** 111 — Historical Training Archive  
**Routes:** `/history/archive`, `/history/archive/[slug]`  
**Domain:** `src/domain/history/archive*.ts`  
**UI:** `src/components/history/HistoricalArchive.tsx`  
**Flag:** `historicalTrainingArchive` (`NEXT_PUBLIC_FF_HISTORICAL_TRAINING_ARCHIVE`, default **on**)

---

## Intent

Premium history profiles covering:

| Kind | Examples |
| --- | --- |
| Historical training systems | Soviet systems, Westside conjugate, early physical culture |
| Influential coaches | Louie Simmons, Arthur Jones, Mike Mentzer, Matveyev, Issurin |
| Famous methods | Conjugate, HIT, GVT, linear, block |

## Hard rules

- **Do not copy copyrighted training programs** — principles only.  
- Original educational language; no pasted books, courses, or proprietary wave charts.  
- History ≠ evidence verdict.

## Analytical lenses (required on every profile)

1. **What was innovative**  
2. **What remains useful**  
3. **What modern evidence questions**

Plus a short **principles summary** (never a reprinted template).

## Related surfaces

- Timeline: `/history` (Prompt 29) — promo banner links here  
- Method pages: `/methods/[slug]`  
- Method graph coach nodes point at archive profiles when richer  

## Tests

`src/domain/history/archive.test.ts`
