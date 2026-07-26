# Behavioral Retention System

**Date:** 2026-07-21  
**Prompt:** 102 — Behavioral Retention System  
**Route:** `/app/retention`  
**Domain:** `src/domain/behavioral-retention/`  
**Service:** `src/services/behavioral-retention/`  
**Flag:** `behavioralRetention` (`NEXT_PUBLIC_FF_BEHAVIORAL_RETENTION`, default on)

---

## Intent

Help athletes **follow through** with ethical retention loops:

| Loop | What it tracks |
| --- | --- |
| Workout follow-through | On-plan streak (completed **or** planned rest) |
| Weekly review | Calm weekly check-in availability |
| Goal progress | Logged progress toward an active goal |
| Technique improvement | Comparable technique score delta |

---

## Planned rest

- Days with **no scheduled session** between the first activity and today resolve as **`planned_rest`**.
- `planned_rest` **continues** the on-plan streak.
- Only **missed** (skipped planned) sessions break the streak.
- Copy never says “lose your streak” or punishes rest.

---

## Hard rules (no dark patterns)

Forbidden product patterns include:

- streak guilt / “lose your streak”
- punishing rest / skip recovery
- daily login points
- fake urgency / shame countdowns

Nudges are soft (“reschedule when it fits”) — never guilt spam.

---

## Tests

`src/domain/behavioral-retention/behavioral-retention.test.ts`
