# Bodybuilding Mode

**Date:** 2026-07-21  
**Prompt:** 105 — Sport-Specific Mode: Bodybuilding  
**Route:** `/app/bodybuilding`  
**Domain:** `src/domain/bodybuilding-mode/`  
**Service:** `src/services/bodybuilding-mode/`  
**Flag:** `bodybuildingMode` (`NEXT_PUBLIC_FF_BODYBUILDING_MODE`, default on)

---

## Intent

Sport shell for physique-oriented training:

### Priorities

| Priority | Behavior |
| --- | --- |
| Muscle groups | Primary-muscle set counts / tonnage (workload overview) |
| Weekly training volume | Observed kg × sets / hard sets |
| Exercise progression | Qualitative load trends — never hypertrophy % |
| Bodyweight | Athlete-reported `BodyMetric` only |
| Training performance | Sessions + hard sets observed |

### Also created

- Muscle-group workload overview  
- Exercise progression list  
- Recovery link  
- Physique photos: **optional, private, not enabled as a product upload yet**  

---

## Hard rules

- **No fake muscle-growth scoring** (`muscleGrowthScore.available = false`).  
- **No medical body-fat from photos** (`photos.bodyFatFromPhotos = false`).  
- Photos stay private by default when a library ships.  
- Missing data stays labeled missing.

---

## Tests

`src/domain/bodybuilding-mode/bodybuilding-mode.test.ts`
