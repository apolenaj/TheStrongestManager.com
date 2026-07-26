# Viral Technique Score Cards

**Date:** 2026-07-21  
**Prompt:** 74 — Viral technique score cards  
**Domain:** `src/domain/technique-share-cards/`  
**UI:** Technique analysis report → Share technique score card  
**Public:** `/share/technique/[token]`

---

## Example

```text
DEADLIFT TECHNIQUE
86/100
Strongest: Lockout 94
Improve: Start Position 72
[Analyze your lift]
TheStrongestManager
```

---

## Athlete controls what to share

| Field | Default |
| --- | --- |
| Overall score | On |
| Strongest + Improve | On |
| One insight | Off (private by default) |
| Video thumbnail | Off — PNG placeholder only; **never** a public private-media URL |

---

## CTA + referrals

Every card includes **Analyze your lift**.

Referral-ready path (example):

```text
/signup?ref=Ab12Cd34&utm_source=technique_card&utm_medium=share&utm_campaign=analyze_your_lift
```

Public share page CTA uses that path. Signup shows a short invite notice when `ref` is present.

---

## Feature flag

Uses existing technique surfaces (no separate flag). Model: `TechniqueShare`.
