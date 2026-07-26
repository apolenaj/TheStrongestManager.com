# Athlete Level System

**Date:** 2026-07-21  
**Prompt:** 80 — Athlete Level System  
**Domain:** `src/domain/athlete-level/`  
**Route:** `/app/athlete-level` (flag `athleteLevel`)  
**Model:** `AthleteLevelOptIn` (optional; default off)

---

## Levels

Foundation → Developing → Advanced → Competitive → Elite

---

## Factors (combined; equal weight)

| Factor | Evidence |
| --- | --- |
| Consistency | Distinct training weeks + completed sessions |
| Knowledge | Academy lessons completed |
| Technique | Scored analyses + score improvement |
| Training history | Span of training + session volume |
| Progress | Logged PR events + technique delta |

**Not used:** app opens, login streaks, screen clicks, absolute 1RM alone.

---

## Elite gate

Elite requires **all** of:

1. Competitive evidence (completed Competition Mode prep **or** officially competition-verified lift)
2. Composite ≥ 80
3. Every factor ≥ 40 (balanced — not one spike)

High engagement / app usage alone never grants Elite.

---

## Sport-specific strength classes

Wilks / DOTS / IPF GL / weight-class placings are **separate** from Athlete Level (`sport-strength.ts` documents the boundary). They are not computed here.

---

## Feature flag

`NEXT_PUBLIC_FF_ATHLETE_LEVEL` → `athleteLevel` (default on)
