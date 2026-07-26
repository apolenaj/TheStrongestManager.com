# Competition Preparation Mode

**Date:** 2026-07-21  
**Prompt:** 70 — Competition preparation mode  
**Domain:** `src/domain/competition-mode/`  
**Route:** `/app/competition` (flag `competitionMode`)  
**Model:** `CompetitionPrep`

---

## Intent

Competition Mode for:

| Sport | Status |
| --- | --- |
| Powerlifting | Supported |
| Deadlift-only | Supported |
| Strongman | Listed — coming later (notice shown) |

### Inputs

- Competition date  
- Weight class (label + optional kg limit)  
- Target lifts (squat / bench / deadlift)

### Features

| Feature | Notes |
| --- | --- |
| Countdown | Days to meet |
| Training phase | Build → intensification → peaking → taper → meet week |
| Last heavy session | Recent high-RPE / low-rep work |
| Taper | Illustrative only — **not** auto-applied |
| Attempt planning | Conservative opener / 2nd / 3rd sketches |
| Bodyweight trend | Latest + kg/week when enough logs |
| Readiness | Latest check-in context |
| Weight class | Gap messaging **with safety warnings** |

---

## Hard rules

- **Do not** automatically prescribe dehydration or risky weight cutting.
- Weight-cut guidance always includes safety warnings.
- `autoPrescribesDehydration` is always `false`.
- Taper / attempts are sketches for coach/athlete confirmation.

---

## Feature flag

`NEXT_PUBLIC_FF_COMPETITION_MODE` → `competitionMode` (default on)

---

## Live meet day (Prompt 196)

Meet-day attempt board / warm-up clocks are **architecture** under `docs/LIVE_COMPETITION_MODE.md` (`/app/competition/live`). Runtime defaults **off**.
