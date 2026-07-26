# Athlete Public Profile

**Date:** 2026-07-21  
**Prompt:** 75 — Athlete public profile  
**Domain:** `src/domain/public-profile/`  
**Settings:** `/app/profile` (flag `publicAthleteProfile`)  
**Public:** `/u/[slug]`  
**Model:** `AthletePublicProfile`

---

## Default

**Private.** Public page 404s until the athlete enables the profile and sets a slug.

---

## Selectable public fields

| Field | Default |
| --- | --- |
| Display name | On (when public) |
| Sport | On |
| PRs | Off |
| Competition history | Off |
| Public achievements | Off |
| Technique score highlights | Off |
| Training streak | Off |
| Body metrics | Off — only if explicitly selected |

---

## Never exposed

- Recovery data  
- Private notes / movement notes / coach notes  

Enforced in `assemblePublicProfile` — not available as toggles.

---

## Custom slug

`/u/your-slug` — 3–32 chars, letters/numbers/hyphens, unique, reserved words blocked.

---

## Feature flag

`NEXT_PUBLIC_FF_PUBLIC_ATHLETE_PROFILE` → `publicAthleteProfile` (default on)
