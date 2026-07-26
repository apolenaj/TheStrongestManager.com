# Personalized Fit Engine (“What works for me?”)

**Date:** 2026-07-20  
**Prompt:** 30 — Personalized “What works for me?” engine  
**Route:** `/fit?...`  
**Domain:** `src/domain/fit/*`  
**UI:** `src/components/fit/FitExperience.tsx`

---

## Behavior

Questionnaire inputs: **goal · experience · schedule (days) · session length · recovery · equipment · sport · preferences**.

Output (never “one perfect method”):

- **Primary recommendation**
- **Alternative**
- **Why it fits** (from fired rule reasons)
- **Tradeoffs** (from method limitations + fatigue notes)
- **Example structure** (method `programmingExample`)
- **Rules that applied** transparency panel

Shareable URL encodes all inputs, e.g.  
`/fit?goal=strength&experience=intermediate&days=4&session=medium&recovery=moderate&equipment=full_gym&sport=none&preference=variety`

## Rules

Deterministic coaching heuristics in `src/domain/fit/rules.ts`. Same inputs → same ranking. Weights are **not** scientific superiority scores.

## Honesty

- Coaching-practice recommender, not medical advice.
- Primary + alternative can both be reasonable.
- Link into `/methods/[slug]` and `/compare` for deeper review.

## Flags

`fit` defaults **on**. Set `NEXT_PUBLIC_FF_FIT=false` to hide from nav.
