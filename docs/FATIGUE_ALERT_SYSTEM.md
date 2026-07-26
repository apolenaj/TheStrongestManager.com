# Fatigue Alert System

**Date:** 2026-07-21  
**Prompt:** 125 — Fatigue Alert System  
**Route:** `/app/fatigue-alerts`  
**Domain:** `src/domain/fatigue-alert-system/`  
**Service:** `src/services/fatigue-alert-system/`  
**Flag:** `fatigueAlertSystem` (`NEXT_PUBLIC_FF_FATIGUE_ALERT_SYSTEM`, default **on**)

---

## Intent

Conservative **coaching awareness** levels from logged signals.  
**No medical claims.** Calm language — no alarmist copy.

## Levels

| Level | When |
| --- | --- |
| **Normal** | No stress signals, or not enough data to escalate |
| **Watch** | Exactly one input shifted |
| **Elevated** | Two inputs aligned |
| **High concern** | All three inputs aligned |

## Inputs

| Input | Stress when… |
| --- | --- |
| Training load | Volume spike (or volume up + recovery softer) |
| Performance | Trend direction down |
| Recovery | Readiness low (&lt;45) or drop ≥8 pts |

## Gates

- ≥ **4** completed sessions before escalation above thin-data Normal
- ≥ **2** of the three inputs available
- One workout never escalates the level

## Distinct from

- AthleteState “Fatigue trend” (PI pillar direction only)
- Deload Intelligence (actionable “Consider deload”)
- Daily brief / notification one-off warnings

## Honesty

See `FATIGUE_ALERT_HONESTY` in domain constants.

## Tests

`src/domain/fatigue-alert-system/fatigue-alert-system.test.ts`
