# Strongman Mode

**Date:** 2026-07-21  
**Prompt:** 106 — Sport-Specific Mode: Strongman  
**Route:** `/app/strongman`  
**Domain:** `src/domain/strongman-mode/`  
**Service:** `src/services/strongman-mode/`  
**Flag:** `strongmanMode` (`NEXT_PUBLIC_FF_STRONGMAN_MODE`, default on)

---

## Intent

Architecture for Strongman as its own sport shell — **not** a powerlifting reskin.

### Event types

| Event | Typical metrics |
| --- | --- |
| Log press | Weight, reps |
| Axle | Weight, reps |
| Farmer’s walk | Weight, distance, time |
| Yoke | Weight, distance, time |
| Stones | Weight, reps, time |
| Deadlift variations | Weight, reps |

### Tracking

- **Weight** (kg)  
- **Distance** (m)  
- **Time** (s)  
- **Reps**  

### Event-specific PRs

Persisted via `ProgressMetric.metricKey` convention:

`sm_<eventId>_<metric>` — e.g. `sm_farmers_walk_distance`, `sm_log_press_weight`

Helpers: `strongmanPrMetricKey`, `parseStrongmanPrMetricKey`.

---

## Hard rules

- **Do not force powerlifting metrics** (SBD, total, DOTS, Wilks, IPF GL) onto Strongman.  
- `powerliftingMetricsForced` is always `false`.  
- Missing event PRs stay labeled missing.

---

## Tests

`src/domain/strongman-mode/strongman-mode.test.ts`
