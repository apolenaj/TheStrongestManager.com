# Pain-Safe Response System

**Date:** 2026-07-21  
**Prompt:** 126 — Pain-Safe Response System  
**Route:** `/app/pain-safe-response`  
**Domain:** `src/domain/pain-safe-response-system/`  
**Service:** `src/services/pain-safe-response-system/`  
**Flag:** `painSafeResponseSystem` (`NEXT_PUBLIC_FF_PAIN_SAFE_RESPONSE_SYSTEM`, default **on**)

---

## Intent

Safety layer when the athlete reports:

- Sharp pain  
- Neurological symptoms  
- Serious injury  

The system must:

1. **Stop** aggressive training recommendations  
2. **Recommend** seeking qualified medical evaluation  
3. **Never diagnose**

## Aggressive kinds withheld

`increase_load` · `increase_volume` · aggressive attempt planning · optimistic PR framing · progression pushes

## Wired surfaces

| Surface | Behavior |
| --- | --- |
| Adaptations | `increase_load` / `increase_volume` → `keep_load` hold + seek-care reason |
| Coach chat | Load-increase intents refused with seek-care copy |
| Attempt selector | Risk locked to **conservative** |
| PR prediction | Banner — ranges are informational, not a push to max |

## Persistence

`PainSafeReport` model — athlete-owned reports (`sharp_pain` | `neurological` | `serious_injury`). Clearing a report does **not** equal medical clearance.

## Honesty

See `PAIN_SAFE_RESPONSE_HONESTY` and `PAIN_SAFE_SEEK_CARE_MESSAGE`.

## Tests

`src/domain/pain-safe-response-system/pain-safe-response-system.test.ts`
