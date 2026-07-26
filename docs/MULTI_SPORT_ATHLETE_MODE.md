# Multi-Sport Athlete Mode

**Date:** 2026-07-21  
**Prompt:** 108 — Multi-Sport Athlete Mode  
**Route:** `/app/multi-sport`  
**Domain:** `src/domain/multi-sport-mode/`  
**Service:** `src/services/multi-sport-mode/`  
**Flag:** `multiSportAthleteMode` (`NEXT_PUBLIC_FF_MULTI_SPORT_ATHLETE_MODE`, default **on**)

---

## Intent

Allow an athlete to select **multiple sport focuses** (example: Powerlifting + Strongman) on a **single** AthleteProfile.

| Rule | Behavior |
| --- | --- |
| Profiles | **Never duplicated** — `preferredSports` JSON on `TrainingExperience` is source of truth |
| Dashboard | Adapts when ≥2 focuses: focus chips, mixed goals, PRs grouped by sport |
| PRs | Separated by namespace (`lift_*`, `sm_*`, `wl_*`) — no cross-sport totals |
| Training | Mixed goals allowed (multiple active `Goal` rows) |

---

## Focus catalog

| Focus | Mode route | PR namespace |
| --- | --- | --- |
| Powerlifting | `/app/powerlifting` | `lift_*` |
| Strongman | `/app/strongman` | `sm_*` |
| Weightlifting | `/app/weightlifting` | `wl_*` |
| Bodybuilding | `/app/bodybuilding` | none (volume / progression) |
| General strength | `/app/training` | `lift_*` |

`hybrid` remains a **lead discipline** label for scoring — not a selectable focus.

---

## Selection UX

Profile → Sport focus: multi-select checkboxes + lead discipline. Saving two or more sports keeps one profile and stores the full list in `preferredSports`.

---

## Tests

`src/domain/multi-sport-mode/multi-sport-mode.test.ts`
