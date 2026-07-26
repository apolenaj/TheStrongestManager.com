# Recovery System

**Date:** 2026-07-20  
**Prompt:** 26 — Recovery system  
**Route:** `/app/recovery`  
**Engine:** `recovery.readiness.v1`  
**Services:** `src/services/recovery/*`  
**Domain:** `src/domain/recovery/*`

---

## Daily check-in (optional, &lt; ~30s)

| Field | Scale | Notes |
| --- | --- | --- |
| Sleep duration | hours | Null when skipped — **never fabricated** |
| Sleep quality | 1–10 | Optional |
| Stress | 1–10 | Higher = more stress |
| Soreness | 1–10 | Higher = more sore |
| Motivation | 1–10 | Higher = more motivation |
| Fatigue | 1–10 | Higher = more fatigued |

One check-in per local day (updates in place).

---

## Recovery Readiness estimate

Weighted mean of **logged** components only (0–100).

- Missing sleep → excluded; badge **Sleep excluded**; confidence drops
- Confidence: `none` / `low` / `medium` / `high` from input count + sleep presence
- Persisted on `RecoveryEntry.readiness` with `readinessInputsJson` + `readinessConfidence`

**Not medical accuracy.** Product copy must say estimate / indicators — never diagnosis or clearance.

---

## Dashboard

1. **Check-in** — large tap targets, skip per field  
2. **Estimate** — score + confidence  
3. **Potential issues** — conservative flags (short sleep, high stress/soreness/fatigue, low motivation, low estimate)  
4. **Trend** — readiness over ~28 days  
5. **Training relationship** — heuristic notes vs recent estimated volume / hard sets  
6. **Wearables** — architecture only

---

## Wearable architecture

See **`docs/WEARABLE_INTEGRATION.md`** (Prompt 185) for Apple Health, Google Health Connect, Garmin, Whoop, and Oura adapter interfaces.

Recovery still calls `getActiveWearableAdapter()` which bridges to that registry. Active reads stay **unavailable** until a real connected adapter exists **and** the per-provider live flag is on. Stubs never invent sleep.

---

## Schema additions

`sleepQuality`, `motivation`, `fatigue`, `readinessInputsJson`, `readinessConfidence` on `RecoveryEntry`.
