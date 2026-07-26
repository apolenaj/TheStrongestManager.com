# Travel Training Mode

**Date:** 2026-07-21  
**Prompt:** 129 — Travel Training Mode  
**Route:** `/app/travel-mode`  
**Domain:** `src/domain/travel-training-mode/`  
**Service:** `src/services/travel-training-mode/`  
**Flag:** `travelTrainingMode` (`NEXT_PUBLIC_FF_TRAVEL_TRAINING_MODE`, default **on**)

---

## Intent

**Travel Mode** temporarily adapts programming to road gear without permanently changing the athlete’s home program or equipment profile.

## Presets

| Preset | Fit mode | Typical gear |
| --- | --- | --- |
| Hotel gym | `minimal` | Dumbbells, maybe machine/cable, bodyweight |
| No gym | `minimal` | Bodyweight (+ bands if available) |
| Limited equipment | `minimal` | Athlete-selected trip checklist |

## Lifecycle

1. **Start travel** — snapshot home equipment; checkpoint active athlete program (when Program Version Control is on); overlay travel equipment on the live checklist.
2. **While active** — exercise suggestions, substitutions, and equipment-aware surfaces respect travel gear only.
3. **End travel** — restore the pre-travel program version (when checkpointed) and restore the home equipment snapshot.

## Hard rules

1. Original program is preserved via a pre-travel **program version checkpoint**.
2. Home equipment is snapshotted and restored — Travel Mode is not a permanent profile change.
3. Only one Travel Mode can be active at a time.
4. Unavailable travel gear is never a primary recommendation (same equipment gates as Prompt 128).

## Persistence

`TravelTrainingMode` — `preset`, `status`, `equipmentOverrideJson`, `homeEquipmentSnapshotJson`, `programId`, `preTravelVersionNumber`.

## Tests

`src/domain/travel-training-mode/travel-training-mode.test.ts`
