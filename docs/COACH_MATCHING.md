# Coach Matching Engine

**Date:** 2026-07-21  
**Prompt:** 84 — Coach Matching Engine  
**Domain:** `src/domain/coach-matching/`  
**Service:** `src/services/coach-matching/`  
**Route:** `/coaching/match` (flag `coachMatching`)

---

## Inputs

Goal · Sport · Experience · Budget · Language · Location/timezone · Preferred coaching style

---

## Output

- **Top organic matches** (fit score + “why matched” reasons)
- **Sponsored** section only when `sponsoredPlacement` is true — always labeled **Sponsored**

Paid placement **never** increases `organicScore` or reorders the organic list.

---

## Coach profile fields (matching)

`goalTagsJson` · `experienceLevelsJson` · `coachingStylesJson` · `timezone` · `locationLabel` · `sponsoredPlacement`

---

## Feature flag

`NEXT_PUBLIC_FF_COACH_MATCHING` → `coachMatching` (default on)
