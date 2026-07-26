# Safety System 2.0

**Date:** 2026-07-22  
**Prompt:** 180 — Safety System 2.0  
**Domain:** `src/domain/safety-system/`  
**Service:** `src/services/safety-system/`  
**Admin:** `/app/admin/safety-system`  
**Flag:** `safetySystem20` (`NEXT_PUBLIC_FF_SAFETY_SYSTEM_20`, default **on**)

---

## Purpose

Central **recommendation safety validator**. Before coaching advice reaches athletes, candidates are checked and either **allowed**, **modified**, or **blocked**.

This is **not**:

- A medical diagnosis engine  
- A clinical guideline authority  
- A replacement for pain-safe mode or Coach Brain structural checks  

Complementary layers: Coach Brain forbidden claims (`src/domain/coach-brain/safety.ts`), Pain-Safe Response System, competition weight-cut warnings.

---

## Rules (block or modify)

| Rule id | Default | What it catches |
| --- | --- | --- |
| `unsafe_max_frequency` | modify (hard cap → block) | Extreme sessions/week; daily max-effort language |
| `extreme_volume` | modify (hard cap → block) | Extreme hard-set counts; “double volume immediately” style |
| `dangerous_rapid_weight_loss` | block | Dehydration / crash-cut language; extreme kg/week loss |
| `medical_diagnosis` | block | Diagnosis / prescribe-medication language |
| `pain_ignoring` | block | Push-through-pain language; aggressive advice while pain-safe mode is active |

Thresholds live in `SAFETY_THRESHOLDS` — **product heuristics**, not clinical standards.

---

## API

```ts
import { validateRecommendationSafety } from "@/domain/safety-system";
// or gated by flag:
import { gateRecommendation } from "@/services/safety-system";

const result = validateRecommendationSafety({
  id: "rec-1",
  text: "...",
  sessionsPerWeek: 4,
  painSafeModeActive: false,
  aggressiveProgression: false,
});
// result.action: "allow" | "modify" | "block"
// result.outputText: string | null (null when blocked)
```

Coach Brain runs this gate inside `validateCoachBrainRecommendations` via `coachBrainRecommendationToSafetyInput`.

---

## Audit tests

Deterministic suite: `SAFETY_AUDIT_CASES` + `runSafetyAuditSuite()` in `src/domain/safety-system/audit.ts`.  
Vitest: `src/domain/safety-system/safety-system.test.ts`.

Admin snapshot surfaces live audit pass/fail.

---

## Honesty

- Fail closed: prefer withhold or soften over inventing a safer protocol.  
- Never claim the validator diagnoses injury or disease.  
- Pain-safe withhold of aggressive kinds remains a separate, complementary control.
