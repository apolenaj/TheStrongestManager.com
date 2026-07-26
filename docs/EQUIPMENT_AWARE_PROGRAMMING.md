# Equipment-Aware Programming

**Date:** 2026-07-21  
**Prompt:** 128 — Equipment-Aware Programming  
**Route:** `/app/equipment-profiles`  
**Domain:** `src/domain/equipment-profiles/`  
**Service:** `src/services/equipment-profiles/`  
**Flag:** `equipmentAwareProgramming` (`NEXT_PUBLIC_FF_EQUIPMENT_AWARE_PROGRAMMING`, default **on**)

---

## Intent

User **equipment profiles** drive program generation and exercise suggestions.  
Unavailable equipment is **never** a primary recommendation — only a clearly labelled alternative.

## Presets

| Profile | Fit mode | Typical gear |
| --- | --- | --- |
| Commercial gym | `full_gym` | Barbells, machines, cables, DBs, racks |
| Home gym | `home_barbell` | Barbell, rack, bench, DBs |
| Powerlifting gym | `full_gym` | Competition barbell focus |
| Minimal equipment | `minimal` | Dumbbells + bodyweight |

## Hard rules

1. Primary exercise picks require **full** equipment availability (`equipmentFullyAvailable`).
2. Empty equipment profile → withhold primary recommendations (not “recommend everything”).
3. Alternatives that need missing gear are labelled: **“Alternative — needs …”**.
4. Program Builder accessories respect Fit equipment; defaults from the athlete profile.

## Wired surfaces

| Surface | Behavior |
| --- | --- |
| Equipment profiles UI | Apply preset / edit checklist |
| Exercise prescription | Hard gate + labelled alternatives |
| Exercise substitutions | Hard gate on available gear |
| Program Builder | Prefill Fit equipment from profile |
| Travel Mode | Temporarily overlays travel gear; home profile locked until travel ends |

## Persistence

`TrainingExperience.availableEquipment` (checklist) + `equipmentProfileId` (preset id).

Home checklist is snapshotted when Travel Mode starts and restored when travel ends (see `docs/TRAVEL_TRAINING_MODE.md`).

## Tests

`src/domain/equipment-profiles/equipment-profiles.test.ts`
