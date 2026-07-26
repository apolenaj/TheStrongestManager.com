# Experiment Mode

**Date:** 2026-07-21  
**Prompt:** 119 — Experiment Mode  
**Routes:** `/app/experiments`, `/app/experiments/[id]`  
**Domain:** `src/domain/experiment-mode/`  
**Service:** `src/services/experiment-mode/`  
**Flag:** `experimentMode` (`NEXT_PUBLIC_FF_EXPERIMENT_MODE`, default **on**)

---

## Product name

**Personal training experiment** — never “scientific research,” RCT, or clinical study.

## Example

| Field | Example |
| --- | --- |
| Test | Paused deadlift for 6 weeks |
| Personal prediction | Improve floor strength |
| Measure | Deadlift performance, Technique |

## Lifecycle

`planned` → `active` (capture **before** baseline) → `completed` (capture **after** + compare) \| `abandoned`

## Before / after

Observational deltas only. Missing data stays missing. No causality claims.

## Honesty

See `EXPERIMENT_MODE_HONESTY` in `src/domain/experiment-mode/constants.ts`.

Platform aggregate A/B architecture (separate product): `docs/AB_PROGRAMMING_INSIGHTS.md`.

## Tests

`src/domain/experiment-mode/experiment-mode.test.ts`
