# Monthly Performance Report

**Date:** 2026-07-21  
**Prompt:** 98 — Monthly Performance Report  
**Route:** `/app/monthly-report` (`?month=2026-07`)  
**Share:** `/share/monthly/[token]`  
**Domain:** `src/domain/monthly-report/`  
**Service:** `src/services/monthly-report/`  
**Storage:** `MonthlyAthleteReport` + `MonthlyReportShare`  
**Flag:** `monthlyPerformanceReport` (default on)

---

## Intent

Automatic **calendar-month** performance report with:

- Month summary  
- Progress  
- Best performance  
- Technique changes  
- Training volume  
- Consistency  
- Goal progress  
- Next priorities (Keep · Change · Watch)

**Shareable** public-safe summary · **Historical archive** (upserted months).

---

## Flow

```text
Visit /app/monthly-report
  → gather this month + previous month signals
  → assembleMonthlyAthleteReport
  → upsert MonthlyAthleteReport (current + previous)
  → archive list + optional share token
```

No cron — lazy generation on visit (same pattern as weekly review).

---

## Share honesty

Shared cards freeze highlights only — not recovery notes or full session dumps (`MONTHLY_REPORT_HONESTY`).

---

## Related

`docs/WEEKLY_ATHLETE_REVIEW.md`, `docs/PERFORMANCE_REPORT_PDF.md`
